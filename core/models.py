# backend/core/models.py

from django.db import models
from django.contrib.auth.models import User
from django.utils.crypto import get_random_string
from django.utils import timezone

class Profile(models.Model):
    BIRTH_DATE_VISIBILITY_CHOICES = [
        ('public', 'Показывать всем'),
        ('followers', 'Только подписчикам'),
        ('private', 'Только себе'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=20, blank=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    city = models.CharField(max_length=100, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    banner = models.ImageField(upload_to='banners/', blank=True, null=True)

    bio = models.TextField(blank=True)
    location = models.CharField(max_length=255, blank=True)
    website = models.URLField(blank=True)
    birth_date = models.DateField(blank=True, null=True)
    birth_date_visibility = models.CharField(
        max_length=10,
        choices=BIRTH_DATE_VISIBILITY_CHOICES,
        default='public',
    )

    objects = models.Manager()

    def __str__(self):
        return self.user.username


class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField(max_length=280)
    created_at = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User, related_name='liked_posts', blank=True)

    def __str__(self):
        return f"{self.author.username}: {self.content[:50]}"

    def like_count(self):
        return self.likes.count()

    def comment_count(self):
        return self.comments.count()

    def repost_count(self):
        return self.reposts.count()

    objects = models.Manager()


class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, related_name='comments', on_delete=models.CASCADE)
    content = models.TextField(max_length=280)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} прокомментировал пост {self.post.id}"

    objects = models.Manager()


class Repost(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    original_post = models.ForeignKey(Post, related_name='reposts', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} репостнул пост {self.original_post.id}"

    objects = models.Manager()


class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'post')
        verbose_name = 'Избранное'
        verbose_name_plural = 'Избранное'

    def __str__(self):
        return f"{self.user.username} добавил в избранное пост {self.post.id}"

    objects = models.Manager()


class PasswordResetToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def create_token(self):
        self.token = get_random_string(length=64)
        self.expires_at = timezone.now() + timezone.timedelta(hours=24)
        self.save()

    def __str__(self):
        return f"Password reset token for {self.user.username} (expires: {self.expires_at})"

    objects = models.Manager()


class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('like', 'Лайк'),
        ('comment', 'Комментарий'),
        ('repost', 'Репост'),
    )

    recipient = models.ForeignKey(User, related_name='notifications', on_delete=models.CASCADE)
    sender = models.ForeignKey(User, related_name='sent_notifications', on_delete=models.CASCADE)
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, null=True, blank=True)
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, null=True, blank=True)
    repost = models.ForeignKey(Repost, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.sender} {self.notification_type} -> {self.recipient}"

    objects = models.Manager()

# updated 2025-07-12 22:40:59
