__author__ = 'heroico'


from rest_framework.permissions import IsAuthenticated
from rest_framework.mixins import ListModelMixin, RetrieveModelMixin, UpdateModelMixin
from rest_framework.viewsets import GenericViewSet
from metaxcan_api.serializers import CovarianceSerializer
from metaxcan_api.models import Covariance

#http://stackoverflow.com/questions/16857450/how-to-register-users-in-django-rest-framewor

class CovarianceViewSet(ListModelMixin, RetrieveModelMixin, GenericViewSet):
    serializer_class = CovarianceSerializer
    permission_classes = (IsAuthenticated, )
    queryset = Covariance.objects.all()