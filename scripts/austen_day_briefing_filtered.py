import json, os, urllib.parse, urllib.request, base64
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

TZ = ZoneInfo('America/Phoenix')
with open('secrets/acuity.json') as f:
    data=json.load(f)
account=data['accountA']
api_key=account['apiKey']
api_secret=account['apiSecret']
headers={'Authorization':'Basic '+base64.b64encode(f"{api_key}:{api_secret}".encode()).decode()}
base='https://acuityscheduling.com/api/v1/appointments'
start=datetime.now(TZ).replace(hour=0, minute=0, second=0, microsecond=0)
end=start+timedelta(days=1)
params={'minDate':start.strftime('%Y-%m-%dT%H:%M:%S%z'),'maxDate':end.strftime('%Y-%m-%dT%H:%M:%S%z'),'limit':100,'cancelled':'false'}
req=urllib.request.Request(f"{base}?{urllib.parse.urlencode(params)}", headers=headers)
with urllib.request.urlopen(req, timeout=15) as resp:
    batch=json.load(resp)
filtered=[appt for appt in batch if (appt.get('calendar') or '').strip().lower()=='austen']
print('filtered appointments (calendar=Austen):')
for appt in filtered:
    time_str=datetime.fromisoformat(appt['datetime']).astimezone(TZ).strftime('%I:%M %p')
    email='Y' if appt.get('email') else 'N'
    phone='Y' if appt.get('phone') else 'N'
    print(f"{time_str} — {appt.get('firstName')} {appt.get('lastName')} — id={appt.get('id')} — emailPresent={email} — phonePresent={phone} — calendar={appt.get('calendar')}")

print('\nLesson lines:')
for appt in filtered:
    appt_dt=datetime.fromisoformat(appt['datetime']).astimezone(TZ)
    history_start=appt_dt-timedelta(days=365)
    key_params={
        'minDate':history_start.strftime('%Y-%m-%dT%H:%M:%S%z'),
        'maxDate':appt_dt.strftime('%Y-%m-%dT%H:%M:%S%z'),
        'limit':100,
        'cancelled':'false'
    }
    if appt.get('email'):
        key_params['email']=appt['email'].strip().lower()
    elif appt.get('phone'):
        key_params['phone']=appt['phone'].strip()
    else:
        key_params['name']=f"{(appt.get('firstName') or '').strip().lower()} {(appt.get('lastName') or '').strip().lower()}".strip()
    url=f"{base}?{urllib.parse.urlencode(key_params)}"
    req=urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=15) as resp:
        hist=json.load(resp)
    history_count=len(hist)
    earliest=min((datetime.fromisoformat(h['datetime']).astimezone(TZ) for h in hist if h.get('datetime')), default=None)
    latest=max((datetime.fromisoformat(h['datetime']).astimezone(TZ) for h in hist if h.get('datetime')), default=None)
    past=0
    for h in hist:
        dt=datetime.fromisoformat(h['datetime']).astimezone(TZ)
        if dt>=appt_dt:
            continue
        status=(h.get('status') or '').strip().lower()
        if h.get('cancelled') or h.get('noShow') or h.get('no_show') or status in {'cancelled','no-show','rescheduled'}:
            continue
        past+=1
    lesson=past+1
    print(f"{time_str} — {appt.get('firstName')} {appt.get('lastName')} — Lesson #{lesson} — Austen — {appt.get('location')} — (id {appt.get('id')})")
    if lesson==1:
        keyUsed='email' if 'email' in key_params else ('phone' if 'phone' in key_params else 'name')
        print(f"historyCount={history_count} pastCount={past} historyEarliest={earliest.isoformat() if earliest else 'null'} historyLatest={latest.isoformat() if latest else 'null'} keyUsed={keyUsed}")
