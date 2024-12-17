"""2024/11/25 金定歩夢 django移行"""
from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100, blank=True)
    age = models.IntegerField(null=True, blank=True)
    height = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)
    weight = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)
    gender = models.CharField(max_length=20, choices=[('男性', '男性'), ('女性', '女性'), ('その他', 'その他')], blank=True)
    goal = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"


class WalkarySteps(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField(auto_now_add=True)
    steps = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.user.username} - {self.date}: {self.steps} steps"
