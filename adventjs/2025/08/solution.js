/**
 * @param {string} toy - The toy to find the first unique one letter
 * @returns {string} The first unique letter in the toy
 */
function findUniqueToy(toy) {
  // Count occurrences (case-insensitive)
  const counts = {};
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