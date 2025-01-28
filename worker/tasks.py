import json
import os
import psycopg2
import re
import subprocess
import time
from celery import Celery
from celery.signals import task_success, task_revoked
from datetime import datetime, timezone
from pathlib import Path

CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL', 'redis://localhost:6379'),
CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND', 'redis://localhost:6379')

celery = Celery('tasks', broker = CELERY_BROKER_URL, backend = CELERY_RESULT_BACKEND)

def postgres():
	db = psycopg2.connect(
		user = os.environ['POSTGRES_USER'],
		password = os.environ['POSTGRES_PASSWORD'],
		host = os.environ['POSTGRES_HOST'],
		port = "5432",
		database = os.environ['POSTGRES_DB']
	)
	return db

@celery.task(name = 'tasks.run', bind = True, track_started = True)
def run_command(self, cmd):
	start_time = datetime.fromtimestamp(datetime.now().timestamp(), tz = timezone.utc)
	pg = postgres()
	db = pg.cursor()
	db.execute(
		"UPDATE crawls SET status = %s, start_time = %s WHERE task_id = %s",
		('started', start_time, self.request.id)
	)
	pg.commit()
	
	process = subprocess.Popen(
		cmd,
		stdout = subprocess.PIPE,
		stderr = subprocess.PIPE,
		shell = True,
		universal_newlines = True
	)
	
	output = []
	while process.poll() is None:
		resp = process.stdout.readline
		if resp == '' and process.poll() is not None:
			break
		for line in iter(resp, ''):
			if line != '' and ('INFO' in line or 'WARN' in line):
				output.append(line)
				self.update_state(state = 'PROGRESS', meta = {'output': output})
		time.sleep(0.5)

	process.stdout.close()
	process.stderr.close()
	process.wait()

	return ''.join(output)

@task_success.connect
def task_success_handler(sender = None, result = None, **kwargs):
	end_time = datetime.fromtimestamp(datetime.now().timestamp(), tz = timezone.utc)
	pg = postgres()
	db = pg.cursor()
	
	db.execute("""
		SELECT report_data
		FROM crawls
		WHERE task_id = %s
	""", (sender.request.id,))

	if(db.rowcount != 0):
		row = db.fetchone()
		reportData = row[0]
		
		output = []
		if result is not None:
			for line in result.splitlines():
				segment = re.findall(r'([0-9]{4}-[0-9]{2}-[0-9]{2})?( [0-9]{2}:[0-9]{2}:[0-9]{2},[0-9]{3})?( \[[0-9]+\])?( \[.+\])?(.*)', line)
				if segment[0][4] != '':
					output.append({
						'source': segment[0][3] or '',
						'msg': segment[0][4] or '',
					})

		updatedReportData = {
			'directory': reportData['directory'],
			'reports': reportData['reports'],
			'output': output
		}

		try:
			updatedReports = []
			for report in reportData['reports']:
				file = Path(f"{reportData['directory']}{report['path']}")
				size = file.stat().st_size
				updatedReports.append({'path': report['path'], 'size': size})
		
			updatedReportData = {
				'directory': reportData['directory'],
				'reports': updatedReports,
				'output': output
			}
		except OSError as e:
			print(e)
	
		db.execute(
			"UPDATE crawls SET status = %s, end_time = %s, report_data = %s WHERE task_id = %s",
			('done', end_time, json.dumps(updatedReportData), sender.request.id)
		)
		pg.commit()

@task_revoked.connect
def task_revoked_handler(request = None, **kwargs):
	end_time = datetime.fromtimestamp(datetime.now().timestamp(), tz = timezone.utc)
	pg = postgres()
	db = pg.cursor()
	
	db.execute("""
		SELECT report_data
		FROM crawls
		WHERE task_id = %s
	""", (request.id,))

	if(db.rowcount != 0):
		db.execute(
			"UPDATE crawls SET status = %s, end_time = %s WHERE task_id = %s",
			('canceled', end_time, request.id)
		)
		pg.commit()
