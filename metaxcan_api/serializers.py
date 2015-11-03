__author__ = 'heroico'
from rest_framework import serializers
from django.utils.translation import ugettext_lazy as _
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

#http://stackoverflow.com/questions/16857450/how-to-register-users-in-django-rest-framework

class GetUserTokenMixin(object):
    def get_token(self, validated_data):
        #where we populate the 'token' field above
        user = User.objects.filter(email=validated_data.email)
        token = Token.objects.get(user=user)
        return token.key

class CreateUserSerializer(serializers.HyperlinkedModelSerializer, GetUserTokenMixin):
    token = serializers.SerializerMethodField()
    email = serializers.EmailField(allow_blank=True, label='Email address', max_length=254, required=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'password', 'email', 'token', )
        extra_kwargs = {'password': {'write_only': True}}
        read_only_fields = ('id', 'token',)

    def validate(self, attrs):
        email = attrs['email']
        username = attrs['username']

        if not email: raise serializers.ValidationError("email required")
        if User.objects.filter(email=email).exclude(username=username).count(): raise serializers.ValidationError(_("email needs to be unique"))
        return attrs

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
        )

        user.set_password(validated_data['password'])
        user.save()

        Token.objects.create(user=user)

        return user

class CreateSessionSerializer(serializers.Serializer, GetUserTokenMixin):
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

