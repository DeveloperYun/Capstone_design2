from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
#router.register("hello", views.)

urlpatterns = [
    path('hello/', include(router.urls)),
]