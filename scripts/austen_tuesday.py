import json, os, datetime, urllib.parse, urllib.request
from zoneinfo import ZoneInfo
import base64

path=os.path.join('secrets','acuity.json')
with open(path) as f:
    accounts=json.load(f)
creds=accounts['accountA']
zone=ZoneInfo('America/Phoenix')
target_date='2026-02-03'
params={'minDate':target_date,'maxDate':target_date,'limit':200,'cancelled':'false'}
url=f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
token=f"{creds['apiKey']}:{creds['apiSecret']}"
headers={'Authorization':'Basic '+base64.b64encode(token.encode()).decode()}
req=urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req, timeout=30) as resp:
    data=json.load(resp)
beats=[appt for appt in data if appt.get('calendar','').strip().lower()=='austen']
if not beats:
    print('No Austen lessons on',target_date)
else:
    beats.sort(key=lambda a:a['datetime'])
    for idx,appt in enumerate(beats,1):
        dt=datetime.datetime.fromisoformat(appt['datetime']).astimezone(zone)
        student=f"{appt.get('firstName','').strip()} {appt.get('lastName','').strip()}".strip()
        print(f"{idx}. {dt.strftime('%I:%M %p')} | {student} | {appt.get('type')} @ {appt.get('location') or appt.get('category')} | duration {appt.get('duration')} min")
