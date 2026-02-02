import json, os, urllib.parse, urllib.request, base64
from datetime import datetime
from zoneinfo import ZoneInfo

TZ = ZoneInfo('America/Phoenix')
with open('secrets/acuity.json') as f:
    data = json.load(f)
api_key = data['accountB']['apiKey']
api_secret = data['accountB']['apiSecret']

params = {'firstName': 'Aliyeh', 'minDate': '2025-01-01', 'maxDate': '2026-12-31', 'limit': 200, 'offset': 0, 'cancelled': 'false'}
url = f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
headers = {'Authorization': 'Basic ' + base64.b64encode(f"{api_key}:{api_secret}".encode()).decode()}
req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req, timeout=60) as resp:
    data = json.load(resp)
print('found', len(data))
for appt in data:
    dt = appt.get('datetime') or appt.get('startDate')
    print(appt.get('id'), dt, appt.get('email'), appt.get('phone'), appt.get('status'))
