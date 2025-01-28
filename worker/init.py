import json
import subprocess

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

	with open('/queue/reports.json', 'w') as f:
		json.dump({'reports': reports, 'reportTypes': reportTypes}, f)

except Exception as e:
	print(e)