function findUnsafeGifts(warehouse: string[]): number {
  const rows = warehouse.length;
  if (rows === 0) return 0;
  const cols = warehouse[0].length;
  
  let unsafeCount = 0;
  
  // Directions: up, down, left, right
  const directions: number[][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (warehouse[r][c] === '*') {
        // Check if this present has any adjacent camera
        let hasCamera = false;
        
        for (const [dr, dc] of directions) {
          const newR = r + dr;
          const newC = c + dc;
          
          // Check if position is valid and contains a camera
          if (newR >= 0 && newR < rows && newC >= 0 && newC < cols) {
            if (warehouse[newR][newC] === '#') {
              hasCamera = true;
              break;
            }
          }
        }
        
        // If no camera found, this present is unsafe
        if (!hasCamera) {
          unsafeCount++;
        }
      }
    }
  }
  
  return unsafeCount;
}