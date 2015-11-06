__author__ = 'heroico'

from rest_framework.exceptions import PermissionDenied, NotAuthenticated, NotFound
from rest_framework.mixins import RetrieveModelMixin, UpdateModelMixin
from rest_framework.viewsets import GenericViewSet
from django.contrib.auth.models import User  # If used custom user model
from metaxcan_api.serializers import MetaxcanParametersSerializer
from metaxcan_api.permissions import AuthenticatedOwnerPermission
from metaxcan_api.models import MetaxcanParameters


class MetaxcanParametersViewSet(RetrieveModelMixin, UpdateModelMixin, GenericViewSet):
    serializer_class = MetaxcanParametersSerializer
    permission_classes = (AuthenticatedOwnerPermission,)

    def get_queryset(self):
        user_id = self.kwargs['user_pk']
        candidates = User.objects.filter(id=user_id).filter(id=self.request.user.id)
        if candidates.count() != 1:
            raise PermissionDenied
        user = candidates[0]
        job_id = self.kwargs['job_pk']
        jobs = candidates[0].job_set.filter(id=job_id)
        if jobs.count() != 1:
            raise NotFound
        job = jobs[0]
        return MetaxcanParameters.objects.filter(job=job, owner=user)
