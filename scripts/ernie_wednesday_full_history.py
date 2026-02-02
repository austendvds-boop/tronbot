import json, os, datetime, urllib.parse, urllib.request, base64
from zoneinfo import ZoneInfo

path=os.path.join('secrets','acuity.json')
with open(path) as f:
    accounts=json.load(f)
creds_list=list(accounts.values())
zone=ZoneInfo('America/Phoenix')
target_date='2026-02-04'
params={'minDate':'2024-01-01','maxDate':'2026-02-04','limit':2000,'cancelled':'false'}
all_appts=[]
for creds in creds_list:
    url=f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
    token=f"{creds['apiKey']}:{creds['apiSecret']}"
    headers={'Authorization':'Basic '+base64.b64encode(token.encode()).decode()}
    req=urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=60) as resp:
        all_appts.extend(json.load(resp))

history={}
for appt in all_appts:
    fname=appt.get('firstName','').strip()
    lname=appt.get('lastName','').strip()
    if not fname and not lname:
        continue
    key=(fname,lname)
    dt=datetime.datetime.fromisoformat(appt['datetime']).astimezone(zone)
    history.setdefault(key,[]).append(dt)
for vals in history.values():
    vals.sort()
today=[appt for appt in all_appts if datetime.datetime.fromisoformat(appt['datetime']).astimezone(zone).date()==datetime.date(2026,2,4) and appt.get('calendar','').strip().lower()=='ernie']
today.sort(key=lambda x: x['datetime'])
print('Ernie calendar Wednesday update (Feb 4 2026):')
base='35619 N 34th Ave, Phoenix AZ 85086'
for appt in today:
    key=(appt.get('firstName','').strip(), appt.get('lastName','').strip())
    dt=datetime.datetime.fromisoformat(appt['datetime']).astimezone(zone)
    prior=[d for d in history[key] if d<dt]
    lesson=len(prior)+1
    location=appt.get('location') or appt.get('category') or 'N/A'
    print(f"{dt.strftime('%I:%M %p')} | {key[0]} {key[1]} | Lesson #{lesson} of {len(history[key])} recorded so far | {location}")
print('\nTravel base:', base)
