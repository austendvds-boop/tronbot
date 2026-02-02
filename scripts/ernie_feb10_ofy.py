import json, os, datetime, urllib.parse, urllib.request, base64
from zoneinfo import ZoneInfo
PATH=os.path.join('secrets','acuity.json')
with open(PATH) as f:
    accounts=json.load(f)
limit=200
start='2024-01-01'
target='2026-02-10'
zone=ZoneInfo('America/Phoenix')
all_appts=[]
for creds in accounts.values():
    offset=0
    while True:
        params={'minDate':start,'maxDate':target,'limit':limit,'offset':offset,'cancelled':'false'}
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
today=[appt for appt in all_appts if appt.get('calendar','').strip().lower()=='ernie' and datetime.datetime.fromisoformat(appt['datetime']).astimezone(zone).date()==datetime.date(2026,2,10)]
today.sort(key=lambda a:a['datetime'])
print(f"Ernie Wednesday update {target} (travel base 35619 N 34th Ave, Phoenix AZ 85086):")
if not today:
    print('No lessons scheduled yet on Ernie calendar')
else:
    for appt in today:
        key=(appt.get('firstName','').strip(), appt.get('lastName','').strip())
        total=len(history.get(key,[]))
        dt=datetime.datetime.fromisoformat(appt['datetime']).astimezone(zone)
        prior=[d for d in history[key] if d<dt]
        lesson=len(prior)+1
        location=appt.get('location') or appt.get('category') or 'N/A'
        print(f"{dt.strftime('%I:%M %p')} | {key[0]} {key[1]} | Lesson #{lesson} of {total} | {location}")
print('Say "update traffic" if you want me to recalc the route at launch time.')
