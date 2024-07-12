"""
URL configuration for userService project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.urls import path
from user.endpoints import user, friend

urlpatterns = [
    path('register/', user.create_user),
    path('<int:user_id>/infos/', user.get_user),
    path('update/', user.update_user),
    path('<int:user_id>/picture/', user.get_picture),
    path('search/', user.search_user),
    path('delete/', user.delete_user),

    path('friends/', friend.get_friends),
    path('waiting_friends/', friend.get_waiting_friends),
    path('add_friend/<int:friend_id>/', friend.add_friend),
    path('get_requests/', friend.get_requests),
    path('accept_friend/<int:friend_id>/', friend.accept_friend),
    path('refuse_friend/<int:friend_id>/', friend.refuse_friend),
    path('delete_friend/<int:friend_id>/', friend.delete_friend),
]
