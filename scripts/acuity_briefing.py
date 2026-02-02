import json, os, urllib.parse, urllib.request, base64
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
import sys

SECRETS_PATH = os.path.join('secrets', 'acuity.json')

ACCOUNT_KEYS = {
    'austen': 'accountA',
    'dad': 'accountB'
}

TZ = ZoneInfo('America/Phoenix')

INVALID_STATUSES = {'cancelled', 'no-show', 'rescheduled', 'reschedule'}


def load_credentials(account_label):
    with open(SECRETS_PATH) as f:
        data = json.load(f)
    key = ACCOUNT_KEYS.get(account_label.lower())
    if not key:
        raise ValueError('unknown account')
    account = data[key]
    return account['apiKey'], account['apiSecret']


def fetch_appointments(api_key, api_secret, start, end):
    appointments = []
    offset = 0
    limit = 200
    while True:
        params = {
            'minDate': start,
            'maxDate': end,
            'limit': limit,
            'offset': offset,
            'cancelled': 'false'
        }
        url = f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
        token = f"{api_key}:{api_secret}"
        headers = {'Authorization': 'Basic ' + base64.b64encode(token.encode()).decode()}
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=60) as resp:
            batch = json.load(resp)
        if not batch:
            break
        appointments.extend(batch)
        if len(batch) < limit:
            break
        offset += len(batch)
    return appointments


def parse_datetime(appt):
    dt_str = appt.get('datetime') or appt.get('startDate') or appt.get('startAt')
    if not dt_str:
        return None
    try:
        return datetime.fromisoformat(dt_str).astimezone(TZ)
    except Exception:
        try:
            return datetime.fromisoformat(dt_str.replace('Z', '+00:00')).astimezone(TZ)
        except Exception:
            return None


def appointment_key(appt):
    email = (appt.get('email') or appt.get('clientEmail') or '').strip().lower()
    if email:
        return ('email', email)
    first = appt.get('firstName', '').strip().lower()
    last = appt.get('lastName', '').strip().lower()
    phone = ''.join(filter(str.isdigit, appt.get('phone', '')))
    if first or last:
        return ('name_phone', f"{first} {last}||{phone}")
    return ('placeholder', appt.get('id') or appt.get('datetime'))


def appointment_type_id(appt):
    return appt.get('appointmentTypeID') or appt.get('appointmentTypeId') or appt.get('typeID') or appt.get('typeId')


def is_completed(appt):
    if appt.get('cancelled') is True:
        return False
    status = (appt.get('status') or '').strip().lower()
    if status in INVALID_STATUSES:
        return False
    return True


def format_time(dt):
    if not dt:
        return 'UNKNOWN TIME'
    return dt.strftime('%I:%M %p').lstrip('0')


def main():
    args = sys.argv[1:]
    if len(args) < 2 or args[0].lower() not in ACCOUNT_KEYS:
        print('usage: python scripts/acuity_briefing.py <austen|dad> <YYYY-MM-DD>')
        return
    account_label = args[0].lower()
    target_date = args[1]
    try:
        target_dt = datetime.fromisoformat(target_date)
    except ValueError:
        print('invalid date')
        return
    target_day = target_dt.date()
    api_key, api_secret = load_credentials(account_label)

    history_start = (target_day.replace(year=target_day.year - 1) if target_day.year > 2021 else target_day).isoformat()
    # ensure at least 1 year of history, but not before 2024
    history_start = '2024-01-01'
    history_end = target_day.isoformat()
    all_appts = fetch_appointments(api_key, api_secret, history_start, history_end)

    target_appts = []
    for appt in all_appts:
        dt = parse_datetime(appt)
        if not dt:
            continue
        if dt.date() == target_day:
            target_appts.append((dt, appt))

    target_appts.sort(key=lambda x: x[0])

    for dt, appt in target_appts:
        student_key = appointment_key(appt)
        appt_type = appointment_type_id(appt)
        past_count = 0
        for past in all_appts:
            if not is_completed(past):
                continue
            past_dt = parse_datetime(past)
            if not past_dt:
                continue
            if past_dt >= dt:
                continue
            if appointment_key(past) != student_key:
                continue
            if appointment_type_id(past) != appt_type:
                continue
            past_count += 1
        lesson_number = past_count + 1
        student_name = f"{appt.get('firstName','').strip()} {appt.get('lastName','').strip()}".strip() or 'Unknown Student'
        time_str = format_time(dt)
        instructor = appt.get('calendar') or 'Unknown Instructor'
        location = appt.get('location') or appt.get('category') or 'Unknown Location'
        print(f"{time_str} — {student_name} — Lesson #{lesson_number} — {instructor} — {location}")

if __name__ == '__main__':
    main()
