import json, os, urllib.parse, urllib.request, base64
from datetime import datetime
from zoneinfo import ZoneInfo
TZ=ZoneInfo('America/Phoenix')
with open('secrets/acuity.json') as f:
    accounts=json.load(f)
creds=accounts['accountB']
api_key=creds['apiKey']; api_secret=creds['apiSecret']
headers={'Authorization':'Basic '+base64.b64encode(f"{api_key}:{api_secret}".encode()).decode()}
base='https://acuityscheduling.com/api/v1/appointments'
target='2026-02-02'
params={'minDate':f"{target}T00:00:00-07:00",'maxDate':f"{target}T23:59:59-07:00",'limit':200,'cancelled':'false'}
url=f"{base}?{urllib.parse.urlencode(params)}"
req=urllib.request.Request(url,headers=headers)
with urllib.request.urlopen(req,timeout=30) as resp:
    data=json.load(resp)
for appt in data:
    student=f"{(appt.get('firstName') or '').strip()} {(appt.get('lastName') or '').strip()}".strip()
    if student.lower()=='swathi sree pandiri':
        pkg=appt.get('appointmentType') or appt.get('appointmentTypeID')
        print('Package info:', pkg)
        print('Type:', appt.get('type'))
        print('Category:', appt.get('category'))
        break
