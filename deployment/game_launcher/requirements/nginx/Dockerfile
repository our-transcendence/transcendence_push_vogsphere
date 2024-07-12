FROM nginx

# RUN openssl req -x509 -newkey rsa:4096 -keyout /etc/nginx/key.pem -out /etc/nginx/cert.pem -sha256 -days 3650 -nodes -subj "/C=XX/ST=France/L=Lyon/O=42/OU=42Lyon/CN=42"

COPY ./ssl /etc/ssl
COPY ./conf/nginx.conf /etc/nginx/
COPY ./conf/game_launcher.conf /etc/nginx/conf.d
RUN rm /etc/nginx/conf.d/default.conf
