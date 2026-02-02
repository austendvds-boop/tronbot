import json, os, datetime, urllib.parse, urllib.request, base64
from zoneinfo import ZoneInfo

path=os.path.join('secrets','acuity.json')
with open(path) as f:
    accounts=json.load(f)
zone=ZoneInfo('America/Phoenix')
target='2026-02-06'
start='2024-01-01'
all_appts=[]
for creds in accounts.values():
    offset=0
    while True:
        params={'minDate':start,'maxDate':target,'limit':200,'offset':offset,'cancelled':'false'}
        url=f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
        token=f"{creds['apiKey']}:{creds['apiSecret']}"
        headers={'Authorization':'Basic '+base64.b64encode(token.encode()).decode()}
        req=urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=30) as resp:
            data=json.load(resp)
        if not data:
            break
        all_appts.extend(data)
        if len(data)<params['limit']:
            break
        offset+=len(data)

history={}
for appt in all_appts:
    first=appt.get('firstName','').strip()
    last=appt.get('lastName','').strip()
    if not first and not last:
        continue
    key=(first,last)
    dt=datetime.datetime.fromisoformat(appt['datetime']).astimezone(zone)
    history.setdefault(key,[]).append(dt)
for vals in history.values():
    vals.sort()
slots=[appt for appt in all_appts if datetime.datetime.fromisoformat(appt['datetime']).astimezone(zone).date()==datetime.date(2026,2,6)]
slots.sort(key=lambda x:x['datetime'])
print(f"Aggregated Friday update {target} - total {len(slots)} lessons")
for idx,appt in enumerate(slots,1):
    first=appt.get('firstName','').strip()
    last=appt.get('lastName','').strip()
    student=(first,last)
    dt=datetime.datetime.fromisoformat(appt['datetime']).astimezone(zone)
    prior=[d for d in history[student] if d<dt]
    lesson=len(prior)+1
    location=appt.get('location') or appt.get('category') or 'N/A'
    print(f"{idx}. {dt.strftime('%I:%M %p')} | {student[0]} {student[1]} | Lesson #{lesson} of {len(history[student])} total recorded | {appt.get('calendar')} | {location}")
