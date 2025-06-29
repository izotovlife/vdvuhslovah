#C:\Users\ASUS Vivobook\PycharmProjects\PythonProject\vdvuhslovah\core\urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PostViewSet,
    FavoriteViewSet,
    RegisterView,
    CurrentUserView,
    UpdateUserEmailView,
    PasswordChangeView
)

router = DefaultRouter()
router.register('posts', PostViewSet, basename='post')        # basename в единственном числе, но можно и 'posts'
router.register('favorites', FavoriteViewSet, basename='favorite')

urlpatterns = [
    path('', include(router.urls)),             # сюда попадут маршруты /posts/ и /favorites/
    path('register/', RegisterView.as_view(), name='register'),
    path('users/me/', CurrentUserView.as_view(), name='current-user'),
    path('users/me/update_email/', UpdateUserEmailView.as_view(), name='update-email'),
    path('password/change/', PasswordChangeView.as_view(), name='password-change'),
]


