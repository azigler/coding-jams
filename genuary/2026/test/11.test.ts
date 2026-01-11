import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, '../src/days/11.ts');

// Read the source file
const fileContent = fs.readFileSync(filePath, 'utf8');

// Extract S content (everything between first backtick and `\`;)
const match = fileContent.match(/^const S=`([\s\S]*?)`;\n/);
if (!match) {
  console.error('FAIL: Could not extract S from file');
  process.exit(1);
}
const S = match[1];

// Reconstruct what getSource() returns: "const S=`" + S + "`;" + S
const getSourceOutput = 'const S=`' + S + '`;' + S;

// Verify quine property
if (fileContent === getSourceOutput) {
  console.log('PASS: Quine verified - getSource() === source file');
  console.log(`  File length: ${fileContent.length} chars`);
  process.exit(0);
} else {
  console.error('FAIL: Quine property broken');
  console.error(`  File length: ${fileContent.length}`);
  console.error(`  getSource() length: ${getSourceOutput.length}`);

  // Find first difference
  for (let i = 0; i < Math.max(fileContent.length, getSourceOutput.length); i++) {
    if (fileContent[i] !== getSourceOutput[i]) {
      console.error(`  First difference at position ${i}:`);
      console.error(`    File: ${JSON.stringify(fileContent.substring(i, i + 20))}`);
      console.error(`    Output: ${JSON.stringify(getSourceOutput.substring(i, i + 20))}`);
      break;
    }
  }
  process.exit(1);
}
