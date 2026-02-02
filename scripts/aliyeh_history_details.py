import json, os, urllib.parse, urllib.request, base64
from zoneinfo import ZoneInfo
from datetime import datetime
TZ = ZoneInfo('America/Phoenix')
with open('secrets/acuity.json') as f:
    accounts=json.load(f)
api_key=accounts['accountB']['apiKey']
api_secret=accounts['accountB']['apiSecret']
ids=[1623578480,1605610711,1597971535]
headers={'Authorization':'Basic '+base64.b64encode(f"{api_key}:{api_secret}".encode()).decode()}
for aid in ids:
    url=f"https://acuityscheduling.com/api/v1/appointments/{aid}"
    req=urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=60) as resp:
        appt=json.load(resp)
    dt=appt.get('datetime') or appt.get('startDate')
    print('---')
    print('id',appt.get('id'))
    print('datetime',dt)
    print('appointmentTypeID',appt.get('appointmentTypeID') or appt.get('appointmentTypeId'))
    print('calendar',appt.get('calendar'))
    print('email',appt.get('email'))
    print('phone',appt.get('phone'))
    print('status',appt.get('status'))
