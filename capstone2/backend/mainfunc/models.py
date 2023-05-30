from django.db import models
from django.conf import settings

# cf. article : postImage = 1 : N

#Label 테이블 -- 유저(외래키), 레이블
class Label(models.Model):
    id = models.BigAutoField(primary_key=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    #FIXME: dataset 컬럼 추가
    dataset = models.CharField(max_length=50, default='')
    label_name = models.CharField(max_length=50, default='')
    

def image_upload_path(instance, filename):
    return f'{instance.author}/{instance.dataset}/{instance.label.label_name}/{filename}'

#Post 테이블 -- 레이블(외래키), 이미지
class Post(models.Model):
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    label = models.ForeignKey(Label, on_delete=models.CASCADE)
    dataset = models.CharField(max_length=50, default='')  # 새로 추가된 필드
    image = models.ImageField(upload_to=image_upload_path, blank=True, null=True)

    def get_label_name(self):
        return self.label.label_name
    
class Model(models.Model):
    id = models.BigAutoField(primary_key=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=50, default='')
    learning_time = models.CharField(max_length=10,default='')
    accuracy = models.CharField(max_length=10, default='')
    file = models.FileField(upload_to=image_upload_path, blank=True, null=True)