import base64
import json
import os
import urllib.parse
import urllib.request

with open(os.path.join('secrets','acuity.json')) as f:
    data=json.load(f)
acc=data['accountA']
apikey=acc['apiKey']
apisecret=acc['apiSecret']
params={'minDate':'2026-01-31','maxDate':'2026-02-13','limit':100,'cancelled':'false'}
url=f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
headers={'Authorization':'Basic '+base64.b64encode(f"{apikey}:{apisecret}".encode()).decode()}
req=urllib.request.Request(url,headers=headers)
with urllib.request.urlopen(req,timeout=30) as resp:
    data=json.load(resp)
print(json.dumps(data, indent=2))
