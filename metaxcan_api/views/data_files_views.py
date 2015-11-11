__author__ = 'heroico'

from rest_framework import viewsets
from rest_framework import mixins
from .utilities import AuthenticatedUserMixin
from metaxcan_api.serializers import DataFileSerializer
from metaxcan_api.models import DataFile
from metaxcan_api.permissions import AuthenticatedOwnerPermission

class DataFileViewSet(AuthenticatedUserMixin,
                    mixins.CreateModelMixin,
                    mixins.RetrieveModelMixin,
                    mixins.DestroyModelMixin,
                    mixins.ListModelMixin,
                    viewsets.GenericViewSet):
    #queryset = DataFile.objects.all()
    serializer_class = DataFileSerializer
    permission_classes = (AuthenticatedOwnerPermission, )

    def get_queryset(self):
        user = self.get_authenticated_user()
        return user.datafile_set.all()

    def create(self, request, *args, **kwargs):
        print(self.request.data)
        user = self.get_authenticated_user()
        self.request.data["owner"] = user.id
        return super(DataFileViewSet, self).create(request, *args, **kwargs)
    # def perform_create(self, obj):
    #     print (self.request.data)
    #     if not "file" in self.request.FILES:
    #         raise exceptions.ValidationError("missing file part")
    #     obj.file = self.request.FILES.get('file')
    #
    # def create(self, request, *args, **kwargs):
    #     print( self.request.data )
    #     serializer = self.get_serializer(data=request.data)
    #     serializer.is_valid(raise_exception=True)
    #     self.perform_create(serializer)
    #     headers = self.get_success_headers(serializer.data)
    #     return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    #
    # def perform_create(self, serializer):
    #     serializer.save()
    #
    # def get_success_headers(self, data):
    #     try:
    #         return {'Location': data[api_settings.URL_FIELD_NAME]}
    #     except (TypeError, KeyError):
    #         return {}