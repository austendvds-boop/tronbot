import os, json, base64, math, urllib.parse, urllib.request, html
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

TZ = ZoneInfo('America/Phoenix')
ACUITY_BASE = 'https://acuityscheduling.com/api/v1/appointments'
GOOGLE_DIRECTIONS = 'https://maps.googleapis.com/maps/api/directions/json'

BUFFER_MIN = 10

# Recipients
DAD_TO = 'deervalleydrivingschool@gmail.com'      # Mr. Salazar
MOM_TO = 'mysalazar7@gmail.com'                    # Mrs. Salazar
FROM_EMAIL = 'adrian.deervalleydrivingschool@gmail.com'

# Origins (never printed)
ORIGINS = {
    'Dad': '35619 N 34th Ave, Phoenix, AZ 85086',
    'Michelle': '35619 N 34th Ave, Phoenix, AZ 85086'
}

CANCELLED_STATUSES = {'cancelled','no-show','rescheduled','reschedule','refunded'}


def _load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


def _basic_auth_header(api_key, api_secret):
    token = f"{api_key}:{api_secret}".encode()
    return {'Authorization': 'Basic ' + base64.b64encode(token).decode()}


def iso(dt):
    return dt.strftime('%Y-%m-%dT%H:%M:%S%z')


def parse_dt(s):
    if not s:
        return None
    try:
        return datetime.fromisoformat(s).astimezone(TZ)
    except Exception:
        try:
            return datetime.fromisoformat(s.replace('Z', '+00:00')).astimezone(TZ)
        except Exception:
            return None


def is_confirmed(appt):
    status = (appt.get('status') or '').strip().lower()
    if status in CANCELLED_STATUSES:
        return False
    if appt.get('cancelled'):
        return False
    if appt.get('noShow') or appt.get('no_show'):
        return False
    if appt.get('rescheduled') or appt.get('reschedule'):
        return False
    return True


def acuity_fetch_day(account_key, date_local):
    secrets = _load_json(os.path.join('secrets','acuity.json'))
    acct = secrets[account_key]
    headers = _basic_auth_header(acct['apiKey'], acct['apiSecret'])

    day_start = datetime(date_local.year, date_local.month, date_local.day, 0, 0, 0, tzinfo=TZ)
    day_end = day_start + timedelta(days=1)

    params = {
        'minDate': iso(day_start),
        'maxDate': iso(day_end),
        'limit': 100,
        'cancelled': 'false'
    }
    url = ACUITY_BASE + '?' + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.load(resp)


def student_identity(appt):
    client_id = appt.get('clientID') or appt.get('clientId')
    if client_id:
        return ('clientId', str(client_id))
    email_addr = (appt.get('email') or '').strip().lower()
    if email_addr:
        return ('email', email_addr)
    phone = ''.join(ch for ch in (appt.get('phone') or '') if ch.isdigit())
    full = f"{(appt.get('firstName') or '').strip()} {(appt.get('lastName') or '').strip()}".strip()
    if phone and full:
        return ('phoneName', (phone, full.lower()))
    if full:
        return ('name', full.lower())
    return (None, None)


def history_params(identity):
    kind, val = identity
    if kind == 'clientId':
        return {'clientId': val}
    if kind == 'email':
        return {'email': val}
    if kind == 'phoneName':
        phone, name = val
        return {'phone': phone, 'name': name}
    if kind == 'name':
        return {'name': val}
    return None


def acuity_fetch_history_dad(until_dt, identity, appointment_type_id=None):
    # Dad account only
    params_extra = history_params(identity)
    if not params_extra:
        raise RuntimeError('no identity')

    start = until_dt - timedelta(days=365)

    secrets = _load_json(os.path.join('secrets','acuity.json'))
    acct = secrets['accountB']
    headers = _basic_auth_header(acct['apiKey'], acct['apiSecret'])

    params = {
        'minDate': iso(start),
        'maxDate': iso(until_dt),
        'limit': 100,
        'cancelled': 'false'
    }
    params.update(params_extra)

    url = ACUITY_BASE + '?' + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=30) as resp:
        batch = json.load(resp)

    if appointment_type_id:
        out = []
        for a in batch:
            tid = a.get('appointmentTypeID') or a.get('appointmentTypeId')
            if tid and str(tid) != str(appointment_type_id):
                continue
            out.append(a)
        return out

    return batch


def lesson_number_dad(appt):
    appt_dt = parse_dt(appt.get('datetime'))
    if not appt_dt:
        raise RuntimeError('bad datetime')

    identity = student_identity(appt)
    if not identity[0]:
        raise RuntimeError('no identity')

    appt_type = appt.get('appointmentTypeID') or appt.get('appointmentTypeId')
    history = acuity_fetch_history_dad(appt_dt, identity, appointment_type_id=appt_type)

    past = 0
    for h in history:
        hdt = parse_dt(h.get('datetime'))
        if not hdt or hdt >= appt_dt:
            continue
        if not is_confirmed(h):
            continue
        past += 1

    return past + 1


