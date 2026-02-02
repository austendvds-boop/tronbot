import json, os, urllib.parse, urllib.request, base64
from datetime import datetime
from zoneinfo import ZoneInfo

TZ = ZoneInfo('America/Phoenix')
with open('secrets/acuity.json') as f:
    accounts = json.load(f)
api_key = accounts['accountB']['apiKey']
api_secret = accounts['accountB']['apiSecret']

start='2024-01-01'
end='2026-12-31'
limit=200
offset=0
results=[]
while True:
    params={'minDate':start,'maxDate':end,'limit':limit,'offset':offset,'cancelled':'false'}
    url=f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
    token=f"{api_key}:{api_secret}"
    headers={'Authorization':'Basic '+base64.b64encode(token.encode()).decode()}
    req=urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=60) as resp:
        batch=json.load(resp)
    if not batch:
        break
    results.extend(batch)
    if len(batch)<limit:
        break
    offset+=len(batch)

for appt in results:
    fn=(appt.get('firstName') or '').strip().lower()
    ln=(appt.get('lastName') or '').strip().lower()
    if 'aliyeh' in fn or 'mansouri' in ln:
        dt=appt.get('datetime') or appt.get('startDate')
        print('---', appt.get('id'), dt, appt.get('email'), appt.get('phone'), appt.get('status'))
