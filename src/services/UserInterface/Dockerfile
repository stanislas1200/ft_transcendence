# Base image
FROM python:3.8-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /usr/src/app

# Install dependencies
COPY requirements.txt /usr/src/app/
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy project
COPY . /usr/src/app/

# Ensure STATIC_ROOT is set
ENV DJANGO_STATIC_ROOT=/usr/src/app/staticfiles

RUN mkdir -p $DJANGO_STATIC_ROOT

# Collect static files
RUN python manage.py collectstatic --noinput

# Expose the port the app runs on
EXPOSE 8003

# Run the application
CMD ["python", "-m", "uvicorn", "UI.asgi:application", "--reload", "--host", "0.0.0.0", "--port", "8003", "--ssl-keyfile=/etc/ssl/certs/key.pem", "--ssl-certfile=/etc/ssl/certs/cert.pem"]
