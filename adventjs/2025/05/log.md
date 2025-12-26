# Challenge 5: ⏱️ The countdown to take off - Solution Log

## Problem Summary
- **Difficulty:** easy
- **Function:** `timeUntilTakeOff`

Calculate the time difference in seconds between two dates in elf format (`YYYY*MM*DD@HH|mm|ss NP`). Treat NP as UTC timezone. Return positive if takeoff is in the future, negative if in the past, 0 if exactly at takeoff time.

## Attempts

### JavaScript
- ✅ Completed (6 stars, 5/5 quality) - First attempt

### TypeScript
- ✅ Completed (6 stars, 5/5 quality) - First attempt

### Python
- ✅ Completed (6 stars, 5/5 quality) - First attempt

## Approach

1. **Parse elf format**: Extract date and time components from `YYYY*MM*DD@HH|mm|ss NP`
2. **Create Date objects**: Use UTC timezone (NP = North Pole time = UTC)
3. **Calculate difference**: `takeOffTime - fromTime` in milliseconds
4. **Convert to seconds**: Divide by 1000 and floor to get full seconds

### Algorithm:
```javascript
// Parse: "2025*12*25@00|00|00 NP"
const [datePart, timePart] = timeStr.replace(' NP', '').split('@');
const [year, month, day] = datePart.split('*').map(Number);
const [hours, minutes, seconds] = timePart.split('|').map(Number);
const date = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));

// Calculate difference
const diffMs = takeOffDate.getTime() - fromDate.getTime();
return Math.floor(diffMs / 1000);
```

## Key Insights

- **Date parsing**: JavaScript `Date.UTC()` creates UTC dates (month is 0-indexed)
- **Python datetime**: Use `datetime(year, month, day, ...)` with `timezone.utc` (month is 1-indexed)
- **Time difference**: Always `takeOff - fromTime` to get positive for future, negative for past
- **Floor operation**: Use `Math.floor()` in JS/TS, `int()` in Python to get full seconds
- **String parsing**: Simple split operations work well for this structured format
