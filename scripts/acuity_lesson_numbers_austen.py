import json
import os
import datetime
import urllib.parse
import urllib.request
from zoneinfo import ZoneInfo

PATH=os.path.join('secrets','acuity.json')
with open(PATH) as f:
    accounts=json.load(f)

def fetch(creds,minDate,maxDate):
    params={'minDate':minDate,'maxDate':maxDate,'limit':500,'cancelled':'false'}
    url=f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
    token=f"{creds['apiKey']}:{creds['apiSecret']}"
    headers={'Authorization':'Basic '+__import__('base64').b64encode(token.encode()).decode()}
    req=urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.load(resp)

def safe(text):
    return ''.join(ch if ord(ch)<128 else '?' for ch in text)

zone=ZoneInfo('America/Phoenix')
tomorrow=(datetime.date.today()+datetime.timedelta(days=1)).isoformat()
start='2024-01-01'
creds=accounts['accountA']
today=[appt for appt in fetch(creds,tomorrow,tomorrow) if appt.get('calendar','').strip().lower()=='austen']
history=[appt for appt in fetch(creds,start,tomorrow) if appt.get('calendar','').strip().lower()=='austen']
print(f"Austen calendar drives for {tomorrow}:")
today.sort(key=lambda a:a['datetime'])
for idx,appt in enumerate(today,1):
    student=safe(f"{appt.get('firstName','')} {appt.get('lastName','')}".strip() or 'Unknown')
    prior=[a for a in history if a['firstName']==appt['firstName'] and a['lastName']==appt['lastName'] and a['datetime']<appt['datetime']]
    lesson=len(prior)+1
    local=datetime.datetime.fromisoformat(appt['datetime']).astimezone(zone).strftime('%I:%M %p')
    print(f"{idx}. {local} | {student} | Lesson #{lesson} | Instructor: {safe(appt.get('calendar',''))} | {safe(appt.get('type',''))} | {safe(appt.get('location') or appt.get('category') or 'N/A')}")
