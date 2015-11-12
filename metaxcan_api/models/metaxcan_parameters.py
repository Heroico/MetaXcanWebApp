__author__ = 'heroico'

from django.db import models
from django.contrib.auth.models import User
from .transcriptome_model_database import TranscriptomeModelDB

class MetaxcanParameters(models.Model):
    owner = models.ForeignKey(User)
    transcriptome = models.ForeignKey(TranscriptomeModelDB, null=True, blank=True, default = None)
    snp_column = models.CharField(max_length=50, default="SNP")
    other_allele_column = models.CharField(max_length=50, default="A1")
    effect_allele_column = models.CharField(max_length=50, default="A2")
    odd_ratio_column = models.CharField(max_length=50, blank=True)
    beta_column = models.CharField(max_length=50, blank=True)
    beta_sign_column = models.CharField(max_length=50, blank=True)
    p_column = models.CharField(max_length=50, blank=True)
    compressed = models.BooleanField(default=False)
    separator = models.CharField(max_length=10, default=None, blank=True)
