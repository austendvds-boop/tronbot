import json, urllib.parse, urllib.request, base64
with open('secrets/acuity.json') as f:
    data=json.load(f)
api_key=data['accountA']['apiKey']
api_secret=data['accountA']['apiSecret']
headers={'Authorization':'Basic '+base64.b64encode(f"{api_key}:{api_secret}".encode()).decode()}
base='https://acuityscheduling.com/api/v1/appointments'
params={'minDate':'2026-01-01','maxDate':'2026-01-08','email':'test@example.com'}
url=f"{base}?{urllib.parse.urlencode(params)}"
print('EMAIL REQUEST URL',url)
req=urllib.request.Request(url,headers=headers)
with urllib.request.urlopen(req,timeout=15) as resp:
    data=json.load(resp)
print('EMAIL count',len(data))
params={'minDate':'2026-01-01','maxDate':'2026-01-08','phone':'15555555555'}
url=f"{base}?{urllib.parse.urlencode(params)}"
print('PHONE REQUEST URL',url)
req=urllib.request.Request(url,headers=headers)
with urllib.request.urlopen(req,timeout=15) as resp:
    data=json.load(resp)
print('PHONE count',len(data))
