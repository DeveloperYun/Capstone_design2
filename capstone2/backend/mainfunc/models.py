from django.db import models
from django.conf import settings

# cf. article : postImage = 1 : N

#Label 테이블 -- 유저(외래키), 레이블
class Label(models.Model):
    id = models.BigAutoField(primary_key=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    label_name = models.CharField(max_length=50, default='')

def image_upload_path(instance, filename):
    return f'{instance.author}/{instance.label.label_name}/{filename}'

#Post 테이블 -- 레이블(외래키), 이미지
class Post(models.Model):
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    label = models.ForeignKey(Label, on_delete=models.CASCADE)
    image = models.ImageField(upload_to=image_upload_path, blank=True, null=True)

    def get_label_name(self):
        return self.label.label_name
    
    