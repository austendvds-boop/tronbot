import json, os, urllib.parse, urllib.request, base64
from datetime import datetime
from zoneinfo import ZoneInfo

TZ = ZoneInfo('America/Phoenix')
with open('secrets/acuity.json') as f:
    accounts=json.load(f)
api_key=accounts['accountB']['apiKey']
api_secret=accounts['accountB']['apiSecret']

start='2025-11-01'
end='2026-02-03'
limit=200
offset=0
cumulative=0
history=[]
print('STEP 1: pagination log')
while True:
    params={'minDate':start,'maxDate':end,'limit':limit,'offset':offset,'cancelled':'false'}
    url=f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
    token=f"{api_key}:{api_secret}"
    headers={'Authorization':'Basic '+base64.b64encode(token.encode()).decode()}
    req=urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=60) as resp:
        batch=json.load(resp)
    count=len(batch)
    cumulative+=count
    print(f"page offset={offset} countReturned={count} cumulative={cumulative}")
    if not batch:
        break
    history.extend(batch)
    offset+=len(batch)
    if count<limit:
        break
print(f"TOTAL APPOINTMENTS FETCHED={len(history)}")

print('\nSTEP 2: Mansouri candidates (name matching)')
matches=[]
for appt in history:
    fields=[(appt.get('firstName') or ''),(appt.get('lastName') or ''),(appt.get('name') or '')]
    client=appt.get('client') or {}
    fields.extend([(client.get('firstName') or ''),(client.get('lastName') or ''),(client.get('name') or '')])
    if any('mansouri' in (val or '').lower() for val in fields if val):
        matches.append(appt)
        print('---')
        print('id',appt.get('id'))
        print('datetime',appt.get('datetime'))
        print('calendar',appt.get('calendar'),'calendarID',appt.get('calendarID'))
        if appt.get('calendar'):
            print('instructor',appt.get('calendar'))
        print('names',{'firstName':appt.get('firstName'),'lastName':appt.get('lastName'),'name':appt.get('name')})
        if client:
            print('client fields',{k:client.get(k) for k in ['firstName','lastName','name']})
        print('email',appt.get('email'))
        print('phone',appt.get('phone'))
        print('status',appt.get('status'))
        print('cancelled',appt.get('cancelled'))
        print('noShow',appt.get('noShow') or appt.get('no_show'))
print(f"Total Mansouri matches: {len(matches)}")
if not matches:
    print('No Mansouri matches found; dataset incomplete or wrong account.')

print('\nSTEP 3: target appointment info')
target=[appt for appt in history if appt.get('id')==1623578480]
if not target:
    raise SystemExit('target appointment not found')
target=target[0]
print('id',target.get('id'))
print('datetime',target.get('datetime'))
print('firstName',target.get('firstName'))
print('lastName',target.get('lastName'))
print('email',target.get('email'))
print('phone',target.get('phone'))
print('client ids',{'clientID':target.get('clientID'),'clientId':target.get('clientId'),'client_reference_id':target.get('client_reference_id'),'client.id':target.get('client.id')})
print('calendar',target.get('calendar'))

print('\nSTEP 4: compute Lesson # using normalized name cluster')
norm_name=f"{(target.get('firstName') or '').strip().lower()} {(target.get('lastName') or '').strip().lower()}".strip()
target_dt=datetime.fromisoformat(target.get('datetime')).astimezone(TZ)
counted=[]
for appt in history:
    fname=(appt.get('firstName') or '').strip().lower()
    lname=(appt.get('lastName') or '').strip().lower()
    if f"{fname} {lname}".strip()!=norm_name:
        continue
    dt_raw=appt.get('datetime')
    if not dt_raw:
        continue
    dt=datetime.fromisoformat(dt_raw).astimezone(TZ)
    if dt>=target_dt:
        continue
    status=(appt.get('status') or '').strip().lower()
    if appt.get('cancelled') or appt.get('noShow') or appt.get('no_show'):
        continue
    if status in {'cancelled','no-show'}:
        continue
    counted.append((appt.get('id'),dt.strftime('%Y-%m-%d %I:%M %p'),appt.get('calendar')))
print(f"Aliyeh Mansouri — Lesson #{len(counted)+1}")
print('Counted appointments:')
for row in counted:
    print('-',row)
