// Test file for Challenge 5: ⏱️ The countdown to take off
// Run with: deno run --allow-read test.ts

// Inline the solution function for testing
function timeUntilTakeOff(fromTime, takeOffTime) {
  // Parse elf format: YYYY*MM*DD@HH|mm|ss NP
  function parseElfTime(elfTime) {
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

const takeoff = '2025*12*25@00|00|00 NP';

const testCases = [
  { 
    input: ['2025*12*24@23|59|30 NP', takeoff], 
    expected: 30
  },
  { 
    input: ['2025*12*25@00|00|00 NP', takeoff], 
    expected: 0
  },
  { 
    input: ['2025*12*25@00|00|12 NP', takeoff], 
    expected: -12
  },
];

for (const { input, expected } of testCases) {
  const result = timeUntilTakeOff(...input);
  const pass = result === expected;
  console.log(`${pass ? "✅" : "❌"} Input: ${JSON.stringify(input)} | Expected: ${expected} | Got: ${result}`);
}
