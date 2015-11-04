__author__ = 'heroico'
from django.db import models
from django.contrib.auth.models import User

class JobStateEnum(object):
    CREATED="created"

class Job(models.Model):
    owner = models.ForeignKey(User)
    title = models.CharField(max_length=200)
    state = models.CharField(max_length=10)
    created_date = models.DateTimeField('date published')

    def __str__(self):
        t = self.choice_text if self.choice_text else "Untitled Job"
        return t