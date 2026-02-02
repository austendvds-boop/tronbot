import json
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

TZ = ZoneInfo('America/Phoenix')
payments = [
    (4, '02/02/26', 2385.42),
    (5, '03/29/26', 2385.42),
    (6, '05/23/26', 2385.42),
    (7, '07/17/26', 2385.42),
    (8, '09/10/26', 2385.42),
    (9, '11/04/26', 2385.42),
]

with open('secrets/calendar_oauth_tokens.json') as f:
    tokens = json.load(f)
creds = Credentials(
    token=tokens['token'],
    refresh_token=tokens['refresh_token'],
    token_uri=tokens['token_uri'],
    client_id=tokens['client_id'],
    client_secret=tokens['client_secret'],
    scopes=tokens['scopes']
)
service = build('calendar','v3',credentials=creds)
calendar_id='54kkkbtqpoofldrtcsrifvtuv0@group.calendar.google.com'

print('Adding payments...')
for idx,due,amount in payments:
    date = datetime.strptime(due, '%m/%d/%y')
    date_str = date.strftime('%Y-%m-%d')
    date_end = (date + timedelta(days=1)).strftime('%Y-%m-%d')
    event = {
        'summary': f'Payment #{idx} due (${amount:,.2f})',
        'description': 'Villa Siena payment schedule entry',
        'transparency': 'transparent',
        'start': {'date': date_str},
        'end': {'date': date_end},
        'visibility': 'private'
    }
    existing = service.events().list(calendarId=calendar_id,timeMin=date_str+'T00:00:00-07:00',timeMax=date_str+'T23:59:59-07:00',q=f'Payment #{idx} due').execute()
    if existing.get('items'):
        for ev in existing['items']:
            service.events().delete(calendarId=calendar_id,eventId=ev['id']).execute()
    service.events().insert(calendarId=calendar_id,body=event).execute()
    print(f'Added Payment #{idx} {due} (all-day transparent)')
