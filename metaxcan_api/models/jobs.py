__author__ = 'heroico'

from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

class JobStateEnum(object):
    CREATED="created"

    options=[CREATED]

class Job(models.Model):
    owner = models.ForeignKey(User)
    title = models.CharField(max_length=200)
    state = models.CharField(max_length=10, default=JobStateEnum.CREATED)
    created_date = models.DateTimeField('date created', default=timezone.now)

    def __str__(self):
        t = self.title if self.title else "Untitled Job"
        return t