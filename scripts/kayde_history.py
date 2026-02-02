import json,os,urllib.parse,urllib.request,base64,datetime
from zoneinfo import ZoneInfo
path=os.path.join('secrets','acuity.json')
with open(path) as f:
    accounts=json.load(f)
limit=200
start='2024-01-01'
end='2026-12-31'
records=[]
zone=ZoneInfo('America/Phoenix')
for creds in accounts.values():
    offset=0
    while True:
        params={'minDate':start,'maxDate':end,'limit':limit,'offset':offset,'cancelled':'false'}
        url=f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
        token=f"{creds['apiKey']}:{creds['apiSecret']}"
        headers={'Authorization':'Basic '+base64.b64encode(token.encode()).decode()}
        req=urllib.request.Request(url,headers=headers)
        with urllib.request.urlopen(req,timeout=60) as resp:
            data=json.load(resp)
        if not data:
            break
        for appt in data:
            first=appt.get('firstName','').strip().lower()
            last=appt.get('lastName','').strip().lower()
            if (first,last)==('kayde','thompson- bradley') or (first,last)==('kayde','thompson- bradley'):
                records.append(datetime.datetime.fromisoformat(appt['datetime']).astimezone(zone))
        if len(data)<limit:
            break
        offset+=len(data)
records.sort()
print('Kayde total',len(records))
for idx,dt in enumerate(records,1):
    print(idx,dt.strftime('%Y-%m-%d %I:%M %p'))
