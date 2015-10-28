__author__ = 'heroico'
from rest_framework import serializers
from django.contrib.auth.models import User

#http://stackoverflow.com/questions/16857450/how-to-register-users-in-django-rest-framework
class UserSerializer(serializers.HyperlinkedModelSerializer):
    email = serializers.EmailField(allow_blank=True, label='Email address', max_length=254, required=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'password', 'email')
        extra_kwargs = {'password': {'write_only': True}}
        read_only_fields = ('id',)

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
        )

        user.set_password(validated_data['password'])
        user.save()

        return user
