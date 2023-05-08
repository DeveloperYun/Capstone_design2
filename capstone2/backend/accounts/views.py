from django.contrib.auth import get_user_model
from django.shortcuts import render
from rest_framework.permissions import AllowAny
from rest_framework.generics import CreateAPIView
from .serializers import SignupSerializer

#회원가입 뷰
#createapiview 이므로 get 메소드 허용X
class SignupView(CreateAPIView):
    model = get_user_model()
    serializer_class = SignupSerializer
    permission_classes = [
        AllowAny,#실제로 회원가입할 때는 로그인은 되면 안됨
    ]
