from django.db import models
from django.contrib.auth.models import User
import os

def user_directory_path(instance, filename):
    return os.path.join('user_{0}/avatar/'.format(instance.user.id), filename)

class UserToken(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=255)
    avatar = models.ImageField(upload_to=user_directory_path, blank=True, null=True)

# Authorized ? : https://github.com/revsys/django-friendship