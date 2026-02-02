import json, os, urllib.parse, urllib.request, base64, time
from datetime import datetime, timedelta, timezone

TZ_OFFSET = -7
LOCAL = timezone(timedelta(hours=TZ_OFFSET))
with open('secrets/acuity.json') as f:
    accounts=json.load(f)
account=accounts['accountA']
api_key=account['apiKey']
api_secret=account['apiSecret']
headers={'Authorization':'Basic '+base64.b64encode(f"{api_key}:{api_secret}".encode()).decode()}
base_url='https://acuityscheduling.com/api/v1/appointments'
minDate=datetime(2025,2,1,0,0,tzinfo=LOCAL)
maxDate=datetime(2026,2,1,23,59,59,tzinfo=LOCAL)
limit=100
chunk_hours=168
results={}

def fmt(dt):
    return dt.strftime('%Y-%m-%dT%H:%M:%S%z')

def log(msg):
    print(f"[{datetime.now(timezone.utc).isoformat()}Z] {msg}", flush=True)

def fetch(start,end):
    params={'minDate':fmt(start),'maxDate':fmt(end),'limit':limit,'cancelled':'false'}
    url=f"{base_url}?{urllib.parse.urlencode(params)}"
    attempt=0
    delay=1
    while True:
        start_req=time.time()
        log(f"REQUEST start={fmt(start)} end={fmt(end)}")
        try:
            req=urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=15) as resp:
                status=resp.getcode()
                payload=resp.read()
            elapsed=(time.time()-start_req)*1000
            log(f"RESPONSE status={status} elapsedMs={elapsed:.0f} bytes={len(payload)}")
            batch=json.loads(payload)
            log(f"countReturned={len(batch)}")
            return batch
        except urllib.error.HTTPError as e:
            elapsed=(time.time()-start_req)*1000
            log(f"HTTPERROR status={e.code} elapsedMs={elapsed:.0f}")
            if e.code==429 and attempt<3:
                ra=e.headers.get('Retry-After')
                wait=int(ra) if ra and ra.isdigit() else delay
                log(f"RATE LIMITED retry-after={ra}")
                time.sleep(wait)
                attempt+=1
                delay*=2
                continue
            raise
        except urllib.error.URLError as e:
            elapsed=(time.time()-start_req)*1000
            log(f"URLERROR {e.reason} elapsedMs={elapsed:.0f}")
            if attempt<3:
                log(f"TIMEOUT start={fmt(start)}")
                time.sleep(delay)
                attempt+=1
                delay*=2
                continue
            raise

start=minDate
while start<maxDate:
    end=start+timedelta(hours=chunk_hours)
    if end>maxDate:
        end=maxDate
    batch=fetch(start,end)
    if len(batch)==limit and chunk_hours>1:
        chunk_hours=max(chunk_hours/2,1)
        log(f"CAP HIT -> shrink chunk to {chunk_hours}h")
        continue
    if len(batch)==limit and chunk_hours==1:
        log(f"TOO MANY APPTS IN 1 HOUR start={fmt(start)} end={fmt(end)}")
    for appt in batch:
        results[appt['id']]=appt
    if len(batch)==0:
        break
    start=end-timedelta(minutes=1)
print('DONE totalUnique',len(results))
json.dump(results,list(open('memory/ali_hist.json','w')))
