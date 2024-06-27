#!/bin/bash
service redis-server start

python3 manage.py migrate
psql -h db -U postgres -d postgres -tc "SELECT 1 FROM pg_constraint WHERE conname = 'unique_name'" | grep -q 1 || psql -h db -U postgres -d postgres -c "ALTER TABLE \"PongGame_gametype\" ADD CONSTRAINT unique_name UNIQUE (name);"
psql -h db -U postgres -d postgres -c "INSERT INTO \"PongGame_gametype\" (name) VALUES ('pong') ON CONFLICT (name) DO NOTHING;"

daphne -p 8001 GameService.asgi:application -b 0.0.0.0