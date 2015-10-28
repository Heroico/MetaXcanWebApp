from django.conf.urls import include, url
from rest_framework.authtoken import views
from rest_framework.routers import DefaultRouter
from metaxcan_api.views import CreateUserView

# Create a router and register our viewsets with it.
router = DefaultRouter()

urlpatterns = [
    #url(r'^', include(router.urls)),
    url(r'^users/create/$', CreateUserView.as_view()),
    url(r'^token/', views.obtain_auth_token),
]
