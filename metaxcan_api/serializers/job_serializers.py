__author__ = 'heroico'

from rest_framework import serializers
from metaxcan_api.models import Job

class JobSerializer(serializers.ModelSerializer):
    # TODO: implement user view
    owner = serializers.HyperlinkedRelatedField(view_name='user-detail', read_only=True)
    metaxcan_parameters = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Job
        fields = ('id', 'title', 'state', 'owner', 'created_date', 'metaxcan_parameters',)
        read_only_fields = ('id', 'owner', 'created_date', 'state', 'metaxcan_parameters', )
