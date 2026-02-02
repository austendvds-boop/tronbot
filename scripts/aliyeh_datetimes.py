import json,os,urllib.parse,urllib.request,base64
path=os.path.join('secrets','acuity.json')
with open(path) as f:
    accounts=json.load(f)
creds=accounts['accountB']
params={'minDate':'2026-01-30','maxDate':'2026-02-03','limit':1000,'cancelled':'false'}
url=f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
headers={'Authorization':'Basic '+base64.b64encode(f"{creds['apiKey']}:{creds['apiSecret']}".encode()).decode()}
req=urllib.request.Request(url,headers=headers)
with urllib.request.urlopen(req,timeout=30) as resp:
    data=json.load(resp)
for appt in data:
    if appt.get('firstName','').strip()=='Aliyeh':
        print(appt['datetime'], appt.get('calendar'), appt.get('location'))
