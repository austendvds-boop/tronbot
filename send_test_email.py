import json
import os
import smtplib
from email.message import EmailMessage

with open(os.path.join('secrets', 'gmail.json')) as f:
    creds = json.load(f)

msg = EmailMessage()
msg['Subject'] = 'Test from TronMeggabot'
msg['From'] = creds['email']
msg['To'] = 'austen.dvds@gmail.com'
msg.set_content('This is a test email from your assistant. Let me know when it arrives!')

with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
    smtp.login(creds['email'], creds['appPassword'])
    smtp.send_message(msg)
