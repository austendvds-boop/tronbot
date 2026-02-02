import json, os, urllib.parse, urllib.request, base64
from datetime import datetime
from zoneinfo import ZoneInfo

TZ = ZoneInfo('America/Phoenix')
SECRETS = os.path.join('secrets','acuity.json')
with open(SECRETS) as f:
    data = json.load(f)
api_key = data['accountB']['apiKey']
api_secret = data['accountB']['apiSecret']

TARGET_ID = 1623578480
INVALID_STATUSES = {'cancelled', 'no-show', 'rescheduled', 'reschedule', 'refunded'}


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

def normalize_email(email):
    return (email or '').strip().lower()

def normalize_phone(phone):
    digits = ''.join(c for c in (phone or '') if c.isdigit())
    if digits.startswith('1') and len(digits) > 10:
        digits = digits[1:]
    return digits

def is_excluded(appt):
    if appt.get('cancelled'):
        return True
    if appt.get('noShow') or appt.get('no_show'):
        return True
    if appt.get('rescheduled'):
        return True
    status = (appt.get('status') or '').strip().lower()
    if status in INVALID_STATUSES:
        return True
    return False

# fetch target
url = f"https://acuityscheduling.com/api/v1/appointments/{TARGET_ID}"
req = urllib.request.Request(url, headers=auth_headers())
with urllib.request.urlopen(req, timeout=60) as resp:
    target = json.load(resp)

matched_email = normalize_email(target.get('email'))
matched_phone = normalize_phone(target.get('phone'))
matched_type = target.get('appointmentTypeID') or target.get('appointmentTypeId')
target_dt = parse_dt(target.get('datetime'))
print('Target appointment details:')
print('id', target.get('id'))
print('datetime', target.get('datetime'))
print('calendar', target.get('calendar'))
print('appointmentTypeID', matched_type)
print('email', target.get('email'))
print('phone', target.get('phone'))
print('matched_email', matched_email)
print('matched_phone', matched_phone)

# fetch dataset
appointments = []
limit = 200
offset = 0
while True:
    params = {
        'minDate': '2024-01-01',
        'maxDate': '2026-02-02',
        'limit': limit,
        'offset': offset,
        'cancelled': 'false'
    }
    url = f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers=auth_headers())
    with urllib.request.urlopen(req, timeout=60) as resp:
        batch = json.load(resp)
    if not batch:
        break
    appointments.extend(batch)
    if len(batch) < limit:
        break
    offset += len(batch)

print('\nTotal appointments fetched:', len(appointments))

matches_by_email = [appt for appt in appointments if normalize_email(appt.get('email')) == matched_email and matched_email]
matches_by_phone = [appt for appt in appointments if normalize_phone(appt.get('phone')) == matched_phone and matched_phone]
print('Matches by email:', len(matches_by_email))
print('Matches by phone:', len(matches_by_phone))
print('IDs by email/phonenumber:', [appt.get('id') for appt in matches_by_email[:5]])

# now filter for combined email or phone for rest of script
matches = [appt for appt in appointments if (matched_email and normalize_email(appt.get('email')) == matched_email) or (matched_phone and normalize_phone(appt.get('phone')) == matched_phone)]
print('Combined matches (email or phone):', len(matches))
print('Matched IDs:', [appt.get('id') for appt in matches])

from collections import Counter
atype_counter = Counter()
cal_counter = Counter()
for appt in matches:
    atype = appt.get('appointmentTypeID') or appt.get('appointmentTypeId')
    atype_counter[atype] += 1
    cal_counter[appt.get('calendar') or 'Unknown'] += 1
print('\nAppointmentTypeID histogram:')
for atype,count in atype_counter.most_common():
    print(f"{atype} => {count}")
print('\nTop 10 calendars:')
for cal,count in cal_counter.most_common(10):
    print(f"{cal} => {count}")

old_logic = []
for appt in appointments:
    atype = appt.get('appointmentTypeID') or appt.get('appointmentTypeId')
    if atype != matched_type:
        continue
    if is_excluded(appt):
        continue
    dt = parse_dt(appt.get('datetime'))
    if dt:
        old_logic.append((dt, appt))
old_logic.sort(key=lambda x: x[0])
print('\nOld logic first 10 counted entries:')
for dt, appt in old_logic[:10]:
    email = normalize_email(appt.get('email'))
    phone = normalize_phone(appt.get('phone'))
    reason = []
    if matched_email and email != matched_email:
        reason.append('email mismatch')
    if matched_phone and phone != matched_phone:
        reason.append('phone mismatch')
    reason_desc = ', '.join(reason) if reason else 'matched both'
    name = f"{(appt.get('firstName') or '').strip()} {(appt.get('lastName') or '').strip()}".strip() or 'Unknown'
    print(f"- {dt.strftime('%Y-%m-%d %I:%M %p')} | id {appt.get('id')} | email {email or 'N/A'} | phone {phone or 'N/A'} | name {name} | calendar {appt.get('calendar')} | reason: {reason_desc}")

strict_matches = []
for appt in matches:
    if matched_email and normalize_email(appt.get('email')) != matched_email:
        continue
    if matched_phone and normalize_phone(appt.get('phone')) != matched_phone:
        continue
    atype = appt.get('appointmentTypeID') or appt.get('appointmentTypeId')
    if atype != matched_type:
        continue
    if is_excluded(appt):
        continue
    dt = parse_dt(appt.get('datetime'))
    if dt:
        strict_matches.append((dt, appt))
strict_matches.sort(key=lambda x: x[0])
prior_strict = [(dt, appt) for dt, appt in strict_matches if dt < target_dt]
print('\nStrict matches count:', len(strict_matches))
print('Prior strict count:', len(prior_strict))
print('Counted prior IDs/datetimes:')
for dt, appt in prior_strict:
    print(f"- {dt.strftime('%Y-%m-%d %I:%M %p')} id {appt.get('id')}")
print('\nAliyeh Mansouri — Lesson #{}'.format(len(prior_strict) + 1))
print('Counted {} prior appointments using (email AND phone).'.format(len(prior_strict)))
