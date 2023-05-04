from django.db import models

class TImestampedModel(models.Model):
    # 기본 필드값
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class Post(TImestampedModel):
    label = models.CharField(max_length=50, default='')
    images = models.ImageField(upload_to='images/%Y/%m/%d', blank=True)

    def __str__(self):
        return f'{self.label}'

