from rest_framework import permissions, parsers, renderers
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.mixins import ListModelMixin, RetrieveModelMixin
from rest_framework.viewsets import GenericViewSet
from rest_framework.generics import CreateAPIView
from django.contrib.auth.models import User  # If used custom user model
from metaxcan_api.serializers import CreateUserSerializer, CreateSessionSerializer, SimpleUserSerializer
from metaxcan_api.permissions import AuthenticatedUserPermission

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


