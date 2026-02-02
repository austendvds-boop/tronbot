import json,os,datetime,urllib.parse,urllib.request,base64
path=os.path.join('secrets','acuity.json')
with open(path) as f:
    accounts=json.load(f)
creds=accounts['accountB']
params={'minDate':'2026-01-31','maxDate':'2026-12-31','limit':500,'cancelled':'false'}
url=f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
headers={'Authorization':'Basic '+base64.b64encode(f"{creds['apiKey']}:{creds['apiSecret']}".encode()).decode()}
req=urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req, timeout=30) as resp:
    data=json.load(resp)
count=len([a for a in data if a['firstName']=='Ezra' and a['lastName']=='Campos'])
print('Ezra total appointments',count)
