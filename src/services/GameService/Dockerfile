FROM python:3.8-slim

WORKDIR /usr/src/app

COPY . .

RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

RUN apt-get update && apt-get install -y redis-server postgresql-client && rm -rf /var/lib/apt/lists/*
RUN chmod +x start_services.sh
RUN chmod +x /usr/src/app/start_services.sh # FIXME : not working on mac ?

EXPOSE 8001

# CMD ["daphne", "-p", "8001", "GameService.asgi:application", "-b", "0.0.0.0"]
CMD ["/usr/src/app/start_services.sh"]