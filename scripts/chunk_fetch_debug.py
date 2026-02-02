import json, os, urllib.parse, urllib.request, base64, time
from datetime import datetime, timedelta, timezone

TZ_OFFSET = -7
LOCAL = timezone(timedelta(hours=TZ_OFFSET))
with open('secrets/acuity.json') as f:
    accounts = json.load(f)
api_key = accounts['accountB']['apiKey']
api_secret = accounts['accountB']['apiSecret']
headers = {'Authorization': 'Basic ' + base64.b64encode(f"{api_key}:{api_secret}".encode()).decode()}
base_url = 'https://acuityscheduling.com/api/v1/appointments'
minDate = datetime(2025,11,1,0,0,tzinfo=LOCAL)
maxDate = datetime(2026,2,3,23,59,59,tzinfo=LOCAL)
limit = 100
chunk_hours = 168
results = {}

def fmt(dt):
    return dt.strftime('%Y-%m-%dT%H:%M:%S%z')

def log(msg):
    print(f"[{datetime.now(timezone.utc).isoformat()}Z] {msg}", flush=True)

def fetch(start, end):
    params = {'minDate': fmt(start), 'maxDate': fmt(end), 'limit': limit, 'cancelled': 'false'}
    url = f"{base_url}?{urllib.parse.urlencode(params)}"
    attempt = 0
    delay = 1
    while True:
        start_req = time.time()
        log(f"REQUEST start={fmt(start)} end={fmt(end)} url={url}")
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=15) as resp:
                status = resp.getcode()
                payload = resp.read()
            elapsed = (time.time()-start_req)*1000
            log(f"RESPONSE status={status} elapsedMs={elapsed:.0f} bytes={len(payload)}")
            batch = json.loads(payload)
            log(f"countReturned={len(batch)}")
            return batch
        except urllib.error.HTTPError as e:
            elapsed = (time.time()-start_req)*1000
            log(f"HTTPERROR status={e.code} elapsedMs={elapsed:.0f}")
            if e.code == 429 and attempt < 3:
                ra = e.headers.get('Retry-After')
                wait = int(ra) if ra and ra.isdigit() else delay
                log(f"RATE LIMITED retry-after={ra}")
                time.sleep(wait)
                attempt += 1
                delay *= 2
                continue
            raise
        except urllib.error.URLError as e:
            elapsed = (time.time()-start_req)*1000
            log(f"URLERROR {e.reason} elapsedMs={elapsed:.0f}")
            if attempt < 3:
                log(f"TIMEOUT start={fmt(start)}")
                time.sleep(delay)
                attempt += 1
                delay *= 2
                continue
            raise

start = minDate
while start < maxDate:
    end = start + timedelta(hours=chunk_hours)
    if end > maxDate:
        end = maxDate
    batch = fetch(start, end)
    if len(batch) == limit and chunk_hours > 1:
        chunk_hours = max(chunk_hours/2, 1)
        log(f"CAP HIT -> shrink chunk to {chunk_hours}h")
        continue
    if len(batch) == limit and chunk_hours == 1:
        log(f"TOO MANY APPTS IN 1 HOUR start={fmt(start)} end={fmt(end)}")
    for appt in batch:
        results[appt['id']] = appt
    if len(batch) == 0:
        break
    overlap = timedelta(minutes=1)
    start = end - overlap
print('---DIAGNOSTICS---')
print(f"totalUnique {len(results)}")
if results:
    times = [datetime.fromisoformat(appt['datetime']).astimezone(LOCAL) for appt in results.values()]
    print(f"earliestDatetime {min(times).isoformat()}")
    print(f"latestDatetime {max(times).isoformat()}")
else:
    print('earliestDatetime None')
    print('latestDatetime None')
if 1605610711 in results:
    appt = results[1605610711]
    print(f"Jan6 found {appt['datetime']} {appt['calendar']}")
else:
    print('Jan6 not found')
from collections import Counter
counter = Counter(appt.get('calendar') or 'Unknown' for appt in results.values())
print('Top calendars:')
for cal,count in counter.most_common(10):
    print(f"{cal} => {count}")

print('\n--- LESSON CALCULATION (aliyeh mansouri) ---')
name_norm='aliyeh mansouri'
target_dt=datetime.fromisoformat('2026-02-02T14:30:00-07:00').astimezone(LOCAL)
counted=[]
for appt in results.values():
    fn=(appt.get('firstName') or '').strip().lower()
    ln=(appt.get('lastName') or '').strip().lower()
    if f"{fn} {ln}".strip()!=name_norm:
        continue
    dt=datetime.fromisoformat(appt['datetime']).astimezone(LOCAL)
    if dt>=target_dt:
        continue
    status=(appt.get('status') or '').strip().lower()
    if appt.get('cancelled') or appt.get('noShow') or appt.get('no_show') or status in {'cancelled','no-show'}:
        continue
    counted.append((appt['id'],dt.strftime('%Y-%m-%d %I:%M %p'),appt.get('calendar')))
counted.sort(key=lambda x:x[1])
lesson=len(counted)+1
print(f"Aliyeh Mansouri — Lesson #{lesson}")
print('Counted appointments:')
for row in counted:
    print('-',row)
