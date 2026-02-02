import json,os,datetime,urllib.parse,urllib.request
from zoneinfo import ZoneInfo
import base64
PATH=os.path.join('secrets','acuity.json')
with open(PATH) as f:
    accounts=json.load(f)
creds=accounts['accountA']
start='2024-01-01'
end='2026-02-03'
params={'minDate':start,'maxDate':end,'limit':500,'cancelled':'false'}
url=f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
token=f"{creds['apiKey']}:{creds['apiSecret']}"
headers={'Authorization':'Basic '+base64.b64encode(token.encode()).decode()}
req=urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req, timeout=30) as resp:
    data=json.load(resp)
matches=[appt for appt in data if (appt.get('firstName','').strip(),appt.get('lastName','').strip())==('Alexis','Hayes')]
zone=ZoneInfo('America/Phoenix')
target=datetime.datetime.fromisoformat('2026-02-03T14:30:00-0700')
target_idx=None
matches.sort(key=lambda a: a['datetime'])
for idx,appt in enumerate(matches,1):
    dt=datetime.datetime.fromisoformat(appt['datetime'])
    if dt==target:
        target_idx=idx
        break
print('found',len(matches),'records')
for idx,appt in enumerate(matches,1):
    dt=datetime.datetime.fromisoformat(appt['datetime']).astimezone(zone)
    print(idx,dt.strftime('%Y-%m-%d %I:%M %p'),appt['type'])
if target_idx:
    print('target lesson index',target_idx)
else:
    print('target not found')
