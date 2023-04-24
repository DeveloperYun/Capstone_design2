from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path("", include("hello.urls")),
    path('accounts/', include('accounts.urls')),
    path('mainfunc/', include('mainfunc.urls')),
]

import mimetypes
mimetypes.add_type("application/javascript", ".js", True)

# MEDIA_URL로 시작되는 요청이 오면 settings.MEDIA_ROOT 에서 파일을 찾아서 서빙한다.
# 디버그 옵션이 거짓이라면 아래 static은 빈 리스트를 반환
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

    import debug_toolbar
    urlpatterns += [
        path("__debug__/", include(debug_toolbar.urls)),
    ]