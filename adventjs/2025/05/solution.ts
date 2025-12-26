type ElfDateTime =
  `${number}*${number}*${number}@${number}|${number}|${number} NP`

function timeUntilTakeOff(
  fromTime: ElfDateTime,
  takeOffTime: ElfDateTime
): number {
  // Parse elf format: YYYY*MM*DD@HH|mm|ss NP
  function parseElfTime(elfTime: string): Date {
    // Remove ' NP' suffix
    const timeStr = elfTime.replace(' NP', '');
    // Split by @ to get date and time parts
    const [datePart, timePart] = timeStr.split('@');
    // Parse date: YYYY*MM*DD
    const [year, month, day] = datePart.split('*').map(Number);
    // Parse time: HH|mm|ss
    const [hours, minutes, seconds] = timePart.split('|').map(Number);
    
    // Create Date object in UTC
    return new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
  }
  
  const fromDate = parseElfTime(fromTime);
  const takeOffDate = parseElfTime(takeOffTime);
  
  // Calculate difference in seconds (takeOff - fromTime)
  const diffMs = takeOffDate.getTime() - fromDate.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  
  return diffSeconds;
}