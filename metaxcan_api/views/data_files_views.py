__author__ = 'heroico'

from rest_framework import viewsets
from rest_framework import mixins
from rest_framework import exceptions
from .utilities import AuthenticatedUserMixin
from metaxcan_api.serializers import DataFileSerializer
from metaxcan_api.models import Job
from metaxcan_api.permissions import AuthenticatedOwnerPermission
from django.utils.translation import ugettext_lazy as _

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
        job = self.get_job()
        return job.files.all()

    def create(self, request, *args, **kwargs):
        user = self.get_authenticated_user()
        self.request.data["owner"] = user.id
        return super(DataFileViewSet, self).create(request, *args, **kwargs)

    def perform_create(self, serializer):
        name = serializer.validated_data["name"] if "name" in serializer.validated_data else "file"
        job = self.get_job()
        files = job.files.filter(name=name)
        if files.count() > 0:
            raise exceptions.PermissionDenied(_("There is already a file with that name in this job"))
        f = serializer.save()
        job.files.add(f)

    def get_job(self):
        job_id = self.kwargs["job_pk"]
        user = self.get_authenticated_user()
        jobs = Job.objects.filter(id=job_id, owner__id=user.id)
        if jobs.count() != 1: raise exceptions.PermissionDenied
        job = jobs[0]
        return job

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