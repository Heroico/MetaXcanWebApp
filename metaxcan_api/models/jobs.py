__author__ = 'heroico'

from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

class JobStateEnum(object):
    CREATED="created"
    RUNNING="running"
    COMPLETED="completed"
    CANCELLED="cancelled"

    options=[CREATED, RUNNING, COMPLETED, CANCELLED]

class Job(models.Model):
    owner = models.ForeignKey(User)
    title = models.CharField(max_length=200)
    state = models.CharField(max_length=10, default=JobStateEnum.CREATED)
    created_date = models.DateTimeField('date created', default=timezone.now)

    def __str__(self):
        t = self.title if self.title else "Untitled Job"
        c = str(self.created_date)
        return "-".join([t, c])

    @classmethod
    def active_job(cls, owner):
        results = Job.objects.filter(state="created", owner=owner)
        if results.count() > 0:
            return results[0]

        return None