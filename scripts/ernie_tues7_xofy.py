import json, os, datetime, urllib.parse, urllib.request, base64
from zoneinfo import ZoneInfo

path = os.path.join('secrets', 'acuity.json')
with open(path) as f:
    accounts = json.load(f)
limit = 200
start = '2024-01-01'
target_date = '2026-02-07'
zone = ZoneInfo('America/Phoenix')
all_appts = []
for creds in accounts.values():
    offset = 0
    while True:
        params = {'minDate': start, 'maxDate': target_date, 'limit': limit, 'offset': offset, 'cancelled': 'false'}
        url = f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
        token = f"{creds['apiKey']}:{creds['apiSecret']}"
        headers = {'Authorization': 'Basic ' + base64.b64encode(token.encode()).decode()}
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.load(resp)
        if not data:
            break
        all_appts.extend(data)
        if len(data) < limit:
            break
        offset += len(data)

history = {}
for appt in all_appts:
    first = appt.get('firstName','').strip()
    last = appt.get('lastName','').strip()
    if not first:
        continue
    key = (first, last)
    dt = datetime.datetime.fromisoformat(appt['datetime']).astimezone(zone)
    history.setdefault(key, []).append(dt)
for v in history.values():
    v.sort()
target_date_dt = datetime.date(2026,2,7)
today = [appt for appt in all_appts if appt.get('calendar','').strip().lower()=='ernie' and datetime.datetime.fromisoformat(appt['datetime']).astimezone(zone).date()==target_date_dt]
today.sort(key=lambda a: a['datetime'])
print(f"Ernie Tuesday update {target_date}:")
print('Travel base: 35619 N 34th Ave, Phoenix AZ 85086. Say "update traffic" for departure times.')
if not today:
    print('No Ernie lessons scheduled')
else:
    for appt in today:
        key = (appt.get('firstName','').strip(), appt.get('lastName','').strip())
        total = len(history.get(key,[]))
        dt = datetime.datetime.fromisoformat(appt['datetime']).astimezone(zone)
        prior = [d for d in history[key] if d < dt]
        lesson = len(prior) + 1
        location = appt.get('location') or appt.get('category') or 'N/A'
        print(f"{dt.strftime('%I:%M %p')} | {key[0]} {key[1]} | Lesson #{lesson} of {total} | {location}")
