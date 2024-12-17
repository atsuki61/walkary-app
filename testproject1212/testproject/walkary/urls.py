"""2024/11/25 金定歩夢 django移行"""
from django.urls import path
from . import views
from django.contrib.auth.views import LogoutView

app_name = "walkary"

urlpatterns = [
    path('', views.index, name="index"),
    path('create/', views.create_account, name="create_account"),
    path('login/', views.account_login, name="login"),
    path('logout/', LogoutView.as_view(template_name="walkary/index.html"), name="logout"),
    path("map/", views.mapPage, name="map"),
    path("home/", views.homePage, name="home"),
    path("graph/", views.graphPage, name="graph"),
    path('mypage/', views.myPage, name='mypage'),
    path('logout/', LogoutView.as_view(template_name="walkary/index.html"), name="logout"),
]
