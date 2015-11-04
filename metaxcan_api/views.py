from rest_framework import permissions
from rest_framework.viewsets import ModelViewSet
from rest_framework.generics import CreateAPIView, ListAPIView, RetrieveAPIView
from django.contrib.auth.models import User  # If used custom user model
from .serializers import CreateUserSerializer, SimpleUserSerializer
from .permissions import AuthenticatedOwnerPermission, AuthenticatedUserPermission

#http://stackoverflow.com/questions/16857450/how-to-register-users-in-django-rest-framework

class CreateUserView(CreateAPIView):
    model = User
    permission_classes = (permissions.AllowAny,)
    serializer_class = CreateUserSerializer

class ListUsersView(ListAPIView):
    serializer_class = SimpleUserSerializer
    permission_classes = (AuthenticatedOwnerPermission,)

    def get_queryset(self):
        return [self.request.user]

class RetrieveUserView(RetrieveAPIView):
    serializer_class = SimpleUserSerializer
    permission_classes = (AuthenticatedUserPermission,)
    queryset = User.objects.all()

from rest_framework import parsers, renderers
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import CreateUserSerializer, CreateSessionSerializer

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

from rest_framework.viewsets import ModelViewSet
from .permissions import AuthenticatedOwnerPermission
from .serializers import JobSerializer

class JobViewSet(ModelViewSet):
    serializer_class = JobSerializer
    permission_classes = (AuthenticatedOwnerPermission,)

    def get_queryset(self):
        return self.request.user.jobs.all()
