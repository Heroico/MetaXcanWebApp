__author__ = 'heroico'

import copy
from rest_framework import status
from rest_framework.settings import api_settings
from rest_framework.exceptions import PermissionDenied, NotAuthenticated, NotFound, ParseError
from rest_framework.response import Response
from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.decorators import list_route, detail_route
from django.contrib.auth.models import User
from metaxcan_api.serializers import JobSerializer, MetaxcanParametersSerializer
from metaxcan_api.permissions import AuthenticatedOwnerPermission
from metaxcan_api.models import Job, MetaxcanParameters

#http://stackoverflow.com/questions/16857450/how-to-register-users-in-django-rest-framework

class JobViewSet(ReadOnlyModelViewSet):
    serializer_class = JobSerializer
    permission_classes = (AuthenticatedOwnerPermission, )

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
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = self.get_authenticated_user()
        job = serializer.save(owner=user)
        headers = self.get_success_headers(serializer.data)
        return job, headers

    def get_authenticated_user(self):
        if not self.request.user.is_authenticated():
            raise NotAuthenticated
        user_id = self.kwargs['user_pk']
        candidates = User.objects.filter(id=user_id).filter(id=self.request.user.id)
        if candidates.count() != 1:
            raise PermissionDenied
        else:
            user = candidates[0]
        return user

    def get_metaxcan_parameters_serializer(self, *args, **kwargs):
        kwargs['context'] = self.get_serializer_context()
        metaxcan_parameters_serializer = MetaxcanParametersSerializer(*args, **kwargs)
        return metaxcan_parameters_serializer

    @detail_route(methods=['get', 'patch'])
    def metaxcan_parameters(self, request, user_pk, pk=None, *args, **kwargs):
        user = self.get_authenticated_user()
        jobs = Job.objects.filter(id=pk)
        job = jobs[0] if jobs.count() == 1 else None
        if not job:
            raise NotFound
        if job.owner != user:
            raise PermissionDenied

        metaxcan_parameters = job.metaxcan_parameters
        if not metaxcan_parameters:
            raise NotFound

        if request.method == 'GET':
            return self.response_metaxcan_data(metaxcan_parameters=metaxcan_parameters)

        if request.method == 'PATCH':
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
