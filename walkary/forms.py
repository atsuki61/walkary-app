"""2024/11/25 金定歩夢 django移行"""
# walkary/forms.py
from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from .models import UserProfile

class LoginForm(AuthenticationForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'].widget.attrs['class'] = 'form-control'
        # self.fields['username'].widget.attrs['placeholder'] = 'ユーザーID'
        self.fields['password'].widget.attrs['class'] = 'form-control'
        # self.fields['password'].widget.attrs['placeholder'] = 'パスワード'

class UserCreateForm(UserCreationForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'].widget.attrs['class'] = 'form-control'
        self.fields['username'].widget.attrs['placeholder'] = 'ユーザーID'
        self.fields['password1'].widget.attrs['class'] = 'form-control'
        self.fields['password1'].widget.attrs['placeholder'] = 'パスワード'
        self.fields['password2'].widget.attrs['class'] = 'form-control'
        self.fields['password2'].widget.attrs['placeholder'] = '確認用パスワード'

    class Meta:
        model = User
        fields = ("username", "password1", "password2",)

class UserProfileForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['name'].widget.attrs.update({
            'placeholder': 'ユーザー名'
        })
        # 性別フィールドの未選択表示を日本語に変更
        gender_choices = list(self.fields['gender'].choices)
        if gender_choices and gender_choices[0][0] == '':
            gender_choices[0] = ('', '選択してください')
            self.fields['gender'].choices = gender_choices

    class Meta:
        model = UserProfile
        fields = ['name', 'age', 'height', 'weight', 'gender', 'goal']
        labels = {
            'name': '名前',
            'age': '年齢',
            'height': '身長',
            'weight': '体重',
            'gender': '性別',
            'goal': '目標',
        }
