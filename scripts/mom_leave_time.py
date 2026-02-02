import json, os, urllib.parse, urllib.request, base64
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
import math

TZ = ZoneInfo('America/Phoenix')
with open('secrets/acuity.json') as f:
    accounts=json.load(f)
creds=accounts['accountB']
base='https://acuityscheduling.com/api/v1/appointments'
with open(os.path.join('secrets','google_maps_api_key.txt')) as f:
    key=f.read().strip()
origin='35619 N 34th Ave, Phoenix, AZ 85086'

def fetch_appointments():
    target=datetime(2026,2,2, tzinfo=TZ)
    day_start=datetime(target.year,target.month,target.day,0,0,0,tzinfo=TZ)
    day_end=day_start+timedelta(days=1)
    params={'minDate':day_start.strftime('%Y-%m-%dT%H:%M:%S%z'),'maxDate':day_end.strftime('%Y-%m-%dT%H:%M:%S%z'),'limit':100,'cancelled':'false'}
    token=f"{creds['apiKey']}:{creds['apiSecret']}"
    headers={'Authorization':'Basic '+base64.b64encode(token.encode()).decode()}
    url=f"{base}?{urllib.parse.urlencode(params)}"
    req=urllib.request.Request(url,headers=headers)
    with urllib.request.urlopen(req,timeout=30) as resp:
        data=json.load(resp)
    return [appt for appt in data if 'michelle' in (appt.get('calendar') or '').strip().lower()]

def get_eta(dest, depart):
    params={'origin':origin,'destination':dest,'departure_time':int(depart.timestamp()),'traffic_model':'best_guess','key':key}
    url='https://maps.googleapis.com/maps/api/directions/json?'+urllib.parse.urlencode(params)
    with urllib.request.urlopen(url, timeout=30) as resp:
        data=json.load(resp)
    if data.get('status') != 'OK':
        return None
    legs=data['routes'][0]['legs'][0]
    duration=legs.get('duration_in_traffic') or legs.get('duration')
    return math.ceil(duration['value']/60) if duration else None

appts=fetch_appointments()
for appt in appts:
    dt=datetime.fromisoformat(appt['datetime']).astimezone(TZ)
    dest=appt.get('location') or 'Unknown location'
    eta=get_eta(dest, max(datetime.now(TZ), dt-timedelta(hours=1)))
    leave=None
    if eta:
        leave_time=dt - timedelta(minutes=eta+10)
        leave=leave_time.strftime('%I:%M %p').lstrip('0')
    print('Michelle appointment:')
    print(f"{dt.strftime('%I:%M %p')} — {dest} — Leave by {leave if leave else 'unknown'} ({eta or '??'} min travel)")
