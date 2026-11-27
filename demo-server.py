"""Máy chủ tĩnh cục bộ để chạy demo không cần Internet.

Cách chạy: python demo-server.py   (hoặc bấm đúp chay-demo.bat trên Windows)
Mở: http://localhost:8000  - nhấn Ctrl+C để dừng.

Ép kiểu MIME cho .js/.css vì trên một số máy Windows, registry trả .js là text/plain
khiến trình duyệt chặn ES module.
"""
import http.server
import os
import threading
import webbrowser

PORT = 8000
ROOT = os.path.dirname(os.path.abspath(__file__))


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".html": "text/html; charset=utf-8",
        ".js": "text/javascript; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".md": "text/plain; charset=utf-8",
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)


if __name__ == "__main__":
    url = f"http://localhost:{PORT}/index.html"
    with http.server.ThreadingHTTPServer(("127.0.0.1", PORT), Handler) as server:
        print(f"Đang chạy demo tại {url}  (Ctrl+C để dừng)")
        threading.Timer(1.0, webbrowser.open, args=(url,)).start()
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("Đã dừng.")
