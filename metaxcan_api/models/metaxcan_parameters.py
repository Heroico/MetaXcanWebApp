__author__ = 'heroico'

import os
from django.db import models
from django.contrib.auth.models import User
from django.conf import settings
from .transcriptome_model_database import TranscriptomeModelDB
from .covariance import Covariance

class MetaxcanParameters(models.Model):
    owner = models.ForeignKey(User)
    transcriptome = models.ForeignKey(TranscriptomeModelDB, null=True, blank=True, default = None)
    covariance = models.ForeignKey(Covariance, null=True, blank=True, default = None)
    snp_column = models.CharField(max_length=50, default="SNP")
    other_allele_column = models.CharField(max_length=50, default="A1")
    effect_allele_column = models.CharField(max_length=50, default="A2")
    odd_ratio_column = models.CharField(max_length=50, blank=True)
    beta_column = models.CharField(max_length=50, blank=True)
    beta_sign_column = models.CharField(max_length=50, blank=True)
    p_column = models.CharField(max_length=50, blank=True)
    compressed = models.BooleanField(default=False)
    separator = models.CharField(max_length=10, blank=True) #Care! Due to sanitation, might be "\\t"

    def run_metaxcan_03_command(self):
        job = self.job
        p = settings.METAXCAN_PYTHON
        m = os.path.join(settings.METAXCAN_SOFTWARE, "M03_betas.py")

        command = p + " " + m

        if job.metaxcan_parameters.compressed:
            command += " --compressed"
        if self.separator and len(self.separator):
            command += " --separator " + self.separator
        command += " --a1_column " + self.other_allele_column
        command += " --a2_column " + self.effect_allele_column
        command += " --snp_column " + self.snp_column
        if self.p_column:
            command += " --pvalue_column " + self.p_column

        if self.beta_column:
            command += " --beta_column " + self.beta_column
        elif self.beta_sign_column:
            command += " --beta_sign_column " + self.beta_sign_column
        elif self.odd_ratio_column:
            command += " --or_column " + self.odd_ratio_column

        command += " --gwas_folder " + os.path.join(settings.MEDIA_ROOT, job.hierarchy_input_files_path())
        command += " --output_folder " + os.path.join(settings.MEDIA_ROOT, job.hierarchy_intermediate_path())
        command += " --weight_db_path " + self.transcriptome.path

        return command

    def run_metaxcan_04_command(self):
        job = self.job
        p = settings.METAXCAN_PYTHON
        m = os.path.join(settings.METAXCAN_SOFTWARE, "M04_zscores.py")

        command = p + " " + m

        command += " --weight_db_path " + self.transcriptome.path
        command += " --covariance_folder " + self.covariance.path
        command += " --beta_folder " + os.path.join(settings.MEDIA_ROOT, job.hierarchy_intermediate_path())

        results_path = os.path.join(settings.MEDIA_ROOT, job.hierarchy_results_path())
        results_path = os.path.join(results_path, "results.csv")
        command += " --output_file " + results_path

        return command
