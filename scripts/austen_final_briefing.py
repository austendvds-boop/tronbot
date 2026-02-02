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
REQUEST_CAP=80
PER_STUDENT_CAP=10
TIME_CAP=90
start_time=time.time()
request_count=0

KB_SEP=timedelta(seconds=30)


def log(msg):
    print(msg)

def iso(dt):
    return dt.strftime('%Y-%m-%dT%H:%M:%S%z')

def do_request(params):
    global request_count
    if request_count>=REQUEST_CAP:
        raise RuntimeError('CAP HIT')
    attempt=0
    backoff=1
    while attempt<3:
        request_count+=1
        start=time.time()
        url=f"{base_url}?{urllib.parse.urlencode(params)}"
        try:
            req=urllib.request.Request(url,headers=headers)
            with urllib.request.urlopen(req,timeout=15) as resp:
                status=resp.getcode()
                data=resp.read()
            elapsed=(time.time()-start)*1000
            batch=json.loads(data)
            log(f"REQ start={params['minDate']} end={params['maxDate']} status={status} elapsedMs={elapsed:.0f} count={len(batch)}")
            return batch
        except urllib.error.HTTPError as e:
            elapsed=(time.time()-start)*1000
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
            elapsed=(time.time()-start)*1000
            log(f"URLERROR {e.reason} elapsedMs={elapsed:.0f}")
            attempt+=1
            time.sleep(backoff)
            backoff*=2
    raise RuntimeError('REQUEST RETRIES EXCEEDED')

def normalized_name(first,last):
    combined=f"{first} {last}".strip().lower()
    filtered=''.join(ch for ch in combined if ch.isalnum() or ch.isspace())
    return ' '.join(filtered.split())

def fetch_filtered_history(key_params,min_dt,max_dt):
    cursor=min_dt
    chunk_hours=14
    collected={}
    chunk_count=0
    windows=[]
    while cursor<max_dt and time.time()-start_time<TIME_CAP and request_count<REQUEST_CAP:
        local_chunk=chunk_hours
        accepted=False
        attempts=0
        while True:
            if local_chunk<6:
                local_chunk=6
            end=cursor+timedelta(hours=local_chunk)
            if end>max_dt:
                end=max_dt
            params={'minDate':iso(cursor),'maxDate':iso(end)}
            params.update(key_params)
            batch=do_request(params)
            windows.append((cursor,end,len(batch)))
            if len(batch)==100 and local_chunk>6:
                local_chunk=max(local_chunk/2,6)
                continue
            if len(batch)==100 and local_chunk==6:
                log(f"MIN_WINDOW_SATURATED start={iso(cursor)} end={iso(end)} count=100")
            for appt in batch:
                collected[appt['id']]=appt
            new_cursor=end-KB_SEP
            if new_cursor<=cursor:
                log(f"NO_CURSOR_ADVANCE start={iso(cursor)} end={iso(end)}")
                return collected,windows,chunk_count
            cursor=new_cursor
            chunk_count+=1
            accepted=True
            break
        if not accepted:
            break
    return collected,windows,chunk_count

today=datetime.now(TZ).date()
start_day=datetime.combine(today,datetime.min.time()).replace(tzinfo=TZ)
end_day=start_day+timedelta(days=1)
day_params={'minDate':iso(start_day),'maxDate':iso(end_day),'limit':100,'cancelled':'false'}
day_batch=do_request(day_params)

print('account: Austen')
print(f"dayRange: {iso(start_day)} -> {iso(end_day)}")
print('appointments returned',len(day_batch))
for appt in day_batch:
    calendar=appt.get('calendar') or ''
    if calendar.strip().lower()!='austen':
        continue
    time_str=datetime.fromisoformat(appt['datetime']).astimezone(TZ).strftime('%I:%M %p')
    email_present='Y' if appt.get('email') else 'N'
    phone_present='Y' if appt.get('phone') else 'N'
    print(f"{time_str}, {appt.get('firstName')} {appt.get('lastName')}, id={appt.get('id')}, emailPresent={email_present}, phonePresent={phone_present}, calendar={calendar}")

print('\n')
lesson_lines=[]
for appt in day_batch:
    if (appt.get('calendar') or '').strip().lower()!='austen':
        continue
    student=f"{appt.get('firstName') or ''} {appt.get('lastName') or ''}".strip()
    lesson_debug=None
    history=None
    # determine filter key
    key_params={}
    if appt.get('email'):
        key_params['email']=appt['email'].strip().lower()
        key_type='email'
    elif appt.get('phone'):
        key_params['phone']=appt['phone'].strip()
        key_type='phone'
    else:
        key_type='name'
    history_start=datetime.fromisoformat(appt['datetime']).astimezone(TZ)-timedelta(days=365)
    history_end=datetime.fromisoformat(appt['datetime']).astimezone(TZ)
    if key_type in ('email','phone'):
        history,windows,_=fetch_filtered_history(key_params,history_start,history_end)
        count=len(history)
        earliest=None
        latest=None
        for h in history.values():
            dt=datetime.fromisoformat(h['datetime']).astimezone(TZ)
            if dt>=history_end:
                continue
            if not earliest or dt<earliest:
                earliest=dt
            if not latest or dt>latest:
                latest=dt
        history_info=(count,earliest,latest,'email' if key_type=='email' else 'phone')
        if count==LIMIT:
            log('FILTER COUNT HIT 100, but not chunking per instructions (no chunk required)')
    else:
        # fallback 90d window
        history,windows,_=fetch_filtered_history({'name':student.lower()},history_end-timedelta(days=90),history_end)
        count=len(history)
        earliest=None
        latest=None
        for h in history.values():
            dt=datetime.fromisoformat(h['datetime']).astimezone(TZ)
            if dt>=history_end:
                continue
            if not earliest or dt<earliest:
                earliest=dt
            if not latest or dt>latest:
                latest=dt
        history_info=(count or 'unknown',earliest,latest,'name')
    past=0
    for h in history.values():
        dt=datetime.fromisoformat(h['datetime']).astimezone(TZ)
        if dt>=history_end:
            continue
        status=(h.get('status') or '').strip().lower()
        if h.get('cancelled') or h.get('noShow') or h.get('no_show') or status in {'cancelled','no-show','rescheduled'}:
            continue
        past+=1
    lesson=past+1 if isinstance(past,int) else '??'
    line=f"{datetime.fromisoformat(appt['datetime']).astimezone(TZ).strftime('%I:%M %p')} — {student} — Lesson #{lesson} — Austen — {appt.get('location')} — (id {appt.get('id')})"
    lesson_lines.append((line,lesson,history_info))

for line,lesson,info in lesson_lines:
    if lesson_lines and lesson==1:
        print(line)
        cnt,earliest,latest,keyUsed=info
        print(f"historyCount={cnt} historyEarliest={earliest.isoformat() if earliest else 'null'} historyLatest={latest.isoformat() if latest else 'null'} keyUsed={keyUsed}")
    else:
        print(line)