def load_google_maps_key():
    key = os.environ.get('GOOGLE_MAPS_API_KEY')
    if key:
        return key
    p = os.path.join('secrets', 'google_maps_api_key.txt')
    if os.path.exists(p):
        with open(p, 'r', encoding='utf-8') as f:
            return f.read().strip()
    return None


def google_eta_minutes(origin, destination, depart_at):
    key = load_google_maps_key()
    if not key:
        return None
    params = {
        'origin': origin,
        'destination': destination,
        'departure_time': int(depart_at.timestamp()),
        'traffic_model': 'best_guess',
        'key': key
    }
    url = GOOGLE_DIRECTIONS + '?' + urllib.parse.urlencode(params)
    with urllib.request.urlopen(url, timeout=30) as resp:
        payload = json.load(resp)
    if payload.get('status') != 'OK':
        return None
    routes = payload.get('routes') or []
    if not routes:
        return None
    legs = routes[0].get('legs') or []
    if not legs:
        return None
    dur = legs[0].get('duration_in_traffic') or legs[0].get('duration')
    if not dur or 'value' not in dur:
        return None
    return int(math.ceil(dur['value'] / 60))


def open_meteo_phoenix_forecast(date_local):
    params = {
        'latitude': 33.4484,
        'longitude': -112.0740,
        'daily': 'weathercode,temperature_2m_max,temperature_2m_min',
        'temperature_unit': 'fahrenheit',
        'timezone': 'America/Phoenix',
        'start_date': date_local.isoformat(),
        'end_date': date_local.isoformat()
    }
    url = 'https://api.open-meteo.com/v1/forecast?' + urllib.parse.urlencode(params)
    with urllib.request.urlopen(url, timeout=30) as resp:
        data = json.load(resp)
    daily = (data.get('daily') or {})
    tmax = (daily.get('temperature_2m_max') or [None])[0]
    tmin = (daily.get('temperature_2m_min') or [None])[0]
    if tmax is None or tmin is None:
        return None
    return f"Weather for Phoenix, AZ: Low {int(round(tmin))}°F / High {int(round(tmax))}°F."


def nba_suns_score_if_played(yesterday_local):
    date_str = yesterday_local.strftime('%Y%m%d')
    url = f"https://site.web.api.espn.com/apis/v2/sports/basketball/nba/scoreboard?dates={date_str}"
    try:
        with urllib.request.urlopen(url, timeout=30) as resp:
            data = json.load(resp)
    except Exception:
        return None

    events = data.get('events') or []
    for ev in events:
        comps = (ev.get('competitions') or [])
        if not comps:
            continue
        comp = comps[0]
        competitors = comp.get('competitors') or []
        team_names = [((c.get('team') or {}).get('displayName') or '').lower() for c in competitors]
        if not any('phoenix suns' == n for n in team_names):
            continue
        lines = []
        for c in competitors:
            team = (c.get('team') or {}).get('displayName')
            score = c.get('score')
            home_away = c.get('homeAway')
            if team and score is not None:
                lines.append((home_away, team, score))
        if len(lines) == 2:
            lines.sort(key=lambda x: 0 if x[0] == 'home' else 1)
            return f"Suns: {lines[0][1]} {lines[0][2]} – {lines[1][1]} {lines[1][2]}"
        return None
    return None


def compute_leave_by(appt_dt, origin, destination, depart_anchor=None):
    if not origin or not destination:
        return (None, None)
    now = datetime.now(TZ)
    depart_at = depart_anchor or max(now, appt_dt - timedelta(minutes=90))
    eta = google_eta_minutes(origin, destination, depart_at)
    if eta is None:
        return (None, None)
    leave_by = appt_dt - timedelta(minutes=eta + BUFFER_MIN)
    return (leave_by, eta)


def build_gmail_service():
    tokens = _load_json(os.path.join('secrets','gmail_oauth_tokens.json'))
    creds = Credentials(
        token=tokens['token'],
        refresh_token=tokens['refresh_token'],
        token_uri=tokens['token_uri'],
        client_id=tokens['client_id'],
        client_secret=tokens['client_secret'],
        scopes=tokens['scopes'],
    )
    return build('gmail', 'v1', credentials=creds)


def send_email(service, to_addr, subject, text_body, html_body):
    msg = MIMEMultipart('alternative')
    msg['to'] = to_addr
    msg['from'] = FROM_EMAIL
    msg['subject'] = subject
    msg.attach(MIMEText(text_body, 'plain', 'utf-8'))
    msg.attach(MIMEText(html_body, 'html', 'utf-8'))
    raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
    service.users().messages().send(userId='me', body={'raw': raw}).execute()


