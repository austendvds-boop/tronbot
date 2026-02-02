import json, os, datetime, urllib.parse, urllib.request
from zoneinfo import ZoneInfo

with open(os.path.join('secrets','acuity.json')) as f:
    accounts=json.load(f)

tomorrow=(datetime.date.today()+datetime.timedelta(days=1)).isoformat()
zone=ZoneInfo('America/Phoenix')
for key,creds in accounts.items():
    params={'minDate':tomorrow,'maxDate':tomorrow,'limit':50,'cancelled':'false'}
    url=f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
    token=f"{creds['apiKey']}:{creds['apiSecret']}"
    headers={'Authorization':'Basic '+__import__('base64').b64encode(token.encode()).decode()}
    req=urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=30) as resp:
        data=json.load(resp)
    for appt in data:
        print('ID',appt['id'],appt['calendar'],appt['datetime'])
        for form in appt.get('forms',[]):
            print('Form',form.get('name'))
            for val in form.get('values',[]):
                if 'lesson' in val.get('name','').lower() or 'lesson' in val.get('value','').lower():
                    print(' ->',val.get('name'),':',val.get('value'))
        print('-'*30)
