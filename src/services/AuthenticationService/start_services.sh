#!/bin/bash
python3 manage.py makemigrations
python3 manage.py migrate

cp ./media/* /var/www/transcendence/media/

python3 manage.py runserver 0.0.0.0:8000