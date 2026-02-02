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
    offset+=count
print(f"TOTAL APPOINTMENTS FETCHED={len(history)}")
print('\nSTEP 2: Mansouri candidates')
matched=[]
for appt in history:
    names=[(appt.get('firstName') or '').lower(),(appt.get('lastName') or '').lower(),(appt.get('name') or '').lower()]
    client=appt.get('client') or {}
    client_names=[(client.get('firstName') or '').lower(),(client.get('lastName') or '').lower(),(client.get('name') or '').lower()]
    combined=names+client_names
    if any('mansouri' in (val or '') for val in combined if val):
        matched.append(appt)
        print('---')
        print('id',appt.get('id'))
        print('datetime',appt.get('datetime'))
        print('calendar',appt.get('calendar'), 'calendarID', appt.get('calendarID'))
        print('instructor',appt.get('calendar'))
        print('name fields',{'firstName':appt.get('firstName'),'lastName':appt.get('lastName'),'name':appt.get('name')})
        if client:
            print('client fields',{k:client.get(k) for k in ['firstName','lastName','name']})
        print('email',appt.get('email'))
        print('phone',appt.get('phone'))
        print('status',appt.get('status'))
        print('cancelled',appt.get('cancelled'))
        print('noShow',appt.get('noShow') or appt.get('no_show'))
if not matched:
    print('No Mansouri matches found; dataset may be incomplete or wrong account.')
print('\nSTEP 3: target appointment info')
target=[appt for appt in history if appt.get('id')==1623578480]
if not target:
    raise SystemExit('target not found')
target=target[0]
print('id',target.get('id'))
print('firstName',target.get('firstName'))
print('lastName',target.get('lastName'))
print('email',target.get('email'))
print('phone',target.get('phone'))
print('clientID fields',{'clientID':target.get('clientID'),'clientId':target.get('clientId'),'client_reference_id':target.get('client_reference_id')})
print('datetime',target.get('datetime'))
print('calendar',target.get('calendar'))

print('\nSTEP 4: compute lesson number')
norm_name=f"{(target.get('firstName') or '').strip().lower()} {(target.get('lastName') or '').strip().lower()}".strip()
past=[]
target_dt=datetime.fromisoformat(target.get('datetime')).astimezone(TZ)
for appt in history:
    name=f"{(appt.get('firstName') or '').strip().lower()} {(appt.get('lastName') or '').strip().lower()}".strip()
    if name!=norm_name:
        continue
    dt_str=appt.get('datetime')
    if not dt_str:
        continue
    dt=datetime.fromisoformat(dt_str).astimezone(TZ)
    if dt>=target_dt:
        continue
    status=(appt.get('status') or '').strip().lower()
    if appt.get('cancelled') or status in {'cancelled','no-show'} or appt.get('noShow') or appt.get('no_show'):
        continue
    past.append((appt.get('id'),dt.strftime('%Y-%m-%d %I:%M %p'),appt.get('calendar'),appt.get('email'),appt.get('phone')))
print(f"Aliyeh Mansouri — Lesson #{len(past)+1}")
print('Counted appointments:')
for row in past:
    print('-',row)
