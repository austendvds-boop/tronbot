import json, os, urllib.parse, urllib.request, base64
from datetime import datetime
from zoneinfo import ZoneInfo

TZ = ZoneInfo('America/Phoenix')
SECRETS_PATH = os.path.join('secrets','acuity.json')
with open(SECRETS_PATH) as f:
    accounts = json.load(f)
account = accounts['accountB']
api_key = account['apiKey']
api_secret = account['apiSecret']

LIMIT = 200
TARGET_DATE = '2026-02-02'
INVALID_STATUSES = {'cancelled', 'no-show'}


def auth_headers():
    token = f"{api_key}:{api_secret}"
    return {'Authorization': 'Basic ' + base64.b64encode(token.encode()).decode()}

def parse_dt(dt_str):
    if not dt_str:
        return None
    try:
        return datetime.fromisoformat(dt_str).astimezone(TZ)
    except Exception:
        try:
            return datetime.fromisoformat(dt_str.replace('Z', '+00:00')).astimezone(TZ)
        except Exception:
            return None

def normalized_name(appt):
    name = f"{appt.get('firstName','').strip().lower()} {appt.get('lastName','').strip().lower()}".strip()
    return ' '.join(''.join(ch for ch in name if ch.isalnum() or ch.isspace()).split())

def student_key(appt):
    if appt.get('clientID'):
        return ('client', str(appt['clientID']))
    if appt.get('clientId'):
        return ('client', str(appt['clientId']))
    if appt.get('client_reference_id'):
        return ('client', str(appt['client_reference_id']))
    email = (appt.get('email') or '').strip().lower()
    if email:
        return ('email', email)
    norm = normalized_name(appt)
    if norm:
        return ('name', norm)
    return ('id', str(appt.get('id')))


def fetch_all_history():
    offset=0
    history=[]
    while True:
        params={'minDate':'2024-01-01','maxDate':TARGET_DATE,'limit':LIMIT,'offset':offset,'cancelled':'false'}
        url=f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
        req=urllib.request.Request(url, headers=auth_headers())
        with urllib.request.urlopen(req, timeout=60) as resp:
            batch=json.load(resp)
        if not batch:
            break
        history.extend(batch)
        if len(batch)<LIMIT:
            break
        offset+=len(batch)
    return history


def fetch_today_ernie():
    offset=0
    results=[]
    while True:
        params={'minDate':TARGET_DATE,'maxDate':TARGET_DATE,'limit':LIMIT,'offset':offset,'cancelled':'false'}
        url=f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
        req=urllib.request.Request(url, headers=auth_headers())
        with urllib.request.urlopen(req, timeout=60) as resp:
            batch=json.load(resp)
        if not batch:
            break
        for appt in batch:
            if (appt.get('calendar') or '').strip().lower()!='ernie':
                continue
            dt=parse_dt(appt.get('datetime'))
            if dt and dt.strftime('%Y-%m-%d')==TARGET_DATE:
                results.append((dt,appt))
        if len(batch)<LIMIT:
            break
        offset+=len(batch)
    return sorted(results,key=lambda x:x[0])

history=fetch_all_history()
today=fetch_today_ernie()
history_map={}
for appt in history:
    key=student_key(appt)
    history_map.setdefault(key,[]).append(appt)

for dt,appt in today:
    key=student_key(appt)
    filtered=[h for h in history_map.get(key,[]) if parse_dt(h.get('datetime')) and parse_dt(h.get('datetime'))<dt]
    counted=[]; excluded=[]
    for h in filtered:
        status=(h.get('status') or '').strip().lower()
        if h.get('cancelled') or status in INVALID_STATUSES:
            excluded.append((h,'cancelled/no-show'))
            continue
        counted.append(h)
    lesson=len(counted)+1
    name=f"{appt.get('firstName','').strip()} {appt.get('lastName','').strip()}".strip() or 'Unknown'
    print(f"{dt.strftime('%I:%M %p')} — {name} — Lesson #{lesson} — {appt.get('calendar')} — {appt.get('location') or appt.get('category')}")
    if name.lower().startswith('aliyeh'):
        print('DEBUG — Aliyeh')
        print('Key',key)
        print('Past appointments counted:',len(counted))
        for h in counted:
            print('-',h.get('id'),h.get('datetime'),h.get('calendar'))
        if excluded:
            print('Excluded:')
        for h,reason in excluded:
            print('-',h.get('id'),reason)
