import json,os,urllib.parse,urllib.request,base64
path=os.path.join('secrets','acuity.json')
with open(path) as f:
    accounts=json.load(f)
limit=200
records=[]
for creds in accounts.values():
    offset=0
    while True:
        params={'minDate':'2024-01-01','maxDate':'2026-12-31','limit':limit,'offset':offset,'cancelled':'false'}
        url=f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
        token=f"{creds['apiKey']}:{creds['apiSecret']}"
        headers={'Authorization':'Basic '+base64.b64encode(token.encode()).decode()}
        req=urllib.request.Request(url,headers=headers)
        with urllib.request.urlopen(req,timeout=60) as resp:
            data=json.load(resp)
        if not data:
            break
        for appt in data:
            if 'jessica' in appt.get('firstName','').lower():
                records.append((appt['datetime'], appt.get('calendar')))
        if len(data)<limit:
            break
        offset+=len(data)
print('found',len(records))
for dt,cal in sorted(records):
    print(dt,cal)
