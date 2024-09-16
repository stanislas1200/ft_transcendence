FROM python:3.8-slim

WORKDIR /usr/src/app

COPY . .

 # TODO : ssl not here but zz
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8002

# CMD ["uvicorn", "Tchat.asgi:application", "--host", "0.0.0.0", "--port", "8002", "--reload"]
CMD ["python", "/usr/src/app/manage.py", "runserver", "0.0.0.0:8002"]
