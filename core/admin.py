# backend/core/admin.py

from django.contrib import admin
from .models import Profile, Post, Repost, Comment, Favorite, PasswordResetToken


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone')
    search_fields = ('user__username', 'phone')


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('author', 'content', 'created_at')
    search_fields = ('author__username', 'content')
    list_filter = ('created_at',)


@admin.register(Repost)
class RepostAdmin(admin.ModelAdmin):
    list_display = ('user', 'original_post', 'created_at')
    search_fields = ('user__username',)
    list_filter = ('created_at',)


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('user', 'post', 'content', 'created_at')
    search_fields = ('user__username', 'content')
    list_filter = ('created_at',)


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'post', 'created_at')
    search_fields = ('user__username',)
    list_filter = ('created_at',)


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'token', 'created_at', 'expires_at')
    search_fields = ('user__username', 'token')
    list_filter = ('created_at', 'expires_at')

# dummy update

# updated 2025-07-12 11:27:40

# updated 2025-07-12 11:31:56
