import copy
from rest_framework import status
from rest_framework import permissions, parsers, renderers
from rest_framework.settings import api_settings
from rest_framework.exceptions import PermissionDenied, NotAuthenticated, NotFound
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.mixins import ListModelMixin, RetrieveModelMixin, UpdateModelMixin
from rest_framework.viewsets import GenericViewSet, ReadOnlyModelViewSet
from rest_framework.generics import CreateAPIView
from rest_framework.decorators import list_route
from django.contrib.auth.models import User  # If used custom user model
from .serializers import CreateUserSerializer, CreateSessionSerializer, SimpleUserSerializer, JobSerializer, TranscriptomeModelSerializer, MetaxcanParametersSerializer
from .permissions import AuthenticatedOwnerPermission, AuthenticatedUserPermission
from .models import Job, TranscriptomeModelDB, MetaxcanParameters

#http://stackoverflow.com/questions/16857450/how-to-register-users-in-django-rest-framework

class CreateUserView(CreateAPIView):
    model = User
    permission_classes = (permissions.AllowAny,)
    serializer_class = CreateUserSerializer

class SimpleUserViewSet( RetrieveModelMixin, ListModelMixin, GenericViewSet):
    serializer_class = SimpleUserSerializer
    permission_classes = (AuthenticatedUserPermission,)

    def get_queryset(self):
        result = User.objects.filter(id=self.request.user.id)
        return result

class LoginView(APIView):
    throttle_classes = ()
    permission_classes = ()
    parser_classes = (parsers.FormParser, parsers.MultiPartParser, parsers.JSONParser,)
    renderer_classes = (renderers.JSONRenderer,)
    serializer_class = CreateSessionSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'username':user.username, 'email':user.email, 'id':user.id})

class JobViewSet(ReadOnlyModelViewSet):
    serializer_class = JobSerializer
    permission_classes = (AuthenticatedOwnerPermission, )

    def get_queryset(self):
        user = self.get_authenticated_user()
        results = user.job_set.all()
        return results

    @list_route(methods=['get'])
    def active(self, request, *args, **kwargs):
        user = self.get_authenticated_user()
        active = Job.active_job(self.request.user)
        data = self.get_serializer(active).data if active else None
        return Response(data)

    @list_route(methods=['post'])
    def create_metaxcan(self, request, *args, **kwargs):
        user = self.get_authenticated_user()
        active = Job.active_job(self.request.user)
        if active:
            raise PermissionDenied

        job, headers = self.create_job(request, args, kwargs)
        metaxcan_parameters = MetaxcanParameters(owner=user)
        metaxcan_parameters.save()
        job.metaxcan_parameters = metaxcan_parameters
        job.save()
        serializer = self.get_serializer(job)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def get_success_headers(self, data):
        try:
            return {'Location': data[api_settings.URL_FIELD_NAME]}
        except (TypeError, KeyError):
            return {}

    def create_job(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = self.get_authenticated_user()
        job = serializer.save(owner=user)
        headers = self.get_success_headers(serializer.data)
        return job, headers

    def get_authenticated_user(self):
        if not self.request.user.is_authenticated():
            raise NotAuthenticated
        user_id = self.kwargs['user_pk']
        candidates = User.objects.filter(id=user_id).filter(id=self.request.user.id)
        if candidates.count() != 1:
            raise PermissionDenied
        else:
            user = candidates[0]
        return user

    def get_metaxcan_parameters_serializer(self, *args, **kwargs):
        kwargs['context'] = self.get_serializer_context()
        metaxcan_parameters_serializer = MetaxcanParametersSerializer(*args, **kwargs)
        return metaxcan_parameters_serializer

class TranscriptomeModelViewSet(ListModelMixin, RetrieveModelMixin, GenericViewSet):
    serializer_class = TranscriptomeModelSerializer
    permission_classes = (IsAuthenticated, )
    queryset = TranscriptomeModelDB.objects.all()

class MetaxcanParametersViewSet(RetrieveModelMixin, UpdateModelMixin, GenericViewSet):
    serializer_class = MetaxcanParametersSerializer
    permission_classes = (AuthenticatedOwnerPermission,)

    def get_queryset(self):
        user_id = self.kwargs['user_pk']
        candidates = User.objects.filter(id=user_id).filter(id=self.request.user.id)
        if candidates.count() != 1:
            raise PermissionDenied
        user = candidates[0]
        job_id = self.kwargs['job_pk']
        jobs = candidates[0].job_set.filter(id=job_id)
        if jobs.count() != 1:
            raise NotFound
        job = jobs[0]
        return MetaxcanParameters.objects.filter(job=job, owner=user)
