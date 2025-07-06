# backend/core/views.py

from rest_framework import generics, permissions, status, mixins
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from .models import Profile, Post, Repost, Comment
from .serializers import (
    ProfileSerializer, ProfileUpdateSerializer, PostSerializer,
    CommentSerializer, RepostSerializer, UserSerializer, RegisterSerializer,
    SendPasswordResetEmailSerializer, ResetPasswordSerializer
)


class RegisterAPIView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer


class ProfileDetailAPIView(mixins.UpdateModelMixin, generics.GenericAPIView):
    queryset = Profile.objects.select_related("user")
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return ProfileUpdateSerializer
        return ProfileSerializer

    def get_object(self):
        return Profile.objects.get(user=self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_serializer(self, *args, **kwargs):
        kwargs.setdefault('context', self.get_serializer_context())
        return super().get_serializer(*args, **kwargs)

    def get(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_object())
        return Response(serializer.data)

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)


class PostListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Post.objects.annotate(
            like_count=Count('likes'),
            comment_count=Count('comments'),
            repost_count=Count('reposts')
        ).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request  # Важно, чтобы вычислялось liked_by_user
        return context


class PostCommentListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        post_id = self.kwargs['pk']
        return Comment.objects.filter(post_id=post_id).order_by('-created_at')

    def perform_create(self, serializer):
        post = get_object_or_404(Post, id=self.kwargs['pk'])
        serializer.save(user=self.request.user, post=post)


class PostRepostAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        post = get_object_or_404(Post, id=pk)
        repost, created = Repost.objects.get_or_create(user=request.user, original_post=post)
        serializer = RepostSerializer(repost)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class PostLikeAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        post = get_object_or_404(Post, id=pk)
        user = request.user
        if user in post.likes.all():
            post.likes.remove(user)
            liked = False
        else:
            post.likes.add(user)
            liked = True
        return Response({"liked": liked, "like_count": post.likes.count()})


class PopularPostsAPIView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Post.objects.annotate(
            like_count=Count("likes"),
            comment_count=Count("comments"),
            repost_count=Count("reposts")
        ).order_by("-like_count", "-comment_count", "-repost_count")[:10]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class UserPostsAPIView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        username = self.kwargs.get("username")
        return Post.objects.annotate(
            like_count=Count('likes'),
            comment_count=Count('comments'),
            repost_count=Count('reposts')
        ).filter(author__username=username).order_by("-created_at")

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class UserRepostsAPIView(generics.ListAPIView):
    serializer_class = RepostSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        username = self.kwargs.get("username")
        return Repost.objects.filter(user__username=username).order_by("-created_at")


class UserCommentsAPIView(generics.ListAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        username = self.kwargs.get("username")
        return Comment.objects.filter(user__username=username).order_by("-created_at")


class ChangePasswordAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get("old_password")
        new_password1 = request.data.get("new_password1")
        new_password2 = request.data.get("new_password2")

        if not user.check_password(old_password):
            return Response({"old_password": "Неверный текущий пароль"}, status=status.HTTP_400_BAD_REQUEST)

        if new_password1 != new_password2:
            return Response({"new_password2": "Пароли не совпадают"}, status=status.HTTP_400_BAD_REQUEST)

        if not new_password1:
            return Response({"new_password1": "Новый пароль не может быть пустым"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password1)
        user.save()
        return Response({"detail": "Пароль успешно изменён"}, status=status.HTTP_200_OK)


class CurrentUserAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


# Восстановление пароля

class SendPasswordResetEmailAPIView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = SendPasswordResetEmailSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(request=request)
        return Response({"detail": "Письмо с инструкциями отправлено, проверьте email"}, status=status.HTTP_200_OK)


class ResetPasswordAPIView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = ResetPasswordSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Пароль успешно изменён"}, status=status.HTTP_200_OK)
