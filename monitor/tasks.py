import os
import time
import subprocess
from celery import Celery

CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL', 'redis://localhost:6379'),
CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND', 'redis://localhost:6379')

celery = Celery('tasks', broker = CELERY_BROKER_URL, backend = CELERY_RESULT_BACKEND)

@celery.task(name = 'tasks.add')
def add(x: int, y: int) -> int:
    time.sleep(5)
    return x + y

@celery.task(name = 'tasks.run')
def run_command(cmd):
    process = subprocess.Popen(cmd, stdout = subprocess.PIPE, stderr = subprocess.PIPE, shell = True)
    stdout, stderr = process.communicate()

    return {
        "stdout": stdout.decode(),
        "stderr": stderr.decode(),
        "returncode": process.returncode
    }