import json, os, urllib.parse, urllib.request, base64
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

TZ = ZoneInfo('America/Phoenix')
with open('secrets/acuity.json') as f:
    accounts=json.load(f)
creds=accounts['accountB']
api_key=creds['apiKey']
api_secret=creds['apiSecret']
headers={'Authorization':'Basic '+base64.b64encode(f"{api_key}:{api_secret}".encode()).decode()}
base_url='https://acuityscheduling.com/api/v1/appointments'
CANCELLED_STATUSES={'cancelled','no-show','rescheduled','reschedule'}


def iso(dt):
    return dt.strftime('%Y-%m-%dT%H:%M:%S%z')


def parse_dt(value):
    if not value:
        return None
    try:
        return datetime.fromisoformat(value).astimezone(TZ)
    except Exception:
        try:
            return datetime.fromisoformat(value.replace('Z','+00:00')).astimezone(TZ)
        except Exception:
            return None


def fetch_appointments(min_dt, max_dt, params_extra=None):
    params={'minDate':iso(min_dt),'maxDate':iso(max_dt),'limit':200,'cancelled':'false'}
    if params_extra:
        params.update(params_extra)
    all_appts=[]
    offset=0
    while True:
        params['offset']=offset
        req=urllib.request.Request(f"{base_url}?{urllib.parse.urlencode(params)}",headers=headers)
        with urllib.request.urlopen(req,timeout=30) as resp:
            batch=json.load(resp)
        if not batch:
            break
        all_appts.extend(batch)
        if len(batch)<params['limit']:
            break
        offset+=len(batch)
    return all_appts


def identify_student(appt):
    client_id=appt.get('clientID') or appt.get('clientId')
    if client_id:
        return ('clientID',str(client_id))
    email=(appt.get('email') or '').strip().lower()
    if email:
        return ('email',email)
    phone=''.join(ch for ch in (appt.get('phone') or '') if ch.isdigit())
    full_name=f"{(appt.get('firstName') or '').strip()} {(appt.get('lastName') or '').strip()}".strip()
    if phone and full_name:
        return ('phoneName',(phone,full_name.lower()))
    if full_name:
        return ('nameOnly',full_name.lower())
    return (None,None)


def build_history_identity_params(identity):
    if identity[0]=='clientID':
        return {'clientId':identity[1]}
    if identity[0]=='email':
        return {'email':identity[1]}
    if identity[0]=='phoneName':
        phone,name=identity[1]
        return {'phone':phone,'name':name}
    if identity[0]=='nameOnly':
        return {'name':identity[1]}
    return None


def download_history(identity, until_dt):
    params_extra=build_history_identity_params(identity)
    if not params_extra:
        return None
    history=fetch_appointments(datetime(2023,1,1,tzinfo=TZ), until_dt, params_extra)
    return history


def lesson_count(history, appt_dt, appointment_type):
    past=0
    for entry in history:
        entry_dt=parse_dt(entry.get('datetime'))
        if not entry_dt or entry_dt>=appt_dt:
            continue
        status=(entry.get('status') or '').strip().lower()
        if status in CANCELLED_STATUSES or entry.get('cancelled') or entry.get('noShow') or entry.get('no_show'):
            continue
        entry_type=entry.get('appointmentTypeID') or entry.get('appointmentTypeId')
        if appointment_type and entry_type:
            if str(entry_type)!=str(appointment_type):
                continue
        past+=1
    return past


# Determine tomorrow
now=datetime.now(TZ)
tomorrow=(now+timedelta(days=1)).date()
start_dt=datetime(tomorrow.year,tomorrow.month,tomorrow.day,0,0,0,tzinfo=TZ)
end_dt=start_dt+timedelta(days=1)
all_day=fetch_appointments(start_dt,end_dt)
michelle_appts=[appt for appt in all_day if (appt.get('calendar') or '').strip().lower()=='michelle']
print("DATA SOURCE: Dad Acuity")
if not michelle_appts:
    print("Michelle — (Account: Dad) • No lessons scheduled for tomorrow.")
else:
    for appt in michelle_appts:
        appt_dt=parse_dt(appt.get('datetime'))
        location=appt.get('location') or appt.get('category') or 'Unknown location'
        student=f"{(appt.get('firstName') or '').strip()} {(appt.get('lastName') or '').strip()}".strip() or 'Unknown Student'
        identity=identify_student(appt)
        if not identity[0]:
            print(f"Michelle — (Account: Dad) • {appt_dt.strftime('%I:%M %p')} — {student} — Lesson # unavailable (history lookup failed) — {location} — Michelle")
            continue
        try:
            history=download_history(identity, appt_dt)
        except Exception:
            print(f"Michelle — (Account: Dad) • {appt_dt.strftime('%I:%M %p')} — {student} — Lesson # unavailable (history lookup failed) — {location} — Michelle")
            continue
        if history is None:
            print(f"Michelle — (Account: Dad) • {appt_dt.strftime('%I:%M %p')} — {student} — Lesson # unavailable (history lookup failed) — {location} — Michelle")
            continue
        appointment_type=appt.get('appointmentTypeID') or appt.get('appointmentTypeId')
        past=lesson_count(history, appt_dt, appointment_type)
        lesson_num=past+1
        print(f"Michelle — (Account: Dad) • {appt_dt.strftime('%I:%M %p')} — {student} — Lesson #{lesson_num} — {location} — Michelle")
