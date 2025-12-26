function findUniqueToy(toy: string): string {
  // Count occurrences (case-insensitive)
  const counts: Record<string, number> = {};
  for (const char of toy) {
    const lower = char.toLowerCase();
    counts[lower] = (counts[lower] || 0) + 1;
  }
  
  // Find first character with count === 1 (case-insensitive)
  for (const char of toy) {
    const lower = char.toLowerCase();
    if (counts[lower] === 1) {
      return char; // Return as it appears in original string
    }
  }
  
  return ''; // No unique letter found
}