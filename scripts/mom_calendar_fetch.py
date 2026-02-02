import json, os, urllib.parse, urllib.request, base64
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
TZ = ZoneInfo('America/Phoenix')
with open('secrets/acuity.json') as f:
    accounts=json.load(f)
creds=accounts['accountB']
base='https://acuityscheduling.com/api/v1/appointments'
target=datetime(2026,2,2, tzinfo=TZ)
start=datetime(target.year,target.month,target.day,0,0,0,tzinfo=TZ)
end=start+timedelta(days=1)
params={'minDate':start.strftime('%Y-%m-%dT%H:%M:%S%z'),'maxDate':end.strftime('%Y-%m-%dT%H:%M:%S%z'),'limit':200,'cancelled':'false'}
token=f"{creds['apiKey']}:{creds['apiSecret']}"
headers={'Authorization':'Basic '+base64.b64encode(token.encode()).decode()}
url=f"{base}?{urllib.parse.urlencode(params)}"
req=urllib.request.Request(url,headers=headers)
with urllib.request.urlopen(req,timeout=30) as resp:
    data=json.load(resp)
for appt in data:
    cal=(appt.get('calendar') or '')
    if 'michelle' in cal.lower() or 'mrs' in cal.lower():
        dt=datetime.fromisoformat(appt['datetime']).astimezone(TZ)
        print(f"{dt.strftime('%I:%M %p')} — {cal} — {appt.get('firstName')} {appt.get('lastName')} — {appt.get('location')} id={appt.get('id')}")
