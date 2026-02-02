import json, os, urllib.parse, urllib.request, base64
from datetime import datetime
from zoneinfo import ZoneInfo

TZ = ZoneInfo('America/Phoenix')
SECRETS = os.path.join('secrets','acuity.json')
with open(SECRETS) as f:
    accounts = json.load(f)
account = accounts['accountB']
api_key = account['apiKey']
api_secret = account['apiSecret']
target_date = '2026-02-02'
history_start = '2024-01-01'
limit = 200
offset = 0
all_appts = []
while True:
    params = {'minDate': history_start, 'maxDate': target_date, 'limit': limit, 'offset': offset, 'cancelled': 'false'}
    url = f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
    token = f"{api_key}:{api_secret}"
    headers = {'Authorization': 'Basic ' + base64.b64encode(token.encode()).decode()}
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=60) as resp:
        batch = json.load(resp)
    if not batch:
        break
    all_appts.extend(batch)
    if len(batch) < limit:
        break
    offset += len(batch)

TZ = ZoneInfo('America/Phoenix')

def parse_dt(dt_str):
    if not dt_str:
        return None
    try:
        return datetime.fromisoformat(dt_str).astimezone(TZ)
    except Exception:
        return None

def student_key(appt):
    email = (appt.get('email') or '').strip().lower()
    if email:
        return ('email', email)
    name = f"{appt.get('firstName','').strip().lower()} {appt.get('lastName','').strip().lower()}".strip()
    phone = ''.join(filter(str.isdigit, appt.get('phone','')))
    return ('name_phone', f"{name}||{phone}")

filtered = []
for appt in all_appts:
    if (appt.get('calendar') or '').strip().lower() != 'ernie':
        continue
    dt = parse_dt(appt.get('datetime') or appt.get('startDate'))
    if not dt:
        continue
    if dt.strftime('%Y-%m-%d') == target_date:
        filtered.append((dt, appt))

filtered.sort(key=lambda x: x[0])

for dt, appt in filtered:
    key = student_key(appt)
    past = 0
    for candidate in all_appts:
        cand_dt = parse_dt(candidate.get('datetime') or candidate.get('startDate'))
        if not cand_dt or cand_dt >= dt:
            continue
        if candidate.get('status','').lower() in {'cancelled','no-show','rescheduled'}:
            continue
        if student_key(candidate) != key:
            continue
        past += 1
    lesson = past + 1
    time_str = dt.strftime('%I:%M %p').lstrip('0')
    name = f"{appt.get('firstName','').strip()} {appt.get('lastName','').strip()}".strip()
    if not name:
        name = 'Unknown Student'
    location = appt.get('location') or appt.get('category') or 'Unknown Location'
    print(f"{time_str} — {name} — Lesson #{lesson} — Ernie — {location}")
