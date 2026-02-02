import json, os, urllib.parse, urllib.request, base64
from datetime import datetime
from zoneinfo import ZoneInfo

TZ = ZoneInfo('America/Phoenix')
with open('secrets/acuity.json') as f:
    accounts = json.load(f)
account = accounts['accountB']
api_key = account['apiKey']
api_secret = account['apiSecret']
target_date = '2026-02-02'
start = '2024-01-01'
end = target_date
limit = 200
offset = 0
all_appts = []
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
    all_appts.extend(batch)
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

target_appts = [a for a in all_appts if parse_dt(a.get('datetime') or a.get('startDate')) and parse_dt(a.get('datetime') or a.get('startDate')).strftime('%Y-%m-%d') == target_date]
for a in target_appts:
    dt = parse_dt(a.get('datetime') or a.get('startDate'))
    print('----')
    print('id:', a.get('id'))
    print('student:', a.get('firstName'), a.get('lastName'))
    print('calendar:', a.get('calendar'))
    print('appointmentTypeID:', a.get('appointmentTypeID') or a.get('appointmentTypeId'))
    print('start:', dt.strftime('%Y-%m-%d %I:%M %p') if dt else 'None')
    print('status:', a.get('status'))
    print('location:', a.get('location'))
    print('email:', a.get('email'))
    print('phone:', a.get('phone'))
    print('paid:', a.get('paid'))
