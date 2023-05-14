from rest_framework.viewsets import ModelViewSet
from .serializers import PostSerializer, LabelSerializer
from .models import Post
from rest_framework.permissions import AllowAny
from django.db.models import Q

# CRUD가 모두 들어간 API를 지원
class PostViewSet(ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = LabelSerializer
    #permission_classes = [AllowAny] #FIXME: 인증 적용

    def get_queryset(self):
        qs = super().get_queryset()
        qs = qs.filter(
            # "author" 필드가 현재 요청한 사용자 (self.request.user)와 동일한 값을 가지는 객체만 필터링
            #본인이 작성한 글만 볼 수 있도록 함.
            Q(author=self.request.user) 
        )
        return qs
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
        return super().perform_create(serializer)