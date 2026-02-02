import json, os, urllib.parse, urllib.request, base64, datetime
from zoneinfo import ZoneInfo

PATH = os.path.join('secrets','acuity.json')
with open(PATH) as f:
    accounts = json.load(f)
LIMIT = 200
FIRST = 'kayde'
LAST = 'thompson-bradley'
ZONE = ZoneInfo('America/Phoenix')
start = '2024-01-01'
end = '2026-12-31'

records = []
for creds in accounts.values():
    offset = 0
    while True:
        params = {'minDate': start, 'maxDate': end, 'limit': LIMIT, 'offset': offset, 'cancelled': 'false'}
        url = f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
        token = f"{creds['apiKey']}:{creds['apiSecret']}"
        headers = {'Authorization': 'Basic ' + base64.b64encode(token.encode()).decode()}
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.load(resp)
        if not data:
            break
        for appt in data:
            if (appt.get('firstName','').strip().lower(), appt.get('lastName','').strip().lower()) == (FIRST, LAST):
                records.append(appt)
        if len(data) < LIMIT:
            break
        offset += len(data)

records.sort(key=lambda a: a['datetime'])
print('Total appointments found', len(records))
for idx, appt in enumerate(records, 1):
    dt = datetime.datetime.fromisoformat(appt['datetime']).astimezone(ZONE)
    print(idx, dt.strftime('%Y-%m-%d %I:%M %p'), appt.get('calendar'), appt.get('location', appt.get('category')))