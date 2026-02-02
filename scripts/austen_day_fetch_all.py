import json, os, urllib.parse, urllib.request, base64
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

tz=ZoneInfo('America/Phoenix')
with open('secrets/acuity.json') as f:
    accounts=json.load(f)
account=accounts['accountA']
api_key=account['apiKey']
api_secret=account['apiSecret']
headers={'Authorization':'Basic '+base64.b64encode(f"{api_key}:{api_secret}".encode()).decode()}
base='https://acuityscheduling.com/api/v1/appointments'
start=datetime.now(tz).replace(hour=0,minute=0,second=0,microsecond=0)
end=start+timedelta(days=1)
params={'minDate':start.strftime('%Y-%m-%dT%H:%M:%S%z'),'maxDate':end.strftime('%Y-%m-%dT%H:%M:%S%z'),'limit':100,'cancelled':'false'}
req=urllib.request.Request(f"{base}?{urllib.parse.urlencode(params)}",headers=headers)
with urllib.request.urlopen(req,timeout=15) as resp:
    data=json.load(resp)
print('account: Austen')
print('dayRange:',params['minDate'],'->',params['maxDate'])
print('appointments returned',len(data))
lines=[]
target=None
for appt in data:
    time_str=datetime.fromisoformat(appt['datetime']).astimezone(tz).strftime('%I:%M %p')
    emailPresent='Y' if appt.get('email') else 'N'
    phonePresent='Y' if appt.get('phone') else 'N'
    calendar=appt.get('calendar') or 'Unknown'
    line=f"{time_str} — {appt.get('firstName')} {appt.get('lastName')} — id={appt.get('id')} — emailPresent={emailPresent} — phonePresent={phonePresent} — calendar={calendar}"
    print(line)
    if appt.get('id')==1576489908:
        target=appt
if target:
    email=target.get('email') or ''
    masked=email
    if '@' in email:
        local,domain=email.split('@',1)
        masked=local[0]+'***@'+domain[0]+'***.com'
    print('masked email',masked)
    req_params={'minDate':'2025-02-01T00:00:00-0700','maxDate':'2026-02-01T09:00:00-07:00','limit':100,'cancelled':'false','email':'REDACTED'}
    real_params={'minDate':'2025-02-01T00:00:00-0700','maxDate':'2026-02-01T09:00:00-07:00','limit':100,'cancelled':'false','email':email}
    url=f"{base}?{urllib.parse.urlencode(real_params)}"
    print('GET /appointments?'+urllib.parse.urlencode(req_params))
    req=urllib.request.Request(url,headers=headers)
    with urllib.request.urlopen(req,timeout=15) as resp:
        status=resp.getcode()
        payload=json.load(resp)
    print('status',status,'countReturned',len(payload))
    for entry in payload[:3]:
        print('- id',entry['id'],'datetime',entry['datetime'],'calendar',entry.get('calendar'))
