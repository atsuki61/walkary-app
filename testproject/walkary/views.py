from django.shortcuts import render, redirect, get_object_or_404
from django.views import View
from django.contrib.auth import login, authenticate
from django.contrib.auth.models import User
from django.views.generic import CreateView, TemplateView
from . forms import UserCreateForm, LoginForm
from django.contrib.auth.views import LogoutView
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from .models import UserProfile
from .forms import UserProfileForm


#indexページ
class Index(TemplateView):
    template_name = 'walkary/index.html'

index = Index.as_view()

#アカウント作成
class Create_Account(View):
    def post(self, request, *args, **kwargs):
        user_form = UserCreateForm(data=request.POST)
        profile_form = UserProfileForm(data=request.POST)

        if user_form.is_valid() and profile_form.is_valid():
            # Save the user and profile data
            user = user_form.save()
            profile = profile_form.save(commit=False)
            profile.user = user  # Link profile to user
            profile.save()

            # Authenticate and login the new user
            username = user_form.cleaned_data.get('username')
            password = user_form.cleaned_data.get('password1')
            user = authenticate(username=username, password=password)
            login(request, user)
            return redirect('walkary:mypage')

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

account_login = Account_login.as_view()


class CustomLogoutView(LogoutView):
    def get(self, request, *args, **kwargs):
        return self.post(request, *args, **kwargs)


@method_decorator(login_required, name='dispatch')
class mypageView(View):
    def get(self, request):
        # Get or create the user's profile
        user_profile, created = UserProfile.objects.get_or_create(user=request.user)

        # Load the profile form with existing data
        form = UserProfileForm(instance=user_profile)

        return render(request, "walkary/mypage.html", {
            'form': form,
            'user_profile': user_profile
        })

    def post(self, request):
        # Get the user's profile
        user_profile = get_object_or_404(UserProfile, user=request.user)

        # Update the profile with POST data
        form = UserProfileForm(request.POST, instance=user_profile)
        if form.is_valid():
            form.save()
            return redirect('walkary:mypage')  # Redirect to avoid resubmission on refresh

        return render(request, "walkary/mypage.html", {
            'form': form,
            'user_profile': user_profile
        })


class mapPageView(View):
    def get(self, request):
        return render(request, "walkary/map.html")


@method_decorator(login_required, name='dispatch')
class homePageView(View):
    def get(self, request):
        # Get the user's profile goal if it exists, otherwise set a default
        user_profile = UserProfile.objects.filter(user=request.user).first()
        goal = user_profile.goal if user_profile and user_profile.goal else 5000  # Default to 5000 if no goal set
        return render(request, "walkary/home.html", {"goal": goal})


class graphPageView(View):
    def get(self, request):
        return render(request, "walkary/graph.html")

create_account = Create_Account.as_view()
myPage = mypageView.as_view()
mapPage = mapPageView.as_view()
homePage = homePageView.as_view()
graphPage = graphPageView.as_view()
