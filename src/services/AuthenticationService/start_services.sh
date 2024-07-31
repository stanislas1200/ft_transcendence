#!/bin/bash
python3 manage.py makemigrations
python3 manage.py migrate

cp ./media/* /var/www/transcendence/media/

python -m uvicorn AuthenticationService.asgi:application --reload --host 0.0.0.0 --port 8000 --ssl-keyfile=/etc/ssl/certs/key.pem --ssl-certfile=/etc/ssl/certs/cert.pem
