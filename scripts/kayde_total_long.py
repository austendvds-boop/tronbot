import json,os,urllib.parse,urllib.request,base64
from zoneinfo import ZoneInfo
import datetime
path=os.path.join('secrets','acuity.json')
with open(path) as f:
    accounts=json.load(f)
LIMIT=200
start='2020-01-01'
end='2026-12-31'
records=[]
ZONE=ZoneInfo('America/Phoenix')
for creds in accounts.values():
    offset=0
    while True:
        params={'minDate':start,'maxDate':end,'limit':LIMIT,'offset':offset,'cancelled':'false'}
        url=f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
        token=f"{creds['apiKey']}:{creds['apiSecret']}"
        headers={'Authorization':'Basic '+base64.b64encode(token.encode()).decode()}
        req=urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=60) as resp:
            data=json.load(resp)
        if not data:
            break
        for appt in data:
            fn=appt.get('firstName','').strip().lower()
            ln=appt.get('lastName','').strip().lower()
            if 'kayde' in fn or 'kayde' in ln:
                records.append((datetime.datetime.fromisoformat(appt['datetime']).astimezone(ZONE), fn, ln, appt.get('calendar'), appt.get('location')))
        if len(data)<LIMIT:
            break
        offset+=len(data)
records.sort()
print('total',len(records))
for idx,(dt,fn,ln,cal,loc) in enumerate(records,1):
    print(idx, dt.strftime('%Y-%m-%d %I:%M %p'), fn, ln, cal, loc)
