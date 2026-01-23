from datetime import datetime, timezone

def now():
    return datetime.now(timezone.utc)

def parse_date(value):
    if not value:
        return None

    # Already a datetime
    if isinstance(value, datetime):
        return value.astimezone(timezone.utc)

    # Normalize strings
    value = value.strip()

    formats = [
        "%Y-%m-%d",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%d %H:%M:%S",
    ]

    for fmt in formats:
        try:
            dt = datetime.strptime(value, fmt)
            return dt.replace(tzinfo=timezone.utc)
        except ValueError:
            pass

    # If nothing matched, fail loudly
    raise ValueError(f"Unrecognized date format: {value}")