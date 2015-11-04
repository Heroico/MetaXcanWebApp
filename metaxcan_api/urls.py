from django.conf.urls import include, url
from rest_framework.authtoken import views
from rest_framework.routers import DefaultRouter
from .routers import ReadOnlyRouter
from metaxcan_api.views import CreateUserView, LoginView, JobViewSet, SimpleUserViewSet

# Create a router and register our viewsets with it.
router = DefaultRouter()

read_only_router = ReadOnlyRouter()
read_only_router.register("users", SimpleUserViewSet, "users")

urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'^', include(read_only_router.urls)),
    url(r'^signup/$', CreateUserView.as_view()),
    url(r'^login/$', LoginView.as_view()),
]

#TODO: remove
urlpatterns += [
    url(r'^api-auth/', include('rest_framework.urls',
                               namespace='rest_framework')),
]