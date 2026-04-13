"""Dev server for MPC Atlas · Visualizar el Territorio."""
import http.server
import os

DEFAULT_PORT = 8087
DIR = os.path.dirname(os.path.abspath(__file__))


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIR, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()


if __name__ == '__main__':
    preferred = int(os.environ.get("MPC_VISOR_PORT", DEFAULT_PORT))
    httpd = None
    port = preferred
    for port in range(preferred, preferred + 15):
        try:
            httpd = http.server.HTTPServer(("", port), NoCacheHandler)
            break
        except OSError:
            continue
    if httpd is None:
        raise SystemExit(f"No se pudo enlazar un puerto en {preferred}–{preferred + 14}")

    print(f"MPC Atlas server → http://localhost:{port}/")
    print(f"  Sin panel predio → http://localhost:{port}/?predio=0")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor detenido.")
