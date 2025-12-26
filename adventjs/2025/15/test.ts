// Test file for Challenge 15: ✏️ Drawing tables
// Run with: deno run --allow-read test.ts

// Inline the solution function for testing
function drawTable(data, sortBy) {
  if (data.length === 0) return '';
  
  // Sort data
  const sorted = [...data].sort((a, b) => {
    const valA = a[sortBy];
    const valB = b[sortBy];
    if (typeof valA === 'number' && typeof valB === 'number') {
      return valA - valB;
    }
    return String(valA).localeCompare(String(valB));
  });
  
  // Get all keys (columns)
  const keys = Object.keys(data[0]);
  
  // Calculate column widths
  const widths = keys.map((key, index) => {
    // Header width (column letter)
    const headerWidth = String.fromCharCode(65 + index).length; // A, B, C...
    // Content width
    const contentWidth = Math.max(
      ...sorted.map(row => String(row[key] || '').length)
    );
    return Math.max(headerWidth, contentWidth);
  });
  
  // Generate header row
  const headerRow = '| ' + keys.map((_, i) => {
    const letter = String.fromCharCode(65 + i);
    return letter.padEnd(widths[i]);
  }).join(' | ') + ' |';
  
  // Generate separator
  const separator = '+' + widths.map(w => '-'.repeat(w + 2)).join('+') + '+';
  
  // Generate data rows
  const dataRows = sorted.map(row => {
    return '| ' + keys.map((key, i) => {
      const val = row[key];
      const value = val === null || val === undefined ? '' : String(val);
      return value.padEnd(widths[i]);
    }).join(' | ') + ' |';
  });
  
  // Combine all parts
  return [
    separator,
    headerRow,
    separator,
    ...dataRows,
    separator
  ].join('\n');
}

const testCases = [
  {
    input: [
      [
        { name: 'Charlie', city: 'New York' },
        { name: 'Alice', city: 'London' },
        { name: 'Bob', city: 'Paris' }
      ],
      'name'
    ],
    expected: `+---------+----------+
| A       | B        |
+---------+----------+
| Alice   | London   |
| Bob     | Paris    |
| Charlie | New York |
+---------+----------+`
  },
  {
    input: [
      [
        { gift: 'Book', quantity: 5 },
        { gift: 'Music CD', quantity: 1 },
        { gift: 'Doll', quantity: 10 }
      ],
      'quantity'
    ],
    expected: `+----------+----+
| A        | B  |
+----------+----+
| Music CD | 1  |
| Book     | 5  |
| Doll     | 10 |
+----------+----+`
  },
];

for (const { input, expected } of testCases) {
  const result = drawTable(...input);
  const pass = result === expected;
  console.log(`${pass ? "✅" : "❌"} Test: drawTable(${input[0].length} items, '${input[1]}')`);
  if (!pass) {
    console.log('Expected:');
    console.log(expected);
    console.log('Got:');
    console.log(result);
  }
}
