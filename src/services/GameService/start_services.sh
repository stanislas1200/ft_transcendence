#!/bin/bash
service redis-server start

python3 manage.py migrate
psql -h db -U postgres -d postgres -c "INSERT INTO \"PongGame_gametype\" (name) VALUES ('pong');"

daphne -p 8001 GameService.asgi:application -b 0.0.0.0