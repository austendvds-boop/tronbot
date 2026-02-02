import json, os, urllib.parse, urllib.request, base64
path=os.path.join('secrets','acuity.json')
with open(path) as f:
    accounts=json.load(f)
creds=accounts['accountB']
limit=200
offset=0
names=set()
while True:
    params={'minDate':'2024-01-01','maxDate':'2026-12-31','limit':limit,'offset':offset,'cancelled':'false'}
    url=f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
    token=f"{creds['apiKey']}:{creds['apiSecret']}"
    headers={'Authorization':'Basic '+base64.b64encode(token.encode()).decode()}
    req=urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=30) as resp:
        data=json.load(resp)
    if not data:
        break
    for appt in data:
        first=appt.get('firstName','').strip()
        last=appt.get('lastName','').strip()
        if first or last:
            names.add(f"{first}|{last}|{appt.get('calendar')}|{appt['datetime']}")
    if len(data)<limit:
        break
    offset+=len(data)
print(len(names))
for item in list(names)[:20]:
    print(item)
