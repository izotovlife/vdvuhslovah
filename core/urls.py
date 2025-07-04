# backend/core/urls.py

from django.urls import path
from .views import (
    ProfileDetailAPIView, PostListCreateAPIView, PopularPostsAPIView,
    PostCommentCreateAPIView, PostRepostAPIView, PostLikeAPIView,
    UserPostsAPIView, UserRepostsAPIView, UserCommentsAPIView,
    ChangePasswordAPIView, RegisterAPIView, CurrentUserAPIView, PostCommentListAPIView
)

urlpatterns = [
    path('profile/', ProfileDetailAPIView.as_view(), name='profile-detail'),
    path('posts/', PostListCreateAPIView.as_view(), name='post-list'),
    path('posts/popular/', PopularPostsAPIView.as_view(), name='popular-posts'),

    path('posts/<int:pk>/comments/', PostCommentListAPIView.as_view(), name='post-comments-list'),  # GET список комментариев
    path('posts/<int:pk>/comments/create/', PostCommentCreateAPIView.as_view(), name='post-comments-create'),  # POST создание комментария

    path('posts/<int:pk>/repost/', PostRepostAPIView.as_view(), name='post-repost'),
    path('posts/<int:pk>/like/', PostLikeAPIView.as_view(), name='post-like'),

    path('users/<str:username>/posts/', UserPostsAPIView.as_view(), name='user-posts'),
    path('users/<str:username>/reposts/', UserRepostsAPIView.as_view(), name='user-reposts'),
    path('users/<str:username>/comments/', UserCommentsAPIView.as_view(), name='user-comments'),

    path('change-password/', ChangePasswordAPIView.as_view(), name='change-password'),
    path('register/', RegisterAPIView.as_view(), name='register'),
    path('me/', CurrentUserAPIView.as_view(), name='current-user'),
]
