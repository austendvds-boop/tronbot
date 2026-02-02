import json,os,urllib.parse,urllib.request,base64,datetime
from zoneinfo import ZoneInfo
path=os.path.join('secrets','acuity.json')
with open(path) as f:
    accounts=json.load(f)
zone=ZoneInfo('America/Phoenix')
target='2026-02-10'
for key,creds in accounts.items():
    params={'minDate':target,'maxDate':target,'limit':200,'cancelled':'false'}
    url=f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
    token=f"{creds['apiKey']}:{creds['apiSecret']}"
    headers={'Authorization':'Basic '+base64.b64encode(token.encode()).decode()}
    req=urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=30) as resp:
        data=json.load(resp)
    print('Account',key,'found',len(data),'appointments')
    for appt in data:
        dt=datetime.datetime.fromisoformat(appt['datetime']).astimezone(zone)
        print(' ',dt.strftime('%H:%M'),appt.get('firstName'),appt.get('lastName'),appt.get('calendar'),appt.get('location'))
