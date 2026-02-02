import json, os, urllib.parse, urllib.request, base64
from datetime import datetime
from zoneinfo import ZoneInfo

TZ = ZoneInfo('America/Phoenix')
possible_status_exclude = {'cancelled','no-show'}

with open('secrets/acuity.json') as f:
    accounts = json.load(f)
account = accounts['accountB']
api_key = account['apiKey']
api_secret = account['apiSecret']

LIMIT = 200
START_DATE = '2024-01-01'
TARGET_DATE = '2026-02-02'
TARGET_ID = 1623578480


def auth_headers():
    token = f"{api_key}:{api_secret}"
    return {'Authorization': 'Basic ' + base64.b64encode(token.encode()).decode()}

def fetch_target():
    url = f"https://acuityscheduling.com/api/v1/appointments/{TARGET_ID}"
    req = urllib.request.Request(url, headers=auth_headers())
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.load(resp)

def fetch_history():
    offset = 0
    all_apps = []
    while True:
        params = {
            'minDate': START_DATE,
            'maxDate': TARGET_DATE,
            'limit': LIMIT,
            'offset': offset,
            'cancelled': 'false'
        }
        url = f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
        req = urllib.request.Request(url, headers=auth_headers())
        with urllib.request.urlopen(req, timeout=60) as resp:
            batch = json.load(resp)
        if not batch:
            break
        all_apps.extend(batch)
        if len(batch) < LIMIT:
            break
        offset += len(batch)
    return all_apps

def normalize_email(email):
    return (email or '').strip().lower() or None

def normalize_phone(phone):
    digits = ''.join(filter(str.isdigit, (phone or '')))
    if digits.startswith('1') and len(digits) > 10:
        digits = digits[1:]
    return digits or None

def normalized_name(appt):
    name = f"{appt.get('firstName','').strip()} {appt.get('lastName','').strip()}".strip().lower()
    if not name:
        return None
    filtered = ''.join(ch for ch in name if ch.isalnum() or ch.isspace()).strip()
    return ' '.join(filtered.split()) or None

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

target = fetch_target()
print('Target appointment:')
print('id', target.get('id'))
print('datetime', target.get('datetime'))
print('calendar', target.get('calendar'))
print('firstName', target.get('firstName'))
print('lastName', target.get('lastName'))
print('email', target.get('email'))
print('phone', target.get('phone'))
print('clientID fields:', {k: target.get(k) for k in ['clientID','clientId','client_reference_id','client.id']})
print('appointmentTypeID', target.get('appointmentTypeID') or target.get('appointmentTypeId'))
key_email = normalize_email(target.get('email'))
key_phone = normalize_phone(target.get('phone'))
key_name = normalized_name(target)
if target.get('clientID') or target.get('clientId') or target.get('client_reference_id'):
    if target.get('clientID'):
        key = ('client', str(target['clientID']))
    elif target.get('clientId'):
        key = ('client', str(target['clientId']))
    else:
        key = ('client', str(target.get('client_reference_id')))
else:
    key = ('name', key_name)
print('Norm name', key_name)
history = fetch_history()
print('History total entries fetched:', len(history))
# Build candidate sets
candidates = []
for appt in history:
    norm_name = normalized_name(appt)
    if norm_name == key_name:
        candidates.append(appt)
clusters = {}
for appt in candidates:
    email = normalize_email(appt.get('email'))
    phone = normalize_phone(appt.get('phone'))
    cluster_key = (email, phone)
    clusters.setdefault(cluster_key, []).append(appt)
print('Clusters found:', len(clusters))
# Determine target cluster
target_cluster_key = (key_email, key_phone)
if target_cluster_key not in clusters and key_email:
    possible_keys = [k for k in clusters if k[0]==key_email]
    target_cluster_key = possible_keys[0] if possible_keys else target_cluster_key
cluster = clusters.get(target_cluster_key, [])
if not cluster:
    print('POSSIBLE DUPLICATE NAME')
    for ck, group in clusters.items():
        print('Cluster', ck, 'size', len(group))
else:
    print('Target cluster size', len(cluster), 'key', target_cluster_key)
counted=[]
excluded=[]
target_dt = parse_dt(target.get('datetime'))
for appt in cluster:
    dt = parse_dt(appt.get('datetime'))
    if not dt or dt >= target_dt:
        continue
    status = (appt.get('status') or '').strip().lower()
    if appt.get('cancelled') or status in possible_status_exclude:
        excluded.append((appt,'canceled/no-show status'))
        continue
    counted.append(appt)
print('Past counted lessons:', len(counted))
for appt in counted:
    print('-', appt.get('id'), appt.get('datetime'), appt.get('calendar'), appt.get('email'), appt.get('phone'))
if excluded:
    print('Excluded appointments:')
    for appt, reason in excluded:
        print('-', appt.get('id'), reason)
print('Aliyeh Mansouri — Lesson #{}'.format(len(counted)+1))
print('Key used:', key)