def render_email_html(title, subtitle_lines, greeting, lessons, signature, accent='#0B3D91'):
    # lessons: list of dicts {time, student, lesson_no, location, leave_by, eta, between_eta}
    def esc(x):
        return html.escape(x or '')

    subtitle_html = ''.join(f"<div style='color:#334155;font-size:14px;line-height:1.4;margin:2px 0;'>{esc(l)}</div>" for l in subtitle_lines if l)

    lesson_cards = []
    for l in lessons:
        leave_html = ''
        if l.get('leave_by') and l.get('eta') is not None:
            leave_html = (
                f"<div style='margin-top:8px;color:#0f172a;'>"
                f"<span style='display:inline-block;background:#ecfeff;border:1px solid #a5f3fc;color:#155e75;"
                f"padding:6px 10px;border-radius:999px;font-size:13px;font-weight:600;'>"
                f"Leave by {esc(l['leave_by'])} ({esc(str(l['eta']))} min travel)"
                f"</span></div>"
            )
        between_html = ''
        if l.get('between_eta') is not None:
            between_html = (
                f"<div style='margin-top:8px;color:#334155;font-size:13px;'>Between lessons: {esc(str(l['between_eta']))}m</div>"
            )

        lesson_cards.append(
            f"<div style='background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;padding:14px 16px;margin:12px 0;'>"
            f"<div style='font-size:14px;color:#64748b;font-weight:600;'>{esc(l['time'])}</div>"
            f"<div style='font-size:18px;color:#0f172a;font-weight:800;margin-top:2px;'>{esc(l['student'])}</div>"
            f"<div style='font-size:14px;color:#0f172a;margin-top:4px;'><strong>Lesson #{esc(str(l['lesson_no']))}</strong></div>"
            f"<div style='font-size:14px;color:#334155;margin-top:6px;'>{esc(l['location'])}</div>"
            f"{between_html}{leave_html}"
            f"</div>"
        )

    lessons_html = ''.join(lesson_cards) if lesson_cards else "<div style='color:#334155;'>No lessons scheduled.</div>"

    return f"""<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f1f5f9;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
    <div style="max-width:680px;margin:0 auto;padding:24px;">
      <div style="background:{accent};border-radius:18px;padding:18px 18px 16px 18px;color:#fff;">
        <div style="font-size:20px;font-weight:800;letter-spacing:0.2px;">{esc(title)}</div>
        {subtitle_html}
      </div>

      <div style="padding:16px 4px 0 4px;">
        <div style="font-size:16px;color:#0f172a;font-weight:700;margin:4px 0 10px 0;">{esc(greeting)}</div>
        {lessons_html}

        <div style="margin-top:18px;color:#0f172a;font-weight:700;">{esc(signature)}</div>
      </div>
    </div>
  </body>
</html>"""


def render_email_text(subtitle_lines, greeting, lessons, signature):
    lines = []
    for l in subtitle_lines:
        if l:
            lines.append(l)
    if subtitle_lines:
        lines.append('')
    lines.append(greeting)
    lines.append('')
    for le in lessons:
        lines.append(f"- {le['time']} — {le['student']} — Lesson #{le['lesson_no']} — {le['location']}")
        if le.get('between_eta') is not None:
            lines.append(f"  Between lessons: {le['between_eta']}m")
        if le.get('leave_by') and le.get('eta') is not None:
            lines.append(f"  Leave by {le['leave_by']} ({le['eta']} min travel)")
        lines.append('')
    lines.append(signature)
    return '\n'.join(lines).strip() + '\n'


