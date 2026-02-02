#!/usr/bin/env python3
"""
Create default Gmail labels and filters for adrian.deervalleydrivingschool@gmail.com.
"""
import json
import os
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

# Helper to load OAuth credentials for Gmail
TOKEN_PATH = os.path.join('secrets', 'gmail_oauth_tokens.json')
if not os.path.exists(TOKEN_PATH):
    raise FileNotFoundError(f"Gmail OAuth tokens not found at {TOKEN_PATH}")
tokens = json.load(open(TOKEN_PATH))
creds = Credentials(
    token=tokens['token'],
    refresh_token=tokens.get('refresh_token'),
    token_uri=tokens['token_uri'],
    client_id=tokens['client_id'],
    client_secret=tokens['client_secret'],
    scopes=tokens.get('scopes')
)
service = build('gmail', 'v1', credentials=creds)

# Define labels to ensure exist
label_names = [
    'Appointments',
    'Invoices',
    'Payments',
    'Newsletters',
    'Action Items'
]

# Fetch existing labels
existing = service.users().labels().list(userId='me').execute().get('labels', [])
existing_map = {lbl['name']: lbl['id'] for lbl in existing}

# Create missing labels, collect label IDs
label_ids = {}
for name in label_names:
    if name in existing_map:
        label_ids[name] = existing_map[name]
    else:
        body = {
            'name': name,
            'labelListVisibility': 'labelShow',
            'messageListVisibility': 'show'
        }
        created = service.users().labels().create(userId='me', body=body).execute()
        label_ids[name] = created['id']
        print(f"Created label: {name}")

# Define filter rules: criteria -> label
filter_defs = [
    # Automatically label scheduling emails
    {
        'criteria': {'from': '@acuityscheduling.com'},
        'action': {'addLabelIds': [label_ids['Appointments']]}
    },
    # Invoice mails
    {
        'criteria': {'query': 'subject:invoice OR subject:Invoice'},
        'action': {'addLabelIds': [label_ids['Invoices']]}
    },
    # Payment reminders or confirmations
    {
        'criteria': {'query': 'subject:payment OR subject:Payment'},
        'action': {'addLabelIds': [label_ids['Payments']]}
    },
    # Newsletters (using unsubscribe keyword)
    {
        'criteria': {'query': 'unsubscribe'},
        'action': {'addLabelIds': [label_ids['Newsletters']]}
    },
]

# Create filters
for fdef in filter_defs:
    service.users().settings().filters().create(userId='me', body=fdef).execute()
    crit = fdef['criteria']
    print(f"Created filter: {crit}")

print('Gmail labels and filters setup complete.')
