import json, os, urllib.parse, urllib.request, base64, datetime
from zoneinfo import ZoneInfo
path=os.path.join('secrets','acuity.json')
with open(path) as f:
    accounts=json.load(f)
creds=accounts['accountA']
zone=ZoneInfo('America/Phoenix')
start=datetime.date(2026,2,3).isoformat()
end=datetime.date(2026,2,24).isoformat()
limit=200
offset=0
calendar_filter={'ryan','alex','aaron','austen'}
slots=[]
while True:
    params={'minDate':start,'maxDate':end,'limit':limit,'offset':offset,'cancelled':'false'}
    url=f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
    token=f"{creds['apiKey']}:{creds['apiSecret']}"
    headers={'Authorization':'Basic '+base64.b64encode(token.encode()).decode()}
    req=urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=60) as resp:
        data=json.load(resp)
    if not data:
        break
    for appt in data:
        cal=appt.get('calendar','').lower().strip()
        if cal in calendar_filter:
            dt=datetime.datetime.fromisoformat(appt['datetime']).astimezone(zone)
            slots.append((dt, cal, appt.get('firstName','')+' '+appt.get('lastName',''), appt.get('location') or appt.get('category'), appt.get('type'), appt.get('duration')))
    if len(data)<limit:
        break
    offset+=len(data)
slots.sort()
print('Found',len(slots),'slots for the next 3 weeks for your instructors.')
for dt,cal,name,loc,typ,dur in slots:
    print(f"{dt.strftime('%a %m/%d %I:%M %p')} | {cal.title()} | {name} | {loc} | {typ} | {dur} min")
