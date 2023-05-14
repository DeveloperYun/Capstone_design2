from rest_framework import serializers
from .models import Post, Label
from django.contrib.auth import get_user_model

class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = '__all__'

# label : Post = 1 : N
# article : postImage = 1 : N
# post = article

# views.py 에서 호출한 시리얼라이저_클래스는 PostSerializer 
class PostSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    image = serializers.ImageField(use_url=True)

    #label_name = serializers.CharField(source='label.label_name')  # Add this line

    # def get_images(self, obj):
    #     image = obj.post_set.all()
    #     return PostSerializer(instance=image, many=True).data
    
    class Meta:
        model = Post
        fields = ['author','image']

    # def create(self, validated_data):
    #     instance = Label.objects.create(**validated_data)
    #     image_set = self.context['request'].FILES
    #     for image_data in image_set.getlist('image'):
    #         Post.objects.create(label=instance, image=image_data)
    #     return instance

class LabelSerializer(serializers.ModelSerializer):

    def get_images(self, obj):
        image = obj.image.all() 
        return PostSerializer(instance=image, many=True, context=self.context).data


    class Meta:
        model = Label
        fields = ['label_name']

    def create(self, validated_data):
        instance = Label.objects.create(**validated_data)
        image_set = self.context['request'].FILES
        for image_data in image_set.getlist('image'):
            Post.objects.create(label=instance, image=image_data)
        return instance 

