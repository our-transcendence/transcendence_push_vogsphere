#!/bin/sh

#check if there is a ssl folder and if it is empty
if [ -d "ssl" ] && [ "$(ls -A ssl)" ]
then
    exit 0
fi

mkdir -p ./ssl
openssl req -x509 -newkey rsa:4096 -keyout ./ssl/key.pem -out ./ssl/cert.pem -sha256 -days 3650 -nodes -subj "/C=XX/ST=France/L=Lyon/O=42/OU=42Lyon/CN=42"
find . -type d -wholename '*/requirements/nginx' -exec cp -r ./ssl {} \;
cp -r ssl front-end
cp -r ssl game_launcher/requirements/game_launcher
