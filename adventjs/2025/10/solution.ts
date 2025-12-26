function maxDepth (s: string): number {
  let depth = 0;
  let maxDepth = 0;
  
  for (const char of s) {
    if (char === '[') {
      depth++;
      maxDepth = Math.max(maxDepth, depth);
    } else if (char === ']') {
      depth--;
      // If depth goes negative, we have a closing bracket before opening
      if (depth < 0) {
        return -1;
      }
    }
  }
  
  // If depth is not 0 at the end, brackets are not balanced
  if (depth !== 0) {
    return -1;
  }
  
  return maxDepth;
}