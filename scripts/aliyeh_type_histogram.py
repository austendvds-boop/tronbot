import json, os, urllib.parse, urllib.request, base64
from datetime import datetime
from zoneinfo import ZoneInfo

TZ=ZoneInfo('America/Phoenix')
with open('secrets/acuity.json') as f:
    data=json.load(f)
api_key=data['accountB']['apiKey']
api_secret=data['accountB']['apiSecret']

def auth_headers():
    token=f"{api_key}:{api_secret}"
    return {'Authorization':'Basic '+base64.b64encode(token.encode()).decode()}

def parse_dt(dt):
    if not dt:
        return None
    try:
        return datetime.fromisoformat(dt).astimezone(TZ)
    except:
        try:
            return datetime.fromisoformat(dt.replace('Z','+00:00')).astimezone(TZ)
        except:
            return None

def norm_email(email):
    return (email or '').strip().lower()

def norm_phone(phone):
    digits=''.join(c for c in (phone or '') if c.isdigit())
    if digits.startswith('1') and len(digits)>10:
        digits=digits[1:]
    return digits

TARGET_ID=1623578480
params_target={'appointmentID':TARGET_ID}
url=f"https://acuityscheduling.com/api/v1/appointments/{TARGET_ID}"
headers=auth_headers()
req=urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req, timeout=60) as resp:
    target=json.load(resp)
print('Target appointment:')
print('id',target.get('id'))
print('datetime',target.get('datetime'))
print('calendar',target.get('calendar'))
print('instructor',target.get('calendar'))
print('appointmentTypeID',target.get('appointmentTypeID') or target.get('appointmentTypeId'))
print('email',target.get('email'))
print('phone',target.get('phone'))
match_email=norm_email(target.get('email'))
match_phone=norm_phone(target.get('phone'))
print('match_email',match_email,'match_phone',match_phone)

history=[]
offset=0
limit=200
while True:
    params={'minDate':'2024-01-01','maxDate':'2026-02-02','limit':limit,'offset':offset,'cancelled':'false'}
    if match_email:
        params['clientEmail']=match_email
    else:
        params['phone']=match_phone
    url=f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
    req=urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=60) as resp:
        batch=json.load(resp)
    if not batch:
        break
    history.extend(batch)
    if len(batch)<limit:
        break
    offset+=len(batch)

print('history total',len(history))
from collections import Counter,defaultdict
counter=Counter()
cal_counts=Counter()
for appt in history:
    atype=appt.get('appointmentTypeID') or appt.get('appointmentTypeId')
    counter[atype]+=1
    cal_counts[appt.get('calendar') or 'Unknown']+=1
print('appointmentType counts:')
for k,v in counter.most_common():
    print(f"{k} => {v}")
print('top calendars:')
for k,v in cal_counts.most_common(10):
    print(f"{k} => {v}")

slots=[appt for appt in history if (appt.get('appointmentTypeID') or appt.get('appointmentTypeId'))==(target.get('appointmentTypeID') or target.get('appointmentTypeId'))]
slots_filtered=[]
for appt in slots:
    dt=parse_dt(appt.get('datetime'))
    if not dt:
        continue
    status=(appt.get('status') or '').strip().lower()
    ignore=False
    if appt.get('cancelled'):
        ignore=True
        reason='cancelled flag'
    elif status in {'cancelled','no-show','rescheduled','reschedule','refunded'}:
        ignore=True
        reason=f'status={status}'
    if not ignore:
        slots_filtered.append((dt,appt))
slots_filtered.sort(key=lambda x:x[0])
target_dt=parse_dt(target.get('datetime'))
counted=[(dt,appt) for dt,appt in slots_filtered if dt<target_dt]
lesson=len(counted)+1
print('Aliyeh Mansouri — Lesson #{}'.format(lesson))
print('Explanation: total matched={}, counted after type filter={} ids'.format(len(history),len(counted)))
for dt,appt in counted:
    print(f"- {dt.strftime('%Y-%m-%d %I:%M %p')} id {appt.get('id')}")
