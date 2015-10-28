from django.conf.urls import include, url
from rest_framework.authtoken import views
from rest_framework.routers import DefaultRouter

# Create a router and register our viewsets with it.
router = DefaultRouter()

urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'^token/', views.obtain_auth_token),
]
