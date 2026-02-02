import argparse
import json
import os
from google_auth_oauthlib.flow import Flow

SCOPES = [
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.readonly"
]
CLIENT_SECRET_FILE = os.path.join("secrets", "gmail_oauth_client.json")
TOKEN_FILE = os.path.join("secrets", "gmail_oauth_tokens.json")
STATE_FILE = os.path.join("secrets", "gmail_oauth_state.json")

parser = argparse.ArgumentParser(description="Run Gmail OAuth flow")
parser.add_argument("--code", help="Authorization code from Google", required=False)
args = parser.parse_args()

if args.code:
    if not os.path.exists(STATE_FILE):
        raise SystemExit("No state file found. Run without --code first to get the URL.")
    with open(STATE_FILE) as f:
        data = json.load(f)
    state = data["state"]
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRET_FILE,
        scopes=SCOPES,
        redirect_uri="urn:ietf:wg:oauth:2.0:oob",
        state=state,
    )
    flow.fetch_token(code=args.code)
    creds = flow.credentials
    with open(TOKEN_FILE, "w") as f:
        json.dump(
            {
                "token": creds.token,
                "refresh_token": creds.refresh_token,
                "token_uri": creds.token_uri,
                "client_id": creds.client_id,
                "client_secret": creds.client_secret,
                "scopes": creds.scopes,
            },
            f,
            indent=2,
        )
    print("OAuth tokens saved to", TOKEN_FILE)
else:
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRET_FILE,
        scopes=SCOPES,
        redirect_uri="urn:ietf:wg:oauth:2.0:oob",
    )
    auth_url, state = flow.authorization_url(access_type="offline", prompt="consent")
    with open(STATE_FILE, "w") as f:
        json.dump({"state": state}, f)
    print("Visit this URL in your browser, sign in to Gmail, and copy the code:")
    print(auth_url)
    print("Then rerun this script with --code YOUR_CODE")
