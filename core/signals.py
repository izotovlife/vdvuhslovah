#C:\Users\ASUS Vivobook\PycharmProjects\PythonProject1\vdvuhslovah\core\signals.py

from django.db.models.signals import post_save, m2m_changed
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Profile, Post, Comment, Repost, Notification


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=Comment)
def create_comment_notification(sender, instance, created, **kwargs):
    if created and instance.post.author != instance.user:
        Notification.objects.create(
            recipient=instance.post.author,
            sender=instance.user,
            notification_type='comment',
            post=instance.post,
            comment=instance
        )


@receiver(post_save, sender=Repost)
def create_repost_notification(sender, instance, created, **kwargs):
    if created and instance.original_post.author != instance.user:
        Notification.objects.create(
            recipient=instance.original_post.author,
            sender=instance.user,
            notification_type='repost',
            post=instance.original_post,
            repost=instance
        )


@receiver(m2m_changed, sender=Post.likes.through)
def create_like_notification(sender, instance, action, pk_set, **kwargs):
    if action == 'post_add':
        for user_id in pk_set:
            liker = User.objects.get(pk=user_id)
            if liker != instance.author:
                Notification.objects.create(
                    recipient=instance.author,
                    sender=liker,
                    notification_type='like',
                    post=instance
                )

# updated 2025-07-12 22:40:59

# updated 2025-07-12 23:07:08

# updated 2025-07-13 21:53:56
