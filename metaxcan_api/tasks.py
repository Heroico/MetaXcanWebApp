from __future__ import absolute_import

from celery import shared_task
from metaxcan_api.models import Job, MetaxcanParameters
from subprocess import call
from django.conf import settings
import os
import shutil


@shared_task
def run_metaxcan_job(job_id):
    print("Running Metaxcan Job:"+job_id)
    job = Job.objects.get(id=job_id)

    command = job.metaxcan_parameters.run_metaxcan_03_command()
    rcode = call(command.split(" "))
    if rcode != 0:
        job.failed()
        return

    command = job.metaxcan_parameters.run_metaxcan_04_command()
    rcode = call(command.split(" "))
    if rcode == 0:
        job.completed()
    else:
        job.failed()

    print("deleting stuff")
    intermediate = os.path.join(settings.MEDIA_ROOT, job.hierarchy_intermediate_path())
    shutil.rmtree(intermediate)

    results = os.path.join(settings.MEDIA_ROOT, job.hierarchy_results_path())
    zip = results
    shutil.make_archive(zip, root_dir=results, format="zip")