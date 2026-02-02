import json, os, datetime, urllib.parse, urllib.request, base64
from zoneinfo import ZoneInfo

target_date='2026-02-02'
start_date='2024-01-01'
PATH=os.path.join('secrets','acuity.json')
with open(PATH) as f:
    accounts=json.load(f)

def fetch(creds,minDate,maxDate):
    params={'minDate':minDate,'maxDate':maxDate,'limit':1000,'cancelled':'false'}
    url=f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
    token=f"{creds['apiKey']}:{creds['apiSecret']}"
    headers={'Authorization':'Basic '+base64.b64encode(token.encode()).decode()}
    req=urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.load(resp)

all_appts=[]
for creds in accounts.values():
    all_appts.extend(fetch(creds,start_date,target_date))

zone=ZoneInfo('America/Phoenix')

# build history per student
history={}
for appt in all_appts:
    if not appt.get('firstName'):
        continue
    key=(appt['firstName'].strip(),appt['lastName'].strip())
    history.setdefault(key,[]).append(datetime.datetime.fromisoformat(appt['datetime']))
for key in history:
    history[key]=sorted(history[key])

monday=[appt for appt in all_appts if appt['datetime'].startswith(target_date)]
monday_sorted=sorted(monday,key=lambda x:x['datetime'])
print(f"Aggregated Monday update ({target_date}): {len(monday_sorted)} lessons scheduled across all calendars.")
for idx,appt in enumerate(monday_sorted,1):
    key=(appt['firstName'].strip(),appt['lastName'].strip())
    dt=datetime.datetime.fromisoformat(appt['datetime']).astimezone(zone)
    prior=[dt for dt in history[key] if dt<datetime.datetime.fromisoformat(appt['datetime'])]
    lesson=len(prior)+1
    location=appt.get('location') or appt.get('category') or 'N/A'
    print(f"{idx}. {dt.strftime('%I:%M %p')} | {key[0]} {key[1]} | Lesson #{lesson} (has taken {len(prior)} before) | {appt.get('calendar')} | {appt.get('type')} @ {location}")
