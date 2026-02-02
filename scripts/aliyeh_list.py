import json, os, urllib.parse, urllib.request, base64
from datetime import datetime
from zoneinfo import ZoneInfo

TZ = ZoneInfo('America/Phoenix')
with open('secrets/acuity.json') as f:
    accounts = json.load(f)
account = accounts['accountB']
api_key = account['apiKey']
api_secret = account['apiSecret']
start = '2024-01-01'
end = '2026-02-02'
limit = 200
offset = 0
appointments = []
while True:
    params = {'minDate': start, 'maxDate': end, 'limit': limit, 'offset': offset, 'cancelled': 'false'}
    url = f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
    token = f"{api_key}:{api_secret}"
    headers = {'Authorization': 'Basic ' + base64.b64encode(token.encode()).decode()}
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=60) as resp:
        batch = json.load(resp)
    if not batch:
        break
    appointments.extend(batch)
    if len(batch) < limit:
        break
    offset += len(batch)

def parse_dt(dt):
    if not dt:
        return None
    try:
        return datetime.fromisoformat(dt).astimezone(TZ)
    except Exception:
        return None

filtered = []
for appt in appointments:
    email = (appt.get('email') or '').lower()
    if 'aliyeh.mansouri58' in email:
        filtered.append(appt)
    else:
        fn = (appt.get('firstName') or '').strip().lower()
        ln = (appt.get('lastName') or '').strip().lower()
        if fn == 'aliyeh' and ln == 'mansouri':
            filtered.append(appt)
filtered.sort(key=lambda x: parse_dt(x.get('datetime') or x.get('startDate')) or datetime.min)

print('Aliyeh appointments total:', len(filtered))
for appt in filtered:
    dt = parse_dt(appt.get('datetime') or appt.get('startDate'))
    print('---')
    print('id:', appt.get('id'))
    print('start:', dt.strftime('%Y-%m-%d %I:%M %p') if dt else 'None')
    print('status:', appt.get('status'))
    print('typeID:', appt.get('appointmentTypeID') or appt.get('appointmentTypeId'))
    print('calendar:', appt.get('calendar'))
    print('location:', appt.get('location'))
    print('cancelled:', appt.get('cancelled'))
    print('notes:', appt.get('notes'))
