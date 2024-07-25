# Dockerfile pour UserInterface
FROM python:3.10-slim

# Définir le répertoire de travail
WORKDIR /usr/src/app

# Copier les fichiers de requirements.txt
COPY requirements.txt .

# Installer les dépendances
RUN pip install --no-cache-dir -r requirements.txt

# Copier le reste des fichiers du projet
COPY . .

# Exposer le port du serveur Django
EXPOSE 8000

# Commande pour démarrer le serveur Django
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
