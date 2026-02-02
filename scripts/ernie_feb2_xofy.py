import json,os,datetime,urllib.parse,urllib.request,base64
from zoneinfo import ZoneInfo

with open('secrets/acuity.json') as f:
    accounts=json.load(f)
creds=accounts['accountB']
limit=200
start='2024-01-01'
end='2026-12-31'
zone=ZoneInfo('America/Phoenix')
all=[]
offset=0
while True:
    params={'minDate':start,'maxDate':end,'limit':limit,'offset':offset,'cancelled':'false'}
    url=f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
    token=f"{creds['apiKey']}:{creds['apiSecret']}"
    headers={'Authorization':'Basic '+base64.b64encode(token.encode()).decode()}
    req=urllib.request.Request(url,headers=headers)
    with urllib.request.urlopen(req,timeout=60) as resp:
        data=json.load(resp)
    if not data:
        break
    all.extend(data)
    if len(data)<limit:
        break
    offset+=len(data)

history={}
for appt in all:
    fn=appt.get('firstName','').strip()
    ln=appt.get('lastName','').strip()
    if not fn:
        continue
    key=(fn,ln)
    dt=datetime.datetime.fromisoformat(appt['datetime']).astimezone(zone)
    history.setdefault(key,[]).append(dt)
for v in history.values():
    v.sort()
target=datetime.date(2026,2,2)
today=[appt for appt in all if datetime.datetime.fromisoformat(appt['datetime']).astimezone(zone).date()==target and appt.get('calendar','').strip().lower()=='ernie']
today.sort(key=lambda appt: appt['datetime'])
print('Ernie update Feb 2:')
for appt in today:
    key=(appt.get('firstName','').strip(),appt.get('lastName','').strip())
    dt=datetime.datetime.fromisoformat(appt['datetime']).astimezone(zone)
    total=len(history[key])
    prior=[d for d in history[key] if d<dt]
    lesson=len(prior)+1
    location=appt.get('location') or appt.get('category')
    print(f"{dt.strftime('%I:%M %p')} | {key[0]} {key[1]} | Lesson #{lesson} of {total} | {location}")
