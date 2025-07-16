#C:\Users\ASUS Vivobook\PycharmProjects\PythonProject1\vdvuhslovah\core\serializers.py

from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.core.mail import send_mail
from django.conf import settings
from .models import Profile, Post, Repost, Comment, Notification

import random
import string


class SimpleUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username')


class SimplePostSerializer(serializers.ModelSerializer):
    author = SimpleUserSerializer(read_only=True)

    class Meta:
        model = Post
        fields = ('id', 'author', 'content', 'created_at')


class SimpleRepostSerializer(serializers.ModelSerializer):
    user = SimpleUserSerializer(read_only=True)

    class Meta:
        model = Repost
        fields = ('id', 'user', 'created_at')


class ProfileSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()
    banner = serializers.SerializerMethodField()
    name = serializers.CharField(source='user.get_full_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    posts = serializers.SerializerMethodField()
    reposts = serializers.SerializerMethodField()
    liked_posts = serializers.SerializerMethodField()
    country = serializers.CharField(read_only=True)
    city = serializers.CharField(read_only=True)
    bio = serializers.CharField(read_only=True)
    phone = serializers.CharField(read_only=True)

    class Meta:
        model = Profile
        fields = (
            'id', 'avatar', 'banner', 'bio', 'phone',
            'name', 'email', 'first_name', 'last_name',
            'country', 'city',
            'posts', 'reposts', 'liked_posts'
        )

    def get_avatar(self, obj):
        request = self.context.get('request')
        if obj.avatar and hasattr(obj.avatar, 'url'):
            return request.build_absolute_uri(obj.avatar.url) if request else obj.avatar.url
        return None

    def get_banner(self, obj):
        request = self.context.get('request')
        if obj.banner and hasattr(obj.banner, 'url'):
            return request.build_absolute_uri(obj.banner.url) if request else obj.banner.url
        return None

    def get_posts(self, obj):
        qs = Post.objects.filter(author=obj.user).order_by('-created_at')
        return SimplePostSerializer(qs, many=True, context=self.context).data

    def get_reposts(self, obj):
        qs = Repost.objects.filter(user=obj.user).order_by('-created_at')
        return SimpleRepostSerializer(qs, many=True, context=self.context).data

    def get_liked_posts(self, obj):
        qs = Post.objects.filter(likes=obj.user).order_by('-created_at')
        return SimplePostSerializer(qs, many=True, context=self.context).data


class ProfileUpdateSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', allow_blank=True, required=False)
    last_name = serializers.CharField(source='user.last_name', allow_blank=True, required=False)
    email = serializers.EmailField(source='user.email', required=False)
    password = serializers.CharField(write_only=True, required=False)
    password2 = serializers.CharField(write_only=True, required=False)
    country = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    avatar = serializers.ImageField(required=False, allow_null=True)
    banner = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Profile
        fields = (
            'avatar', 'banner', 'bio', 'phone',
            'first_name', 'last_name', 'email',
            'password', 'password2',
            'country', 'city'
        )

    def validate(self, data):
        pw = data.get('password')
        pw2 = data.get('password2')
        if pw or pw2:
            if pw != pw2:
                raise serializers.ValidationError({"password2": "Пароли не совпадают"})
        return data

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user

        pw = validated_data.pop('password', None)
        if pw:
            user.set_password(pw)

        for attr, val in user_data.items():
            setattr(user, attr, val)
        user.save()

        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()

        return instance


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email', 'name', 'profile')

    def get_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()


class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    post_content = serializers.CharField(source='post.content', read_only=True)
    post_author = serializers.CharField(source='post.author.username', read_only=True)
    parent = serializers.PrimaryKeyRelatedField(
        queryset=Comment.objects.all(), required=False, allow_null=True
    )
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ('id', 'user', 'post_content', 'post_author', 'content', 'created_at', 'parent', 'replies')
        read_only_fields = ('id', 'user', 'created_at', 'replies')

    def get_replies(self, obj):
        replies_qs = obj.replies.all().order_by('created_at')
        return CommentSerializer(replies_qs, many=True, context=self.context).data

    def create(self, validated_data):
        parent = validated_data.pop('parent', None)
        # Убираем возможные дублирующие ключи из validated_data
        validated_data.pop('user', None)
        validated_data.pop('post', None)

        user = self.context['request'].user
        post = self.context.get('post')
        if post is None:
            raise serializers.ValidationError("Post context is required for creating a comment.")

        return Comment.objects.create(user=user, post=post, parent=parent, **validated_data)


class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    author_username = serializers.CharField(source='author.username', read_only=True)
    like_count = serializers.IntegerField(read_only=True)
    comment_count = serializers.IntegerField(read_only=True)
    repost_count = serializers.IntegerField(read_only=True)
    liked_by_user = serializers.SerializerMethodField()
    comments = serializers.SerializerMethodField()
    reposts = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = (
            'id', 'author', 'author_username', 'content', 'created_at',
            'like_count', 'comment_count', 'repost_count', 'liked_by_user',
            'comments', 'reposts'
        )

    def get_liked_by_user(self, obj):
        req = self.context.get('request')
        return req.user.is_authenticated and obj.likes.filter(id=req.user.id).exists()

    def get_comments(self, obj):
        root_comments = obj.comments.filter(parent__isnull=True).order_by('created_at')
        return CommentSerializer(root_comments, many=True, context=self.context).data

    def get_reposts(self, obj):
        return obj.reposts.values('id')



class RepostSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    original_post = PostSerializer(read_only=True)

    class Meta:
        model = Repost
        fields = ('id', 'user', 'created_at', 'original_post')


class RegisterSerializer(serializers.ModelSerializer):
    generated_password = None

    class Meta:
        model = User
        fields = ('username', 'email', 'password')
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'email': {'required': True},
        }

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Имя пользователя занято.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email уже используется.")
        return value

    def validate_password(self, value):
        if value is None or value == '':
            return value
        if len(value) < 6:
            raise serializers.ValidationError("Пароль должен быть не менее 6 символов.")
        if not any(c.isupper() for c in value):
            raise serializers.ValidationError("Пароль должен содержать хотя бы одну заглавную букву.")
        if not any(c.isdigit() for c in value):
            raise serializers.ValidationError("Пароль должен содержать хотя бы одну цифру.")
        return value

    def create(self, validated_data):
        use_generated = self.context.get('use_generated_password', False)
        password = validated_data.get('password')

        if use_generated or not password:
            password = self.generate_password()
            self.generated_password = password

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=password
        )
        user.is_active = False  # Блокируем до подтверждения
        user.save()

        Profile.objects.get_or_create(user=user)
        self.send_confirmation_email(user)
        return user

    def generate_password(self, length=10):
        while True:
            pwd = ''.join(random.choices(string.ascii_letters + string.digits, k=length))
            if any(c.isupper() for c in pwd) and any(c.isdigit() for c in pwd):
                return pwd

    def send_confirmation_email(self, user):
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        link = f"http://localhost:3000/activate?uid={uid}&token={token}"
        send_mail(
            subject='Подтверждение регистрации',
            message=f'Для активации аккаунта перейдите по ссылке:\n{link}',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )


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
        send_mail(
            'Восстановление пароля',
            f"Перейдите по ссылке для сброса: {reset_url}",
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
        except Exception:
            raise serializers.ValidationError("Неверный UID.")
        if not default_token_generator.check_token(user, data['token']):
            raise serializers.ValidationError("Недействительный или просроченный токен.")
        data['user'] = user
        return data

    def save(self):
        user = self.validated_data['user']
        user.set_password(self.validated_data['new_password'])
        user.save()


class NotificationSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    recipient = UserSerializer(read_only=True)
    post = SimplePostSerializer(read_only=True)
    comment = CommentSerializer(read_only=True)
    repost = RepostSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = '__all__'

# updated 2025-07-16 21:48:48
