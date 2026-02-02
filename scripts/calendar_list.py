import json, os
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

TOKEN_PATH = os.path.join('secrets', 'calendar_oauth_tokens.json')

def load_creds():
    data = json.load(open(TOKEN_PATH))
    return Credentials(
        token=data['token'],
        refresh_token=data.get('refresh_token'),
        token_uri=data['token_uri'],
        client_id=data['client_id'],
        client_secret=data['client_secret'],
        scopes=data.get('scopes')
    )

creds = load_creds()
service = build('calendar', 'v3', credentials=creds)
page_token = None
calendars = []
while True:
    response = service.calendarList().list(pageToken=page_token).execute()
    calendars.extend(response.get('items', []))
    page_token = response.get('nextPageToken')
    if not page_token:
        break
for cal in calendars:
    print(cal.get('summary'), cal.get('id'))
