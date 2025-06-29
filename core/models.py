#C:\Users\ASUS Vivobook\PycharmProjects\PythonProject\vdvuhslovah\core\models.py

from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    following = models.ManyToManyField('self', symmetrical=False, related_name='followers')


class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User, related_name='liked_posts', blank=True)
    hidden_by = models.ManyToManyField(User, related_name='hidden_posts', blank=True)

    is_blocked = models.BooleanField(default=False)  # Добавлено поле блокировки

    def like_count(self):
        return self.likes.count()


class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
