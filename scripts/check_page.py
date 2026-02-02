import json, os, urllib.parse, urllib.request, base64
with open('secrets/acuity.json') as f:
    data=json.load(f)
api_key=data['accountB']['apiKey']
api_secret=data['accountB']['apiSecret']
params={'minDate':'2025-11-01','maxDate':'2026-02-03','limit':100,'offset':0,'cancelled':'false'}
url=f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
headers={'Authorization':'Basic '+base64.b64encode(f"{api_key}:{api_secret}".encode()).decode()}
req=urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req, timeout=60) as resp:
    data=json.load(resp)
print('got',len(data))
