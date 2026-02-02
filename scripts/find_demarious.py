#!/usr/bin/env python3
import json, os, urllib.parse, urllib.request, base64
from datetime import datetime, date
from zoneinfo import ZoneInfo

TZ = ZoneInfo('America/Phoenix')
# Load API credentials
data = json.load(open('secrets/acuity.json'))

found = []
# Today's date window
today = date.today().isoformat()
params = {'minDate': today, 'maxDate': today, 'limit': 100, 'cancelled': 'false'}
for label, creds in data.items():
    token = f"{creds['apiKey']}:{creds['apiSecret']}"
    headers = {'Authorization': 'Basic ' + base64.b64encode(token.encode()).decode()}
    url = f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=30) as resp:
            appts = json.load(resp)
    except Exception:
        continue
    for appt in appts:
        fn = appt.get('firstName', '').strip().lower()
        ln = appt.get('lastName', '').strip().lower()
        if fn == 'demarious' and ln == 'johnson':
            dt = datetime.fromisoformat(appt['datetime']).astimezone(TZ)
            found.append((label, dt.strftime('%I:%M %p'), appt.get('calendar', '')))

if not found:
    print('No appointments found for Demarious Johnson today.')
else:
    for label, time_str, cal in found:
        print(f"Instructor {label.title()} at {time_str} (calendar: {cal})")
