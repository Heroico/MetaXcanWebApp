__author__ = 'heroico'

import os
from django.core.servers.basehttp import FileWrapper
from django.http import HttpResponse
from django.utils.translation import ugettext_lazy as _
from django.conf import settings
from rest_framework import status
from rest_framework.settings import api_settings
from rest_framework.exceptions import PermissionDenied, NotAuthenticated, NotFound, ParseError
from rest_framework.response import Response
from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.decorators import list_route, detail_route
from rest_framework.pagination import LimitOffsetPagination
from .utilities import AuthenticatedUserMixin, GetJobMixin
from metaxcan_api.serializers import JobSerializer, MetaxcanParametersSerializer
from metaxcan_api.permissions import AuthenticatedOwnerPermission
from metaxcan_api.models import Job, JobStateEnum, MetaxcanParameters
from metaxcan_api.tasks import run_metaxcan_job

#http://stackoverflow.com/questions/16857450/how-to-register-users-in-django-rest-framework

class JobViewSet(AuthenticatedUserMixin,
                 GetJobMixin,
                 ReadOnlyModelViewSet):
    serializer_class = JobSerializer
    permission_classes = (AuthenticatedOwnerPermission, )
    pagination_class = LimitOffsetPagination

    def get_queryset(self):
        user = self.get_authenticated_user()
        results = user.job_set.all()
        return results

    @list_route(methods=['get'])
    def active(self, request, *args, **kwargs):
        user = self.get_authenticated_user()
        active = Job.active_job(self.request.user)
        data = self.get_serializer(active).data if active else None
        return Response(data)

    @list_route(methods=['post'])
    def create_metaxcan(self, request, *args, **kwargs):
        user = self.get_authenticated_user()
        active = Job.active_job(self.request.user)
        if active:
            raise PermissionDenied

        job, headers = self.create_job(request, args, kwargs)
        metaxcan_parameters = MetaxcanParameters(owner=user)
        metaxcan_parameters.save()
        job.metaxcan_parameters = metaxcan_parameters
        job.save()
        serializer = self.get_serializer(job)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def get_success_headers(self, data):
        try:
            return {'Location': data[api_settings.URL_FIELD_NAME]}
        except (TypeError, KeyError):
            return {}

    def create_job(self, request, *args, **kwargs):
        #we default to "untitled" for the job
        if not "title" in request.data or request.data["title"] == None or request.data["title"] == "":
            request.data["title"] = "untitled"
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = self.get_authenticated_user()
        job = serializer.save(owner=user)
        headers = self.get_success_headers(serializer.data)
        return job, headers

    def get_metaxcan_parameters_serializer(self, *args, **kwargs):
        kwargs['context'] = self.get_serializer_context()
        metaxcan_parameters_serializer = MetaxcanParametersSerializer(*args, **kwargs)
        return metaxcan_parameters_serializer

    @detail_route(methods=['post'])
    def start(self, request, user_pk, pk=None, *args, **kwargs):
        job = self.get_job(pk)
        if not job.safe_for_run():
            raise PermissionDenied(_("Cannot start job"))
        job.start()
        if job.metaxcan_parameters and job.metaxcan_parameters.id:
            run_metaxcan_job.delay(pk)
        else:
            raise PermissionDenied(_("Need parameters"))
        data = self.get_serializer(job).data if job else None
        return Response(data)

    @detail_route(methods=['get'])
    def results(self, request, user_pk, pk=None, *args, **kwargs):
        user = self.get_authenticated_user()
        job = self.get_job(pk)
        if not job.state == JobStateEnum.COMPLETED:
            raise PermissionDenied(_("Job not completed"))
        path = job.hierarchy_results_path() + ".zip"
        path = os.path.join(settings.MEDIA_ROOT, path)
        if not os.path.exists(path):
            raise PermissionDenied("Job Results lost")
        with open(path, 'rb') as file:
            response = HttpResponse(FileWrapper(file), content_type='application/zip')
            response['Content-Disposition'] = 'attachment; filename="%s"' % 'results.zip'
            return response

    @detail_route(methods=['get', 'patch'])
    def metaxcan_parameters(self, request, user_pk, pk=None, *args, **kwargs):
        user = self.get_authenticated_user()
        job = self.get_job(pk)

        metaxcan_parameters = job.metaxcan_parameters
        if not metaxcan_parameters:
            raise NotFound

        if request.method == 'GET':
            return self.response_metaxcan_data(metaxcan_parameters=metaxcan_parameters)

        if request.method == 'PATCH':
            if not job.safe_for_run():
                raise PermissionDenied(_("Cannot modify parameters"))

            return self.partial_update_metaxcan_data(request, metaxcan_parameters)

    def response_metaxcan_data(self, metaxcan_parameters=None, serializer=None):
        if not (metaxcan_parameters or serializer):
            raise ParseError
        serializer = self.get_metaxcan_parameters_serializer(metaxcan_parameters) if not serializer else serializer
        return Response(serializer.data)

    def update_metaxcan_data(self, request, metaxcan_parameters, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        serializer = self.get_metaxcan_parameters_serializer(metaxcan_parameters, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return self.response_metaxcan_data(serializer=serializer)

    def partial_update_metaxcan_data(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update_metaxcan_data(request, *args, **kwargs)

