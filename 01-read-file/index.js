const fs = require('fs');
const path = require('path');

const readPath = path.resolve(__dirname, 'text.txt');
const readable = fs.createReadStream(readPath, 'utf-8');

readable.pipe(process.stdout);
