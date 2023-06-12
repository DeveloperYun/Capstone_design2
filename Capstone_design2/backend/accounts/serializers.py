from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class SignupSerializer(serializers.ModelSerializer):
    #pw 보안
    password = serializers.CharField(write_only=True)

    def create(self, validated_data):
        user = User.objects.create(username=validated_data["username"])
        user.set_password(validated_data["password"]) #암호화된 비번 저장
        user.save()
        return user
    
    class Meta:
        model = User
        fields = ["pk", "username", "password"]