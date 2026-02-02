import json, os, urllib.parse, urllib.request, base64
from datetime import datetime
from zoneinfo import ZoneInfo

TZ = ZoneInfo('America/Phoenix')
with open('secrets/acuity.json') as f:
    accounts = json.load(f)
account = accounts['accountB']
api_key = account['apiKey']
api_secret = account['apiSecret']

LIMIT = 200
START_DATE = '2024-01-01'
TARGET_DATE = '2026-02-02'
INVALID = {'cancelled', 'no-show', 'rescheduled', 'reschedule', 'refunded'}


def parse_dt(appt):
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


def fetch_today_ernie():
    offset = 0
    entries = []
    while True:
        print(f"fetch today offset={offset}")
        params = {
            'minDate': TARGET_DATE,
            'maxDate': TARGET_DATE,
            'limit': LIMIT,
            'offset': offset,
            'cancelled': 'false'
        }
        url = f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
        token = f"{api_key}:{api_secret}"
        headers = {'Authorization': 'Basic ' + base64.b64encode(token.encode()).decode()}
        with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=60) as resp:
            batch = json.load(resp)
        if not batch:
            break
        for appt in batch:
            if (appt.get('calendar') or '').strip().lower() == 'ernie':
                dt = parse_dt(appt)
                if dt and dt.strftime('%Y-%m-%d') == TARGET_DATE:
                    entries.append(appt)
        if len(batch) < LIMIT:
            break
        offset += len(batch)
    return entries


def fetch_history_for_email(email):
    offset = 0
    history = []
    while True:
        print(f"history fetch offset={offset} email={email}")
        params = {
            'clientEmail': email,
            'minDate': START_DATE,
            'maxDate': TARGET_DATE,
            'limit': LIMIT,
            'offset': offset,
            'cancelled': 'false'
        }
        url = f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
        token = f"{api_key}:{api_secret}"
        headers = {'Authorization': 'Basic ' + base64.b64encode(token.encode()).decode()}
        with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=60) as resp:
            batch = json.load(resp)
        if not batch:
            break
        history.extend(batch)
        offset += len(batch)
    return history


def filter_confirmed(history):
    return [appt for appt in history if (appt.get('status') or '').strip().lower() not in INVALID and not appt.get('cancelled')]


def count_past(appt, history):
    dt = parse_dt(appt)
    return len([h for h in history if parse_dt(h) and parse_dt(h) < dt])

entries = fetch_today_ernie()
for appt in sorted(entries, key=lambda a: parse_dt(a)):
    student = f"{appt.get('firstName','').strip()} {appt.get('lastName','').strip()}".strip()
    email = (appt.get('email') or '').strip().lower()
    if not email:
        continue
    history = fetch_history_for_email(email)
    history = filter_confirmed(history)
    history.sort(key=lambda a: parse_dt(a) or datetime.min)
    past_count = count_past(appt, history)
    dt = parse_dt(appt)
    loc = appt.get('location') or appt.get('category') or 'Unknown Location'
    lesson = past_count + 1
    print(f"{dt.strftime('%I:%M %p')} — {student} — Lesson #{lesson} — {appt.get('calendar')} — {loc}")
    if student.lower().startswith('aliyeh'):
        print("DEBUG BLOCK — Aliyeh Mansouri")
        print(f"Current appointment: {dt.strftime('%I:%M %p')} America/Phoenix — Ernie — {loc}")
        print(f"Match key used: email={email}")
        print(f"History fetched count: {len(history)}")
        for h in history:
            hdt = parse_dt(h)
            print(f"- {hdt.strftime('%Y-%m-%d %I:%M %p')} — {h.get('calendar')} — id {h.get('id')}")
