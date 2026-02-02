import json, os, urllib.parse, urllib.request, base64
from datetime import datetime
with open('secrets/acuity.json') as f:
    accounts=json.load(f)
api_key=accounts['accountA']['apiKey']
api_secret=accounts['accountA']['apiSecret']
headers={'Authorization':'Basic '+base64.b64encode(f"{api_key}:{api_secret}".encode()).decode()}
base='https://acuityscheduling.com/api/v1/appointments'
params={'minDate':'2026-02-01','maxDate':'2026-02-02','limit':100,'cancelled':'false'}
url=f"{base}?{urllib.parse.urlencode(params)}"
req=urllib.request.Request(url,headers=headers)
with urllib.request.urlopen(req,timeout=15) as resp:
    data=json.load(resp)
if not data:
    raise SystemExit('no appts')
appt=data[0]
email=appt.get('email')
phone=appt.get('phone')
print('appointment email',email)
print('appointment phone',phone)
print('firstName',appt.get('firstName'), 'lastName', appt.get('lastName'))
count=0
if email:
    params={'minDate':'2026-01-01','maxDate':'2026-02-02','limit':100,'cancelled':'false','email':email}
    url=f"{base}?{urllib.parse.urlencode(params)}"
    redacted=url.replace(email,'REDACTED')
    req=urllib.request.Request(url,headers=headers)
    with urllib.request.urlopen(req,timeout=15) as resp:
        data=json.load(resp)
    print('EMAIL URL',redacted)
    print('status',resp.getcode())
    print('countReturned',len(data))
    for entry in data[:3]:
        print('- id',entry['id'],'datetime',entry['datetime'])
if phone:
    params={'minDate':'2026-01-01','maxDate':'2026-02-02','limit':100,'cancelled':'false','phone':phone}
    url=f"{base}?{urllib.parse.urlencode(params)}"
    redacted=url.replace(phone,'REDACTED')
    req=urllib.request.Request(url,headers=headers)
    with urllib.request.urlopen(req,timeout=15) as resp:
        data=json.load(resp)
    print('PHONE URL',redacted)
    print('status',resp.getcode())
    print('countReturned',len(data))
    for entry in data[:3]:
        print('- id',entry['id'],'datetime',entry['datetime'])
