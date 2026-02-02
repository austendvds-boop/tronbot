import json, os, urllib.parse, urllib.request, base64
import itertools
from datetime import datetime
from zoneinfo import ZoneInfo

TZ = ZoneInfo('America/Phoenix')
with open('secrets/acuity.json') as f:
    accounts = json.load(f)
api_key = accounts['accountB']['apiKey']
api_secret = accounts['accountB']['apiSecret']

start='2025-12-01'
end='2026-02-28'
limit=200
offset=0
results=[]
while True:
    params={'minDate':start,'maxDate':end,'limit':limit,'offset':offset,'cancelled':'false'}
    url=f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
    token=f"{api_key}:{api_secret}"
    headers={'Authorization':'Basic '+base64.b64encode(token.encode()).decode()}
    req=urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=60) as resp:
        batch=json.load(resp)
    if not batch:
        break
    results.extend(batch)
    if len(batch)<limit:
        break
    offset+=len(batch)

names={}
for appt in results:
    name=f"{appt.get('firstName','').strip()} {appt.get('lastName','').strip()}".strip()
    names[name]=names.get(name,0)+1
for name,count in sorted(names.items(), key=lambda x:x[0]):
    print(name or 'Unknown', count)
