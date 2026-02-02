import json, os, datetime, urllib.parse, urllib.request, base64
from zoneinfo import ZoneInfo
path=os.path.join('secrets','acuity.json')
with open(path) as f:
    accounts=json.load(f)
creds=accounts['accountB']
zone=ZoneInfo('America/Phoenix')
target='2026-02-03'
params={'minDate':'2024-01-01','maxDate':target,'limit':200,'cancelled':'false'}
url=f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
token=f"{creds['apiKey']}:{creds['apiSecret']}"
headers={'Authorization':'Basic '+base64.b64encode(token.encode()).decode()}
req=urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req, timeout=30) as resp:
    data=json.load(resp)
history={}
for appt in data:
    if appt.get('calendar','').strip().lower()!='ernie':
        continue
    key=(appt.get('firstName','').strip(), appt.get('lastName','').strip())
    dt=datetime.datetime.fromisoformat(appt['datetime']).astimezone(zone)
    if dt.date()<=datetime.datetime.fromisoformat(target+'T23:59:59-0700').astimezone(zone).date():
        history.setdefault(key, []).append(dt)
for key in history:
    history[key].sort()
today=[appt for appt in data if appt.get('calendar','').strip().lower()=='ernie' and datetime.datetime.fromisoformat(appt['datetime']).astimezone(zone).date()==datetime.datetime.fromisoformat(target+'T00:00:00-0700').astimezone(zone).date()]
today.sort(key=lambda appt: appt['datetime'])
print('Ernie Tuesday update',target)
address='35619 N 34th Ave, Phoenix, AZ 85086'
for appt in today:
    key=(appt.get('firstName','').strip(), appt.get('lastName','').strip())
    dt=datetime.datetime.fromisoformat(appt['datetime']).astimezone(zone)
    prior=[dt for dt in history[key] if dt<dt]
    lesson=len(prior)+1
    location=appt.get('location') or appt.get('category')
    print(f"{dt.strftime('%I:%M %p')} | {key[0]} {key[1]} | Lesson #{lesson} | {location}")
