import json,os,urllib.parse,urllib.request

data=None
with open(os.path.join('secrets','acuity.json')) as f:
    data=json.load(f)

creds=data['accountA']
params={'minDate':'2026-02-01','maxDate':'2026-02-01','limit':5,'cancelled':'false'}
url=f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
token=f"{creds['apiKey']}:{creds['apiSecret']}"
headers={'Authorization':'Basic '+__import__('base64').b64encode(token.encode()).decode()}
req=urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req) as resp:
    appts=json.load(resp)
for appt in appts:
    print('--- appt',appt['id'],appt['firstName'],appt['lastName'])
    for form in appt.get('forms',[]):
        print('Form',form.get('name'))
        for val in form.get('values',[]):
            print(' field',val.get('name'), '=>', val.get('value'))
    print()
