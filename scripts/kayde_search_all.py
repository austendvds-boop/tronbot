import json,os,urllib.parse,urllib.request,base64
path=os.path.join('secrets','acuity.json')
with open(path) as f:
    accounts = json.load(f)
LIMIT=200
start='2024-01-01'
end='2026-12-31'
PAGE=0
found=0
for creds in accounts.values():
    offset=0
    while True:
        params={'minDate':start,'maxDate':end,'limit':LIMIT,'offset':offset,'cancelled':'false'}
        token=f"{creds['apiKey']}:{creds['apiSecret']}"
        headers={'Authorization':'Basic '+base64.b64encode(token.encode()).decode()}
        url=f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
        req=urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=60) as resp:
            data=json.load(resp)
        if not data:
            break
        for appt in data:
            fn=appt.get('firstName','').lower()
            ln=appt.get('lastName','').lower()
            if 'kayde' in fn or 'kayde' in ln:
                found+=1
                print(found, appt['datetime'], fn, ln, appt.get('calendar'))
        if len(data)<LIMIT:
            break
        offset += len(data)
print('found total', found)
