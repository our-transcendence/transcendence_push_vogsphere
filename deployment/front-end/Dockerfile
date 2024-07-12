FROM debian

ARG GITHUB_TOKEN

RUN apt update
RUN apt install -y openssl nginx npm nodejs software-properties-common

RUN apt install -y curl

RUN npm install npm@latest -g && \
    npm install n -g && \
    n latest

COPY ./ssl /etc/ssl
COPY ./conf /etc/nginx/conf.d/default.conf
COPY ./clone.sh /
ADD ./source/front-end/ /website

RUN chmod 777 /clone.sh

CMD ["bash", "/clone.sh"]
