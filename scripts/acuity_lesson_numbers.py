import json, os, datetime, urllib.parse, urllib.request
from zoneinfo import ZoneInfo

PATH=os.path.join('secrets','acuity.json')
with open(PATH) as f:
    accounts=json.load(f)

zone=ZoneInfo('America/Phoenix')
tomorrow=(datetime.date.today()+datetime.timedelta(days=1)).isoformat()
start_date='2024-01-01'

cache={}

def fetch(creds,minDate,maxDate):
    params={'minDate':minDate,'maxDate':maxDate,'limit':500,'cancelled':'false'}
    url=f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
    token=f"{creds['apiKey']}:{creds['apiSecret']}"
    headers={'Authorization':'Basic '+__import__('base64').b64encode(token.encode()).decode()}
    req=urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.load(resp)

print(f"Lesson status for {tomorrow} (Phoenix time):")
order=1
for acct,creds in accounts.items():
    future_appts=fetch(creds,tomorrow,tomorrow)
    prev_appts=fetch(creds,start_date,tomorrow)
    for appt in future_appts:
        student=f"{appt.get('firstName','').strip()} {appt.get('lastName','').strip()}".strip() or 'Unknown'
        prior=[x for x in prev_appts if x.get('firstName','').strip()==appt.get('firstName','').strip() and x.get('lastName','').strip()==appt.get('lastName','').strip() and x['datetime']<appt['datetime']]
        lesson_number=len(prior)+1
        dt=datetime.datetime.fromisoformat(appt['datetime'])
        print(f"{order}. {dt.astimezone(zone).strftime('%I:%M %p')} | {student} | Lesson #{lesson_number}")
        order+=1
