import json, os, datetime, urllib.parse, urllib.request, base64
from zoneinfo import ZoneInfo

PATH = os.path.join('secrets','acuity.json')
with open(PATH) as f:
    accounts = json.load(f)

limit = 200
start = '2024-01-01'
end = '2026-12-31'
all_appts = []
for creds in accounts.values():
    offset = 0
    while True:
        params = {
            'minDate': start,
            'maxDate': end,
            'limit': limit,
            'offset': offset,
            'cancelled': 'false'
        }
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
    fn = appt.get('firstName','').strip()
    ln = appt.get('lastName','').strip()
    if not fn:
        continue
    key = (fn, ln)
    dt = datetime.datetime.fromisoformat(appt['datetime']).astimezone(ZoneInfo('America/Phoenix'))
    history.setdefault(key, []).append(dt)
for k in history:
    history[k].sort()

# example debug print for specific students
for student in [('Jessica','Catalanotte'), ('Kennedi','Harris'), ('Ezra','Campos')] :
    recs=history.get(student,[])
    print(student, 'total', len(recs))
    for idx,dt in enumerate(recs,1):
        print(' ', idx, dt.strftime('%Y-%m-%d %I:%M %p'))
