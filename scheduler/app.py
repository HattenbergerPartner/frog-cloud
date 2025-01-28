import json
import os
import pathlib
import psutil
import psycopg2
import re
import subprocess
from datetime import datetime, timezone
# celery
from worker import celery
from celery import current_app, uuid
from celery.exceptions import TimeoutError, TaskRevokedError
import celery.states as states
# flask
from flask import Flask, jsonify, request, send_from_directory, url_for
from werkzeug.utils import secure_filename

ALLOWED_EXTENSIONS = {'seospiderconfig'}

app = Flask(__name__)

app.config['UPLOAD_FOLDER'] = '/tmp/crawl-config'
app.config["SECRET_KEY"] = "12343212"

def allowed_file(filename):
	return '.' in filename and \
		filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def postgres():
	db = psycopg2.connect(
		user = os.environ['POSTGRES_USER'],
		password = os.environ['POSTGRES_PASSWORD'],
		host = os.environ['POSTGRES_HOST'],
		port = "5432",
		database = os.environ['POSTGRES_DB']
	)
	return db

@app.route("/crawl", methods = ['GET', 'POST'])
def start_crawl():
	req = request.get_json(force = True)
	url = req.get('requestURL', None)
	reports = req.get('requestReports', [])
	config_id = req.get('configId', 'default')

	task_id = uuid()
	report_path = f"/tmp/crawl-data/{task_id}/"
	pathlib.Path(report_path).mkdir(exist_ok = True) 
	report_data = {
		'directory': report_path,
		'reports': [{'path': f"{report['csv']}.csv", 'size': 0} for report in reports],
		'output': []
	}
	reportNames = [report['report'] for report in reports]

	cli_options = [
		'screamingfrogseospider',
		'--crawl',
		url,
		'--headless',
		'--output-folder',
		report_path,
		'--export-tabs',
		f'"{",".join(reportNames)}"',
		'--overwrite'
	]
	
	pg = postgres()
	db = pg.cursor()
	
	if config_id != 'default':
		db.execute("""
			SELECT id, config_id, config_data
			FROM configs
			WHERE config_id = %s
		""", (config_id,))

		if(db.rowcount != 0):
			row = db.fetchone()
			config = row[2]

			cli_options.append('--config')
			cli_options.append(f"{config['directory']}/{config['servername']}")

	task = celery.send_task('tasks.run', args = [" ".join(cli_options)], kwargs = {}, task_id = task_id)

	db.execute(
		"INSERT INTO crawls (status, start_url, task_id, start_time, end_time, report_data) VALUES (%s, %s, %s, %s, %s, %s)",
		("requested", url, task_id, None, None, json.dumps(report_data))
	)
	pg.commit()
	
	return {
		'status': 'ok',
		'task': task_id,
		'refreshURL': f"<a href='{url_for('check_task', task_id = task_id, external = True)}'>check status of {task_id} </a>"
	}, 200

@app.route("/cancel", methods = ['POST'])
def cancel_crawl():
	req = request.get_json(force = True)
	task_id = req.get('task_id', None)
	celery.control.revoke(task_id, terminate = True)
	
	return {
		'status': 'ok',
		'state': 'CANCELED',
		'task': task_id,
	}, 200

@app.route("/status", methods = ['POST'])
def task_status():
	req = request.get_json(force = True)
	task_id = req.get('task_id', None)
	
	pg = postgres()
	db = pg.cursor()
	db.execute("""
		SELECT id, task_id, status, start_url, start_time, end_time, report_data
		FROM crawls
		WHERE task_id = %s
	""", (task_id,))

	task = {}
	state = 'not found'
	if(db.rowcount != 0):
		row = db.fetchone()
		task = {
			'id': row[0],
			'task_id': row[1],
			'status': row[2],
			'start_url': row[3],
			'start_time': row[4],
			'end_time': row[5],
			'report_data': row[6],
		}
	
	output = []
	res = celery.AsyncResult(task_id)
	state = res.state
	info = res.info
	process = []
	if isinstance(info, dict):
		if 'output' in info:
			for line in info['output']:
				segment = re.findall(r'([0-9]{4}-[0-9]{2}-[0-9]{2})?( [0-9]{2}:[0-9]{2}:[0-9]{2},[0-9]{3})?( \[[0-9]+\])?( \[.+\])?(.*)', line)
				if segment[0][4] != '':
					process.append({
						'source': segment[0][3] or '',
						'msg': segment[0][4] or '',
					})
	try:
		result = res.get(timeout=0.1)

		if result is not None:
			for line in result.splitlines():
				segment = re.findall(r'([0-9]{4}-[0-9]{2}-[0-9]{2})?( [0-9]{2}:[0-9]{2}:[0-9]{2},[0-9]{3})?( \[[0-9]+\])?( \[.+\])?(.*)', line)
				if segment[0][4] != '':
					output.append({
						'source': segment[0][3] or '',
						'msg': segment[0][4] or '',
					})

		return {
			'status': 'ok',
			'state': state,
			'task_id': task_id,
			'msg': output,
			'server': {
				'cpu': psutil.cpu_percent(),
				'vm': psutil.virtual_memory().percent,
				'disk': psutil.disk_usage('/')[3],
			},
			'task': task
		}, 200

	except TimeoutError:
		return {
			'status': 'waiting',
			'state': state,
			'task_id': task_id,
			'msg': process,
			'server': {
				'cpu': psutil.cpu_percent(),
				'vm': psutil.virtual_memory().percent,
				'disk': psutil.disk_usage('/')[3],
			},
			'task': task
		}, 200

	except TaskRevokedError:
		return {
			'status': 'ok',
			'state': 'TERMINATED',
			'task_id': task_id,
			'msg': process,
			'server': {
				'cpu': psutil.cpu_percent(),
				'vm': psutil.virtual_memory().percent,
				'disk': psutil.disk_usage('/')[3],
			},
			'task': task
		}, 200

