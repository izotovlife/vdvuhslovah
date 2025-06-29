# core/serializers.py

from rest_framework import serializers
from .models import Post, Favorite
from django.contrib.auth.models import User
from rest_framework.exceptions import ValidationError


class PostSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    like_count = serializers.IntegerField(read_only=True)
    parent = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'author_username', 'content', 'created_at', 'like_count', 'parent']

    def get_parent(self, obj):
        if obj.parent:
            return {
                'id': obj.parent.id,
                'author_username': obj.parent.author.username,
                'content': obj.parent.content,
                'created_at': obj.parent.created_at,
                'like_count': obj.parent.like_count(),
            }
        return None


class FavoritePostSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    like_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'author_username', 'content', 'created_at', 'like_count']


class FavoriteSerializer(serializers.ModelSerializer):
    post = FavoritePostSerializer(read_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'post', 'created_at']
        read_only_fields = ['user']


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),  # Убедитесь, что email передается
            password=validated_data['password']
        )
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    current_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['email', 'current_password']
        extra_kwargs = {
            'email': {'required': True},
        }

    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Неверный пароль")
        return value

    def update(self, instance, validated_data):
        instance.email = validated_data['email']
        instance.save()
        return instance


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password1 = serializers.CharField(required=True, write_only=True)
    new_password2 = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        if data['new_password1'] != data['new_password2']:
            raise ValidationError({"new_password2": "Пароли не совпадают"})
        return data


