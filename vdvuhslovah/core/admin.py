# core/admin.py

from django.contrib import admin
from .models import Post, Favorite, Profile
from django.db.models import Count


@admin.action(description='Заблокировать выбранные посты')
def block_posts(modeladmin, request, queryset):
    queryset.update(is_blocked=True)


@admin.action(description='Разблокировать выбранные посты')
def unblock_posts(modeladmin, request, queryset):
    queryset.update(is_blocked=False)


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('id', 'author', 'truncated_content', 'created_at', 'get_like_count', 'is_blocked')
    list_filter = ('created_at', 'is_blocked')
    search_fields = ('content', 'author__username')
    actions = [block_posts, unblock_posts]

    def truncated_content(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content

    truncated_content.short_description = 'Content'

    def get_like_count(self, obj):
        if hasattr(obj, 'like_count_anno'):
            return obj.like_count_anno
        return obj.like_count()

    get_like_count.short_description = 'Likes'
    get_like_count.admin_order_field = 'like_count_anno'

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(
            like_count_anno=Count('likes')
        )


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'post', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'post__content')
    date_hierarchy = 'created_at'


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'get_following_count', 'get_followers_count')
    search_fields = ('user__username',)
    filter_horizontal = ('following',)

    def get_following_count(self, obj):
        return obj.following.count()

    get_following_count.short_description = 'Following'

    def get_followers_count(self, obj):
        return obj.followers.count()

    get_followers_count.short_description = 'Followers'


