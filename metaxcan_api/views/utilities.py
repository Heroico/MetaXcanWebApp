__author__ = 'heroico'

from rest_framework.exceptions import NotAuthenticated, PermissionDenied
from django.contrib.auth.models import User

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