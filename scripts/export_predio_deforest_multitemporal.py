#!/usr/bin/env python3
"""Vectoriza pérdida forestal por era desde Hansen (banda lossyear) hacia GeoJSON.

Lee el GeoTIFF descargado por el pipeline (3 bandas: treecover2000, loss, lossyear).
lossyear: 0 = sin pérdida; 1–23 = año 2001–2023.

Uso:
  python export_predio_deforest_multitemporal.py \\
    --hansen /path/to/pipeline_data/downloads/hansen_forest_change.tif \\
    --aoi /path/to/predio\\ demo/aoi.geojson \\
    --out /path/to/visor/predio_demo/exports/deforestacion_multitemporal.geojson
"""

from __future__ import annotations

import argparse
from pathlib import Path

import geopandas as gpd
import numpy as np
import rasterio
from rasterio import features as rio_features
from shapely.geometry import shape

ERA_META = {
    "2001-2010": {"label": "Pérdida 2001–2010", "color": "#c62828"},
    "2011-2020": {"label": "Pérdida 2011–2020", "color": "#f9a825"},
    "2021-2023": {"label": "Pérdida 2021–2023", "color": "#1565c0"},
}


def main() -> None:
    ap = argparse.ArgumentParser(description="Hansen lossyear → GeoJSON por era")
    ap.add_argument("--hansen", type=Path, required=True, help="hansen_forest_change.tif (3 bandas)")
    ap.add_argument("--aoi", type=Path, required=True, help="GeoJSON del predio (EPSG:4326)")
    ap.add_argument("--out", type=Path, required=True, help="Salida GeoJSON")
    args = ap.parse_args()

    aoi_gdf = gpd.read_file(args.aoi).to_crs(4326)
    try:
        geom = aoi_gdf.union_all()
    except AttributeError:
        geom = aoi_gdf.unary_union

    with rasterio.open(args.hansen) as src:
        if src.count < 3:
            raise SystemExit("Se esperaban ≥3 bandas (treecover2000, loss, lossyear)")
        lossyear = src.read(3).astype(np.float32)
        transform = src.transform
        crs = src.crs

    era_code = np.zeros(lossyear.shape, dtype=np.uint8)
    for era_key, (lo, hi) in {
        "2001-2010": (1, 10),
        "2011-2020": (11, 20),
        "2021-2023": (21, 23),
    }.items():
        code = {"2001-2010": 1, "2011-2020": 2, "2021-2023": 3}[era_key]
        era_code = np.where((lossyear >= lo) & (lossyear <= hi), code, era_code)

    rows = []
    for code, era_key in [(1, "2001-2010"), (2, "2011-2020"), (3, "2021-2023")]:
        mask = (era_code == code).astype(np.uint8)
        if not mask.any():
            continue
        meta = ERA_META[era_key]
        for geom_d, val in rio_features.shapes(mask, mask=mask, transform=transform):
            if val != 1:
                continue
            g = shape(geom_d)
            if g.is_empty:
                continue
            rows.append(
                {
                    "geometry": g,
                    "periodo": era_key,
                    "label": meta["label"],
                    "color": meta["color"],
                }
            )

    if not rows:
        gdf = gpd.GeoDataFrame(columns=["periodo", "label", "color", "geometry"], crs=crs)
    else:
        gdf = gpd.GeoDataFrame(rows, crs=crs)
        gdf = gdf.to_crs(4326)
        gdf = gdf[gdf.intersects(geom)].copy()
        gdf["geometry"] = gdf.geometry.intersection(geom)

    args.out.parent.mkdir(parents=True, exist_ok=True)
    gdf.to_file(args.out, driver="GeoJSON")
    print(f"OK: {len(gdf)} features → {args.out}")


if __name__ == "__main__":
    main()
