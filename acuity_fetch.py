import base64
import datetime
import json
import os
import urllib.error
import urllib.parse
import urllib.request

with open(os.path.join(os.path.dirname(__file__), "secrets", "acuity.json")) as f:
    data = json.load(f)
acc = data["accountA"]
apikey = acc["apiKey"]
apisecret = acc["apiSecret"]
today = datetime.datetime.now().date().isoformat()
params = {
    "minDate": today,
    "limit": 50,
    "cancelled": "false"
}
query = urllib.parse.urlencode(params)
url = f"https://acuityscheduling.com/api/v1/appointments?{query}"
headers = {
    "Authorization": "Basic " + base64.b64encode(f"{apikey}:{apisecret}".encode()).decode()
}
req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req, timeout=30) as resp:
        appointments = json.load(resp)
except urllib.error.HTTPError as error:
    print("HTTPError", error.code, error.reason)
    appointments = []
except Exception as error:
    print("Error", error)
    appointments = []

if not appointments:
    print("No upcoming appointments found for today.")
else:
    appointments.sort(key=lambda a: a.get("datetime", ""))
    for appt in appointments[:3]:
        start_time = appt.get("datetime")
        appointment_type = appt.get("appointmentType") or {}
        service = (appointment_type.get("name") if isinstance(appointment_type, dict) else appointment_type) or appointment_type
        location_data = appt.get("location")
        if isinstance(location_data, dict):
            location = location_data.get("name")
        else:
            location = location_data
        student = f"{appt.get('firstName', '').strip()} {appt.get('lastName', '').strip()}".strip()
        components = [start_time or "(no time)", service or "(no service)", location or "(no location)"]
        if student:
            components.append(student)
        print(" - " + " | ".join(components))
