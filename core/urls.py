# C:\Users\ASUS Vivobook\PycharmProjects\PythonProject\vdvuhslovah\core\urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PostViewSet,
    FavoriteViewSet,
    RegisterView,
    UserProfileView,
    ChangePasswordView
)

router = DefaultRouter()
router.register(r'posts', PostViewSet, basename='posts')
router.register(r'favorites', FavoriteViewSet, basename='favorites')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),  # /api/register/
    path('me/', UserProfileView.as_view(), name='user-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
]




