import base64
import json
import os
import urllib.error
import urllib.parse
import urllib.request

PAY_PERIOD_START = "2026-01-31"
PAY_PERIOD_END = "2026-02-13"
INSTRUCTOR_RATES = {
    "Ryan": 26,
    "Alex": 26,
    "Aaron": 25,
    "Allan": 20,
    "Bob": 24,
    "Branden": 30,
    "Freddy": 26,
}
CALENDAR_MAP = {
    "ryan": "Ryan",
    "alex": "Alex",
    "aaron": "Aaron",
    "allan": "Allan",
    "bob": "Bob",
    "brandon": "Branden",
    "branden": "Branden",
    "freddy": "Freddy",
}


def normalize_calendar(name: str) -> str:
    return name.strip().lower()


def fetch_account(cred: dict):
    apikey = cred["apiKey"]
    apisecret = cred["apiSecret"]
    params = {
        "minDate": PAY_PERIOD_START,
        "maxDate": PAY_PERIOD_END,
        "limit": 200,
        "cancelled": "false",
    }
    url = f"https://acuityscheduling.com/api/v1/appointments?{urllib.parse.urlencode(params)}"
    headers = {
        "Authorization": "Basic " + base64.b64encode(f"{apikey}:{apisecret}".encode()).decode()
    }
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.load(resp)


def main():
    with open(os.path.join("secrets", "acuity.json")) as f:
        accounts = json.load(f)
    instructor_minutes = {name: 0.0 for name in INSTRUCTOR_RATES}
    for key in ["accountA", "accountB"]:
        if key not in accounts:
            continue
        try:
            appointments = fetch_account(accounts[key])
        except urllib.error.HTTPError as exc:
            raise SystemExit(f"Failed to fetch {key}: {exc.code} {exc.reason}")
        for appt in appointments:
            calendar = (appt.get("calendar") or "")
            normalized = normalize_calendar(calendar)
            instructor_name = CALENDAR_MAP.get(normalized)
            if not instructor_name:
                continue
            duration = appt.get("duration")
            try:
                instructor_minutes[instructor_name] += float(duration or 0)
            except (TypeError, ValueError):
                continue
    totals = {}
    total_payroll = 0.0
    for name, rate in INSTRUCTOR_RATES.items():
        minutes = instructor_minutes.get(name, 0.0)
        hours = minutes / 60
        pay = hours * rate
        totals[name] = {
            "hours": hours,
            "rate": rate,
            "pay": pay,
        }
        total_payroll += pay
    report = {
        "pay_period": f"{PAY_PERIOD_START} to {PAY_PERIOD_END}",
        "totals": totals,
        "total_payroll": total_payroll,
    }
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
