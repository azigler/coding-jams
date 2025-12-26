function minStepsToDeliver(map: string[][]): number {
  const rows = map.length, cols = map[0].length;
  let startR = -1, startC = -1;
  const goals: [number, number][] = [];
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (map[r][c] === 'S') {
        startR = r;
        startC = c;
      } else if (map[r][c] === 'G') {
        goals.push([r, c]);
      }
    }
  }
  
  if (goals.length === 0) return 0;
  
  const isValid = (r: number, c: number): boolean => 
    r >= 0 && r < rows && c >= 0 && c < cols && map[r][c] !== '#';
  
  const bfs = (sr: number, sc: number, gr: number, gc: number): number => {
    const queue: [number, number, number][] = [[sr, sc, 0]];
    const visited = new Set([`${sr},${sc}`]);
    const dirs: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    
    while (queue.length) {
      const [r, c, steps] = queue.shift()!;
      if (r === gr && c === gc) return steps;
      
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        const key = `${nr},${nc}`;
        
        if (isValid(nr, nc) && !visited.has(key)) {
          visited.add(key);
          queue.push([nr, nc, steps + 1]);
        }
      }
    }
    return -1;
  };
  
  let total = 0;
  for (const [gr, gc] of goals) {
    const dist = bfs(startR, startC, gr, gc);
    if (dist === -1) return -1;
    total += dist;
  }
  
  return total;
}
