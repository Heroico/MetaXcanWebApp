__author__ = 'heroico'

from rest_framework import serializers
from metaxcan_api.models import DataFile

class DataFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataFile
        fields = ("id", "name", "file", "owner", )
        read_only_fields = ("id",)
        extra_kwargs = {'file': {'write_only': True}, 'owner':{'write_only': True}}
