from __future__ import absolute_import

from celery import shared_task
from metaxcan_api.models import Job

@shared_task
def run_job(job_id):
    print("Metaxcan Job:"+job_id)
    job = Job.objects.get(id=job_id)
    print("File Count:"+str(job.files.count()))
    job.complete()
