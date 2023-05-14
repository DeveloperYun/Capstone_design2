from django.db import models
from django.conf import settings
from django.contrib.auth.models import User

# cf. article : postImage = 1 : N

#Label 테이블 -- 유저(외래키), 레이블
class Label(models.Model):
    id = models.BigAutoField(primary_key=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True)
    label_name = models.CharField(max_length=50, default='')

#Post 테이블 -- 레이블(외래키), 이미지
class Post(models.Model):
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True)
    label = models.ForeignKey(Label, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='images/%Y/%m/%d', blank=True, null=True)

    # def __str__(self):
    #     return f'{self.label}'

