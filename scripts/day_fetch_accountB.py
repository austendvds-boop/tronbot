import json, urllib.parse, urllib.request, base64
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
with open('secrets/acuity.json') as f:
    accounts=json.load(f)
account=accounts['accountB']
api_key=account['apiKey']
api_secret=account['apiSecret']
headers={'Authorization':'Basic '+base64.b64encode(f"{api_key}:{api_secret}".encode()).decode()}
TZ=ZoneInfo('America/Phoenix')
today=datetime.now(TZ).date()
start=datetime(today.year,today.month,today.day,0,0,0,tzinfo=TZ)
end=start+timedelta(days=1)
params={'minDate':start.strftime('%Y-%m-%dT%H:%M:%S%z'),'maxDate':end.strftime('%Y-%m-%dT%H:%M:%S%z'),'limit':100,'cancelled':'false'}
url=f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
req=urllib.request.Request(url,headers=headers)
with urllib.request.urlopen(req,timeout=15) as resp:
    batch=json.load(resp)
print('count',len(batch))
calendars=set((appt.get('calendar') or '').strip() for appt in batch)
print('calendars',calendars)
for appt in batch:
    print(appt.get('calendar'), appt.get('datetime'), appt.get('firstName'), appt.get('lastName'))
