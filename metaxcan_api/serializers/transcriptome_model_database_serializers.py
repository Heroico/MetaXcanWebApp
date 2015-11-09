__author__ = 'heroico'

from rest_framework import serializers
from metaxcan_api.models import TranscriptomeModelDB

class TranscriptomeModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = TranscriptomeModelDB
        fields = ('id', 'name', )
        read_only_fields = ('id', 'name', )