#C:\Users\ASUS Vivobook\PycharmProjects\PythonProject1\vdvuhslovah\core\views.py

from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count
from django.contrib.auth.models import User
from .models import Profile, Post, Repost, Comment
from .serializers import (
    ProfileSerializer, ProfileUpdateSerializer, PostSerializer,
    CommentSerializer, RepostSerializer, UserSerializer, RegisterSerializer
)

class RegisterAPIView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

class ProfileDetailAPIView(generics.RetrieveUpdateAPIView):
    queryset = Profile.objects.select_related("user")
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProfileUpdateSerializer

    def get_object(self):
        return Profile.objects.get(user=self.request.user)

class PostListCreateAPIView(generics.ListCreateAPIView):
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class CommentCreateAPIView(generics.CreateAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class RepostCreateAPIView(generics.CreateAPIView):
    queryset = Repost.objects.all()
    serializer_class = RepostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class PopularPostsAPIView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Post.objects.annotate(
            num_likes=Count('likes'),
            num_comments=Count('comments')
        ).order_by('-num_likes', '-num_comments')[:10]

class UserPostsAPIView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        username = self.kwargs.get("username")
        return Post.objects.filter(author__username=username).order_by('-created_at')

class UserRepostsAPIView(generics.ListAPIView):
    serializer_class = RepostSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        username = self.kwargs.get("username")
        return Repost.objects.filter(user__username=username).order_by('-created_at')

class UserCommentsAPIView(generics.ListAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        username = self.kwargs.get("username")
        return Comment.objects.filter(user__username=username).order_by('-created_at')

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
