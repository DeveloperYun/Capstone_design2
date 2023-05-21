# from django.contrib import admin
# from .models import Post

# # Register your models here.
# admin.site.register(Post)
# # admin.site.register(PostImage)

from django.contrib import admin
from .models import Post, Label

@admin.register(Label)
class LabelAdmin(admin.ModelAdmin):
    list_display = ["id", "author", "label_name"]

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ["id", "author", "label_name", "image"]

    def label_name(self, obj):
        return obj.label.label_name