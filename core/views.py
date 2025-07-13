# backend/core/views.py

from rest_framework import generics, permissions, status, mixins
from rest_framework.views import APIView
from django.db.models import Count
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from .models import Profile, Post, Repost, Comment, Notification
from .serializers import (
    ProfileSerializer, ProfileUpdateSerializer, PostSerializer,
    CommentSerializer, RepostSerializer, UserSerializer, RegisterSerializer,
    SendPasswordResetEmailSerializer, ResetPasswordSerializer, NotificationSerializer
)

class RegisterAPIView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ProfileDetailAPIView(mixins.UpdateModelMixin, generics.GenericAPIView):
    queryset = Profile.objects.select_related("user")
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return ProfileUpdateSerializer
        return ProfileSerializer

    def get_object(self):
        profile, _created = Profile.objects.get_or_create(user=self.request.user)
        return profile

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

    def get(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_object())
        return Response(serializer.data)

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

class PublicProfileView(generics.RetrieveAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'user__username'
    queryset = Profile.objects.select_related('user')

    def get_object(self):
        username = self.kwargs.get('username')
        profile = get_object_or_404(Profile, user__username=username)
        return profile

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

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
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

class PostCommentListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        pid = self.kwargs['pk']
        return Comment.objects.filter(post_id=pid).order_by('-created_at')

    def perform_create(self, serializer):
        post = get_object_or_404(Post, id=self.kwargs['pk'])
        serializer.save(user=self.request.user, post=post)

class PostRepostAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        post = get_object_or_404(Post, id=pk)
        try:
            repost, created = Repost.objects.get_or_create(user=request.user, original_post=post)
        except Exception as e:
            return Response(
                {"detail": "Ошибка при создании репоста: " + str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = RepostSerializer(repost, context={'request': request})
        status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(serializer.data, status=status_code)

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
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

class UserPostsAPIView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        uname = self.kwargs.get("username")
        return Post.objects.annotate(
            like_count=Count('likes'),
            comment_count=Count('comments'),
            repost_count=Count('reposts')
        ).filter(author__username=uname).order_by("-created_at")

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

class UserRepostsAPIView(generics.ListAPIView):
    serializer_class = RepostSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        uname = self.kwargs.get("username")
        return Repost.objects.filter(user__username=uname).order_by("-created_at")

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

class UserCommentsAPIView(generics.ListAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        uname = self.kwargs.get("username")
        return Comment.objects.filter(user__username=uname).order_by("-created_at")

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

class ChangePasswordAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        old = request.data.get("old_password")
        new1 = request.data.get("new_password1")
        new2 = request.data.get("new_password2")
        if not user.check_password(old):
            return Response({"old_password": "Неверный текущий пароль"}, status=status.HTTP_400_BAD_REQUEST)
        if new1 != new2:
            return Response({"new_password2": "Пароли не совпадают"}, status=status.HTTP_400_BAD_REQUEST)
        if not new1:
            return Response({"new_password1": "Новый пароль не может быть пустым"}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new1)
        user.save()
        return Response({"detail": "Пароль успешно изменён"})

class CurrentUserAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class SendPasswordResetEmailAPIView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = SendPasswordResetEmailSerializer

    def post(self, request, *args, **kwargs):
        ser = self.get_serializer(data=request.data)
        ser.is_valid(raise_exception=True)
        ser.save(request=request)
        return Response({"detail": "Письмо с инструкциями отправлено"}, status=status.HTTP_200_OK)

class ResetPasswordAPIView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = ResetPasswordSerializer

    def post(self, request, *args, **kwargs):
        ser = self.get_serializer(data=request.data)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response({"detail": "Пароль успешно изменён"}, status=status.HTTP_200_OK)

class LikedPostsAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        qs = Post.objects.filter(likes=user).order_by('-created_at').annotate(
            like_count=Count('likes'),
            comment_count=Count('comments'),
            repost_count=Count('reposts')
        )
        serializer = PostSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)

class UserRepostsListAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        qs = Repost.objects.filter(user=user).order_by('-created_at')
        serializer = RepostSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)

class NotificationListAPIView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user).order_by('-created_at')

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions

def check_password_complexity(password):
    """Метод для оценки сложности пароля."""
    if len(password) < 8:
        return "Слабый"
    elif len(password) >= 8 and any(c.isupper() for c in password) and any(c.isdigit() for c in password):
        return "Средний"
    else:
        return "Сильный"

class PasswordCheckAPIView(APIView):
    permission_classes = [permissions.AllowAny]  # Доступ разрешён для всех

    def post(self, request):
        password = request.data.get('password')
        if not password:
            return Response({'error': 'Отсутствует пароль.'}, status=400)
        complexity = check_password_complexity(password)
        return Response({'complexity': complexity}, status=200)
# updated 2025-07-12 22:40:59

# updated 2025-07-12 23:07:08

# updated 2025-07-13 21:53:56

# updated 2025-07-13 22:00:14

# updated 2025-07-13 22:09:14

# updated 2025-07-13 23:07:46

# updated 2025-07-13 23:32:13
