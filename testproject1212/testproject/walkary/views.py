"""2024/11/25 金定歩夢 django移行"""
from django.shortcuts import render, redirect, get_object_or_404
from django.views import View
from django.contrib.auth import login, authenticate
from django.contrib.auth.models import User
from django.views.generic import CreateView, TemplateView
from .forms import UserCreateForm, LoginForm
from django.contrib.auth.views import LogoutView
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from .models import UserProfile
from .forms import UserProfileForm
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from datetime import date
from .models import WalkarySteps


#indexページ
class Index(TemplateView):
    template_name = 'walkary/index.html'


#アカウント作成
class Create_Account(View):
    def post(self, request, *args, **kwargs):
        user_form = UserCreateForm(data=request.POST)
        profile_form = UserProfileForm(data=request.POST)

        if user_form.is_valid() and profile_form.is_valid():
            user = user_form.save()
            profile = profile_form.save(commit=False)
            profile.user = user
            profile.save()

            username = user_form.cleaned_data.get('username')
            password = user_form.cleaned_data.get('password1')
            user = authenticate(username=username, password=password)
            login(request, user)
            return redirect('walkary:home')

        return render(request, 'walkary/create.html', {
            'user_form': user_form,
            'profile_form': profile_form
        })

    def get(self, request, *args, **kwargs):
        user_form = UserCreateForm()
        profile_form = UserProfileForm()
        return render(request, 'walkary/create.html', {
            'user_form': user_form,
            'profile_form': profile_form
        })


#ログイン
class Account_login(View):
    def post(self, request, *arg, **kwargs):
        form = LoginForm(data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            user = User.objects.get(username=username)
            login(request, user)
            return redirect('walkary:home')
        return render(request, 'walkary/login.html', {'form': form})

    def get(self, request, *args, **kwargs):
        form = LoginForm(request.POST)
        return render(request, 'walkary/login.html', {'form': form})


class CustomLogoutView(LogoutView):
    def get(self, request, *args, **kwargs):
        return self.post(request, *args, **kwargs)


@method_decorator(login_required, name='dispatch')
class mypageView(View):
    def get(self, request):
        user_profile, created = UserProfile.objects.get_or_create(user=request.user)
        form = UserProfileForm(instance=user_profile)
        return render(request, "walkary/mypage.html", {
            'form': form,
            'user_profile': user_profile
        })

    def post(self, request):
        user_profile = get_object_or_404(UserProfile, user=request.user)
        form = UserProfileForm(request.POST, instance=user_profile)
        if form.is_valid():
            form.save()
            return redirect('walkary:mypage')
        return render(request, "walkary/mypage.html", {
            'form': form,
            'user_profile': user_profile
        })


@method_decorator(login_required, name='dispatch')
class mapPageView(View):
    def get(self, request):
        user_profile = UserProfile.objects.filter(user=request.user).first()
        user_height = user_profile.height if user_profile else 170
        return render(request, "walkary/map.html", {"user_height": user_height})


@method_decorator(login_required, name='dispatch')
class homePageView(View):
    def get(self, request):
        user_profile = UserProfile.objects.filter(user=request.user).first()
        goal = user_profile.goal if user_profile and user_profile.goal else 5000
        return render(request, "walkary/home.html", {"goal": goal})


@method_decorator(login_required, name='dispatch')
class graphPageView(View):
    def get(self, request, *args, **kwargs):
        steps_data = WalkarySteps.objects.filter(user=request.user).order_by('date')
        steps_data = [{"date": entry.date.strftime('%Y-%m-%d'), "steps": entry.steps} for entry in steps_data]
        return render(request, 'walkary/graph.html', {'steps_data': json.dumps(steps_data)})


index = Index.as_view()
create_account = Create_Account.as_view()
account_login = Account_login.as_view()
myPage = mypageView.as_view()
mapPage = mapPageView.as_view()
homePage = homePageView.as_view()
graphPage = graphPageView.as_view()
