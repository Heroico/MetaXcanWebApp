__author__ = 'heroico'


from rest_framework.permissions import IsAuthenticated
from rest_framework.mixins import ListModelMixin, RetrieveModelMixin, UpdateModelMixin
from rest_framework.viewsets import GenericViewSet
from metaxcan_api.serializers import TranscriptomeModelSerializer
from metaxcan_api.models import TranscriptomeModelDB

#http://stackoverflow.com/questions/16857450/how-to-register-users-in-django-rest-framewor

class TranscriptomeModelViewSet(ListModelMixin, RetrieveModelMixin, GenericViewSet):
    serializer_class = TranscriptomeModelSerializer
    permission_classes = (IsAuthenticated, )
    queryset = TranscriptomeModelDB.objects.all()