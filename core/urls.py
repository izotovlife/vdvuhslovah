# backend/core/urls.py

from django.urls import path
from .views import (
    RegisterAPIView, ProfileDetailAPIView, PostListCreateAPIView,
    PostCommentListCreateAPIView, PostRepostAPIView,
    PostLikeAPIView, PopularPostsAPIView, UserPostsAPIView, UserRepostsAPIView,
    UserCommentsAPIView, ChangePasswordAPIView, CurrentUserAPIView,
    SendPasswordResetEmailAPIView, ResetPasswordAPIView,
    LikedPostsAPIView, UserRepostsListAPIView,
    PublicProfileView, NotificationListAPIView,
    PasswordCheckAPIView  # Новый класс для проверки сложности пароля
)

urlpatterns = [
    path('register/', RegisterAPIView.as_view(), name='register'),
    path('profile/', ProfileDetailAPIView.as_view(), name='profile-detail'),

    # Посты, их комментарии и лайки
    path('posts/', PostListCreateAPIView.as_view(), name='posts'),
    path('posts/<int:pk>/comments/', PostCommentListCreateAPIView.as_view(), name='post-comments'),
    path('posts/<int:pk>/repost/', PostRepostAPIView.as_view(), name='post-repost'),
    path('posts/<int:pk>/like/', PostLikeAPIView.as_view(), name='post-like'),

    # Популярные посты
    path('posts/popular/', PopularPostsAPIView.as_view(), name='popular-posts'),

    # Лайкнутые и репостнутые посты текущего пользователя
    path('posts/liked/', LikedPostsAPIView.as_view(), name='liked-posts'),
    path('posts/reposts/', UserRepostsListAPIView.as_view(), name='user-reposts-list'),

    # Посты, репосты и комментарии пользователя по username
    path('users/<str:username>/posts/', UserPostsAPIView.as_view(), name='user-posts'),
    path('users/<str:username>/reposts/', UserRepostsAPIView.as_view(), name='user-reposts'),
    path('users/<str:username>/comments/', UserCommentsAPIView.as_view(), name='user-comments'),

    # Общедоступный профиль пользователя
    path('users/<str:username>/profile/', PublicProfileView.as_view(), name='public-profile'),

    # Смена пароля и получение текущего пользователя
    path('change-password/', ChangePasswordAPIView.as_view(), name='change-password'),
    path('me/', CurrentUserAPIView.as_view(), name='current-user'),

    # Восстановление пароля
    path('send-reset-email/', SendPasswordResetEmailAPIView.as_view(), name='send-reset-email'),
    path('reset-password/', ResetPasswordAPIView.as_view(), name='reset-password'),

    # Маршрут для проверки сложности пароля
    path('password-check/', PasswordCheckAPIView.as_view(), name='password-check'),

    # Оставшиеся маршруты уведомлений
    path('notifications/', NotificationListAPIView.as_view(), name='notifications'),
]
# updated 2025-07-12 22:40:59

# updated 2025-07-12 23:07:08

# updated 2025-07-13 21:53:56

# updated 2025-07-13 22:00:14

# updated 2025-07-13 22:09:14

# updated 2025-07-13 23:07:46

# updated 2025-07-13 23:32:13
