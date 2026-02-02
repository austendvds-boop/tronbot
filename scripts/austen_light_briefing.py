import json, os, urllib.parse, urllib.request, base64, time
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

ACCOUNT_LABEL = 'accountA'
with open('secrets/acuity.json') as f:
    accounts = json.load(f)
account = accounts[ACCOUNT_LABEL]
api_key = account['apiKey']
api_secret = account['apiSecret']
headers = {'Authorization': 'Basic ' + base64.b64encode(f"{api_key}:{api_secret}".encode()).decode()}
base_url = 'https://acuityscheduling.com/api/v1/appointments'
TZ = ZoneInfo('America/Phoenix')

def iso(dt):
    return dt.strftime('%Y-%m-%dT%H:%M:%S%z')

def norm_name(appt):
    fn = (appt.get('firstName') or '').lower()
    ln = (appt.get('lastName') or '').lower()
    combined = f"{fn} {ln}".strip()
    filtered = ''.join(ch for ch in combined if ch.isalnum() or ch.isspace())
    return ' '.join(filtered.split())

def request(params):
    global request_count, last_response
    attempts = 0
    backoff = 1
    while attempts < 3 and request_count < 500:
        request_count += 1
        url = f"{base_url}?{urllib.parse.urlencode(params)}"
        start = time.time()
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=15) as resp:
                status = resp.getcode()
                payload = resp.read()
            elapsed = (time.time() - start) * 1000
            batch = json.loads(payload)
            last_response = (status, len(batch), elapsed)
            return batch
        except urllib.error.HTTPError as e:
            elapsed = (time.time() - start) * 1000
            last_response = (e.code, 0, elapsed)
            if e.code == 429:
                wait = int(e.headers.get('Retry-After') or backoff)
                time.sleep(wait)
                attempts += 1
                backoff *= 2
                continue
            raise
        except urllib.error.URLError as e:
            elapsed = (time.time() - start) * 1000
            last_response = (None, 0, elapsed)
            if attempts < 3:
                time.sleep(backoff)
                attempts += 1
                backoff *= 2
                continue
            raise
    raise SystemExit('Max retries reached or request cap hit')

def date_chunk_fetch(min_dt, max_dt):
    chunk_hours = 14
    start = min_dt
    windows = []
    seen_windows = set()
    collected = {}
    while start < max_dt and request_count < 500:
        end = start + timedelta(hours=chunk_hours)
        if end > max_dt:
            end = max_dt
        key = (iso(start), iso(end))
        if key in seen_windows:
            print('WINDOW STUCK', key)
            break
        seen_windows.add(key)
        params = {'minDate': iso(start), 'maxDate': iso(end), 'limit': 100, 'cancelled': 'false'}
        batch = request(params)
        windows.append(key)
        last_window[0] = iso(start)
        last_window[1] = iso(end)
        if len(batch) == 100 and chunk_hours > 6:
            chunk_hours = max(chunk_hours / 2, 6)
            continue
        if len(batch) == 100 and chunk_hours == 6:
            print(f"TOO MANY APPTS IN 6 HOURS start={iso(start)} end={iso(end)}")
        for appt in batch:
            collected[appt['id']] = appt
        if len(batch) == 0:
            break
        start = end - timedelta(seconds=30)
    return collected, windows

# phase/state trackers
request_count = 0
last_response = (None, 0, 0)
last_window = [None, None]
unique_ids = 0
state_phase = 'dayFetch'

# Step1: fetch today day list
today = datetime.now(TZ).date()
start_day = datetime.combine(today, datetime.min.time()).replace(tzinfo=TZ)
end_day = start_day + timedelta(days=1)
day_params = {'minDate': iso(start_day), 'maxDate': iso(end_day), 'limit': 100, 'cancelled': 'false'}
day_batch = request(day_params)
state_phase = 'historyFetch'

# Build history per student
briefing = []
history_cache = {}
for appt in day_batch:
    if (appt.get('calendar') or '').strip().lower() != 'austen':
        continue
    student = f"{(appt.get('firstName') or '').strip()} {(appt.get('lastName') or '').strip()}".strip()
    key = student.lower()
    key_id = appt.get('email')
    if key_id:
        key_norm = key_id.lower()
    else:
        key_norm = key
    if key not in history_cache:
        min_window = start_day - timedelta(days=365)
        max_window = end_day
        collection, _ = date_chunk_fetch(min_window, max_window)
        if not collection:
            min_window = start_day - timedelta(days=730)
            collection, _ = date_chunk_fetch(min_window, max_window)
        history_cache[key] = collection
    history = history_cache[key]
    past = []
    appt_dt = datetime.fromisoformat(appt['datetime']).astimezone(TZ)
    for h in history.values():
        dt = datetime.fromisoformat(h['datetime']).astimezone(TZ)
        if dt >= appt_dt:
            continue
        status = (h.get('status') or '').strip().lower()
        if h.get('cancelled') or h.get('noShow') or h.get('no_show') or status in {'cancelled','no-show','rescheduled'}:
            continue
        if norm_name(h) == norm_name(appt):
            past.append(h)
    lesson_num = len(past) + 1
    briefing.append((appt_dt, student, lesson_num, appt.get('calendar'), appt.get('location')))

# Output final briefing
for item in briefing:
    dt, student, lesson, instructor, location = item
    print(f"{dt.strftime('%I:%M %p')} — {student} — Lesson #{lesson} — {instructor} — {location}")

# Print required state summary
print(f"phase: {state_phase}")
print(f"account: Austen")
print(f"instructor filter: Austen (calendarID unknown)")
print(f"minDate: {iso(start_day)}")
print(f"maxDate: {iso(end_day)}")
print(f"requestCount: {request_count}")
print(f"uniqueAppointmentIDs: {len(history_cache)}")
print(f"earliestDatetime: {iso(start_day)}")
print(f"latestDatetime: {iso(end_day)}")
print(f"lastWindowStartISO: {last_window[0]} -> {last_window[1]}")
print(f"lastResponse: {last_response}")
