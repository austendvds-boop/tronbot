import json, os, urllib.parse, urllib.request, base64, time
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

TZ = ZoneInfo('America/Phoenix')
with open('secrets/acuity.json') as f:
    accounts=json.load(f)
account=accounts['accountA']
api_key=account['apiKey']
api_secret=account['apiSecret']
headers={'Authorization':'Basic '+base64.b64encode(f"{api_key}:{api_secret}".encode()).decode()}
base_url='https://acuityscheduling.com/api/v1/appointments'

LIMIT=100
REQUEST_CAP=250
PER_STUDENT_CAP=10
TIME_CAP=8*60
last_request_time=0
request_count=0
start_time=time.time()


def log(msg):
    print(msg)

def do_request(params):
    global request_count
    if request_count>=REQUEST_CAP:
        raise RuntimeError('REQUEST_CAP_REACHED')
    attempt=0
    backoff=1
    while attempt<3:
        start=request_count
        request_count+=1
        start_t=time.time()
        params.update({'limit':LIMIT,'cancelled':'false'})
        url=f"{base_url}?{urllib.parse.urlencode(params)}"
        try:
            req=urllib.request.Request(url,headers=headers)
            with urllib.request.urlopen(req,timeout=15) as resp:
                status=resp.getcode()
                payload=resp.read()
            elapsed=(time.time()-start_t)*1000
            batch=json.loads(payload)
            log(f"REQ start={params['minDate']} end={params['maxDate']} status={status} elapsedMs={elapsed:.0f} count={len(batch)}")
            return batch
        except urllib.error.HTTPError as e:
            elapsed=(time.time()-start_t)*1000
            log(f"HTTPERROR {e.code} elapsedMs={elapsed:.0f}")
            if e.code==429:
                ra=e.headers.get('Retry-After')
                wait=int(ra) if ra and ra.isdigit() else backoff
                time.sleep(wait)
                attempt+=1
                backoff*=2
                continue
            raise
        except urllib.error.URLError as e:
            elapsed=(time.time()-start_t)*1000
            log(f"URLERROR {e.reason} elapsedMs={elapsed:.0f}")
            time.sleep(backoff)
            attempt+=1
            backoff*=2
    raise RuntimeError('MAX_RETRIES')


def normalized(name):
    filtered=''.join(ch.lower() for ch in name if ch.isalnum() or ch.isspace())
    return ' '.join(filtered.split())

def fetch_history(key_params,start,end):
    cursor=start
    chunk_hours=14
    collected={}
    chunks=0
    while cursor<end and time.time()-start_time<TIME_CAP:
        local_chunk=chunk_hours
        accepted=False
        while True:
            chunk_end=cursor+timedelta(hours=local_chunk)
            if chunk_end>end:
                chunk_end=end
            params={'minDate':chunk_end-timedelta(seconds=(chunk_end-cursor).total_seconds()),
                    'maxDate':chunk_end}
            params={'minDate':cursor.strftime('%Y-%m-%dT%H:%M:%S%z'),
                    'maxDate':chunk_end.strftime('%Y-%m-%dT%H:%M:%S%z')}
            params.update(key_params)
            batch=do_request(params)
            if len(batch)==LIMIT and local_chunk>6:
                local_chunk=max(local_chunk/2,6)
                continue
            if len(batch)==LIMIT and local_chunk==6:
                log(f"MIN_WINDOW_SATURATED start={params['minDate']} end={params['maxDate']}")
            for appt in batch:
                collected[appt['id']]=appt
            new_cursor=chunk_end-timedelta(seconds=30)
            if new_cursor<=cursor:
                log(f"NO_CURSOR_ADVANCE start={cursor} end={chunk_end}")
                return collected,chunks,chunk_end
            cursor=new_cursor
            chunks+=1
            accepted=True
            break
        if not accepted:
            break
    return collected,chunks,chunk_end


today=datetime.now(TZ).date()
start_day=datetime.combine(today,datetime.min.time()).replace(tzinfo=TZ)
end_day=start_day+timedelta(days=1)
params={'minDate':start_day.strftime('%Y-%m-%dT%H:%M:%S%z'),
        'maxDate':end_day.strftime('%Y-%m-%dT%H:%M:%S%z'),
        'cancelled':'false'}
day_batch=do_request(params)

results=[]
for appt in day_batch:
    if (appt.get('calendar') or '').strip().lower()!='austen':
        continue
    student_name=f"{appt.get('firstName','').strip()} {appt.get('lastName','').strip()}".strip()
    history_end=datetime.fromisoformat(appt['datetime']).astimezone(TZ)
    history_start=history_end-timedelta(days=365)
    key_params={}
    email=(appt.get('email') or '').strip().lower()
    if email:
        key_params['email']=email
        key_type='email'
    else:
        key_params['name']=normalized(student_name)
        key_type='name'
    try:
        history, chunks,_=fetch_history(key_params, history_start, history_end)
    except RuntimeError:
        results.append((appt, None, True))
        continue
    past=0
    for h in history.values():
        dt=datetime.fromisoformat(h['datetime']).astimezone(TZ)
        if dt>=history_end:
            continue
        status=(h.get('status') or '').strip().lower()
        if h.get('cancelled') or h.get('noShow') or h.get('no_show') or status in {'cancelled','no-show','rescheduled'}:
            continue
        key_match=key_type=='email' and (h.get('email') or '').strip().lower()==email
        key_match=key_match or (key_type=='name' and normalized(f"{h.get('firstName','')} {h.get('lastName','')}")==key_params.get('name'))
        if not key_match:
            continue
        past+=1
    lesson=past+1
    results.append((appt,lesson,False))

for appt,lesson,cap in results:
    student=f"{appt.get('firstName','').strip()} {appt.get('lastName','').strip()}".strip()
    line=f"{datetime.fromisoformat(appt['datetime']).astimezone(TZ).strftime('%I:%M %p')} — {student} — "
    if cap:
        line+=f"Lesson #? (history cap hit) — {appt.get('calendar')} — {appt.get('location')}"
    else:
        line+=f"Lesson #{lesson} — {appt.get('calendar')} — {appt.get('location')}"
    print(line)
