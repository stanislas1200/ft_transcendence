FROM python:3.8-slim

WORKDIR /usr/src/app

COPY . .

RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

RUN apt-get update && apt-get install -y redis-server postgresql-client dos2unix && rm -rf /var/lib/apt/lists/*
RUN dos2unix start_services.sh
RUN chmod +x start_services.sh
RUN chmod +x /usr/src/app/start_services.sh # FIXME : not working on mac ?

EXPOSE 8001

CMD ["/usr/src/app/start_services.sh"]