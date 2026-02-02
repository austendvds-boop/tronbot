import json,os,datetime,urllib.parse,urllib.request,base64
from zoneinfo import ZoneInfo
path=os.path.join('secrets','acuity.json')
with open(path) as f:
    accounts=json.load(f)
all_appts=[]
for creds in accounts.values():
    params={'minDate':'2024-01-01','maxDate':'2026-02-03','limit':2000,'cancelled':'false'}
    url=f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
    token=f"{creds['apiKey']}:{creds['apiSecret']}"
    headers={'Authorization':'Basic '+base64.b64encode(token.encode()).decode()}
    req=urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=30) as resp:
        all_appts.extend(json.load(resp))
zone=ZoneInfo('America/Phoenix')
student=('Brayden','Miller')
history=[datetime.datetime.fromisoformat(appt['datetime']).astimezone(zone) for appt in all_appts if (appt.get('firstName','').strip(),appt.get('lastName','').strip())==student]
history.sort()
target_date=datetime.date(2026,2,3)
today=[appt for appt in all_appts if appt['datetime'].startswith(target_date.isoformat()) and (appt.get('firstName','').strip(),appt.get('lastName','').strip())==student]
print('Brayden total records',len(history))
for idx,dt in enumerate(history,1):
    print(idx,dt.strftime('%Y-%m-%d %I:%M %p'))
if not today:
    print('No Apr 3 for Brayden?')
else:
    for appt in today:
        dt=datetime.datetime.fromisoformat(appt['datetime']).astimezone(zone)
        prior=[h for h in history if h<dt]
        print('Scheduled',dt.strftime('%I:%M %p'), 'Lesson #', len(prior)+1)
