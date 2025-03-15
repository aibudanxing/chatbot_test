import http.server
import socketserver
import logging
import os
import datetime
import sys

# 设置默认编码为UTF-8，解决中文乱码问题
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

# 配置日志
log_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'logs')
if not os.path.exists(log_dir):
    os.makedirs(log_dir)

log_file = os.path.join(log_dir, 'access.log')
# 创建一个支持UTF-8编码的FileHandler
file_handler = logging.FileHandler(log_file, encoding='utf-8')
file_handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
file_handler.setFormatter(formatter)

# 配置根日志记录器
logger = logging.getLogger()
logger.setLevel(logging.INFO)
logger.addHandler(file_handler)

class LoggingHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        # 记录到标准输出
        super().log_message(format, *args)
        
        # 同时记录到日志文件，确保使用UTF-8编码
        message = format % args
        if isinstance(message, bytes):
            message = message.decode('utf-8')
        logging.info("%s - %s" % (self.address_string(), message))
    
    def do_GET(self):
        # 记录完整的GET请求，包括查询参数
        logging.info(f"GET请求: {self.path}")
        return super().do_GET()
    
    def do_POST(self):
        # 记录POST请求
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length > 0:
            post_data = self.rfile.read(content_length).decode('utf-8')
            logging.info(f"POST请求: {self.path}\nPOST数据: {post_data}")
        else:
            logging.info(f"POST请求: {self.path} (无数据)")
        return super().do_POST()

PORT = 8000
Handler = LoggingHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    start_message = f"服务器启动在端口 {PORT}，访问 http://localhost:{PORT}/"
    print(start_message)
    logging.info(start_message)
    httpd.serve_forever()