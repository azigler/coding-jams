from datetime import datetime, timezone

def time_until_take_off(from_time: str, take_off_time: str) -> int:
  # Parse elf format: YYYY*MM*DD@HH|mm|ss NP
  def parse_elf_time(elf_time: str) -> datetime:
    # Remove ' NP' suffix
    time_str = elf_time.replace(' NP', '')
    # Split by @ to get date and time parts
    date_part, time_part = time_str.split('@')
    # Parse date: YYYY*MM*DD
    year, month, day = map(int, date_part.split('*'))
    # Parse time: HH|mm|ss
    hours, minutes, seconds = map(int, time_part.split('|'))
    
    # Create datetime object in UTC
    return datetime(year, month, day, hours, minutes, seconds, tzinfo=timezone.utc)
  
  from_date = parse_elf_time(from_time)
  take_off_date = parse_elf_time(take_off_time)
  
  # Calculate difference in seconds (takeOff - fromTime)
  diff = take_off_date - from_date
  diff_seconds = int(diff.total_seconds())
  
  return diff_seconds
