FROM python:3.8-slim

WORKDIR /usr/src/app

COPY . .

 # TODO : ssl not here but zz
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

RUN apt-get update && apt-get install -y redis-server && rm -rf /var/lib/apt/lists/*

EXPOSE 8002

CMD ["/usr/src/app/start_services.sh"]
# ENTRYPOINT ["service", "redis-server", "start"]
# CMD ["uvicorn", "Tchat.asgi:application", "--host", "0.0.0.0", "--port", "8002", "--reload"]
# CMD ["python", "-m", "uvicorn", "UI.asgi:application", "--reload", "--host", "0.0.0.0", "--port", "8002", "--ssl-keyfile=/etc/ssl/certs/key.pem", "--ssl-certfile=/etc/ssl/certs/cert.pem"]
# CMD ["uvicorn", "Tchat.asgi:application", "--host", "0.0.0.0", "--port", "8002", "--reload"]
# CMD ["python", "/usr/src/app/manage.py", "runserver", "0.0.0.0:8002"]
