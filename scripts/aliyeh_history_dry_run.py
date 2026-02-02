import json, os, urllib.parse, urllib.request, base64, time
from datetime import datetime

with open('secrets/acuity.json') as f:
    accounts = json.load(f)
account = accounts['accountB']
api_key = account['apiKey']
api_secret = account['apiSecret']
base_url = 'https://acuityscheduling.com/api/v1/appointments'
limit = 100
max_pages = 20
minDate = '2025-11-01'
maxDate = '2026-02-03'
pos = 0
pages=0
cumulative=0
all_appts=[]
logs=[]
headers={'Authorization':'Basic '+base64.b64encode(f"{api_key}:{api_secret}".encode()).decode()}

def log(msg):
    print(f"[{datetime.utcnow().isoformat()}Z] {msg}")

def fetch(off):
    params={'minDate':minDate,'maxDate':maxDate,'limit':limit,'offset':off,'cancelled':'false'}
    url=f"{base_url}?{urllib.parse.urlencode(params)}"
    attempt=0
    while attempt<3:
        log(f"FETCH offset={off} limit={limit} minDate={minDate} maxDate={maxDate} url={url}")
        start=time.time()
        try:
            req=urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=15) as resp:
                status=resp.getcode()
                data=resp.read()
            elapsed_ms=(time.time()-start)*1000
            log(f"RESPONSE status={status} elapsedMs={elapsed_ms:.0f} bytes={len(data)}")
            batch=json.loads(data)
            log(f"COUNTRETURNED={len(batch)} cumulative={cumulative+len(batch)}")
            return status, elapsed_ms, len(data), batch
        except urllib.error.HTTPError as e:
            status=e.code
            elapsed_ms=(time.time()-start)*1000
            log(f"RESPONSE status={status} elapsedMs={elapsed_ms:.0f}")
            if status==429:
                ra=e.headers.get('Retry-After')
                log(f"RATE LIMITED retry-after={ra}")
                time.sleep(int(ra) if ra and ra.isdigit() else 5)
                attempt+=1
            else:
                raise
        except urllib.error.URLError as e:
            elapsed_ms=(time.time()-start)*1000
            log(f"ERROR {e.reason} elapsedMs={elapsed_ms:.0f}")
            if isinstance(e.reason, TimeoutError) or 'timed out' in str(e.reason).lower():
                log(f"TIMEOUT offset={off}")
                attempt+=1
                continue
            raise
    raise SystemExit('Failed after retries')

while True:
    if pages>=max_pages:
        log('PAGE CAP HIT')
        break
    status, elapsed, byte_len, batch = fetch(pos)
    pages+=1
    count=len(batch)
    cumulative+=count
    all_appts.extend(batch)
    if count==0:
        break
    pos+=limit
print('--- FETCH SUMMARY ---')
print('totalFetched',len(all_appts))
if all_appts:
    times=[datetime.fromisoformat(appt['datetime']).astimezone(datetime.now().astimezone().tzinfo) for appt in all_appts]
    print('earliestDatetime',min(times).isoformat())
    print('latestDatetime',max(times).isoformat())
else:
    print('earliestDatetime None')
    print('latestDatetime None')
print('\nMANSOURI MATCHES:')
matches=[appt for appt in all_appts if 'mansouri' in ((appt.get('firstName') or '')+ ' '+(appt.get('lastName') or '')).lower()]
for appt in matches:
    print(f"id {appt.get('id')} datetime {appt.get('datetime')} calendar {appt.get('calendar')} instructor {appt.get('calendar')} firstName {appt.get('firstName')} lastName {appt.get('lastName')} email {appt.get('email')} phone {appt.get('phone')} status {appt.get('status')} cancelled {appt.get('cancelled')} noShow {appt.get('noShow') or appt.get('no_show')}")
print('\nLooking for Jan 6 id=1605610711:')
print('found' if any(appt.get('id')==1605610711 for appt in all_appts) else 'not found')
