# backend/core/urls.py

from django.urls import path
from .views import (
    RegisterAPIView, ProfileDetailAPIView, PostListCreateAPIView,
    PostCommentListAPIView, PostCommentCreateAPIView, PostRepostAPIView,
    PostLikeAPIView, PopularPostsAPIView, UserPostsAPIView, UserRepostsAPIView,
    UserCommentsAPIView, ChangePasswordAPIView, CurrentUserAPIView,
    SendPasswordResetEmailAPIView, ResetPasswordAPIView,
)

urlpatterns = [
    path('register/', RegisterAPIView.as_view(), name='register'),
    path('profile/', ProfileDetailAPIView.as_view(), name='profile-detail'),

    path('posts/', PostListCreateAPIView.as_view(), name='posts'),
    path('posts/<int:pk>/comments/', PostCommentListAPIView.as_view(), name='post-comments'),
    path('posts/<int:pk>/comments/create/', PostCommentCreateAPIView.as_view(), name='post-comment-create'),
    path('posts/<int:pk>/repost/', PostRepostAPIView.as_view(), name='post-repost'),
    path('posts/<int:pk>/like/', PostLikeAPIView.as_view(), name='post-like'),

    path('posts/popular/', PopularPostsAPIView.as_view(), name='popular-posts'),
    path('users/<str:username>/posts/', UserPostsAPIView.as_view(), name='user-posts'),
    path('users/<str:username>/reposts/', UserRepostsAPIView.as_view(), name='user-reposts'),
    path('users/<str:username>/comments/', UserCommentsAPIView.as_view(), name='user-comments'),

    path('change-password/', ChangePasswordAPIView.as_view(), name='change-password'),
    path('me/', CurrentUserAPIView.as_view(), name='current-user'),

    # Восстановление пароля
    path('send-reset-email/', SendPasswordResetEmailAPIView.as_view(), name='send-reset-email'),
    path('reset-password/', ResetPasswordAPIView.as_view(), name='reset-password'),
]
