import base64, os, json
from email.mime.text import MIMEText
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

TO='78rkhoury@gmail.com'
FROM='adrian.deervalleydrivingschool@gmail.com'
SUBJECT='Quick note'
BODY=(
"Hey Ramy,\n\n"
"Just wanted to tell you I appreciate you, man. You’re my best friend, and it’s crazy to think we’ve been boys since 2007.\n\n"
"I’m grateful for all the years, all the laughs, and having you in my corner through everything.\n\n"
"Love you bro,\n"
"Austen\n"
)

with open(os.path.join('secrets','gmail_oauth_tokens.json')) as f:
    data=json.load(f)
creds=Credentials(
    token=data['token'],
    refresh_token=data['refresh_token'],
    token_uri=data['token_uri'],
    client_id=data['client_id'],
    client_secret=data['client_secret'],
    scopes=data['scopes']
)
service=build('gmail','v1',credentials=creds)
msg=MIMEText(BODY)
msg['to']=TO
msg['from']=FROM
msg['subject']=SUBJECT
raw=base64.urlsafe_b64encode(msg.as_bytes()).decode()
service.users().messages().send(userId='me',body={'raw':raw}).execute()
print('SENT')
