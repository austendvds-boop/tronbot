import requests
from bs4 import BeautifulSoup

url='https://www.deervalleydrivingschool.com/blog'
resp=requests.get(url, timeout=10)
resp.raise_for_status()
print(f'Status',resp.status_code)
soup=BeautifulSoup(resp.text,'html.parser')
articles=soup.select('article')[:30]
print('found',len(articles))
for idx,article in enumerate(articles,1):
    title_tag=article.select_one('h1, h2, h3')
    title=title_tag.get_text(strip=True) if title_tag else '(no title)'
    link_tag=article.find('a',href=True)
    link=link_tag['href'] if link_tag else 'no link'
    date_tag=article.select_one('time')
    date=date_tag.get_text(strip=True) if date_tag else 'unknown'
    summary_tag=article.find('p')
    summary=summary_tag.get_text(strip=True) if summary_tag else ''
    print(f"{idx}. {title} | {date} | {link} | {summary[:60]}")
