import json, os, urllib.request, urllib.parse, urllib.error

with open('secrets/github-token.json') as f:
    data=json.load(f)
token=data['token']
url='https://api.github.com/user/repos'
headers={
    'Authorization': f'token {token}',
    'Content-Type': 'application/json',
    'User-Agent': 'TronMeggabot'
}
payload={
    'name': 'tron-dashboard',
    'private': True,
    'description': 'Dashboard to track tasks and briefings for Deer Valley Driving School',
    'auto_init': True
}
req=urllib.request.Request(url, data=json.dumps(payload).encode(), headers=headers, method='POST')
try:
    with urllib.request.urlopen(req, timeout=30) as resp:
        result=json.load(resp)
    print(json.dumps(result, indent=2))
except urllib.error.HTTPError as e:
    body=e.read().decode(errors='ignore')
    print('HTTP Error', e.code, e.reason)
    print(body)
    raise
