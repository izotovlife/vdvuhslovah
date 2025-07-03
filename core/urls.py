# backend/core/urls.py

from django.urls import path
from .views import (
    ProfileDetailAPIView, PostListCreateAPIView, CommentCreateAPIView,
    RepostCreateAPIView, PopularPostsAPIView, UserPostsAPIView,
    UserRepostsAPIView, UserCommentsAPIView, ChangePasswordAPIView,
    RegisterAPIView, CurrentUserAPIView,
)

urlpatterns = [
    path('profile/', ProfileDetailAPIView.as_view(), name='profile-detail'),
    path('posts/', PostListCreateAPIView.as_view(), name='post-list-create'),
    path('comments/', CommentCreateAPIView.as_view(), name='comment-create'),
    path('reposts/', RepostCreateAPIView.as_view(), name='repost-create'),

    path('popular/', PopularPostsAPIView.as_view(), name='popular-posts'),

    path('user/<str:username>/posts/', UserPostsAPIView.as_view(), name='user-posts'),
    path('user/<str:username>/reposts/', UserRepostsAPIView.as_view(), name='user-reposts'),
    path('user/<str:username>/comments/', UserCommentsAPIView.as_view(), name='user-comments'),

    path('change-password/', ChangePasswordAPIView.as_view(), name='change-password'),
    path('register/', RegisterAPIView.as_view(), name='register'),
    path('me/', CurrentUserAPIView.as_view(), name='current-user'),
]