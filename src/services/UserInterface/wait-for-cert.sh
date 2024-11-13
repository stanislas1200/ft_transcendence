#!/bin/bash
CERT_FILE="/etc/ssl/certs/cert.pem"
KEY_FILE="/etc/ssl/certs/key.pem"

# Attendre que les certificats soient disponibles
while [ ! -f "$CERT_FILE" ] || [ ! -f "$KEY_FILE" ]; do
    echo "En attente des fichiers de certificat..."
    sleep 2
done

# Lancer Uvicorn une fois les fichiers disponibles
exec python -m uvicorn UI.asgi:application --reload --host 0.0.0.0 --port 8003 --ssl-keyfile=$KEY_FILE --ssl-certfile=$CERT_FILE
