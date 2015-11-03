from rest_framework import permissions
from rest_framework.generics import CreateAPIView
from django.contrib.auth.models import User  # If used custom user model
from .serializers import SessionUserSerializer

#http://stackoverflow.com/questions/16857450/how-to-register-users-in-django-rest-framework

class CreateUserView(CreateAPIView):
    model = User
    permission_classes = (permissions.AllowAny,)
    serializer_class = SessionUserSerializer
