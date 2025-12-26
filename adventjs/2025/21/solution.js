/**
 * @param {string[][]} warehouse
 * @param {number[]} drops
 * @returns {string[][]}
 */
function clearGifts(warehouse, drops) {
  const result = warehouse.map(row => [...row]);
  const cols = warehouse[0].length;
  
  for (const col of drops) {
    let dropRow = -1;
    for (let row = result.length - 1; row >= 0; row--) {
      if (result[row][col] === '.') {
        dropRow = row;
        break;
      }
    }
    
    if (dropRow === -1) continue;
    
    result[dropRow][col] = '#';
    
    if (result[dropRow].every(cell => cell === '#')) {
      result.splice(dropRow, 1);
      result.unshift(new Array(cols).fill('.'));
    }
  }
  
  return result;
}
