__author__ = 'heroico'

import os
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from django.utils.translation import ugettext_lazy as _
from .metaxcan_parameters import MetaxcanParameters
from .data_file import DataFile

class JobStateEnum(object):
    CREATED="created"
    RUNNING="running"
    COMPLETED="completed"
    CANCELLED="cancelled"
    FAILED="failed"

    options=[CREATED, RUNNING, COMPLETED, CANCELLED, FAILED]

class Job(models.Model):
    owner = models.ForeignKey(User)
    title = models.CharField(max_length=200)
    state = models.CharField(max_length=10, default=JobStateEnum.CREATED)
    created_date = models.DateTimeField('date created', default=timezone.now)

    metaxcan_parameters = models.OneToOneField(MetaxcanParameters, blank=True, null=True, default=None)

    files = models.ManyToManyField(DataFile)

    def __str__(self):
        t = self.title if self.title else "Untitled Job"
        c = str(self.created_date)
        return "-".join([t, c])

    @classmethod
    def active_job(cls, owner):
        results = Job.objects.filter(
            state__in=[JobStateEnum.CREATED, JobStateEnum.RUNNING, JobStateEnum.FAILED],
            owner=owner)
        if results.count() > 0:
            return results[0]

        return None

# crude state machine
    def start(self):
        if self.state not in [JobStateEnum.CREATED, JobStateEnum.FAILED]:
            raise Exception(_("Can't start that which already is started"))
        self.state = JobStateEnum.RUNNING
        self.save()

    def completed(self):
        if self.state != JobStateEnum.RUNNING:
            raise Exception(_("Can't complete that which is not running"))
        self.state = JobStateEnum.COMPLETED
        self.save()

    def saved(self):
        if self.state != JobStateEnum.RUNNING:
            raise Exception(_("Can't fail that which is not running"))
        self.state = JobStateEnum.FAILED
        self.save()

#relevant paths
    def hierarchy_path(self):
        user = self.owner
        hierarchy = os.path.join(str(user.id), str(self.id))
        if not os.path.exists(hierarchy):
            os.makedirs(hierarchy)
        return hierarchy

    def hierarchy_input_files_path(self):
        return  self.make_subpath("input_files")

    def hierarchy_results_path(self):
        return self.make_subpath("results")

    def hierarchy_intermediate_path(self):
        return self.make_subpath("intermediate")

    def make_subpath(self, sub_path):
        path = self.hierarchy_path()
        path = os.path.join(path, sub_path)
        if not os.path.exists(path):
            os.makedirs(path)
        return path
