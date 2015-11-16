__author__ = 'heroico'

import os
from django.db import models
from django.contrib.auth.models import User
from django.conf import settings
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
    separator = models.CharField(max_length=10, default=None, blank=True) #Care! Due to sanitation, might be "\\t"

    def run_metaxcan_command(self):
        job = self.job
        p = settings.METAXCAN_PYTHON
        m = settings.METAXCAN_SOFTWARE

        command = p + " " + m
        if job.metaxcan_parameters.compressed:
            command += " -compressed"

        input_path = os.path.join(settings.MEDIA_ROOT, job.hierarchy_input_files_path())
        command += " --gwas_folder " + input_path

        intermediate_path = os.path.join(settings.MEDIA_ROOT, job.hierarchy_intermediate_path())
        command += " --beta_folder " + intermediate_path

        transcriptome_path = self.transcriptome.path
        command += " --weight_db_path " + transcriptome_path

        #TODO: covariance

        return command