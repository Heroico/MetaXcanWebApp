__author__ = 'heroico'

from django.db import models

class Covariance(models.Model):
    name = models.CharField(max_length=200)
    path = models.CharField(max_length=400)