def main(send=False):
    now = datetime.now(TZ)
    tomorrow = (now + timedelta(days=1)).date()
    yesterday = (now - timedelta(days=1)).date()

    day = acuity_fetch_day('accountB', tomorrow)

    ernie = []
    michelle = []
    for appt in day:
        cal = (appt.get('calendar') or '').strip().lower()
        dt = parse_dt(appt.get('datetime'))
        if not dt:
            continue
        if cal == 'ernie':
            ernie.append((dt, appt))
        elif cal == 'michelle':
            michelle.append((dt, appt))

    ernie.sort(key=lambda x: x[0])
    michelle.sort(key=lambda x: x[0])

    if not ernie and not michelle:
        print('No Ernie or Michelle lessons tomorrow; no emails sent.')
        return

    service = build_gmail_service()
    subject = f"Daily Update — {tomorrow.isoformat()}"

    weather_line = None
    try:
        weather_line = open_meteo_phoenix_forecast(tomorrow)
    except Exception:
        weather_line = None

    signature = '-your AI Grandson TronMeggabot'

    # Dad email (Ernie-only)
    if ernie:
        subtitle = []
        if weather_line:
            subtitle.append(weather_line)
        suns_line = nba_suns_score_if_played(yesterday)
        if suns_line:
            subtitle.append(suns_line)

        greeting = 'Good morning, Mr. Salazar,'

        lessons = []
        origin = ORIGINS.get('Dad')
        prev_loc = None
        prev_end = None
        for idx, (dt, appt) in enumerate(ernie):
            student = f"{(appt.get('firstName') or '').strip()} {(appt.get('lastName') or '').strip()}".strip() or (appt.get('email') or 'Unknown Student')
            location = (appt.get('location') or appt.get('category') or '').strip() or None
            if not location:
                loc_text = '(Missing address — cannot compute leave time)'
            else:
                loc_text = location

            lesson_no = lesson_number_dad(appt)

            between_eta = None
            depart_anchor = None
            if idx > 0 and prev_loc and location:
                depart_anchor = prev_end
                between_eta = google_eta_minutes(prev_loc, location, depart_anchor)

            # compute leave_by/eta
            used_origin = origin if idx == 0 else (prev_loc or origin)
            leave_by_dt, eta = compute_leave_by(dt, used_origin, location, depart_anchor=depart_anchor)
            leave_by = leave_by_dt.strftime('%I:%M %p').lstrip('0') if leave_by_dt else None

            lessons.append({
                'time': dt.strftime('%I:%M %p').lstrip('0'),
                'student': student,
                'lesson_no': lesson_no,
                'location': loc_text,
                'leave_by': leave_by,
                'eta': eta,
                'between_eta': between_eta,
            })

            prev_loc = location
            dur = appt.get('duration') or appt.get('length')
            dur_min = int(dur) if str(dur).isdigit() else 150
            prev_end = dt + timedelta(minutes=dur_min)

        text_body = render_email_text(subtitle, greeting, lessons, signature)
        html_body = render_email_html(
            title=f"Daily Update — {tomorrow.isoformat()}",
            subtitle_lines=subtitle,
            greeting=greeting,
            lessons=lessons,
            signature=signature,
            accent='#0B3D91'
        )
        if send:
            send_email(service, DAD_TO, subject, text_body, html_body)
            print('Sent Dad email')
        else:
            print('DRY_RUN Dad email (not sent)')
            print(text_body)

    # Mom email (Michelle-only)
    if michelle:
        subtitle = ['“Commit your work to the Lord, and your plans will be established.” — Proverbs 16:3']
        if weather_line:
            subtitle.append(weather_line)

        greeting = 'Good morning, Mrs. Salazar,'

        lessons = []
        origin = ORIGINS.get('Michelle')
        prev_loc = None
        prev_end = None
        for idx, (dt, appt) in enumerate(michelle):
            student = f"{(appt.get('firstName') or '').strip()} {(appt.get('lastName') or '').strip()}".strip() or (appt.get('email') or 'Unknown Student')
            location = (appt.get('location') or appt.get('category') or '').strip() or None
            if not location:
                loc_text = '(Missing address — cannot compute leave time)'
            else:
                loc_text = location

            lesson_no = lesson_number_dad(appt)

            between_eta = None
            depart_anchor = None
            if idx > 0 and prev_loc and location:
                depart_anchor = prev_end
                between_eta = google_eta_minutes(prev_loc, location, depart_anchor)

            used_origin = origin if idx == 0 else (prev_loc or origin)
            leave_by_dt, eta = compute_leave_by(dt, used_origin, location, depart_anchor=depart_anchor)
            leave_by = leave_by_dt.strftime('%I:%M %p').lstrip('0') if leave_by_dt else None

            lessons.append({
                'time': dt.strftime('%I:%M %p').lstrip('0'),
                'student': student,
                'lesson_no': lesson_no,
                'location': loc_text,
                'leave_by': leave_by,
                'eta': eta,
                'between_eta': between_eta,
            })

            prev_loc = location
            dur = appt.get('duration') or appt.get('length')
            dur_min = int(dur) if str(dur).isdigit() else 150
            prev_end = dt + timedelta(minutes=dur_min)

        text_body = render_email_text(subtitle, greeting, lessons, signature)
        html_body = render_email_html(
            title=f"Daily Update — {tomorrow.isoformat()}",
            subtitle_lines=subtitle,
            greeting=greeting,
            lessons=lessons,
            signature=signature,
            accent='#7C3AED'
        )
        if send:
            send_email(service, MOM_TO, subject, text_body, html_body)
            print('Sent Mom email')
        else:
            print('DRY_RUN Mom email (not sent)')
            print(text_body)


if __name__ == '__main__':
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument('--send', action='store_true', help='Actually send emails. Default is dry-run (prints drafts only).')
    args = ap.parse_args()
    main(send=args.send)
