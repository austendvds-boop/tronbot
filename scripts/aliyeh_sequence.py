import json, os, datetime, urllib.parse, urllib.request, base64
from zoneinfo import ZoneInfo
path=os.path.join('secrets','acuity.json')
with open(path) as f:
    accounts=json.load(f)
all_appts=[]
for creds in accounts.values():
    params={'minDate':'2024-01-01','maxDate':'2026-12-31','limit':1000,'cancelled':'false'}
    url=f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
    token=f"{creds['apiKey']}:{creds['apiSecret']}"
    headers={'Authorization':'Basic '+base64.b64encode(token.encode()).decode()}
    req=urllib.request.Request(url,headers=headers)
    with urllib.request.urlopen(req,timeout=30) as resp:
        all_appts.extend(json.load(resp))
zone=ZoneInfo('America/Phoenix')
student=('Aliyeh','Mansouri')
target_date=datetime.date(2026,2,2)
history=sorted([datetime.datetime.fromisoformat(a['datetime']).astimezone(zone) for a in all_appts if (a.get('firstName','').strip(),a.get('lastName','').strip())==student])
today=[a for a in all_appts if datetime.datetime.fromisoformat(a['datetime']).astimezone(zone).date()==target_date and (a.get('firstName','').strip(),a.get('lastName','').strip())==student]
if not today:
    print('No Aliyeh appointments on',target_date)
else:
    for appt in sorted(today,key=lambda a:a['datetime']):
        dt=datetime.datetime.fromisoformat(appt['datetime']).astimezone(zone)
        prior=[d for d in history if d<dt]
        lesson=len(prior)+1
        print(f"{dt.strftime('%I:%M %p')} | Lesson #{lesson} | prior {len(prior)} | {appt.get('type')} @ {appt.get('location') or appt.get('category')}")
