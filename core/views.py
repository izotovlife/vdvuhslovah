# core/views.py

from rest_framework import viewsets, permissions, generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count
from django.contrib.auth.models import User
from .models import Post, Favorite, Comment
from .serializers import (
    PostSerializer, FavoriteSerializer, CommentSerializer,
    UserProfileSerializer, UserSerializer
)


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        post = self.get_object()
        post.likes.add(request.user)
        return Response({'status': 'liked'})

    @action(detail=True, methods=['post'])
    def hide(self, request, pk=None):
        post = self.get_object()
        post.hidden_by.add(request.user)
        return Response({'status': 'hidden'})

    @action(detail=True, methods=['post'])
    def repost(self, request, pk=None):
        original = self.get_object()
        repost = Post.objects.create(author=request.user, content=original.content, original_post=original)
        return Response(PostSerializer(repost, context={'request': request}).data)

    @action(detail=True, methods=['post'])
    def comment(self, request, pk=None):
        post = self.get_object()
        text = request.data.get('text')
        if not text:
            return Response({'error': 'Комментарий не может быть пустым'}, status=400)
        comment = Comment.objects.create(post=post, author=request.user, text=text)
        return Response(CommentSerializer(comment).data)

    @action(detail=False, methods=['get'])
    def popular(self, request):
        posts = Post.objects.annotate(
            num_likes=Count('likes'),
            num_comments=Count('comments')
        ).order_by('-num_likes', '-num_comments')[:10]
        return Response(self.get_serializer(posts, many=True).data)


class FavoriteViewSet(viewsets.ModelViewSet):
    queryset = Favorite.objects.all()
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserSerializer


class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not user.check_password(old_password):
            return Response({'detail': 'Неверный текущий пароль'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({'detail': 'Пароль успешно изменён'})

