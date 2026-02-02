import json,os,datetime,urllib.parse,urllib.request,base64
from zoneinfo import ZoneInfo
path=os.path.join('secrets','acuity.json')
with open(path) as f:
    accounts=json.load(f)
all_appts=[]
limit=200
for creds in accounts.values():
    offset=0
    while True:
        params={'minDate':'2024-01-01','maxDate':'2026-12-31','limit':limit,'offset':offset,'cancelled':'false'}
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

student=('Ezra','Campos')
zone=ZoneInfo('America/Phoenix')
records=[datetime.datetime.fromisoformat(appt['datetime']).astimezone(zone) for appt in all_appts if (appt.get('firstName','').strip(),appt.get('lastName','').strip())==student]
records.sort()
print('Ezra total appointments',len(records))
for idx,dt in enumerate(records,1):
    print(idx,dt.strftime('%Y-%m-%d %I:%M %p'))
