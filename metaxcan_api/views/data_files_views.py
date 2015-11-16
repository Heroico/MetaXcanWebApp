__author__ = 'heroico'

from rest_framework import viewsets
from rest_framework import mixins
from rest_framework import exceptions
from .utilities import AuthenticatedUserMixin
from metaxcan_api.serializers import DataFileSerializer
from .utilities import GetJobMixin
from metaxcan_api.permissions import AuthenticatedOwnerPermission
from django.utils.translation import ugettext_lazy as _
from django.conf import settings
import os

class DataFileViewSet(AuthenticatedUserMixin,
                    GetJobMixin,
                    mixins.CreateModelMixin,
                    mixins.RetrieveModelMixin,
                    mixins.DestroyModelMixin,
                    mixins.ListModelMixin,
                    viewsets.GenericViewSet):
    #queryset = DataFile.objects.all()
    serializer_class = DataFileSerializer
    permission_classes = (AuthenticatedOwnerPermission, )

    def get_queryset(self):
        job_id = self.kwargs["job_pk"]
        job = self.get_job(job_id)
        return job.files.all()

    def create(self, request, *args, **kwargs):
        user = self.get_authenticated_user()
        self.request.data["owner"] = user.id
        return super(DataFileViewSet, self).create(request, *args, **kwargs)

    def perform_create(self, serializer):
        name = serializer.validated_data["name"] if "name" in serializer.validated_data else "file"
        job_id = self.kwargs["job_pk"]
        job = self.get_job(job_id)
        files = job.files.filter(name=name)
        if files.count() > 0:
            raise exceptions.PermissionDenied(_("There is already a file with that name in this job"))
        file = serializer.save()
        self.move_file(job, file)
        job.files.add(file)

    def move_file(self, job, file):
        initial_path = file.file.path
        root = settings.MEDIA_ROOT

        hierarchy = job.hierarchy_input_files_path()
        path = os.path.join(root, hierarchy)
        if not os.path.exists(path):
            os.makedirs(path)
        name = os.path.join(hierarchy, file.file.name)
        file.file.name = name

        final_path = os.path.join(root, file.file.name)
        os.rename(initial_path, final_path)
        file.save()

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