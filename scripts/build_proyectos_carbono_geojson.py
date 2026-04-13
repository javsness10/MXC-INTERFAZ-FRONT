#!/usr/bin/env python3
"""Exporta CAR + VCS (CARBONO BENCHMARK) a GeoJSON para el visor Mapbox."""
from __future__ import annotations

import json
import math
from pathlib import Path

import geopandas as gpd
import pandas as pd

# visor/scripts/ → .. = visor, ../.. = PROYECTO_05, ../../.. = Landed_ILA
_BASE = Path(__file__).resolve()
BASE_CARBONO = _BASE.parents[3] / "CARBONO BENCHMARK"
OUT = _BASE.parents[1] / "data" / "proyectos_carbono_mx.geojson"


def _f(x) -> float | None:
    if x is None or (isinstance(x, float) and (math.isnan(x) or math.isinf(x))):
        return None
    try:
        return float(x)
    except (TypeError, ValueError):
        return None


def _s(x, default: str = "") -> str:
    if x is None or (isinstance(x, float) and pd.isna(x)):
        return default
    return str(x).strip()


def car_row(row) -> dict:
    area = _f(row.get("Area_Ha"))
    ton_ha = _f(row.get("Ton/Ha"))
    co2_stock = None
    if area is not None and ton_ha is not None:
        co2_stock = area * ton_ha
    elif _f(row.get("Credits_Re")) is not None:
        co2_stock = _f(row.get("Credits_Re"))
    elif area is not None:
        co2_stock = area * 2.5  # hipotético conservador si falta ton/ha

    credits = _f(row.get("Credits_Re"))
    desc = _s(row.get("P_Notes"))
    if not desc:
        desc = (
            f"Proyecto forestal registrado en Climate Action Reserve (CAR). "
            f"Tipo: {_s(row.get('P_Type'))}. "
            f"Ubicación declarada: {_s(row.get('P_Location'))}."
        )
    return {
        "detail_kind": "carbono",
        "id": f"car-{_s(row.get('ID'), str(row.name))}",
        "nombre": _s(row.get("P_Name"))[:240] or "Proyecto CAR",
        "organizacion": _s(row.get("P_Develope")) or _s(row.get("P_Owner")) or "n/d",
        "descripcion": desc[:1200],
        "sector": "Carbono · CAR",
        "sector_slug": "carbono-car",
        "hectareas": round(area, 2) if area is not None else None,
        "co2_ton": round(co2_stock, 1) if co2_stock is not None else None,
        "co2_label": "Stock / créditos (orden magnitud)",
        "beneficiarios_label": "Verificador",
        "beneficiarios_val": _s(row.get("Ver_Body")) or "n/d",
        "estado": _s(row.get("P_State")) or "n/d",
        "municipio": "n/d",
        "tipo_org": "CAR · México",
        "subsector": _s(row.get("P_Type")) or "Forestal",
        "year": _s(row.get("P_Regist_D"))[:4] if _s(row.get("P_Regist_D")) else "n/d",
        "status": _s(row.get("Status")) or "n/d",
        "necesidad": "n/d",
        "carbon_program": "CAR",
        "ton_ha": ton_ha,
        "credits_released": credits,
        "link_url": _s(row.get("P_Link")),
        "methodology": "n/d",
        "est_anual": None,
    }


def vcs_row(row) -> dict:
    area = _f(row.get("Area_ha"))
    ton_ha = _f(row.get("Ton/ha"))
    est = _f(row.get("Est_Annual"))
    co2_metric = est
    if co2_metric is None and area is not None and ton_ha is not None:
        co2_metric = area * ton_ha
    desc = (
        f"Proyecto en estándar VCS (Verified Carbon Standard). "
        f"{_s(row.get('AFOLU_Act'))}. Región: {_s(row.get('Region'))}."
    )
    return {
        "detail_kind": "carbono",
        "id": f"vcs-{_s(row.get('ID'), str(row.name))}",
        "nombre": _s(row.get("Name_2"))[:240] or "Proyecto VCS",
        "organizacion": _s(row.get("Proponent")) or "n/d",
        "descripcion": desc[:1200],
        "sector": "Carbono · VCS",
        "sector_slug": "carbono-vcs",
        "hectareas": round(area, 2) if area is not None else None,
        "co2_ton": round(co2_metric, 1) if co2_metric is not None else None,
        "co2_label": "Est. emisiones / año (t CO₂e)",
        "beneficiarios_label": "Metodología",
        "beneficiarios_val": _s(row.get("Methodolog")) or "n/d",
        "estado": _s(row.get("Region")) or "n/d",
        "municipio": _s(row.get("Country_Ar")) or "n/d",
        "tipo_org": "VCS · Verra",
        "subsector": _s(row.get("Project_Ty"))[:80] or "AFOLU",
        "year": _s(row.get("P_Registra"))[:4] if _s(row.get("P_Registra")) else "n/d",
        "status": _s(row.get("Status")) or "n/d",
        "necesidad": "n/d",
        "carbon_program": "VCS",
        "ton_ha": ton_ha,
        "credits_released": None,
        "link_url": _s(row.get("Link")),
        "methodology": _s(row.get("Methodolog")),
        "est_anual": est,
    }


def main() -> None:
    car_path = BASE_CARBONO / "CAR Projects" / "CAR_Projects_Ago2024.shp"
    vcs_path = BASE_CARBONO / "VCS Projects" / "VCS_Projects_Ago2024.shp"
    car = gpd.read_file(car_path).to_crs(4326)
    vcs = gpd.read_file(vcs_path).to_crs(4326)
    car = car[car.geometry.notna()].copy()
    vcs = vcs[vcs.geometry.notna()].copy()

    # Punto representativo por polígono (GeoJSON ligero; el área sigue en atributos Area_Ha).
    car["geometry"] = car.geometry.representative_point()
    vcs["geometry"] = vcs.geometry.representative_point()

    feats = []
    for _, row in car.iterrows():
        feats.append({"type": "Feature", "properties": car_row(row), "geometry": row.geometry.__geo_interface__})
    for _, row in vcs.iterrows():
        feats.append({"type": "Feature", "properties": vcs_row(row), "geometry": row.geometry.__geo_interface__})

    out = {"type": "FeatureCollection", "features": feats}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with OUT.open("w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False)
    print(f"Wrote {len(feats)} features → {OUT}")


if __name__ == "__main__":
    main()
