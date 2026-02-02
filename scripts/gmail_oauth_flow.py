#!/usr/bin/env python3
"""
Interactive OAuth 2.0 flow for Gmail to obtain scopes for managing labels and filters.
"""
import json
import os
from google_auth_oauthlib.flow import Flow

SCOPES = [
    'https://www.googleapis.com/auth/gmail.labels',
    'https://www.googleapis.com/auth/gmail.settings.basic'
]
CLIENT_SECRET_FILE = os.path.join('secrets', 'gmail_oauth_client.json')
TOKEN_FILE = os.path.join('secrets', 'gmail_oauth_tokens.json')

# Initialize the OAuth flow
flow = Flow.from_client_secrets_file(
    CLIENT_SECRET_FILE,
    scopes=SCOPES,
    redirect_uri='urn:ietf:wg:oauth:2.0:oob'
)

# Generate the authorization URL
auth_url, _ = flow.authorization_url(
    access_type='offline',
    include_granted_scopes=True,
    prompt='consent'
)
print("Go to this URL in your browser to authorize access:")
print(auth_url)

# Prompt user for the authorization code
code = input('Enter the authorization code: ').strip()
# Fetch and store the tokens
flow.fetch_token(code=code)
creds = flow.credentials
with open(TOKEN_FILE, 'w') as f:
    json.dump({
        'token': creds.token,
        'refresh_token': creds.refresh_token,
        'token_uri': creds.token_uri,
        'client_id': creds.client_id,
        'client_secret': creds.client_secret,
        'scopes': creds.scopes
    }, f, indent=2)
print(f"Gmail tokens saved to {TOKEN_FILE}")
