import base64
from email.mime.text import MIMEText
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import os
import json

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
message=MIMEText('This is a test email from TronMeggabot.')
message['to']='austen.dvds@gmail.com'
message['from']='adrian.deervalleydrivingschool@gmail.com'
message['subject']='Test from TronMeggabot via OAuth'
raw=base64.urlsafe_b64encode(message.as_bytes()).decode()
service.users().messages().send(userId='me',body={'raw':raw}).execute()
print('Email sent!')
