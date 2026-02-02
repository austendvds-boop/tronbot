import json, os, datetime, urllib.parse, urllib.request
from zoneinfo import ZoneInfo
import base64
path=os.path.join('secrets','acuity.json')
with open(path) as f:
    accounts=json.load(f)
creds=accounts['accountB']
zone=ZoneInfo('America/Phoenix')
target='2026-02-02'
params={'minDate':target,'maxDate':target,'cancelled':'false','limit':200}
url=f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
token=f"{creds['apiKey']}:{creds['apiSecret']}"
headers={'Authorization':'Basic '+base64.b64encode(token.encode()).decode()}
req=urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req, timeout=30) as resp:
    data=json.load(resp)
ernie=[appt for appt in data if appt.get('calendar','').strip().lower()=='ernie']
if not ernie:
    print('No Ernie calendar events for',target)
else:
    ernie.sort(key=lambda a:a['datetime'])
    for idx,appt in enumerate(ernie,1):
        dt=datetime.datetime.fromisoformat(appt['datetime']).astimezone(zone)
        print(f"{idx}. {dt.strftime('%I:%M %p')} | {appt.get('firstName','').strip()} {appt.get('lastName','').strip()} | {appt.get('type')} @ {appt.get('location') or appt.get('category')} | dur {appt.get('duration')}m")
