#! /bin/bash
pip install --upgrade pip 2> /dev/null | grep -v "already satisfied"
pip install -r requirements.txt 2> /dev/null | grep -v "already satisfied"

python3.10 manage.py makemigrations
python3.10 manage.py migrate

gunicorn --bind 0.0.0.0:"$PORT" -w 1 $PROJECT.wsgi
