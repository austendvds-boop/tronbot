import json, os
from google_auth_oauthlib.flow import Flow

SCOPES = [
    "https://www.googleapis.com/auth/calendar.readonly",
    "https://www.googleapis.com/auth/calendar.events"
]
CLIENT_SECRET_FILE = os.path.join("secrets", "gmail_oauth_client.json")
TOKEN_FILE = os.path.join("secrets", "calendar_oauth_tokens.json")

flow = Flow.from_client_secrets_file(CLIENT_SECRET_FILE, scopes=SCOPES, redirect_uri="urn:ietf:wg:oauth:2.0:oob")
code = "4/1ASc3gC15g2sNVY8A2ZJdx2wlOpQaJLT50rUGf8yY0bt126PJeKNzS-5WOYo"
flow.fetch_token(code=code)
creds = flow.credentials
with open(TOKEN_FILE, "w") as f:
    json.dump({
        "token": creds.token,
        "refresh_token": creds.refresh_token,
        "token_uri": creds.token_uri,
        "client_id": creds.client_id,
        "client_secret": creds.client_secret,
        "scopes": creds.scopes
    }, f, indent=2)
print("Calendar tokens saved to", TOKEN_FILE)
