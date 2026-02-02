import json,os,datetime,urllib.parse,urllib.request,base64
path=os.path.join('secrets','acuity.json')
with open(path) as f:
    accounts=json.load(f)
creds=accounts['accountB']
url_base='https://acuityscheduling.com/api/v1/appointments'
params={'minDate':'2020-01-01','maxDate':'2026-12-31','limit':2000,'cancelled':'false'}
url=f"{url_base}?{urllib.parse.urlencode(params)}"
token=f"{creds['apiKey']}:{creds['apiSecret']}"
headers={'Authorization':'Basic '+base64.b64encode(token.encode()).decode()}
req=urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req, timeout=60) as resp:
    data=json.load(resp)
counts=[appt for appt in data if (appt.get('firstName','').strip(),appt.get('lastName','').strip())==('Kennedi','Harris')]
print('Kennedi total appointments',len(counts))
for appt in sorted(counts,key=lambda a:a['datetime']):
    print(appt['datetime'], appt.get('calendar'))
