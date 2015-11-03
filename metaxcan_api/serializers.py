__author__ = 'heroico'
from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

#http://stackoverflow.com/questions/16857450/how-to-register-users-in-django-rest-framework
class UserSerializer(serializers.HyperlinkedModelSerializer):
    email = serializers.EmailField(allow_blank=True, label='Email address', max_length=254, required=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'password', 'email')
        extra_kwargs = {'password': {'write_only': True}}
        read_only_fields = ('id',)


class SessionUserSerializer(UserSerializer):
    token = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'password', 'email', 'token', )
        extra_kwargs = {'password': {'write_only': True}}
        read_only_fields = ('id', 'token',)

    def get_token(self, validated_data):
        #where we populate the 'token' field above
        user = User.objects.filter(email=validated_data.email)
        token = Token.objects.get(user=user)
        return token.key

    def validate(self, attrs):
        email = attrs['email']
        username = attrs['username']

        if not email: raise serializers.ValidationError("email required")
        if User.objects.filter(email=email).exclude(username=username).count(): raise serializers.ValidationError("email needs to be unique")
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
