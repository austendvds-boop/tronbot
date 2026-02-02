import json,os,datetime,urllib.parse,urllib.request,base64
from zoneinfo import ZoneInfo

path=os.path.join('secrets','acuity.json')
with open(path) as f:
    accounts=json.load(f)
creds=accounts['accountB']
zone=ZoneInfo('America/Phoenix')
target='2026-02-02'
params={'minDate':'2024-01-01','maxDate':target,'limit':1000,'cancelled':'false'}
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
    key=(appt.get('firstName','').strip(),appt.get('lastName','').strip())
    dt=datetime.datetime.fromisoformat(appt['datetime'])
    history.setdefault(key,[]).append(dt)

for key,vals in history.items():
    vals.sort()

today=[appt for appt in data if appt.get('calendar','').strip().lower()=='ernie' and appt['datetime'].startswith(target)]
today.sort(key=lambda appt: appt['datetime'])
print('Ernie calendar Monday update (Feb 2 2026):')
address='35619 N 34th Ave, Phoenix, AZ 85086'
for idx,appt in enumerate(today,1):
    student=(appt.get('firstName','').strip(),appt.get('lastName','').strip())
    dt=datetime.datetime.fromisoformat(appt['datetime']).astimezone(zone)
    prior=[dt for dt in history[student] if dt<datetime.datetime.fromisoformat(appt['datetime'])]
    lesson=len(prior)+1
    location=appt.get('location') or appt.get('category')
    print(f"{dt.strftime('%I:%M %p')} | {student[0]} {student[1]} | Lesson #{lesson} ({len(prior)} completed before today) | {appt.get('type')} @ {location}")
print('\nTravel: use 35619 N 34th Ave base; I can add directions when you say update traffic.')
