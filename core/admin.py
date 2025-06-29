# core/admin.py

from django.contrib import admin
from .models import Post, Favorite

@admin.action(description='Заблокировать выбранные посты')
def block_posts(modeladmin, request, queryset):
    queryset.update(is_blocked=True)

@admin.action(description='Разблокировать выбранные посты')
def unblock_posts(modeladmin, request, queryset):
    queryset.update(is_blocked=False)

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('id', 'author', 'content', 'created_at', 'is_blocked')
    list_filter = ('created_at', 'is_blocked')
    search_fields = ('content', 'author__username')
    actions = [block_posts, unblock_posts]

@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'post')
    search_fields = ('user__username', 'post__content')


