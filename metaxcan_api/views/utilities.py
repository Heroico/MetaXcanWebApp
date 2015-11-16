__author__ = 'heroico'

from rest_framework.exceptions import NotAuthenticated, PermissionDenied, NotFound
from django.contrib.auth.models import User
from metaxcan_api import models

class AuthenticatedUserMixin(object):
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

class GetJobMixin(object):
    def get_job(self, job_pk):
        user = self.get_authenticated_user()
        jobs = models.Job.objects.filter(id=job_pk)
        job = jobs[0] if jobs.count() == 1 else None
        if not job:
            raise NotFound
        if job.owner != user:
            raise PermissionDenied
        return job