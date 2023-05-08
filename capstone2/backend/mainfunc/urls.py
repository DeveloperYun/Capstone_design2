from django.urls import include, path
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('post', views.PostViewSet) # 2개의 url패턴 생성

# router.urls = url 패턴 리스트
urlpatterns = [
    path('api/', include(router.urls)),
]