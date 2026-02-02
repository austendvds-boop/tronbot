import json, os, urllib.parse, urllib.request, base64
from datetime import datetime
from zoneinfo import ZoneInfo

TZ = ZoneInfo('America/Phoenix')
with open('secrets/acuity.json') as f:
    accounts = json.load(f)
api_key = accounts['accountB']['apiKey']
api_secret = accounts['accountB']['apiSecret']

def auth_headers():
    token = f"{api_key}:{api_secret}"
    return {'Authorization': 'Basic ' + base64.b64encode(token.encode()).decode()}

def parse_dt(dt_str):
    if not dt_str:
        return None
    try:
        return datetime.fromisoformat(dt_str).astimezone(TZ)
    except Exception:
        try:
            return datetime.fromisoformat(dt_str.replace('Z', '+00:00')).astimezone(TZ)
        except Exception:
            return None


print('FETCH WINDOW 2026-01-05 to 2026-01-07 for Aliyeh')
limit = 200
offset = 0
matches = []
while True:
    params = {
        'minDate': '2026-01-05',
        'maxDate': '2026-01-07',
        'limit': limit,
        'offset': offset,
        'cancelled': 'false'
    }
    url = f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers=auth_headers())
    with urllib.request.urlopen(req, timeout=60) as resp:
        batch = json.load(resp)
    if not batch:
        break
    for appt in batch:
        email = (appt.get('email') or '').strip().lower()
        phone = ''.join(c for c in (appt.get('phone') or '') if c.isdigit())
        if phone.startswith('1') and len(phone) > 10:
            phone = phone[1:]
        if email == 'aliyeh.mansouri58@gmail.com' or phone == '14809523529':
            dt_raw = appt.get('datetime') or appt.get('startDate')
            parsed = parse_dt(dt_raw)
            matches.append({
                'id': appt.get('id'),
                'datetime_raw': dt_raw,
                'parsed': parsed.isoformat() if parsed else None,
                'epoch': int(parsed.timestamp()) if parsed else None,
                'cancelled': appt.get('cancelled'),
                'noShow': appt.get('noShow') or appt.get('no_show'),
                'rescheduled': appt.get('rescheduled'),
                'status': appt.get('status'),
                'calendar': appt.get('calendar'),
                'calendarID': appt.get('calendarID') or appt.get('calendarId')
            })
    if len(batch) < limit:
        break
    offset += len(batch)

if matches:
    for entry in matches:
        print('---')
        for key in ['id','datetime_raw','parsed','epoch','cancelled','noShow','rescheduled','status','calendar','calendarID']:
            print(f"{key}: {entry.get(key)}")
else:
    print("Jan 6 appointment is NOT present in Dad's API data.")
    # show earliest five from full history
    limit = 200
offset = 0
found = []
while len(found) < 5:
    params = {
        'minDate': '2025-01-01',
        'maxDate': '2026-12-31',
        'limit': limit,
        'offset': offset,
        'cancelled': 'false'
    }
    url = f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers=auth_headers())
    with urllib.request.urlopen(req, timeout=60) as resp:
        batch = json.load(resp)
    if not batch:
        break
    for appt in batch:
        email = (appt.get('email') or '').strip().lower()
        phone = ''.join(c for c in (appt.get('phone') or '') if c.isdigit())
        if phone.startswith('1') and len(phone) > 10:
            phone = phone[1:]
        if email == 'aliyeh.mansouri58@gmail.com' or phone == '14809523529':
            found.append(appt)
            if len(found) >= 5:
                break
    if len(batch) < limit:
        break
    offset += len(batch)
if not matches:
    for appt in found[:5]:
        print('---')
        dt_raw = appt.get('datetime') or appt.get('startDate')
        print('id', appt.get('id'))
        print('datetime', dt_raw)
        print('cancelled', appt.get('cancelled'))
        print('noShow', appt.get('noShow') or appt.get('no_show'))
        print('status', appt.get('status'))

# After forensic info compute lesson number for Feb 2
print('\nLESSON COUNT FOR ALIYEH MANSOURI ON 2026-02-02')
offset = 0
history = []
while True:
    params = {
        'clientEmail': 'aliyeh.mansouri58@gmail.com',
        'minDate': '2024-01-01',
        'maxDate': '2026-02-02',
        'limit': 200,
        'offset': offset
    }
    url = f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers=auth_headers())
    with urllib.request.urlopen(req, timeout=60) as resp:
        batch = json.load(resp)
    if not batch:
        break
    history.extend(batch)
    if len(batch) < 200:
        break
    offset += len(batch)

def is_excluded(appt):
    if appt.get('cancelled'):
        return 'cancelled flag true'
    if appt.get('noShow') or appt.get('no_show'):
        return 'noShow flag true'
    if appt.get('rescheduled'):
        return 'rescheduled flag true'
    status = (appt.get('status') or '').strip().lower()
    if status in {'cancelled','no-show','rescheduled','reschedule','refunded'}:
        return f'status={status}'
    return None

target_dt = None
for appt in history:
    if appt.get('id') == 1623578480:
        target_dt = parse_dt(appt.get('datetime'))
        break
if not target_dt:
    target_dt = datetime.fromisoformat('2026-02-02T14:30:00-07:00').astimezone(TZ)
past = []
for appt in history:
    if is_excluded(appt):
        continue
    dt = parse_dt(appt.get('datetime'))
    if not dt or dt >= target_dt:
        continue
    past.append(appt)
past.sort(key=lambda x: parse_dt(x.get('datetime')))  # ease debugging
print(f"total_history_entries={len(history)} (after pagination)")
print(f"counted_past_lessons={len(past)} (before 2026-02-02 14:30)")
print(f"Aliyeh Mansouri — Lesson #{len(past)+1}")
