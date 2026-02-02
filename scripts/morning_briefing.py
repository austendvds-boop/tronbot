import json, os, urllib.parse, urllib.request, base64, math
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

TZ = ZoneInfo('America/Phoenix')
BASE_URL = 'https://acuityscheduling.com/api/v1/appointments'

ORIGINS = {
    'Austen': '2250 E Deer Valley Rd Unit 41, Phoenix, AZ 85024',
    'Dad': '35619 N 34th Ave, Phoenix, AZ 85086'
}

CANCELLED_STATUSES = {'cancelled', 'no-show', 'rescheduled', 'reschedule', 'refunded'}
GOOGLE_MAPS_MESSAGE = '(Google Maps ETA unavailable — missing/invalid API key)'

def load_google_maps_key():
    key = os.environ.get('GOOGLE_MAPS_API_KEY')
    if key:
        return key
    path = os.path.join('secrets', 'google_maps_api_key.txt')
    if os.path.exists(path):
        with open(path) as f:
            return f.read().strip()
    return None

GOOGLE_MAPS_API_KEY = load_google_maps_key()

with open('secrets/acuity.json') as f:
    ACCOUNTS = json.load(f)


def iso(dt):
    return dt.strftime('%Y-%m-%dT%H:%M:%S%z')


def call_api(api_key, api_secret, params):
    token = f"{api_key}:{api_secret}"
    headers = {'Authorization': 'Basic ' + base64.b64encode(token.encode()).decode()}
    url = f"{BASE_URL}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.load(resp)


def parse_datetime(value):
    if not value:
        return None
    try:
        return datetime.fromisoformat(value).astimezone(TZ)
    except Exception:
        try:
            return datetime.fromisoformat(value.replace('Z', '+00:00')).astimezone(TZ)
        except Exception:
            return None


def is_confirmed(appt):
    status = (appt.get('status') or '').strip().lower()
    if status in CANCELLED_STATUSES:
        return False
    if appt.get('cancelled'):
        return False
    if appt.get('noShow') or appt.get('no_show'):
        return False
    if appt.get('rescheduled') or appt.get('reschedule'):
        return False
    return True


def fetch_filtered_history(api_key, api_secret, appt_dt, email, phone, name):
    window_start = appt_dt - timedelta(days=365)
    params = {
        'minDate': iso(window_start),
        'maxDate': iso(appt_dt),
        'limit': 100,
        'cancelled': 'false'
    }
    key_used = 'none'
    if email:
        params['email'] = email
        key_used = 'email'
    elif phone:
        params['phone'] = phone
        key_used = 'phone'
    elif name:
        params['name'] = name
        key_used = 'name'
    else:
        return [], 'none'
    batch = call_api(api_key, api_secret, params)
    history = []
    seen = set()
    for entry in batch:
        appt_id = entry.get('id')
        if appt_id in seen:
            continue
        seen.add(appt_id)
        history.append(entry)
    return history, key_used


def get_appointment_duration(appt):
    duration = appt.get('duration') or appt.get('length')
    if isinstance(duration, (int, float)):
        return int(duration)
    if isinstance(duration, str) and duration.isdigit():
        return int(duration)
    return 150


def get_google_eta(origin, destination, depart_time):
    if not GOOGLE_MAPS_API_KEY:
        raise ValueError('missing key')
    params = {
        'origin': origin,
        'destination': destination,
        'departure_time': int(depart_time.timestamp()),
        'traffic_model': 'best_guess',
        'key': GOOGLE_MAPS_API_KEY
    }
    url = 'https://maps.googleapis.com/maps/api/directions/json?' + urllib.parse.urlencode(params)
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=30) as resp:
        payload = json.load(resp)
    if payload.get('status') != 'OK':
        raise ValueError(payload.get('status'))
    routes = payload.get('routes')
    if not routes:
        raise ValueError('no routes')
    legs = routes[0].get('legs')
    if not legs:
        raise ValueError('no legs')
    duration = legs[0].get('duration_in_traffic') or legs[0].get('duration')
    if not duration or 'value' not in duration:
        raise ValueError('missing duration')
    minutes = math.ceil(duration['value'] / 60)
    return minutes