@app.route("/complete", methods = ['POST'])
def complete():
	pg = postgres()
	db = pg.cursor()
	db.execute("""
		SELECT id, task_id, status, start_url, start_time, end_time, report_data
		FROM crawls
		ORDER BY id ASC
	""", ())

	tasks = []
	if(db.rowcount != 0):
		rows = db.fetchall()
		for row in rows:
			tasks.append({
				'id': row[0],
				'task_id': row[1],
				'status': row[2],
				'start_url': row[3],
				'start_time': row[4],
				'end_time': row[5],
				'report_data': row[6],
			})

	returnData = {
		'success': True,
		'msg': 'msg',
		'tasks': tasks
	}

	return jsonify(returnData)

@app.route('/check/<string:task_id>', methods = ['GET'])
def check_task(task_id: str) -> str:
	res = celery.AsyncResult(task_id)
	return [res.state, str(res.result)]

@app.route("/configs", methods = ['POST'])
def configs():
	pg = postgres()
	db = pg.cursor()
	db.execute("""
		SELECT id, config_id, status, name, description, created_time, config_data
		FROM configs
		WHERE status = %s
		ORDER BY id ASC
	""", ('ok',))

	configs = []
	if(db.rowcount != 0):
		rows = db.fetchall()
		for row in rows:
			configs.append({
				'id': row[0],
				'config_id': row[1],
				'status': row[2],
				'name': row[3],
				'description': row[4],
				'created_time': row[5],
				'config_data': row[6],
			})

	reports = []
	reportTypes = []

	try:
		with open('/tmp/reports.json', 'r') as f:
			data = json.load(f)
			reports = data['reports']
			reportTypes = data['reportTypes']
	
	except OSError as e:
		reports = [{csv: "internal_all", label:"All", report: "Internal:All", section: "Internal" }]
		reportTypes = ['Internal']

	returnData = {
		'success': True,
		'msg': 'msg',
		'configs': configs,
		'reports': reports,
		'reportTypes': reportTypes,
	}

	return jsonify(returnData)

@app.route('/upload-config', methods = ['POST'])
def upload_file():
	if 'file' in request.files:
		file = request.files['file']
		if file and file.filename is not None and allowed_file(file.filename):

			config_id = uuid()
			name = request.form.get('name', 'config')
			description = request.form.get('description', 'description')
			filename = secure_filename(file.filename)
			servername = secure_filename(f"{config_id}.seospiderconfig")
			file.save(os.path.join(app.config['UPLOAD_FOLDER'], servername))
			create_time = datetime.fromtimestamp(datetime.now().timestamp(), tz = timezone.utc)
			config_data = {
				'filename': filename,
				'servername': servername,
				'directory': app.config['UPLOAD_FOLDER']
			}

			pg = postgres()
			db = pg.cursor()
			db.execute("""
				INSERT INTO configs (config_id, status, name, description, created_time, config_data)
				VALUES (%s, %s, %s, %s, %s, %s)
			""", (config_id, "ok", name, description, create_time, json.dumps(config_data))
			)
			pg.commit()
			
			return {
				'status': 'ok',
				'msg': 'config uploaded',
			}, 200
		else:
			print('no file?')
			return {
				'status': 'bad',
				'msg': 'bad file',
			}, 200
	else:
		print('no file')
		return {
			'status': 'bad',
			'msg': 'no file',
		}, 200

@app.route('/remove-config', methods = ['POST'])
def remove_config():
	req = request.get_json(force=True)
	config_id = req.get('configId', None)
	pg = postgres()
	db = pg.cursor()
	db.execute(
		"UPDATE configs SET status = %s WHERE config_id = %s",
		('deleted', config_id)
	)
	pg.commit()
	
	return {
		'status': 'ok',
		'msg': 'removed',
	}, 200

@app.route("/", methods = ['GET'])
def test():
	returnData = {
		'success': True,
		'msg': 'msg'
	}

	return jsonify(returnData)

@app.after_request
def after_request(response):
	response.headers.add('Access-Control-Allow-Origin', '*')
	response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
	response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
	return response

if __name__ == "__main__":
	app.run(port = 5000, debug = True)
