#!/bin/bash
python3 manage.py makemigrations
service redis-server start

python3 manage.py makemigrations
python3 manage.py migrate
psql -h db -U postgres -d postgres -tc "SELECT 1 FROM pg_constraint WHERE conname = 'unique_name'" | grep -q 1 || psql -h db -U postgres -d postgres -c "ALTER TABLE \"PongGame_gametype\" ADD CONSTRAINT unique_name UNIQUE (name);"
psql -h db -U postgres -d postgres -c "INSERT INTO \"PongGame_gametype\" (name) VALUES ('pong') ON CONFLICT (name) DO NOTHING;"
psql -h db -U postgres -d postgres -c "INSERT INTO \"PongGame_gametype\" (name) VALUES ('tron') ON CONFLICT (name) DO NOTHING;"

python -m uvicorn GameService.asgi:application --reload --host 0.0.0.0 --port 8001 --ssl-keyfile=/etc/ssl/certs/key.pem --ssl-certfile=/etc/ssl/certs/cert.pem