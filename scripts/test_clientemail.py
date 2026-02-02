import json, urllib.parse, urllib.request, base64
with open('secrets/acuity.json') as f:
    data=json.load(f)
api_key=data['accountB']['apiKey']
api_secret=data['accountB']['apiSecret']
email='aliyeh.mansouri58@gmail.com'
params={'clientEmail':email,'minDate':'2024-01-01','maxDate':'2026-02-02','limit':5,'offset':0,'cancelled':'false'}
url=f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
headers={'Authorization':'Basic '+base64.b64encode(f"{api_key}:{api_secret}".encode()).decode()}
req=urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req, timeout=60) as resp:
    data=json.load(resp)
print('got',len(data))
for appt in data:
    print(appt['id'], appt.get('datetime'))
