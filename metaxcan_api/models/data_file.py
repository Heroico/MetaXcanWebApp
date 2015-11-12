__author__ = 'heroico'

from django.db import models
from django.contrib.auth.models import User

class DataFile(models.Model):
    name = models.CharField(max_length=254, default="file", blank=False)
    file = models.FileField(blank=False)
    owner = models.ForeignKey(User)
