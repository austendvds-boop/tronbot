import json, os, datetime, urllib.parse, urllib.request, base64
from zoneinfo import ZoneInfo

path=os.path.join('secrets','acuity.json')
with open(path) as f:
    accounts=json.load(f)
zone=ZoneInfo('America/Phoenix')
target='2026-02-06'
start='2024-01-01'
limit=200
offset=0
all_appts=[]
for creds in accounts.values():
    local_offset=0
    while True:
        params={'minDate':start,'maxDate':target,'limit':limit,'offset':local_offset,'cancelled':'false'}
        url=f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
        token=f"{creds['apiKey']}:{creds['apiSecret']}"
        headers={'Authorization':'Basic '+base64.b64encode(token.encode()).decode()}
        req=urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=60) as resp:
            data=json.load(resp)
        if not data:
            break
        all_appts.extend(data)
        if len(data)<limit:
            break
        local_offset+=len(data)

history={}
for appt in all_appts:
    fname=appt.get('firstName','').strip()
    lname=appt.get('lastName','').strip()
    if not fname:
        continue
    key=(fname,lname)
    dt=datetime.datetime.fromisoformat(appt['datetime']).astimezone(zone)
    history.setdefault(key,[]).append(dt)
for vals in history.values():
    vals.sort()
today=[appt for appt in all_appts if appt.get('calendar','').strip().lower()=='ernie' and datetime.datetime.fromisoformat(appt['datetime']).astimezone(zone).date()==datetime.date(2026,2,6)]
today.sort(key=lambda appt: appt['datetime'])
print('Ernie Friday update 2026-02-06:')
if not today:
    print('No Ernie lessons scheduled')
else:
    for appt in today:
        key=(appt.get('firstName','').strip(), appt.get('lastName','').strip())
        total=len(history.get(key,[]))
        dt=datetime.datetime.fromisoformat(appt['datetime']).astimezone(zone)
        prior=[d for d in history[key] if d<dt]
        lesson=len(prior)+1
        location=appt.get('location') or appt.get('category') or 'N/A'
        print(f"{dt.strftime('%I:%M %p')} | {key[0]} {key[1]} | Lesson #{lesson} of {total} recorded | {location}")
print('\nTravel base: 35619 N 34th Ave Phoenix AZ 85086. Say "update traffic" for live departure times.')
