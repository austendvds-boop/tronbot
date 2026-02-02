import json, os, urllib.parse, urllib.request, base64
from zoneinfo import ZoneInfo
from datetime import datetime

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
print('total results', len(results))
for appt in results:
    if (appt.get('lastName') or '').strip().lower()=='mansouri':
        dt=None
        if appt.get('datetime'):
            dt=datetime.fromisoformat(appt['datetime']).astimezone(TZ)
        elif appt.get('startDate'):
            dt=datetime.fromisoformat(appt['startDate']).astimezone(TZ)
        print('----')
        print('id', appt.get('id'))
        print('name', appt.get('firstName'), appt.get('lastName'))
        print('start', dt.strftime('%Y-%m-%d %I:%M %p') if dt else 'None')
        print('email', appt.get('email'))
        print('phone', appt.get('phone'))
        print('status', appt.get('status'))
