#C:\Users\ASUS Vivobook\PycharmProjects\PythonProject1\vdvuhslovah\core\serializers.py

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Post, Repost, Comment


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ('id', 'avatar', 'bio', 'phone')


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
    post_id = serializers.IntegerField(write_only=True)
    post_content = serializers.CharField(source='post.content', read_only=True)
    post_author = serializers.CharField(source='post.author.username', read_only=True)

    class Meta:
        model = Comment
        fields = (
            'id', 'user', 'post_id',
            'post_content', 'post_author',
            'content', 'created_at'
        )
        read_only_fields = ('id', 'user', 'created_at')

    def create(self, validated_data):
        post_id = validated_data.pop('post_id')
        return Comment.objects.create(post_id=post_id, **validated_data)


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
    like_count = serializers.IntegerField(read_only=True)
    comment_count = serializers.IntegerField(read_only=True)
    repost_count = serializers.IntegerField(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    reposts = RepostSerializer(many=True, read_only=True)

    class Meta:
        model = Post
        fields = (
            'id', 'author', 'content', 'created_at',
            'like_count', 'comment_count', 'repost_count',
            'comments', 'reposts'
        )


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
