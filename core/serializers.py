# backend/core/serializers.py

from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.core.mail import send_mail
from django.conf import settings
from .models import Profile, Post, Repost, Comment


class ProfileSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ('id', 'avatar', 'bio', 'phone')

    def get_avatar(self, obj):
        request = self.context.get('request')
        if obj.avatar and hasattr(obj.avatar, 'url'):
            if request is not None:
                return request.build_absolute_uri(obj.avatar.url)
            else:
                return obj.avatar.url
        return None


class ProfileUpdateSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', allow_blank=True, required=False)
    last_name = serializers.CharField(source='user.last_name', allow_blank=True, required=False)
    email = serializers.EmailField(source='user.email', required=False)

    class Meta:
        model = Profile
        fields = ('avatar', 'bio', 'phone', 'first_name', 'last_name', 'email')

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user

        for attr, value in user_data.items():
            setattr(user, attr, value)
        user.save()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email', 'profile')


class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    post_content = serializers.CharField(source='post.content', read_only=True)
    post_author = serializers.CharField(source='post.author.username', read_only=True)

    class Meta:
        model = Comment
        fields = (
            'id', 'user',
            'post_content', 'post_author',
            'content', 'created_at'
        )
        read_only_fields = ('id', 'user', 'created_at')

    def create(self, validated_data):
        return Comment.objects.create(**validated_data)


class RepostSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    original_post_content = serializers.CharField(source='original_post.content', read_only=True)
    original_post_author = serializers.CharField(source='original_post.author.username', read_only=True)
    original_post_id = serializers.IntegerField(source='original_post.id', read_only=True)

    class Meta:
        model = Repost
        fields = (
            'id', 'user', 'created_at',
            'original_post', 'original_post_id',
            'original_post_content', 'original_post_author'
        )


class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    author_username = serializers.CharField(source='author.username', read_only=True)
    like_count = serializers.IntegerField(read_only=True)
    comment_count = serializers.IntegerField(read_only=True)
    repost_count = serializers.IntegerField(read_only=True)
    liked_by_user = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)
    reposts = RepostSerializer(many=True, read_only=True)

    class Meta:
        model = Post
        fields = (
            'id', 'author', 'author_username', 'content', 'created_at',
            'like_count', 'comment_count', 'repost_count', 'liked_by_user',
            'comments', 'reposts'
        )

    def get_liked_by_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False


class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2')
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Это имя пользователя уже занято, выберите другое.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Этот адрес электронной почты уже используется.")
        return value

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password2": "Пароли не совпадают"})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        Profile.objects.create(user=user)
        return user


# 🔐 Восстановление пароля

class SendPasswordResetEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Пользователь с таким email не найден.")
        return value

    def save(self, request=None):
        email = self.validated_data['email']
        user = User.objects.get(email=email)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        reset_url = f"http://localhost:3000/reset-password?uid={uid}&token={token}"
        print(f"[DEBUG] Ссылка для сброса пароля: {reset_url}")

        message = f"Для сброса пароля перейдите по ссылке: {reset_url}"
        send_mail(
            'Восстановление пароля',
            message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )


class ResetPasswordSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=6)

    def validate(self, data):
        try:
            uid = force_str(urlsafe_base64_decode(data['uid']))
            user = User.objects.get(pk=uid)
        except (User.DoesNotExist, ValueError, TypeError):
            raise serializers.ValidationError("Неверный UID.")

        if not default_token_generator.check_token(user, data['token']):
            raise serializers.ValidationError("Недействительный или просроченный токен.")

        data['user'] = user
        return data

    def save(self):
        user = self.validated_data['user']
        password = self.validated_data['new_password']
        user.set_password(password)
        user.save()
