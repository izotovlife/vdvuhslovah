# core/serializers.py

# core/serializers.py

from rest_framework import serializers
from rest_framework.validators import UniqueValidator
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
    original_post = serializers.PrimaryKeyRelatedField(read_only=True)

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
        read_only_fields = ['id']


class UserProfileSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(allow_blank=True, required=False)
    avatar = serializers.ImageField(allow_null=True, required=False)
    first_name = serializers.CharField(allow_blank=True, required=False)
    last_name = serializers.CharField(allow_blank=True, required=False)

    class Meta:
        model = User
        fields = ['username', 'email', 'phone', 'avatar', 'first_name', 'last_name']
        extra_kwargs = {
            'email': {
                'required': False,
                'allow_blank': True,
                'validators': [UniqueValidator(queryset=User.objects.all())]
            },
            'username': {
                'validators': [UniqueValidator(queryset=User.objects.all())]
            }
        }

    def to_representation(self, instance):
        profile = instance.profile
        rep = super().to_representation(instance)
        rep['phone'] = profile.phone
        rep['avatar'] = profile.avatar.url if profile.avatar else None
        rep['first_name'] = profile.first_name
        rep['last_name'] = profile.last_name
        return rep

    def update(self, instance, validated_data):
        # Обновление User
        instance.email = validated_data.get('email', instance.email)
        instance.username = validated_data.get('username', instance.username)
        instance.save()

        # Обновление Profile
        profile = instance.profile
        profile.phone = validated_data.get('phone', profile.phone)
        if 'avatar' in self.initial_data:
            profile.avatar = self.initial_data.get('avatar')
        profile.first_name = validated_data.get('first_name', profile.first_name)
        profile.last_name = validated_data.get('last_name', profile.last_name)
        profile.save()

        return instance


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(
        required=False,
        allow_blank=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    username = serializers.CharField(
        validators=[UniqueValidator(queryset=User.objects.all())]
    )

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']

    def create(self, validated_data):
        user = User(
            username=validated_data['username'],
            email=validated_data.get('email', '')
        )
        user.set_password(validated_data['password'])
        user.save()
        return user
