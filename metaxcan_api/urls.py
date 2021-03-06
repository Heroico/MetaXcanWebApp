from django.conf.urls import include, url
from rest_framework_nested.routers import NestedSimpleRouter
from rest_framework.routers import DefaultRouter
from .routers import ReadOnlyRouter
from metaxcan_api.views import CreateUserView, LoginView, JobViewSet, \
    SimpleUserViewSet, TranscriptomeModelViewSet, DataFileViewSet, CovarianceViewSet


# Create a router and register our viewsets with it.
router = DefaultRouter()

read_only_router = ReadOnlyRouter()
read_only_router.register("users", SimpleUserViewSet, "user")
read_only_router.register("transcriptomes", TranscriptomeModelViewSet, "transcriptome")
read_only_router.register("covariances", CovarianceViewSet, "covariance")

user_router = NestedSimpleRouter(read_only_router, r'users', lookup='user')
user_router.register(r'jobs', JobViewSet, base_name="jobs")

jobs_router = NestedSimpleRouter(user_router, r'jobs', lookup='job')
jobs_router.register(r'files', DataFileViewSet, base_name="")

urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'^', include(read_only_router.urls)),
    url(r'^', include(user_router.urls)),
    url(r'^', include(jobs_router.urls)),
    url(r'^signup/$', CreateUserView.as_view()),
    url(r'^login/$', LoginView.as_view()),
]

#TODO: remove
urlpatterns += [
    url(r'^api-auth/', include('rest_framework.urls',
                               namespace='rest_framework')),
]