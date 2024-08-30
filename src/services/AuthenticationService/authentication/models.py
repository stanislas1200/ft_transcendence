from django.db import models
from django.contrib.auth.models import User
import os

def user_directory_path(instance, filename):
    return os.path.join('user_{0}/avatar/'.format(instance.user.id), filename)

class UserToken(models.Model): # TODO : Social service ?: use ws to get online/offline +- and for notification db notif on connect send all if read delete from db. Add friends
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=255)
    avatar = models.ImageField(upload_to=user_directory_path, default='default.png', blank=True, null=True)

class Friendship(models.Model):
    user1 = models.ForeignKey(User, related_name='friendships1', on_delete=models.CASCADE)
    user2 = models.ForeignKey(User, related_name='friendships2', on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user1', 'user2') 

class FriendRequest(models.Model):
    sender = models.ForeignKey(User, related_name='sent_requests', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='received_requests', on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)


User.add_to_class(
    'friends',
    property(lambda u: 
        list(User.objects.filter(
            id__in=(
                list(Friendship.objects.filter(user1=u).values_list('user2_id', flat=True)) +
                list(Friendship.objects.filter(user2=u).values_list('user1_id', flat=True))
            )
        ))
    )
)
    