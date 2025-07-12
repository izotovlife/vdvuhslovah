# backend/urls.py

# backend/urls.py

from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')),  # подключаем основные API маршруты
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # получение JWT
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # обновление JWT
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)  # отдача медиа в dev





# dummy update

# updated 2025-07-12 11:27:40

# updated 2025-07-12 11:31:56
