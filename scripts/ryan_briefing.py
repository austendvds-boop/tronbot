import json, os, urllib.parse, urllib.request, base64
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

TZ = ZoneInfo('America/Phoenix')
with open('secrets/acuity.json') as f:
    accounts=json.load(f)
creds=accounts['accountA']
api_key=creds['apiKey']
api_secret=creds['apiSecret']
headers={'Authorization':'Basic '+base64.b64encode(f"{api_key}:{api_secret}".encode()).decode()}
base_url='https://acuityscheduling.com/api/v1/appointments'

LIMIT=100

def iso(dt):
    return dt.strftime('%Y-%m-%dT%H:%M:%S%z')

def parse_dt(value):
    if not value:
        return None
    try:
        return datetime.fromisoformat(value).astimezone(TZ)
    except Exception:
        try:
            return datetime.fromisoformat(value.replace('Z', '+00:00')).astimezone(TZ)
        except Exception:
            return None

def confirm_status(appt):
    status=(appt.get('status') or '').strip().lower()
    if status in {'cancelled','no-show','rescheduled','reschedule'}:
        return False
    if appt.get('cancelled') or appt.get('noShow') or appt.get('no_show'):
        return False
    return True

def request(params):
    params['limit']=LIMIT
    params['cancelled']='false'
    url=f"{base_url}?{urllib.parse.urlencode(params)}"
    req=urllib.request.Request(url,headers=headers)
    with urllib.request.urlopen(req,timeout=30) as resp:
        data=json.load(resp)
    return data

def normalized(name):
    filtered=''.join(ch.lower() for ch in name if ch.isalnum() or ch.isspace())
    return ' '.join(filtered.split())

def fetch_history(appt_dt,email,phone,name):
    history=[]
    seen=set()
    window_start=appt_dt-timedelta(days=365)
    base_params={'minDate':iso(window_start),'maxDate':iso(appt_dt)}
    def add_batch(batch):
        for entry in batch:
            entry_id=entry.get('id')
            if entry_id and entry_id in seen:
                continue
            seen.add(entry_id)
            history.append(entry)
    if email:
        params={**base_params,'email':email}
        add_batch(request(params))
        if len(history)==1 and phone:
            params_phone={**base_params,'phone':phone}
            add_batch(request(params_phone))
    elif phone:
        params={**base_params,'phone':phone}
        add_batch(request(params))
    elif name:
        params={**base_params,'name':name}
        add_batch(request(params))
    return history

today=datetime.now(TZ).date()
day_start=datetime(today.year,today.month,today.day,0,0,0,tzinfo=TZ)
day_end=day_start+timedelta(days=1)
params_day={'minDate':iso(day_start),'maxDate':iso(day_end),'limit':200,'cancelled':'false'}
day_appointments=request(params_day)
ryan_appts=[appt for appt in day_appointments if (appt.get('calendar') or '').strip().lower()=='ryan']
ryan_appts.sort(key=lambda appt: parse_dt(appt.get('datetime')) or datetime.max.replace(tzinfo=TZ))
output=[]
for appt in ryan_appts:
    appt_dt=parse_dt(appt.get('datetime'))
    if not appt_dt:
        continue
    student=f"{(appt.get('firstName') or '').strip()} {(appt.get('lastName') or '').strip()}".strip()
    email=(appt.get('email') or '').strip().lower()
    phone=(appt.get('phone') or '').strip()
    history=fetch_history(appt_dt,email,phone,normalized(student))
    past=sum(1 for h in history if parse_dt(h.get('datetime')) and parse_dt(h.get('datetime'))<appt_dt and confirm_status(h))
    lesson=past+1
    location=appt.get('location') or appt.get('category') or 'Unknown location'
    output.append({'time':appt_dt.strftime('%I:%M %p').lstrip('0'),'student':student or 'Unknown Student','lesson':lesson,'location':location})
print(f"Ryan — Lessons Today — {day_start.strftime('%Y-%m-%d')}")
if not output:
    print('No lessons scheduled for Ryan today.')
else:
    for entry in output:
        print(f"- {entry['time']} — {entry['student']} — Lesson #{entry['lesson']} — {entry['location']}")
