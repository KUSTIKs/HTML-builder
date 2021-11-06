const process = require('process');
const fs = require('fs');
const path = require('path');

const writePath = path.resolve(__dirname, 'text.txt');
const writable = fs.createWriteStream(writePath, 'utf-8');

const underlineText = (text) => `\x1b[4m${text}\x1b[0m`;
console.log(underlineText('How was your day ?\n'));
process.stdin.pipe(writable);

process.on('exit', () => {
  console.log('\nThank you for the story. Goodbye!');
});

process.on('SIGINT', () => {
  process.exit(0);
});
