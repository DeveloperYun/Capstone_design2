from django.contrib import admin
from django.urls import path, include
from hello import views


urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('accounts.urls')),
    path('mainfunc/', include('mainfunc.urls')),
    path('hello/', include('hello.urls')),
    path('',views.index, name='index'),
]
