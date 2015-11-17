__author__ = 'heroico'

from rest_framework import serializers
from metaxcan_api.models import Covariance

class CovarianceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Covariance
        fields = ('id', 'name', )
        read_only_fields = ('id', 'name', )