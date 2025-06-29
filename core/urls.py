#C:\Users\ASUS Vivobook\PycharmProjects\PythonProject\vdvuhslovah\core\urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet, FavoriteViewSet, RegisterView

router = DefaultRouter()
router.register('posts', PostViewSet, basename='posts')
router.register('favorites', FavoriteViewSet, basename='favorites')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
]

