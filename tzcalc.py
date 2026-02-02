import datetime
from datetime import timezone

# 2026-02-14 07:00 MST = UTC-7
# Represent as UTC timestamp

dt = datetime.datetime(2026, 2, 14, 14, 0, 0, tzinfo=timezone.utc)
print(int(dt.timestamp() * 1000))
