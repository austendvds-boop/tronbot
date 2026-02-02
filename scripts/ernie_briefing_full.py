import json, os, urllib.parse, urllib.request, base64
from datetime import datetime
from zoneinfo import ZoneInfo

TZ = ZoneInfo('America/Phoenix')
SECRETS_PATH = os.path.join('secrets','acuity.json')
with open(SECRETS_PATH) as f:
    accounts = json.load(f)
account = accounts['accountB']
api_key = account['apiKey']
api_secret = account['apiSecret']

LIMIT = 200
START_DATE = '2024-01-01'
TARGET_DATE = '2026-02-02'
INVALID_STATUSES = {'cancelled', 'no-show', 'rescheduled', 'reschedule', 'refunded'}


def fetch_student_history(filters):
    gathered = []
    offset = 0
    pages = 0
    last_offset = 0
    while True:
        params = {
            'minDate': START_DATE,
            'maxDate': TARGET_DATE,
            'limit': LIMIT,
            'offset': offset,
            'cancelled': 'false'
        }
        params.update(filters)
        print(f"Fetching history offset={offset} filters={filters}")
        url = f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
        token = f"{api_key}:{api_secret}"
        headers = {'Authorization': 'Basic ' + base64.b64encode(token.encode()).decode()}
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=60) as resp:
            batch = json.load(resp)
        if not batch:
            break
        gathered.extend(batch)
        pages += 1
        last_offset = offset
        offset += len(batch)
    return gathered, pages, last_offset, offset


def normalize_email(value):
    return (value or '').strip().lower()


def normalize_phone(value):
    digits = ''.join([c for c in (value or '') if c.isdigit()])
    if digits.startswith('1') and len(digits) > 10:
        digits = digits[1:]
    return digits


def student_match_key(appt):
    email = normalize_email(appt.get('email') or appt.get('clientEmail'))
    if email:
        return ('email', email)
    phone = normalize_phone(appt.get('phone'))
    if phone:
        return ('phone', phone)
    client_id = appt.get('clientID') or appt.get('clientId')
    if client_id:
        return ('client', str(client_id))
    return None


def matches_key(candidate, key):
    if not key:
        return False
    typ, val = key
    if typ == 'email':
        return normalize_email(candidate.get('email') or candidate.get('clientEmail')) == val
    if typ == 'phone':
        return normalize_phone(candidate.get('phone')) == val
    if typ == 'client':
        return str(candidate.get('clientID') or candidate.get('clientId')) == val
    return False


def parse_datetime(appt):
    dt = appt.get('datetime') or appt.get('startDate') or appt.get('startAt')
    if not dt:
        return None
    try:
        return datetime.fromisoformat(dt).astimezone(TZ)
    except Exception:
        try:
            return datetime.fromisoformat(dt.replace('Z', '+00:00')).astimezone(TZ)
        except Exception:
            return None


def filter_completed(candidates):
    return [c for c in candidates if (c.get('status') or '').strip().lower() not in INVALID_STATUSES and not c.get('cancelled')]


def fetch_today_ernie():
    offset = 0
    results = []
    while True:
        params = {
            'minDate': TARGET_DATE,
            'maxDate': TARGET_DATE,
            'limit': LIMIT,
            'offset': offset,
            'cancelled': 'false'
        }
        print(f"Fetching today offset={offset}")
        url = f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
        token = f"{api_key}:{api_secret}"
        headers = {'Authorization': 'Basic ' + base64.b64encode(token.encode()).decode()}
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=60) as resp:
            batch = json.load(resp)
        if not batch:
            break
        for appt in batch:
            if (appt.get('calendar') or '').strip().lower() == 'ernie':
                dt = parse_datetime(appt)
                if dt:
                    results.append((dt, appt))
        if len(batch) < LIMIT:
            break
        offset += len(batch)
    return sorted(results, key=lambda x: x[0])


today_appts = fetch_today_ernie()

aliyeh_debug_printed = False

def format_time(dt):
    return dt.strftime('%I:%M %p').lstrip('0')

for dt, appt in today_appts:
    key = student_match_key(appt)
    filters = {}
    if key:
        if key[0] == 'email':
            filters['clientEmail'] = key[1]
        elif key[0] == 'phone':
            filters['phone'] = key[1]
        elif key[0] == 'client':
            filters['clientID'] = key[1]
    history, pages, last_offset, final_offset = fetch_student_history(filters)
    filtered_history = [h for h in history if matches_key(h, key)] if key else []
    filtered_history = filter_completed(filtered_history)
    past_candidates = [(parse_datetime(h), h) for h in filtered_history if parse_datetime(h) and parse_datetime(h) < dt]
    past_candidates.sort(key=lambda x: x[0])
    lesson_number = len(past_candidates) + 1
    if appt.get('firstName') and appt.get('lastName'):
        student_name = f"{appt.get('firstName').strip()} {appt.get('lastName').strip()}".strip()
    else:
        student_name = appt.get('email') or 'Unknown Student'
    location = appt.get('location') or appt.get('category') or 'Unknown Location'
    instructor = appt.get('calendar') or 'Unknown Instructor'
    if not aliyeh_debug_printed and student_name.lower().startswith('aliyeh'):
        aliyeh_debug_printed = True
        print("DEBUG BLOCK — Aliyeh Mansouri")
        print(f"Current appointment: {format_time(dt)} America/Phoenix — {instructor} — {location}")
        match_desc = f"{key[0]}={key[1]}" if key else 'no match key'
        print(f"Match key used: {match_desc}")
        print(f"History fetch — total={len(history)} appointments, pages={pages}, last_offset={last_offset}, final_offset={final_offset}")
        if past_candidates:
            print("Matched past appointments counted:")
            for past_dt, past_appt in past_candidates:
                past_instr = past_appt.get('calendar') or 'Unknown'
                past_loc = past_appt.get('location') or past_appt.get('category') or 'Unknown'
                print(f"- {past_dt.strftime('%Y-%m-%d %I:%M %p')} — {past_instr} — id {past_appt.get('id')} — {past_loc}")
        else:
            print("BUG: history exists in UI but was not returned/was filtered out")
            print(f"filters — key_matches={len(filtered_history)} (after status), before_count=0")
    print(f"{format_time(dt)} — {student_name} — Lesson #{lesson_number} — {instructor} — {location}")
