import os, json, base64
from email.mime.text import MIMEText
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

def load_credentials():
    path = os.path.join('secrets', 'gmail_oauth_tokens.json')
    with open(path) as f:
        tokens = json.load(f)
    creds = Credentials(
        token=tokens['token'],
        refresh_token=tokens['refresh_token'],
        token_uri=tokens['token_uri'],
        client_id=tokens['client_id'],
        client_secret=tokens['client_secret'],
        scopes=tokens['scopes']
    )
    return creds

creds = load_credentials()
service = build('gmail', 'v1', credentials=creds)
subject = 'Daily Update — 2026-02-02'
body = """
Good morning, Mr. Salazar,

Here are your lessons for 2026-02-02:

- 11:30 AM — Ezra Campos — Lesson #3 — 1605 E Juniper Ave, Phoenix, AZ
  Leave by [ETA pending — Google Maps key required] (ETA …m + 10m buffer)

- 02:30 PM — Aliyeh Mansouri — Lesson #3 — 1450 E Bell Rd, Phoenix, AZ
  Between lessons: [ETA pending — Google Maps key required]
  Leave by [ETA pending — Google Maps key required] (ETA …m + 10m buffer)

—TronMeggabot
"""
message = MIMEText(body.strip())
message['to'] = 'deervalleydrivingschool@gmail.com'
message['from'] = 'adrian.deervalleydrivingschool@gmail.com'
message['subject'] = subject
raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
service.users().messages().send(userId='me', body={'raw': raw}).execute()
print('Sent briefing email to www.deervalleyschool.com')
