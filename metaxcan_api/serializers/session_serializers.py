__author__ = 'heroico'

from rest_framework import serializers
from django.utils.translation import ugettext_lazy as _
from django.contrib.auth import authenticate
from django.contrib.auth.models import User

class CreateSessionSerializer(serializers.Serializer):
    email = serializers.EmailField(allow_blank=True, label='Email address', max_length=254, required=False)
    username = serializers.CharField(allow_blank=True, label='User name', max_length=30, required=False)
    password = serializers.CharField(style={'input_type': 'password'})

    def validate(self, attrs):
        password = attrs['password']
        email = attrs['email'] if 'email' in attrs else None
        username = attrs['username'] if 'username' in attrs else None

        if not (email or username):
            raise serializers.ValidationError(_("Either username or email required"))

        if not username:
            results = User.objects.filter(email=email)
            count = len(results)
            if count == 1:
                candidate = results[0]
                username = candidate.username
            else:
                msg = _('Try with different credentials')
                raise serializers.ValidationError(msg)

        user = authenticate(username=username, password=password)
        if user:
            if not user.is_active:
                msg = _('User account is disabled.')
                raise serializers.ValidationError(msg)
        else:
            msg = _('Unable to log in with provided credentials.')
            raise serializers.ValidationError(msg)
        attrs['user'] = user

        return attrs

