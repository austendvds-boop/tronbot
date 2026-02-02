import json, os, urllib.parse, urllib.request, base64
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

TZ = ZoneInfo('America/Phoenix')
with open('secrets/acuity.json') as f:
    accounts = json.load(f)
account = accounts['accountB']
api_key = account['apiKey']
api_secret = account['apiSecret']

def headers(token):
    return {'Authorization': 'Basic ' + base64.b64encode(token.encode()).decode()}

def fetch(url):
    req = urllib.request.Request(url, headers=headers(f"{api_key}:{api_secret}"))
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.load(resp)

def paginate(params, limit=100, max_pages=None):
    offset = 0
    collected = []
    pages = 0
    while True:
        params.update({'limit': limit, 'offset': offset})
        url = f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
        batch = fetch(url)
        collected.extend(batch)
        pages += 1
        print(f"page offset={offset} countReturned={len(batch)} cumulative={len(collected)}")
        if len(batch) < limit or (max_pages and pages >= max_pages):
            break
        offset += limit
    return collected, pages

print('STEP 1: fetch Ernie appointments for Feb 2')
params = {
    'minDate': '2026-02-02',
    'maxDate': '2026-02-03',
    'calendarID': 9817866,
    'cancelled': 'false'
}
day_appts, _ = paginate(params)
print('\nSTEP 2: history per student (safe bounded fetch)')
RESULTS = []
for appt in day_appts:
    student = f"{(appt.get('firstName') or '').strip()} {(appt.get('lastName') or '').strip()}".strip()
    appt_dt = datetime.fromisoformat(appt['datetime']).astimezone(TZ)
    window_start = (appt_dt - timedelta(days=365)).strftime('%Y-%m-%d')
    query = {'minDate': window_start, 'maxDate': appt_dt.strftime('%Y-%m-%d'), 'cancelled': 'false'}
    email = (appt.get('email') or '').strip().lower()
    use_email = bool(email)
    if email:
        query['clientEmail'] = email
    else:
        norm_name = ''.join(ch for ch in student.lower() if ch.isalnum() or ch.isspace()).strip()
        query['name'] = norm_name
    collected = []
    pages=0
    while True:
        if pages >=10:
            break
        query.update({'offset': pages*100, 'limit': 100})
        url = f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(query)}"
        batch = fetch(url)
        collected.extend(batch)
        pages +=1
        if len(batch) < 100:
            break
    if not collected and window_start!='2024-01-01':
        window_start = (appt_dt - timedelta(days=730)).strftime('%Y-%m-%d')
        query['minDate'] = window_start
        collected = []
        pages=0
        while True:
            if pages>=10:
                break
            query.update({'offset': pages*100, 'limit': 100})
            url = f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(query)}"
            batch = fetch(url)
            collected.extend(batch)
            pages +=1
            if len(batch)<100:
                break
    past = []
    for hist in collected:
        dt = datetime.fromisoformat(hist['datetime']).astimezone(TZ)
        if dt >= appt_dt:
            continue
        if hist.get('canceled') or hist.get('cancelled') or hist.get('noShow') or hist.get('no_show'):
            continue
        status = (hist.get('status') or '').strip().lower()
        if status in {'cancelled','no-show'}:
            continue
        past.append((hist['id'], dt.strftime('%Y-%m-%d %I:%M %p'), hist.get('calendar')))
    print(f"{appt_dt.strftime('%I:%M %p')} — {student} — Lesson #{len(past)+1} — {appt.get('calendar')} — {appt.get('location')}" )
    if student.lower().startswith('aliyeh'):
        print('DEBUG — history query', query)
        print('pages fetched', pages)
        print('email matches' if use_email else 'name matches', len(collected))
        print('first five past:', past[:5])
    RESULTS.append((appt_dt, student, len(past)+1, appt.get('calendar'), appt.get('location')))
print('\nFINAL BRIEFING:')
for dt, student, lesson, instr, loc in RESULTS:
    print(f"{dt.strftime('%I:%M %p')} — {student} — Lesson #{lesson} — {instr} — {loc}")
