__author__ = 'heroico'

from django.db import models

class TranscriptomeModelDB(models.Model):
    name = models.CharField(max_length=200)
    path = models.CharField(max_length=400)
