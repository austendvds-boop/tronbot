import json
import os
import datetime
import urllib.parse
import urllib.request
from zoneinfo import ZoneInfo

PATH=os.path.join('secrets','acuity.json')
with open(PATH) as f:
    accounts=json.load(f)

def fetch(creds,date):
    params={'minDate':date,'maxDate':date,'limit':200,'cancelled':'false'}
    url=f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
    token=f"{creds['apiKey']}:{creds['apiSecret']}"
    headers={'Authorization':'Basic '+__import__('base64').b64encode(token.encode()).decode()}
    req=urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.load(resp)

def lesson_note(appointment):
    for form in appointment.get('forms',[]):
        for val in form.get('values',[]):
            name=val.get('name','').lower()
            text=val.get('value','')
            if 'lesson' in name and text.strip():
                return text.strip()
    notes=appointment.get('notes','')
    if 'lesson' in notes.lower():
        return notes.strip()
    return None


def safe_text(text):
    return ''.join(ch if ord(ch) < 128 else '?' for ch in text)


tomorrow=(datetime.date.today()+datetime.timedelta(days=1)).isoformat()
zone=ZoneInfo('America/Phoenix')
matches=[]
for key,creds in accounts.items():
    try:
        appts=fetch(creds,tomorrow)
    except Exception as exc:
        print('Failed',key,exc)
        continue
    for appt in appts:
        dt=datetime.datetime.fromisoformat(appt['datetime'])
        local=dt.astimezone(zone).strftime('%Y-%m-%d %I:%M %p')
        lesson=lesson_note(appt)
        matches.append({
            'account':key,
            'time':local,
            'instructor':appt.get('calendar') or 'unknown',
            'student':safe_text(f"{appt.get('firstName','').strip()} {appt.get('lastName','').strip()}".strip() or 'Unknown'),
            'type':safe_text(appt.get('type','').strip()),
            'location':safe_text(appt.get('location') or appt.get('category') or 'N/A'),
            'lesson_note':safe_text(lesson) if lesson else None,
            'duration':appt.get('duration'),
        })
if not matches:
    print('No drives scheduled for',tomorrow)
else:
    print(f"Drives scheduled for {tomorrow} (Phoenix):")
    for idx,appt in enumerate(sorted(matches,key=lambda x:x['time']),1):
        parts=[f"{idx}. {appt['time']} | {appt['student']} | Instr: {appt['instructor']} | {appt['type']} @ {appt['location']} | duration {appt['duration']} min"]
        if appt['lesson_note']:
            parts.append(f"lesson note: {appt['lesson_note']}")
        print(' | '.join(parts))
