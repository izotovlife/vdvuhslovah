# core/serializers.py

from rest_framework import serializers
from .models import Post, Favorite, Comment, Profile
from django.contrib.auth.models import User


class CommentSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'author_username', 'text', 'created_at']


class PostSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    like_count = serializers.IntegerField(source='likes.count', read_only=True)
    comment_count = serializers.IntegerField(source='comments.count', read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    is_repost = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'author_username', 'content', 'created_at',
            'like_count', 'comment_count', 'comments',
            'original_post', 'is_repost'
        ]

    def get_is_repost(self, obj):
        return obj.original_post is not None


class FavoriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favorite
        fields = '__all__'


class UserProfileSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(source='profile.phone', allow_blank=True, allow_null=True)
    subscriptions = serializers.PrimaryKeyRelatedField(
        many=True,
        source='profile.subscriptions',
        queryset=Profile.objects.all(),
        required=False
    )

    class Meta:
        model = User
        fields = ['username', 'email', 'phone', 'subscriptions']

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        phone = profile_data.get('phone')

        instance.email = validated_data.get('email', instance.email)
        instance.save()

        profile = instance.profile
        if phone is not None:
            profile.phone = phone
            profile.save()

        return instance


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']

    def create(self, validated_data):
        user = User(
            username=validated_data['username'],
            email=validated_data.get('email', '')
        )
        user.set_password(validated_data['password'])  # Обязательно хешируем пароль
        user.save()
        return user
