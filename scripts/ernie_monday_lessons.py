import json,os,datetime,urllib.parse,urllib.request,base64
from zoneinfo import ZoneInfo
path=os.path.join('secrets','acuity.json')
with open(path) as f:
    accounts=json.load(f)
creds=accounts['accountB']
zone=ZoneInfo('America/Phoenix')
target='2026-02-02'
start='2024-01-01'
def fetch(date_min,date_max):
    params={'minDate':date_min,'maxDate':date_max,'limit':500,'cancelled':'false'}
    url=f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
    token=f"{creds['apiKey']}:{creds['apiSecret']}"
    headers={'Authorization':'Basic '+base64.b64encode(token.encode()).decode()}
    req=urllib.request.Request(url,headers=headers)
    with urllib.request.urlopen(req,timeout=30) as resp:
        return json.load(resp)
history=fetch(start,target)
targets=fetch(target,target)
zlist=[appt for appt in history if appt.get('calendar','').strip().lower()=='ernie']
today=[appt for appt in targets if appt.get('calendar','').strip().lower()=='ernie']
print('Ernie calendar for',target)
today.sort(key=lambda a:a['datetime'])
for idx,appt in enumerate(today,1):
    dt=datetime.datetime.fromisoformat(appt['datetime']).astimezone(zone)
    student=f"{appt.get('firstName','').strip()} {appt.get('lastName','').strip()}".strip()
    prior=[a for a in zlist if a['firstName']==appt['firstName'] and a['lastName']==appt['lastName'] and a['datetime']<appt['datetime']]
    lesson=len(prior)+1
    print(f"{idx}. {dt.strftime('%I:%M %p')} | {student} | Lesson #{lesson} | {appt.get('type')} @ {appt.get('location') or appt.get('category')} | duration {appt.get('duration')}m")
