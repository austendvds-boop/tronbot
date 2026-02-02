import json, os, urllib.parse, urllib.request, base64
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

tz=ZoneInfo('America/Phoenix')
with open('secrets/acuity.json') as f:
    accounts=json.load(f)
account=accounts['accountA']
api_key=account['apiKey']
api_secret=account['apiSecret']
headers={'Authorization':'Basic '+base64.b64encode(f"{api_key}:{api_secret}".encode()).decode()}
base='https://acuityscheduling.com/api/v1/appointments'
start=datetime.now(tz).replace(hour=0,minute=0,second=0,microsecond=0)
end=start+timedelta(days=1)
params={'minDate':start.strftime('%Y-%m-%dT%H:%M:%S%z'),'maxDate':end.strftime('%Y-%m-%dT%H:%M:%S%z'),'limit':100,'cancelled':'false'}
req=urllib.request.Request(f"{base}?{urllib.parse.urlencode(params)}",headers=headers)
with urllib.request.urlopen(req,timeout=15) as resp:
    data=json.load(resp)
print('account: Austen')
print('dayRange:',params['minDate'],'->',params['maxDate'])
print('appointments returned',len(data))
def present(x):
    return 'Y' if x else 'N'
for appt in data:
    cal=appt.get('calendar')
    if not cal or cal.strip().lower()!='austen':
        continue
    time_str=datetime.fromisoformat(appt['datetime']).astimezone(tz).strftime('%I:%M %p')
    print(time_str,appt.get('firstName'),appt.get('lastName'),'id='+str(appt.get('id')),'emailPresent='+present(appt.get('email')),'phonePresent='+present(appt.get('phone')),'calendar='+cal)
