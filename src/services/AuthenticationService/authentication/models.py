from django.db import models
from django.contrib.auth.models import User

class UserToken(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=255)
    avatar = models.ImageField()

# Authorized ? : https://github.com/revsys/django-friendship