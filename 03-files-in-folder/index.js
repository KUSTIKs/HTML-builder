const fsp = require('fs/promises');
const path = require('path');

const dirPath = path.resolve(__dirname, 'secret-folder');

function formatFileSize(size) {
  const prefixes = ['', 'k', 'm', 'g', 't', 'p'];
  const prefIndex = Math.min(Math.floor(Math.log10(size) / 3), prefixes.length);
  return `${size / (prefIndex * 1000)}${prefixes[prefIndex]}b`;
}

async function logDirStats(dirPath) {
  const files = await fsp.readdir(dirPath, 'utf-8');

  for await (const base of files) {
    const filePath = path.resolve(dirPath, base);
    const fileStats = await fsp.stat(filePath);

    if (!fileStats.isFile()) continue;

    const pathInfo = path.parse(base);

    const size = formatFileSize(fileStats.size);
    const { name } = pathInfo;
    const ext = pathInfo.ext.replace('.', '');

    console.log(`${name} - ${ext} - ${size}`);
  }
}

logDirStats(dirPath);
