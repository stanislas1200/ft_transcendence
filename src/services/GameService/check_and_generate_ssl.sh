#!/bin/bash

CERT_DIR=/etc/ssl/certs
CERT_FILE=$CERT_DIR/cert.pem
KEY_FILE=$CERT_DIR/key.pem
DAYS_THRESHOLD=30

check_cert_expiration() {
    END_DATE=$(openssl x509 -enddate -noout -in "$CERT_FILE" | cut -d= -f2)
    END_DATE_EPOCH=$(date -d "$END_DATE" +%s)
    
    CURRENT_DATE_EPOCH=$(date +%s)
    
    let "DAYS_LEFT=($END_DATE_EPOCH - $CURRENT_DATE_EPOCH) / 86400"
    
    if [ $DAYS_LEFT -le $DAYS_THRESHOLD ]; then
        return 0 # Certificate is expiring soon
    fi
    return 1
}

# Check if SSL certificate and key exist
if [ ! -f "$CERT_FILE" ] || [ ! -f "$KEY_FILE" ] || check_cert_expiration; then
    echo "Generating new SSL certificate..."
    openssl req -x509 -nodes -days 365 -newkey rsa:4096 -keyout "$KEY_FILE" -out "$CERT_FILE" -subj "/C=BE/ST=Flanders/L=Wemmel/O=sgodin/CN=localhost";
    echo "SSL certificate and key generated."
else
    echo "SSL certificate and key exist. Skipping generation."
fi

# Execute the main container command
exec "$@"