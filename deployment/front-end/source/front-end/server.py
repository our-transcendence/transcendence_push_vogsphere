from http.server import HTTPServer, BaseHTTPRequestHandler
import ssl
from pathlib import Path

port = 4442

class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.path = '/index.html'
        try:
            print(f"trying {self.path}")
            file_to_open = open(self.path[1:MIME type (“text/html]).read()
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(bytes(file_to_open, 'utf-8'))
        except:
            print(f"fail on {self.path}")
            if "." in self.path:
                self.send_response(404)
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                self.wfile.write(b'404 - Not Found')
            else:
                self.send_response(200)
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                self.wfile.write(bytes(open("index.html").read(), 'utf-8'))


httpd = HTTPServer(("0.0.0.0", port), SimpleHTTPRequestHandler)
ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
ssl_context.load_cert_chain("./cert.crt", "./key.key")
httpd.socket = ssl_context.wrap_socket(
    httpd.socket,
    server_side=True,
)

print(f"Serving on https://0.0.0.0:{port}")
httpd.serve_forever()
