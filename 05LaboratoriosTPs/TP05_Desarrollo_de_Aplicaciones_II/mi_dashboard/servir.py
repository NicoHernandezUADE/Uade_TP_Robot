"""Servidor estatico del dashboard sin cache.

`python -m http.server` no manda Cache-Control, asi que el navegador puede
seguir usando JS viejos despues de editarlos. Este servidor fuerza no-store.

Uso: python3 servir.py [puerto]   (por defecto 8080)
"""

import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


class SinCache(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    puerto = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    handler = partial(SinCache, directory=str(Path(__file__).parent))
    print(f"Dashboard en http://localhost:{puerto}/")
    ThreadingHTTPServer(("", puerto), handler).serve_forever()
