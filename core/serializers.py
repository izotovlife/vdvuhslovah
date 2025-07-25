# backend/core/serializers.py
#
# Сериализаторы для API приложения "Аналог Твиттера":
# - Пользователи и расширенные профили с аватаром, баннером, подписками
# - Посты с поддержкой лайков, репостов, комментариев, цитат (quoted_post)
# - Комментарии с рекурсивной вложенностью (ответы на комментарии)
# - Репосты и избранное
# - Регистрация с подтверждением email и автогенерацией пароля
# - Сброс и смена пароля с проверкой токенов
# - Уведомления о лайках, комментариях и репостах
#
# Поддерживается контекст запроса для корректного формирования ссылок и проверки действий текущего пользователя


from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.core.mail import send_mail
from django.conf import settings
from .models import Profile, Post, Repost, Comment, Notification
from django.contrib.auth.models import User

import random
import string
from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()
    display_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'avatar', 'display_name']

    def get_avatar(self, obj):
        try:
            return obj.profile.avatar.url if obj.profile.avatar else None
        except Exception:
            return None

    def get_display_name(self, obj):
        try:
            full_name = obj.get_full_name()
            return full_name if full_name else obj.username
        except Exception:
            return obj.username


class RecursiveField(serializers.Serializer):
    def to_representation(self, value):
        serializer = self.parent.parent.__class__(value, context=self.context)
        return serializer.data


class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    replies = RecursiveField(many=True, read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'user', 'content', 'created_at', 'parent', 'replies']

    def create(self, validated_data):
        user = self.context['request'].user
        post = self.context.get('post')
        parent = validated_data.get('parent', None)
        content = validated_data['content']
        return Comment.objects.create(user=user, post=post, content=content, parent=parent)


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
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    is_followed_by_user = serializers.SerializerMethodField()
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
            'posts', 'reposts', 'liked_posts',
            'followers_count', 'following_count', 'is_followed_by_user',
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

    def get_followers_count(self, obj):
        try:
            return obj.user.followers.count()
        except Exception:
            return 0

    def get_following_count(self, obj):
        try:
            return obj.user.following.count()
        except Exception:
            return 0

    def get_is_followed_by_user(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        try:
            return obj.user.followers.filter(follower=request.user).exists()
        except Exception:
            return False


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


class UserWithProfileSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email', 'name', 'profile')

    def get_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()


class PostSerializer(serializers.ModelSerializer):
    author = UserWithProfileSerializer(read_only=True)
    author_username = serializers.CharField(source='author.username', read_only=True)
    like_count = serializers.IntegerField(read_only=True)
    comment_count = serializers.IntegerField(read_only=True)
    repost_count = serializers.IntegerField(read_only=True)
    liked_by_user = serializers.SerializerMethodField()
    reposted_by_user = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)
    reposts = serializers.SerializerMethodField()
    quoted_post = SimplePostSerializer(read_only=True)  # если есть поле quoted_post в модели

    class Meta:
        model = Post
        fields = (
            'id', 'author', 'author_username', 'content', 'created_at',
            'like_count', 'comment_count', 'repost_count', 'liked_by_user',
            'reposted_by_user', 'comments', 'reposts', 'quoted_post',
        )

    def get_liked_by_user(self, obj):
        request = self.context.get('request')
        return request.user.is_authenticated and obj.likes.filter(id=request.user.id).exists()

    def get_reposted_by_user(self, obj):
        request = self.context.get('request')
        if not request.user.is_authenticated:
            return False
        return obj.reposts.filter(user=request.user).exists()

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


class PublicProfileSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()
    bio = serializers.CharField(read_only=True)

    class Meta:
        model = Profile
        fields = ['id', 'name', 'avatar', 'bio']

    def get_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def get_avatar(self, obj):
        request = self.context.get('request')
        if obj.avatar and hasattr(obj.avatar, 'url'):
            return request.build_absolute_uri(obj.avatar.url) if request else obj.avatar.url
        return None


class FullProfileSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()
    banner = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = [
            'id', 'user', 'avatar', 'banner', 'bio', 'phone',
            'country', 'city',
        ]

    def get_user(self, obj):
        user = obj.user
        return {
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
        }

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
