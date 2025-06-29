#C:\Users\ASUS Vivobook\PycharmProjects\PythonProject\vdvuhslovah\core\models.py

from django.db import models
from django.contrib.auth.models import User
from django.db.models import Count
from django.db.models.signals import post_save
from django.dispatch import receiver

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    following = models.ManyToManyField('self', symmetrical=False, related_name='followers')

    def __str__(self):
        return self.user.username

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'profile'):
        instance.profile.save()

class PostQuerySet(models.QuerySet):
    def annotate_like_count(self):
        return self.annotate(like_count=Count('likes'))

class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.CharField(max_length=200, blank=True)  # ✅ теперь content может быть пустым
    created_at = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User, related_name='liked_posts', blank=True)
    hidden_by = models.ManyToManyField(User, related_name='hidden_posts', blank=True)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='retweets')
    is_blocked = models.BooleanField(default=False)

    objects = PostQuerySet.as_manager()

    def like_count(self):
        return self.likes.count()

    def is_retweet(self):
        return self.parent is not None

    def __str__(self):
        return f"{self.author.username}: {self.content[:30]}"

class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} ➜ {self.post.id}"
