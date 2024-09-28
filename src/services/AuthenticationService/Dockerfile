FROM python:3.8-slim

WORKDIR /usr/src/app

COPY . .

RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

RUN chmod +x start_services.sh
RUN chmod +x /usr/src/app/start_services.sh

EXPOSE 8000

# CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]
CMD ["/usr/src/app/start_services.sh"]