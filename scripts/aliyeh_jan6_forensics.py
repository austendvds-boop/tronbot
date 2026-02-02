import json, os, urllib.parse, urllib.request, base64
from datetime import datetime
from zoneinfo import ZoneInfo

TZ = ZoneInfo('America/Phoenix')
with open('secrets/acuity.json') as f:
    accounts = json.load(f)
api_key = accounts['accountB']['apiKey']
api_secret = accounts['accountB']['apiSecret']
start = '2026-01-05'
end = '2026-01-07'
limit = 200
offset = 0
matched = []
print_stages = []
while True:
    params = {
        'minDate': start,
        'maxDate': end,
        'limit': limit,
        'offset': offset,
        'cancelled': 'false'
    }
    url = f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
    token = f"{api_key}:{api_secret}"
    headers = {'Authorization': 'Basic ' + base64.b64encode(token.encode()).decode()}
    req = urllib.request.Request(url, headers=headers)
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
            dt_parsed = None
            if dt_raw:
                try:
                    dt_parsed = datetime.fromisoformat(dt_raw).astimezone(TZ)
                except Exception:
                    try:
                        dt_parsed = datetime.fromisoformat(dt_raw.replace('Z', '+00:00')).astimezone(TZ)
                    except Exception:
                        dt_parsed = None
            epoch = int(dt_parsed.timestamp()) if dt_parsed else 'N/A'
            matched.append({
                'id': appt.get('id'),
                'datetime': dt_raw,
                'parsed': dt_parsed.isoformat() if dt_parsed else None,
                'epoch': epoch,
                'cancelled': appt.get('cancelled'),
                'noShow': appt.get('noShow') or appt.get('no_show'),
                'rescheduled': appt.get('rescheduled'),
                'status': appt.get('status'),
                'calendar': appt.get('calendar'),
                'calendarID': appt.get('calendarID'),
                'instructor': appt.get('calendar')
            })
    if len(batch) < limit:
        break
    offset += len(batch)
if matched:
    for entry in matched:
        print('---')
        for key, value in entry.items():
            print(f"{key}: {value}")
else:
    print('Jan 6 appointment is NOT present in Dad\'s API data.')
    # print earliest 5 from entire dataset
    offset = 0
    early = []
    while len(early) < 5:
        params = {
            'minDate': '2025-01-01',
            'maxDate': '2026-02-28',
            'limit': limit,
            'offset': offset,
            'cancelled': 'false'
        }
        url = f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=60) as resp:
            batch = json.load(resp)
        if not batch:
            break
        for appt in batch:
            email = (appt.get('email') or '').strip().lower()
            phone = ''.join(c for c in (appt.get('phone') or '') if c.isdigit())
            if email == 'aliyeh.mansouri58@gmail.com' or phone == '14809523529':
                early.append(appt)
                if len(early) >= 5:
                    break
        if len(batch) < limit:
            break
        offset += len(batch)
    for appt in early[:5]:
        dt = appt.get('datetime') or appt.get('startDate')
        print('---')
        print('id', appt.get('id'))
        print('datetime', dt)
        print('cancelled', appt.get('cancelled'))
        print('noShow', appt.get('noShow') or appt.get('no_show'))
