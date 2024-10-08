FROM python:3.8-slim

WORKDIR /usr/src/app

COPY . .

RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

RUN apt-get update && apt-get install -y redis-server && rm -rf /var/lib/apt/lists/*

EXPOSE 8002

CMD ["/usr/src/app/start_services.sh"]