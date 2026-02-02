import json, urllib.parse, urllib.request, base64
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
import math, os

TZ = ZoneInfo('America/Phoenix')
BASE_URL = 'https://acuityscheduling.com/api/v1/appointments'
GOOGLE_MAPS_KEY = None
key_path = os.path.join('secrets','google_maps_api_key.txt')
if os.path.exists(key_path):
    with open(key_path) as f:
        GOOGLE_MAPS_KEY = f.read().strip()

ORIGIN = '35619 N 34th Ave, Phoenix, AZ 85086'
BUFFER = 10

with open('secrets/acuity.json') as f:
    accounts = json.load(f)
account = accounts['accountB']
creds = (account['apiKey'], account['apiSecret'])

def iso(dt):
    return dt.strftime('%Y-%m-%dT%H:%M:%S%z')

def call(params):
    token = f"{creds[0]}:{creds[1]}"
    headers = {'Authorization': 'Basic ' + base64.b64encode(token.encode()).decode()}
    url = f"{BASE_URL}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.load(resp)

def parse_dt(val):
    if not val:
        return None
    try:
        return datetime.fromisoformat(val).astimezone(TZ)
    except Exception:
        try:
            return datetime.fromisoformat(val.replace('Z','+00:00')).astimezone(TZ)
        except Exception:
            return None

def is_confirmed(appt):
    status = (appt.get('status') or '').strip().lower()
    if status in {'cancelled','no-show','rescheduled','reschedule','refunded'}:
        return False
    if appt.get('cancelled') or appt.get('noShow') or appt.get('no_show') or appt.get('rescheduled') or appt.get('reschedule'):
        return False
    return True

target_date = datetime(2026,2,2,tzinfo=TZ)
params = {
    'minDate': target_date.strftime('%Y-%m-%dT00:00:00%z'),
    'maxDate': target_date.strftime('%Y-%m-%dT23:59:59%z'),
    'limit':100,
    'cancelled':'false'
}
batch = call(params)

def fetch_history(appt_dt, email, phone):
    start = appt_dt - timedelta(days=365)
    req = {
        'minDate': start.strftime('%Y-%m-%dT%H:%M:%S%z'),
        'maxDate': appt_dt.strftime('%Y-%m-%dT%H:%M:%S%z'),
        'limit': 100,
        'cancelled': 'false'
    }
    if email:
        req['email'] = email
        data = call(req)
        return data
    if phone:
        req['phone'] = phone
        data = call(req)
        return data
    req['name'] = ''
    return call(req)

def normalize_address(addr):
    return addr.strip() if addr else None

def google_eta(origin, destination, depart):
    if not GOOGLE_MAPS_KEY:
        return None
    params = {
        'origin': origin,
        'destination': destination,
        'departure_time': int(depart.timestamp()),
        'key': GOOGLE_MAPS_KEY,
        'traffic_model': 'best_guess'
    }
    url = 'https://maps.googleapis.com/maps/api/directions/json?' + urllib.parse.urlencode(params)
    with urllib.request.urlopen(url, timeout=30) as resp:
        payload = json.load(resp)
    if payload.get('status') != 'OK':
        return None
    legs = payload.get('routes',[{}])[0].get('legs',[])
    if not legs:
        return None
    duration = legs[0].get('duration_in_traffic') or legs[0].get('duration')
    if not duration or 'value' not in duration:
        return None
    return math.ceil(duration['value']/60)

lessons = []
for appt in batch:
    if (appt.get('calendar') or '').strip().lower() != 'ernie':
        continue
    dt = parse_dt(appt.get('datetime'))
    if not dt:
        continue
    hist = fetch_history(dt, (appt.get('email') or '').strip().lower(), (appt.get('phone') or '').strip())
    past = 0
    for h in hist:
        hdt = parse_dt(h.get('datetime'))
        if not hdt or hdt >= dt:
            continue
        if not is_confirmed(h):
            continue
        past += 1
    lessons.append({
        'student': f"{appt.get('firstName','').strip()} {appt.get('lastName','').strip()}".strip() or appt.get('email') or 'Unknown Student',
        'datetime': dt,
        'location': normalize_address(appt.get('location') or appt.get('category')) or '(Missing address — cannot compute leave time)',
        'lesson': past + 1,
        'duration': int(appt.get('duration') or appt.get('length') or 150)
    })
lessons.sort(key=lambda x:x['datetime'])

results = []
prev_addr = None
prev_end = None
for idx, lesson in enumerate(lessons):
    dest = lesson['location']
    eta=None
    between=None
    if dest.startswith('(Missing'):
        lesson['leave_by']=None
    else:
        if idx==0 and ORIGIN:
            depart = max(datetime.now(TZ), lesson['datetime'] - timedelta(minutes=90))
            eta=google_eta(ORIGIN, dest, depart) or None
        elif prev_addr:
            depart = prev_end
            eta=google_eta(prev_addr, dest, depart) or None
            between=eta
        if eta is not None:
            lesson['eta']=eta
            lesson['leave_by']=lesson['datetime'] - timedelta(minutes=eta+BUFFER)
        else:
            lesson['leave_by']=None
    prev_addr = dest
    prev_end = lesson['datetime'] + timedelta(minutes=lesson['duration'])
    lesson['between_eta']=between
    results.append(lesson)

print('Email template for 2026-02-02:')
print('To: deervalleydrivingschool@gmail.com')
print('Subject: Daily Update — 2026-02-02')
print('\nGood morning, Mr. Salazar,\n')
print('Here are your lessons for 2026-02-02:')
for lesson in results:
    time_str = lesson['datetime'].strftime('%I:%M %p').lstrip('0')
    line = f"- {time_str} — {lesson['student']} — Lesson #{lesson['lesson']} — {lesson['location']}"
    print(line)
    if lesson.get('between_eta'):
        print(f"  Between lessons: {lesson['between_eta']}m")
    if lesson.get('eta') is not None and lesson.get('leave_by'):
        leave = lesson['leave_by'].strftime('%I:%M %p').lstrip('0')
        print(f"  Leave by {leave} ({lesson['eta']} min travel)")
print('\n—TronMeggabot')
