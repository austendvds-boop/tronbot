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
MAX_REQUESTS=60
MAX_RUNTIME=60
chunk_size_hours=14
MIN_CHUNK_HOURS=6
REQUEST_COUNT=0
start_time=time.time()

def log(msg):
    print(msg)

def fetch_chunk(start,end):
    global REQUEST_COUNT
    if REQUEST_COUNT>=MAX_REQUESTS:
        raise SystemExit('request cap reached')
    params={'minDate':start.strftime('%Y-%m-%dT%H:%M:%S%z'),
            'maxDate':end.strftime('%Y-%m-%dT%H:%M:%S%z'),
            'limit':100,'cancelled':'false'}
    url=f"{base_url}?{urllib.parse.urlencode(params)}"
    attempts=0
    backoff=1
    while attempts<3:
        REQUEST_COUNT+=1
        start_req=time.time()
        log(f"REQUEST start={params['minDate']} end={params['maxDate']}")
        try:
            req=urllib.request.Request(url,headers=headers)
            with urllib.request.urlopen(req, timeout=15) as resp:
                status=resp.getcode()
                payload=resp.read()
            elapsed=(time.time()-start_req)*1000
            batch=json.loads(payload)
            log(f"RESP status={status} elapsedMs={elapsed:.0f} bytes={len(payload)} count={len(batch)}")
            return batch,len(batch)
        except urllib.error.HTTPError as e:
            elapsed=(time.time()-start_req)*1000
            log(f"HTTPERROR {e.code} elapsedMs={elapsed:.0f}")
            if e.code==429:
                ra=e.headers.get('Retry-After')
                wait=int(ra) if ra and ra.isdigit() else backoff
                log(f"RATE LIMITED retry-after={ra}")
                time.sleep(wait)
                attempts+=1
                backoff*=2
                continue
            raise
        except urllib.error.URLError as e:
            elapsed=(time.time()-start_req)*1000
            log(f"URLERROR {e.reason} elapsedMs={elapsed:.0f}")
            attempts+=1
            time.sleep(backoff)
            backoff*=2
    raise SystemExit('requests retries exceeded')

def normalize_name(name):
    filtered=''.join(ch.lower() for ch in name if ch.isalnum() or ch.isspace())
    return ' '.join(filtered.split())

target_dt=datetime(2026,2,1,9,0,tzinfo=TZ)
history_end=target_dt
history_start=history_end-timedelta(days=365)
name_str='Hannah and Caleb Boyer'
parts=[part.strip() for part in name_str.replace('&',' and ').split(' and ')]
if len(parts)==1:
    parsed=[name_str]
else:
    surname=None
    for p in reversed(parts):
        tokens=p.split()
        if len(tokens)>1:
            surname=tokens[-1]
            break
    parsed=[]
    for p in parts:
        tokens=p.split()
        if len(tokens)==1 and surname:
            parsed.append(f"{tokens[0]} {surname}")
        else:
            parsed.append(p)
history_map={}
window_earliest=None
window_latest=None
appointments_earliest=None
appointments_latest=None
chunk_log_count=0
chunks=(0,0,0)
for person in parsed:
    cursor=history_start
    chunk_size=chunk_size_hours
    while cursor<history_end and time.time()-start_time<MAX_RUNTIME:
        local_chunk=chunk_size
        accepted=False
        while True:
            if local_chunk<MIN_CHUNK_HOURS:
                local_chunk=MIN_CHUNK_HOURS
            end=cursor+timedelta(hours=local_chunk)
            if end>history_end:
                end=history_end
            batch,count=fetch_chunk(cursor,end)
            window_earliest=min(window_earliest or cursor,cursor)
            window_latest=max(window_latest or end,end)
            if count<100 or local_chunk<=MIN_CHUNK_HOURS:
                for appt in batch:
                    history_map[appt['id']]=appt
                    dt=datetime.fromisoformat(appt['datetime']).astimezone(TZ)
                    if not appointments_earliest or dt<appointments_earliest:
                        appointments_earliest=dt
                    if not appointments_latest or dt>appointments_latest:
                        appointments_latest=dt
                cursor=end-timedelta(seconds=30)
                chunk_log_count+=1
                chunks=(chunks[0]+1,chunks[1],chunks[2])
                accepted=True
                break
            else:
                local_chunk=max(local_chunk/2,MIN_CHUNK_HOURS)
                chunks=(chunks[0],chunks[1]+1,chunks[2])
                if local_chunk==MIN_CHUNK_HOURS and count==100:
                    log(f"MIN_WINDOW_SATURATED start={cursor} end={end}")
                    for appt in batch:
                        history_map[appt['id']]=appt
                    cursor=end-timedelta(seconds=30)
                    chunk_log_count+=1
                    chunks=(chunks[0]+1,chunks[1],chunks[2]+1)
                    accepted=True
                    break
        if not accepted:
            break
    history_map_copy=list(history_map.values())
counted=[]
for appt in history_map_copy:
    name_key=normalize_name(f"{appt.get('firstName','')} {appt.get('lastName','')}")
    if name_key!=normalize_name(person):
        continue
    dt=datetime.fromisoformat(appt['datetime']).astimezone(TZ)
    if dt>=history_end:
        continue
    status=(appt.get('status') or '').strip().lower()
    if appt.get('cancelled') or appt.get('noShow') or appt.get('no_show') or status in {'cancelled','no-show','rescheduled'}:
        continue
    counted.append((appt['id'],dt.strftime('%Y-%m-%d %I:%M %p'),appt.get('calendar')))
lesson_num=len(counted)+1
lesson_entries=[(person,lesson_num) for person in parsed]
line='09:00 AM — '+', '.join(f"{name} (Lesson #{lesson})" for name,lesson in lesson_entries)+" — Austen — 5209 Stone Path Trail, Prescott 86301"
print(line)
print(f"targetAppointmentStart {history_end.isoformat()}")
print(f"historyStart {history_start.isoformat()}")
print(f"historyEnd {history_end.isoformat()}")
print(f"numberOfAcceptedChunks {chunk_log_count}")
print(f"windowCoverageEarliest {window_earliest.isoformat() if window_earliest else 'null'}")
print(f"windowCoverageLatest {window_latest.isoformat() if window_latest else 'null'}")
print(f"appointmentsEarliest {appointments_earliest.isoformat() if appointments_earliest else 'null'}")
print(f"appointmentsLatest {appointments_latest.isoformat() if appointments_latest else 'null'}")
print(f"requestsMade {REQUEST_COUNT}")
print(f"MIN_WINDOW_SATURATED events {chunks[2]}")
