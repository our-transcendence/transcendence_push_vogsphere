#!/bin/bash


pip install --upgrade pip 2> /dev/null | grep -v "already satisfied"
pip install -r requirements.txt 2> /dev/null | grep -v "already satisfied"

if python3.10 manage.py makemigrations && python3.10 manage.py migrate
then
    python3.10 manage.py truncate --apps stats --models Search
    gunicorn --bind 0.0.0.0:"$PORT" -w 4 "$PROJECT".asgi:application -k uvicorn.workers.UvicornWorker
fi
