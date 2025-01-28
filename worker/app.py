import json
import os
import pathlib
import psutil
import psycopg2
import re
import subprocess
# flask
from flask import Flask, jsonify, request, send_from_directory, url_for

app = Flask(__name__)

app.config["SECRET_KEY"] = "12343212"

@app.route("/update", methods = ['POST'])
def update():
	req = request.get_json(force = True)
	settings = req['settings']

	if 'licence' in settings:
		try:
			f = open('/root/.ScreamingFrogSEOSpider/licence.txt', 'w')
			f.write(f"{settings['licence']['name']}\n")
			f.write(f"{settings['licence']['key']}\n")
			f.close(0)

		except Exception as e:
			print(e)

	if 'sf' in settings:
		try:
			f = open('/root/.ScreamingFrogSEOSpider/.screamingfrogseospider', 'w')
			f.write(f"-Xmx{settings['sf']['memory_amount']}g")
			f.close()

		except Exception as e:
			print(e)
		
		if 'config' in settings['sf']:
			try:
				f = open('/root/.ScreamingFrogSEOSpider/spider.config', 'w')
				f.write(f"eula.accepted={settings['sf']['config']['eula_accepted']}\n")
				f.write(f"storage.mode={settings['sf']['config']['storage_mode']}\n")
				f.write(f"ui.mode=Spider\n")
				f.close()

			except Exception as e:
				print(e)
	
	returnData = {
		'success': True,
		'msg': 'msg',
	}

	return jsonify(returnData)

@app.route("/report-options", methods = ['POST'])
def report_options():
	reports = []
	reportTypes = []

	try:
		with open('/root/.ScreamingFrogSEOSpider/reports.json', 'r') as f:
			data = json.load(f)
			reports = data['reports']
			reportTypes = data['reportTypes']
	
	except OSError as e:
		try:
			sf_reports = subprocess.run(
				"screamingfrogseospider --help export-tabs",
				shell = True,
				stdout = subprocess.PIPE,
				stderr = subprocess.PIPE,
				text = True
			).stdout

			reports = [{
				'report': report,
				'section': report.split(':')[0],
				'label': report.split(':')[1],
				'csv': report.lower().replace(' ','_').replace(':','_')
			} for report in sf_reports.splitlines()[3:] if ":" in report]

			reportTypes = sorted(list(set([report['section'] for report in reports])))

			with open('/root/.ScreamingFrogSEOSpider/reports.json', 'w') as f:
				json.dump({'reports': reports, 'reportTypes': reportTypes}, f)
		
		except Exception as e:
			print(e)

	returnData = {
		'success': True,
		'msg': 'msg',
		'reports': reports,
		'reportTypes': reportTypes,
	}
	return jsonify(returnData)

@app.route("/settings", methods = ['POST'])
def settings():
	licence = {'name': 'none', 'key': 'none'}
	config = {}
	memory = [0, 'mb']
	sf_installed = 'none'

	try:
		l = open('/root/.ScreamingFrogSEOSpider/licence.txt', 'r')
		raw_licence = l.read().splitlines()
		licence = {
			'name': f"{'*' * (len(raw_licence[0]) - 4)}{raw_licence[0][-4:]}",
			'key': f"{'*' * (len(raw_licence[1]) - 4)}{raw_licence[1][-4:]}",
		}
	except Exception as e:
		print(e)

	try:
		cf = open('/root/.ScreamingFrogSEOSpider/spider.config', 'r')
		config = dict(line.replace('.', '_').split('=') for line in cf.read().splitlines() if "=" in line)
	except Exception as e:
		print(e)

	try:
		mem = open('/root/.ScreamingFrogSEOSpider/.screamingfrogseospider', 'r')
		memory = re.findall(r'-Xmx([0-9]+)(mb|g)', mem.read())[0]
	except Exception as e:
		print(e)

	try:
		sf_installed = subprocess.run(
			"dpkg -s screamingfrogseospider | grep '^Version:'",
			shell = True,
			stdout = subprocess.PIPE,
			stderr = subprocess.PIPE,
			text = True
		).stdout
	
	except Exception as e:
		print(e)

	returnData = {
		'success': True,
		'msg': 'msg',
		'licence': licence,
		'server': {
			'cpu': psutil.cpu_percent(),
			'vm': {
				'total': round(psutil.virtual_memory().total / 1024 / 1024 / 1024),
				'available': round(psutil.virtual_memory().available / 1024 / 1024 / 1024),
				'per': psutil.virtual_memory().percent,
			},
			'disk': {
				'total': round(psutil.disk_usage('/').total / 1024 / 1024 / 1024),
				'available': round(psutil.disk_usage('/').free / 1024 / 1024 / 1024),
				'per': psutil.disk_usage('/').percent,
			}
		},
		'sf': {
			'version': sf_installed,
			'memory_amount': int(memory[0]),
			'memory_size': memory[1],
			'config': config,
		},
	}
	return jsonify(returnData)

@app.after_request
def after_request(response):
	response.headers.add('Access-Control-Allow-Origin', '*')
	response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
	response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
	return response

if __name__ == "__main__":
	app.run(port = 5666, debug = True)
