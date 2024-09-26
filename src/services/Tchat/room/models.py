from django.db import models
from django.contrib.auth.models import User

class Room(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)

class Block(models.Model):
    blocker = models.ForeignKey(User, related_name='blocker', on_delete=models.CASCADE)
    blocked = models.ForeignKey(User, related_name='blocked', on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('blocker', 'blocked')

User.add_to_class(
    'blocked',
    property(lambda u: User.objects.filter(id__in=Block.objects.filter(blocker=u).values_list('blocked_id', flat=True)))
)