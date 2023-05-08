from django.db import models

class User(models.Model):
    user_id = models.CharField(max_length=32, unique=True, verbose_name='id')
    user_pw = models.CharField(max_length=128, verbose_name='password')
    user_name = models.CharField(max_length=16, unique=True, verbose_name='name')
    user_Email = models.EmailField(max_length=128, unique=True, verbose_name='email')

    def __str__(self):
        return self.user_name #오브젝트 호출시 user_name으로 표시
    
    class Meta: #DB 테이블 명 지정
        db_table = 'user'
        verbose_name = 'user'
        