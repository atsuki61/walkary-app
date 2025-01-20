from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100, blank=True)
    age = models.IntegerField(null=True, blank=True)
    height = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)  # e.g., 170.0 cm
    weight = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)  # e.g., 60.0 kg
    gender = models.CharField(max_length=20, choices=[('男性', '男性'), ('女性', '女性'), ('その他', 'その他')], blank=True)
    goal = models.IntegerField(null=True, blank=True)  # Step goal

    def __str__(self):
        return f"{self.user.username}'s Profile"
