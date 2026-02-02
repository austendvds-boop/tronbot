import json,os,urllib.parse,urllib.request,base64
path=os.path.join('secrets','acuity.json')
with open(path) as f:
    accounts=json.load(f)
for key,creds in accounts.items():
    offset=0
    limit=200
    print('checking',key)
    while True:
        params={'minDate':'2025-12-01','maxDate':'2026-04-15','limit':limit,'offset':offset,'cancelled':'false'}
        url=f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
        token=f"{creds['apiKey']}:{creds['apiSecret']}"
        headers={'Authorization':'Basic '+base64.b64encode(token.encode()).decode()}
        req=urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=60) as resp:
            data=json.load(resp)
        if not data:
            break
        for appt in data:
            first=appt.get('firstName','').strip().lower()
            last=appt.get('lastName','').strip().lower()
            if 'kayde' in first or 'kayde' in last or 'thompson' in last:
                print(key,appt['datetime'],appt.get('calendar'),first,last)
        if len(data)<limit:
            break
        offset+=len(data)
