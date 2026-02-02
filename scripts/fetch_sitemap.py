import requests
resp=requests.get('https://www.deervalleydrivingschool.com/sitemap.xml', timeout=30)
print(resp.status_code)
print(resp.text[:800])
