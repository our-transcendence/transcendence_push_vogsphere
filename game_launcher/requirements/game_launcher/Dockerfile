FROM python:3.10

ARG GITHUB_TOKEN
ARG PROJECT
ARG REPO
ARG BRANCH=main
ARG PORT

RUN echo test
RUN test -n "$GITHUB_TOKEN" || (echo "GITHUB_TOKEN not set" && false)
RUN test -n "$PROJECT" || (echo "PROJECT not set" && false)
RUN test -n "$REPO" || (echo "REPO not set" && false)
RUN test -n "$PORT" || (echo "PORT not set" && false)

COPY ./ssl /etc/ssl

ENV PROJECT=${PROJECT}
ENV PORT=${PORT}
ENV BRANCH=${BRANCH}

RUN apt-get update && \
    apt-get install -y git net-tools

ADD ./source/pong-launcher /pong-launcher/

WORKDIR /pong-launcher

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

RUN mkdir -p /var/game

COPY start.sh .

HEALTHCHECK --interval=5s --timeout=30s --start-period=10s --retries=3 \
    CMD netstat -anop | grep LISTEN | grep python | grep "0.0.0.0:${PORT}"

CMD [ "bash", "start.sh" ]
