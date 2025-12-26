const board = `
.....
.*#.*
.@...
.....
`;

const lines = board.trim().split('\n');
console.log('Lines after trim:', lines);
console.log('Length:', lines.length);
const grid = lines.slice(1, -1);
console.log('Grid after slice(1, -1):', grid);
console.log('Grid length:', grid.length);
console.log('Grid[0]:', grid[0]);
console.log('Grid[1]:', grid[1]);
