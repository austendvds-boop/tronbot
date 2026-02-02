#!/usr/bin/env python3
import json
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

# Timezone for event dates
TZ = ZoneInfo('America/Phoenix')

# Full payment schedule: label, date (MM/DD/YYYY), amount
payments = [
    ('Initial dep', '06/28/2025', 1000.00),
    ('Payment #1', '08/21/2025', 2385.42),
    ('Payment #2', '10/15/2025', 2385.42),
    ('Payment #3', '12/09/2025', 2385.42),
    ('Payment #4', '02/03/2026', 2385.42),
    ('Payment #5', '03/29/2026', 2385.42),
    ('Payment #6', '05/23/2026', 2385.42),
    ('Payment #7', '07/17/2026', 2385.42),
    ('Payment #8', '09/10/2026', 2385.42),
    ('Payment #9', '11/04/2026', 2385.42),  # Due upon receipt of final invoice
    ('Payment #10 (invoice)', '11/04/2026', 2385.42),
]

# Load OAuth tokens from secrets/calendar_oauth_tokens.json
with open('secrets/calendar_oauth_tokens.json') as f:
    tokens = json.load(f)
creds = Credentials(
    token=tokens['token'],
    refresh_token=tokens.get('refresh_token'),
    token_uri=tokens['token_uri'],
    client_id=tokens['client_id'],
    client_secret=tokens['client_secret'],
    scopes=tokens.get('scopes')
)
# Build Calendar API service
service = build('calendar', 'v3', credentials=creds)

# Target calendar ID for DVDSE Austen
calendar_id = '54kkkbtqpoofldrtcsrifvtuv0@group.calendar.google.com'

print('Adding Villa Siena payment schedule to calendar...')
for label, due, amount in payments:
    # Parse date and format for all-day event
    dt = datetime.strptime(due, '%m/%d/%Y')
    date_str = dt.strftime('%Y-%m-%d')
    date_end = (dt + timedelta(days=1)).strftime('%Y-%m-%d')
    summary = f'{label} — ${amount:,.2f}'
    description = 'Villa Siena payment schedule entry'
    event = {
        'summary': summary,
        'description': description,
        'transparency': 'transparent',
        'start': {'date': date_str, 'timeZone': 'America/Phoenix'},
        'end': {'date': date_end, 'timeZone': 'America/Phoenix'},
        'visibility': 'private'
    }
    # Remove any existing matching events on that date
    time_min = f'{date_str}T00:00:00-07:00'
    time_max = f'{date_str}T23:59:59-07:00'
    existing = service.events().list(
        calendarId=calendar_id,
        timeMin=time_min,
        timeMax=time_max,
        q=label
    ).execute()
    for ev in existing.get('items', []):
        service.events().delete(calendarId=calendar_id, eventId=ev['id']).execute()
    # Insert new event
    service.events().insert(calendarId=calendar_id, body=event).execute()
    print(f'Added: {summary} on {date_str}')
print('Done.')
