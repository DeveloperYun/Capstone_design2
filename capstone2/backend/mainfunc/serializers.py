from rest_framework.serializers import ModelSerializer
from .models import Post# PostImage

# class PostImageSerializer(ModelSerializer): #이미지 직렬화
#     class Meta:
#         model = PostImage
#         fields = ['image']

class PostSerializer(ModelSerializer):
    # post에서 이미지를 한번에 입력받아서 저장할 것이기 때문.
    
    class Meta:
        model = Post
        fields = '__all__'