def plan_leave_times(lessons, instructor_label):
    google_issue = None
    previous_address = None
    previous_end = None
    buffer_minutes = 10
    now = datetime.now(TZ)
    origin = ORIGINS.get(instructor_label)
    for idx, lesson in enumerate(lessons):
        address = lesson['address']
        if address.startswith('(Missing'):
            previous_address = None
            previous_end = lesson['datetime'] + timedelta(minutes=lesson['duration'])
            continue
        if GOOGLE_MAPS_API_KEY and not google_issue:
            try:
                if idx == 0:
                    if origin:
                        depart_at = max(now, lesson['datetime'] - timedelta(minutes=90))
                        eta = get_google_eta(origin, address, depart_at)
                        lesson['leave_by'] = lesson['datetime'] - timedelta(minutes=eta + buffer_minutes)
                        lesson['eta'] = eta
                else:
                    if previous_address:
                        depart_at = previous_end
                        eta_between = get_google_eta(previous_address, address, depart_at)
                        lesson['leave_by'] = lesson['datetime'] - timedelta(minutes=eta_between + buffer_minutes)
                        lesson['eta'] = eta_between
                        lesson['between_eta'] = eta_between
            except ValueError:
                google_issue = GOOGLE_MAPS_MESSAGE
        else:
            if not GOOGLE_MAPS_API_KEY and not google_issue:
                google_issue = GOOGLE_MAPS_MESSAGE
        previous_address = address
        previous_end = lesson['datetime'] + timedelta(minutes=lesson['duration'])
    return google_issue


def run_account(label, account_key, calendar_whitelist, origin_label, include_calendar_note=False):
    creds = ACCOUNTS[account_key]
    today = datetime.now(TZ).date()
    day_start = datetime(today.year, today.month, today.day, 0, 0, 0, tzinfo=TZ)
    day_end = day_start + timedelta(days=1)
    params = {
        'minDate': iso(day_start),
        'maxDate': iso(day_end),
        'limit': 100,
        'cancelled': 'false'
    }
    batch = call_api(creds['apiKey'], creds['apiSecret'], params)
    allowed = {name.strip().lower() for name in calendar_whitelist}
    lessons = []
    for appt in batch:
        cal = (appt.get('calendar') or '').strip()
        if cal.lower() not in allowed:
            continue
        appt_dt = parse_datetime(appt.get('datetime'))
        if not appt_dt:
            continue
        student = f"{appt.get('firstName','').strip()} {appt.get('lastName','').strip()}".strip()
        if not student:
            student = appt.get('email') or 'Unknown Student'
        email = (appt.get('email') or '').strip().lower()
        phone = (appt.get('phone') or '').strip()
        name_key = f"{appt.get('firstName','').strip().lower()} {appt.get('lastName','').strip().lower()}".strip()
        history, key_used = fetch_filtered_history(creds['apiKey'], creds['apiSecret'], appt_dt, email, phone, name_key)
        history_count = len(history)
        past_count = 0
        for entry in history:
            entry_dt = parse_datetime(entry.get('datetime'))
            if not entry_dt or entry_dt >= appt_dt:
                continue
            if not is_confirmed(entry):
                continue
            past_count += 1
        lesson_number = past_count + 1
        address = appt.get('location') or appt.get('category')
        if address:
            address = address.strip()
        else:
            address = '(Missing address — cannot compute leave time)'
        lessons.append({
            'student': student,
            'lesson': lesson_number,
            'address': address,
            'datetime': appt_dt,
            'duration': get_appointment_duration(appt),
            'history_count': history_count,
            'past_count': past_count,
            'key_used': key_used,
            'appt': appt
        })
    lessons.sort(key=lambda x: x['datetime'])
    google_issue = plan_leave_times(lessons, origin_label)
    return lessons, google_issue, today


def format_section(label, lessons, date_value, include_note=False, google_issue=None):
    date_str = date_value.isoformat()
    header_suffix = ' (Calendar: Austen)' if include_note else ''
    lines = [f"{label} — Lessons Today{header_suffix} — {date_str}"]
    if google_issue:
        lines.append(google_issue)
    if not lessons:
        lines.append('No lessons scheduled.')
        return lines
    for entry in lessons:
        line = f"{entry['student']} — Lesson #{entry['lesson']} {entry['address']}"
        if entry.get('leave_by') and entry.get('eta') is not None:
            leave_str = entry['leave_by'].strftime('%I:%M %p').lstrip('0')
            line += f" Leave by {leave_str} (ETA {entry['eta']}m + 10m buffer)"
        lines.append(line)
        if entry.get('between_eta'):
            lines.append(f"Between lessons: {entry['between_eta']}m")
    return lines


result_austen, austen_google_issue, date_marker = run_account('Austen', 'accountA', ['Austen'], 'Austen', include_calendar_note=True)
result_dad, dad_google_issue, _ = run_account('Dad', 'accountB', ['Ernie', 'Freddy', 'Allan', 'Ryan', 'Alex', 'Aaron', 'Branden', 'Bob'], 'Dad')

austen_section = format_section('Austen', result_austen, date_marker, include_note=True, google_issue=austen_google_issue)
dad_section = format_section('Dad', result_dad, date_marker, include_note=False, google_issue=dad_google_issue)

for line in austen_section:
    print(line)
print()
for line in dad_section:
    print(line)
