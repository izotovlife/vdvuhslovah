# backend/core/models.py
# Основные модели приложения core:
# - Profile: расширенный профиль пользователя с дополнительными полями и настройками приватности (добавлена приватность аккаунта)
# - Post: пост пользователя с контентом, лайками, подсчётом комментариев и репостов
#         добавлены поля для поддержки ответов (parent), цитат (quoted_post), обновления и закрепления (is_pinned)
# - Comment: комментарии к постам с поддержкой вложенных ответов (parent)
# - Repost: репосты постов пользователями
# - Favorite: избранное (лайкнутые или добавленные в избранное посты)
# - PasswordResetToken: токен для восстановления пароля с ограничением по времени
# - Notification: уведомления о лайках, комментариях, репостах и упоминаниях с привязкой к отправителю, получателю и объекту
# - Follow: подписки пользователей (кто на кого подписан)

from django.db import models
from django.contrib.auth.models import User
from django.utils.crypto import get_random_string
from django.utils import timezone


class Profile(models.Model):
    """
    Расширенный профиль пользователя:
    - Телефон, имя, фамилия, город
    - Аватар и баннер (изображения)
    - Биография, местоположение, сайт
    - Дата рождения и её видимость (публично, только подписчикам, только себе)
    - Флаг приватности аккаунта (приватный/публичный)
    """
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
    is_private = models.BooleanField(default=False, help_text="Если True — аккаунт приватный, виден только подписчикам")

    objects = models.Manager()

    def __str__(self):
        return self.user.username


class Post(models.Model):
    """
    Пост пользователя с текстовым контентом.
    Поля:
    - author: ссылка на пользователя-автора
    - content: текст поста (до 280 символов)
    - created_at: дата и время создания
    - updated_at: дата и время последнего обновления
    - likes: множество пользователей, поставивших лайк
    - parent: ссылка на родительский пост (если это ответ)
    - is_quote: флаг, что это цитата другого поста
    - quoted_post: ссылка на цитируемый пост
    - is_pinned: закреплен ли пост (например, в профиле)

    Методы:
    - like_count: количество лайков
    - comment_count: количество комментариев
    - repost_count: количество репостов
    """
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField(max_length=280)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    likes = models.ManyToManyField(User, related_name='liked_posts', blank=True)

    parent = models.ForeignKey('self', null=True, blank=True, related_name='replies', on_delete=models.CASCADE)
    is_quote = models.BooleanField(default=False)
    quoted_post = models.ForeignKey('self', null=True, blank=True, related_name='quotes', on_delete=models.SET_NULL)
    is_pinned = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.author.username}: {self.content[:50]}"

    def like_count(self):
        return self.likes.count()

    def comment_count(self):
        return self.replies.count()

    def repost_count(self):
        return self.reposts.count()

    objects = models.Manager()


class Comment(models.Model):
    """
    Комментарий к посту:
    - user: автор комментария
    - post: пост, к которому относится комментарий
    - content: текст комментария (до 280 символов)
    - created_at: дата и время создания
    - parent: если комментарий является ответом, ссылка на родительский комментарий (вложенность)

    Позволяет реализовать вложенные комментарии
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, related_name='comments', on_delete=models.CASCADE)
    content = models.TextField(max_length=280)
    created_at = models.DateTimeField(auto_now_add=True)

    parent = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        related_name='replies',
        on_delete=models.CASCADE
    )

    def __str__(self):
        return f"{self.user.username} прокомментировал пост {self.post.id}"

    objects = models.Manager()


class Repost(models.Model):
    """
    Репост поста пользователем:
    - user: кто сделал репост
    - original_post: исходный пост
    - created_at: дата и время репоста

    Обеспечивает возможность делиться постами
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    original_post = models.ForeignKey(Post, related_name='reposts', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} репостнул пост {self.original_post.id}"

    objects = models.Manager()


class Favorite(models.Model):
    """
    Избранное — пользователь может добавить пост в избранное.
    Уникальность пары (user, post) гарантирована.
    """
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


class Follow(models.Model):
    """
    Подписка пользователя на другого пользователя
    Уникальность пары (follower, following) гарантирована.
    """
    follower = models.ForeignKey(User, related_name='following', on_delete=models.CASCADE)
    following = models.ForeignKey(User, related_name='followers', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'following')

    def __str__(self):
        return f"{self.follower.username} подписан на {self.following.username}"

    objects = models.Manager()


class PasswordResetToken(models.Model):
    """
    Токен для восстановления пароля:
    - token: случайная строка длиной 64 символа
    - expires_at: срок жизни токена (24 часа по умолчанию)
    """
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
    """
    Уведомления пользователя:
    - recipient: получатель уведомления
    - sender: отправитель уведомления
    - notification_type: тип (лайк, комментарий, репост, упоминание)
    - post, comment, repost: объекты, связанные с уведомлением (опционально)
    - created_at: дата создания
    - is_read: прочитано/непрочитано
    """
    NOTIFICATION_TYPES = (
        ('like', 'Лайк'),
        ('comment', 'Комментарий'),
        ('repost', 'Репост'),
        ('mention', 'Упоминание'),
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
        return f"{self.sender.username} {self.notification_type} -> {self.recipient.username}"

    objects = models.Manager()
