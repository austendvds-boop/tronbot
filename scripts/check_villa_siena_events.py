#!/usr/bin/env python3
import json
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

# Timezone
TZ = ZoneInfo('America/Phoenix')

# Payment dates to check
dates = ['2025-06-28','2025-08-21','2025-10-15','2025-12-09','2026-02-03','2026-03-29','2026-05-23','2026-07-17','2026-09-10','2026-11-04']

# Load credentials
tokens = json.load(open('secrets/calendar_oauth_tokens.json'))
creds = Credentials(
    token=tokens['token'],
    refresh_token=tokens.get('refresh_token'),
    token_uri=tokens['token_uri'],
    client_id=tokens['client_id'],
    client_secret=tokens['client_secret'],
    scopes=tokens.get('scopes')
)
service = build('calendar','v3',credentials=creds)
calendar_id='54kkkbtqpoofldrtcsrifvtuv0@group.calendar.google.com'

print('Checking Villa Siena events on calendar...')
for date_str in dates:
    time_min = f'{date_str}T00:00:00-07:00'
    time_max = f'{date_str}T23:59:59-07:00'
    events = service.events().list(calendarId=calendar_id, timeMin=time_min, timeMax=time_max).execute().get('items', [])
    print(f'Date {date_str}:')
    if not events:
        print('  No events found.')
    else:
        for ev in events:
            print(f"  {ev.get('summary')} [{ev.get('id')}] @ {ev.get('start')}")
print('Done.')
