import json, os, urllib.parse, urllib.request, base64, time
from datetime import datetime

with open('secrets/acuity.json') as f:
    accounts=json.load(f)
account=accounts['accountB']
api_key=account['apiKey']
api_secret=account['apiSecret']
base_url='https://acuityscheduling.com/api/v1/appointments'
limit=100
offset=0
max_pages=10
seen_offsets=set()
headers={'Authorization':'Basic '+base64.b64encode(f"{api_key}:{api_secret}".encode()).decode()}
minDate='2026-02-02'
maxDate='2026-02-03'
page=0
conn_token=f"{api_key}:{api_secret}"
logs=[]

def log(msg):
    print(f"[{datetime.utcnow().isoformat()}Z] {msg}")

def fetch_page(off):
    params={'minDate':minDate,'maxDate':maxDate,'limit':limit,'offset':off,'cancelled':'false'}
    url=f"{base_url}?{urllib.parse.urlencode(params)}"
    retry=0
    while retry<3:
        log(f"FETCH offset={off} limit={limit} minDate={minDate} maxDate={maxDate} url={url}")
        start=time.time()
        try:
            req=urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=15) as resp:
                status=resp.getcode()
                data_bytes=resp.read()
            elapsed=time.time()-start
            log(f"RESPONSE status={status} elapsed={elapsed*1000:.0f}ms bytes={len(data_bytes)}")
            parse_start=time.time()
            batch=json.loads(data_bytes)
            parse_elapsed=time.time()-parse_start
            if parse_elapsed>2:
                log(f"JSON PARSE SLOW {parse_elapsed:.2f}s")
            log(f"COUNTRETURNED={len(batch)}")
            return batch
        except urllib.error.HTTPError as e:
            status=e.code
            elapsed=time.time()-start
            log(f"RESPONSE status={status} elapsed={elapsed*1000:.0f}ms")
            if status==429:
                ra=e.headers.get('Retry-After')
                log(f"RATE LIMITED retry-after={ra}")
                time.sleep(int(ra) if ra and ra.isdigit() else 5)
                retry+=1
                continue
            raise
        except urllib.error.URLError as e:
            elapsed=time.time()-start
            log(f"ERROR {e} elapsed={elapsed*1000:.0f}ms")
            if isinstance(e.reason, TimeoutError) or 'timed out' in str(e.reason).lower():
                log(f"TIMEOUT offset={off}")
                retry+=1
                continue
            raise
    raise SystemExit(f"Failed after retries offset={off}")

while True:
    if offset in seen_offsets:
        log(f"OFFSET REPEATED offset={offset}")
        break
    seen_offsets.add(offset)
    batch=fetch_page(offset)
    if not batch:
        log(f"page offset={offset} countReturned=0 cumulative={offset}")
        break
    page+=1
    if page>max_pages:
        log('PAGE CAP HIT')
        break
    if len(batch)<limit:
        log(f"page offset={offset} countReturned={len(batch)} cumulative={offset+len(batch)}")
        offset+=limit
        break
    offset+=limit
log('DONE day fetch')
