#!/bin/bash
python3 manage.py makemigrations
service redis-server start

python3 manage.py makemigrations
python3 manage.py migrate

python -m uvicorn Tchat.asgi:application --host 0.0.0.0 --port 8002 --reload
