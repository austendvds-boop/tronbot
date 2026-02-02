import json, os, urllib.parse, urllib.request, base64
with open('secrets/acuity.json') as f:
    data=json.load(f)
account=data['accountB']
api_key=account['apiKey']
api_secret=account['apiSecret']
target_id=1623578480
url=f"https://acuityscheduling.com/api/v1/appointments/{target_id}"
headers={'Authorization':'Basic '+base64.b64encode(f"{api_key}:{api_secret}".encode()).decode()}
req=urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req, timeout=60) as resp:
    target=json.load(resp)
print(json.dumps(target, indent=2))
