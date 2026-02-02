import json, os, datetime, urllib.parse, urllib.request, base64
path=os.path.join('secrets','acuity.json')
with open(path) as f:
    accounts=json.load(f)
creds_list=list(accounts.values())
zone=datetime.timezone.utc
all_appts=[]
for creds in creds_list:
    limit=200
    offset=0
    while True:
        params={'minDate':'2024-01-01','maxDate':'2026-12-31','limit':limit,'offset':offset,'cancelled':'false'}
        token=f"{creds['apiKey']}:{creds['apiSecret']}"
        headers={'Authorization':'Basic '+base64.b64encode(token.encode()).decode()}
        url=f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
        req=urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req,timeout=60) as resp:
            data=json.load(resp)
        if not data:
            break
        all_appts.extend(data)
        if len(data)<limit:
            break
        offset+=len(data)

history=[appt for appt in all_appts if (appt.get('firstName','').strip(),appt.get('lastName','').strip())==('Jessica','Catalanotte')]
history.sort(key=lambda a:a['datetime'])
print('Record count',len(history))
for appt in history:
    print(appt['datetime'],appt.get('calendar'))
