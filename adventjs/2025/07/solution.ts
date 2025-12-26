function drawTree(height: number, ornament: string, frequency: number): string {
  const lines: string[] = [];
  let position = 1; // Global position counter (starts at 1)
  const maxWidth = 2 * height - 1; // Width of the bottom row
  
  // Draw tree rows
  for (let row = 1; row <= height; row++) {
    const rowWidth = 2 * row - 1; // Number of characters in this row
    const padding = (maxWidth - rowWidth) / 2; // Spaces before the row
    
    let rowStr = ' '.repeat(padding);
    
    // Build the row character by character
    for (let col = 0; col < rowWidth; col++) {
      // If position is divisible by frequency, use ornament, else use '*'
      if (position % frequency === 0) {
        rowStr += ornament;
      } else {
        rowStr += '*';
      }
      position++;
    }
    
    lines.push(rowStr);
  }
  
  // Add trunk (centered, same width as first row)
  const trunkPadding = (maxWidth - 1) / 2;
  lines.push(' '.repeat(trunkPadding) + '#');
  
  return lines.join('\n');
}