from django.http import Http404
from rest_framework import permissions, parsers, renderers
from rest_framework.exceptions import PermissionDenied
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.mixins import ListModelMixin, RetrieveModelMixin
from rest_framework.viewsets import GenericViewSet, ModelViewSet
from rest_framework.generics import CreateAPIView
from rest_framework.decorators import list_route
from django.contrib.auth.models import User  # If used custom user model
from .serializers import CreateUserSerializer, CreateSessionSerializer, SimpleUserSerializer, JobSerializer
from .permissions import AuthenticatedOwnerPermission, AuthenticatedUserPermission
from .models import Job

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

class JobViewSet(ModelViewSet):
    serializer_class = JobSerializer
    permission_classes = (AuthenticatedOwnerPermission,)

    def get_queryset(self):
        user_id = self.kwargs['user_pk']
        candidates = User.objects.filter(id=user_id).filter(id=self.request.user.id)
        if candidates.count() == 1:
            results = candidates[0].job_set.all()
        else:
            raise PermissionDenied
        return results

    def perform_create(self, serializer):
        user = self.request.user
        active_job = Job.active_job(user)
        if active_job:
            raise PermissionDenied
        serializer.save(owner=user)

    @list_route(methods=['get'], permission_classes=(AuthenticatedOwnerPermission,))
    def active(self, request, *args, **kwargs):
        active = Job.active_job(self.request.user)
        data = self.get_serializer(active).data if active else None
        return Response(data)
