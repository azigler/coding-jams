function dropGifts(warehouse: string[][], drops: number[]): string[][] {
  const result = warehouse.map(row => [...row]);
  
  for (const col of drops) {
    for (let row = result.length - 1; row >= 0; row--) {
      if (result[row][col] === '.') {
        result[row][col] = '#';
        break;
      }
    }
  }
  
  return result;
}
