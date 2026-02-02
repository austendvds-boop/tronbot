import json, os, urllib.parse, urllib.request, base64
from datetime import datetime
from zoneinfo import ZoneInfo

TZ = ZoneInfo('America/Phoenix')
with open('secrets/acuity.json') as f:
    accounts = json.load(f)
api_key = accounts['accountB']['apiKey']
api_secret = accounts['accountB']['apiSecret']
START = '2025-11-01'
END = '2026-02-03'
LIMIT = 100
offset = 0
cumulative = 0
all_appts = []
print('STEP 1: pagination log')
while True:
    params = {'minDate': START, 'maxDate': END, 'limit': LIMIT, 'offset': offset, 'cancelled': 'false'}
    url = f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
    token = f"{api_key}:{api_secret}"
    headers = {'Authorization': 'Basic ' + base64.b64encode(token.encode()).decode()}
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=60) as resp:
        batch = json.load(resp)
    count = len(batch)
    cumulative += count
    print(f"page offset={offset} countReturned={count} cumulative={cumulative}")
    if count == 0:
        break
    all_appts.extend(batch)
    offset += LIMIT
print(f"TOTAL APPOINTMENTS FETCHED={len(all_appts)}")
if len(all_appts) == 100:
    raise SystemExit('TOTAL APPOINTMENTS FETCHED == 100; pagination likely incomplete (only first page).')
name_norm = 'aliyeh mansouri'
TARGET_DT = datetime.fromisoformat('2026-02-02T14:30:00-07:00').astimezone(TZ)
counted = []
for appt in all_appts:
    fn = (appt.get('firstName') or '').strip().lower()
    ln = (appt.get('lastName') or '').strip().lower()
    if f"{fn} {ln}".strip() != name_norm:
        continue
    dt_raw = appt.get('datetime')
    if not dt_raw:
        continue
    dt = datetime.fromisoformat(dt_raw).astimezone(TZ)
    if dt >= TARGET_DT:
        continue
    status = (appt.get('status') or '').strip().lower()
    if appt.get('cancelled') or appt.get('noShow') or appt.get('no_show') or status in {'cancelled','no-show'}:
        continue
    counted.append((appt.get('id'), dt.strftime('%Y-%m-%d %I:%M %p'), appt.get('calendar')))
lesson_num = len(counted) + 1
print(f'Aliyeh Mansouri — Lesson #{lesson_num}')
print('Counted appointments:')
for cid, cdt, cal in counted:
    print(f"- {cid} | {cdt} | {cal}")
print('\nFINAL BRIEFING LINES:')
print('11:30 AM — Ezra Campos — Lesson #3 — Ernie — 1605 E Juniper Ave, Phoenix 85022')
print(f'02:30 PM — Aliyeh Mansouri — Lesson #{lesson_num} — Ernie — 1450 E Bell Rd, Phoenix 85022')
