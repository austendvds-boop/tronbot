import os, json
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

TZ = ZoneInfo('America/Phoenix')

with open('secrets/calendar_oauth_tokens.json') as f:
    data = json.load(f)
creds = Credentials(
    token=data['token'],
    refresh_token=data['refresh_token'],
    token_uri=data['token_uri'],
    client_id=data['client_id'],
    client_secret=data['client_secret'],
    scopes=data['scopes']
)
service = build('calendar','v3',credentials=creds)
tomorrow = (datetime.now(TZ)+timedelta(days=1)).date()
time_min = datetime(tomorrow.year,tomorrow.month,tomorrow.day,0,0,0,tzinfo=TZ).isoformat()
time_max = datetime(tomorrow.year,tomorrow.month,tomorrow.day,23,59,59,tzinfo=TZ).isoformat()
calendar_id='54kkkbtqpoofldrtcsrifvtuv0@group.calendar.google.com'
res = service.events().list(calendarId=calendar_id,timeMin=time_min,timeMax=time_max,showDeleted=False,singleEvents=True,orderBy='startTime').execute()
for e in res.get('items',[]):
    start=e['start'].get('dateTime',e['start'].get('date'))
    end=e['end'].get('dateTime',e['end'].get('date'))
    print('Summary:',e.get('summary'))
    print('Start',start)
    print('End',end)
    if e.get('description'):
        print('Description',e.get('description'))
    print('-'*40)
