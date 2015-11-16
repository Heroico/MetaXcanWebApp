from __future__ import absolute_import

from celery import shared_task
from metaxcan_api.models import Job, MetaxcanParameters
from subprocess import call

@shared_task
def run_metaxcan_job(job_id):
    print("Metaxcan Job:"+job_id)
    job = Job.objects.get(id=job_id)
    print("File Count:"+str(job.files.count()))
    command = job.metaxcan_parameters.run_metaxcan_command()
    print(command)

    return
    rcode = call(command.split(" "))
    if rcode == 0:
        job.completed()
    else:
        job.failed()
