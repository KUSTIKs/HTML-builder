const fsp = require('fs/promises');
const fs = require('fs');
const path = require('path');

const srcPath = path.resolve(__dirname, 'styles');
const distPath = path.resolve(__dirname, 'project-dist', 'bundle.css');

async function bundle(srcDirPath, distPath, regex) {
  const distStream = fs.createWriteStream(distPath);
  const files = await fsp.readdir(srcDirPath, { withFileTypes: true });

  for await (const file of files) {
    if (!file.isFile() || !regex.test(file.name)) continue;

    const filePath = path.resolve(srcDirPath, file.name);
    const fileStream = fs.createReadStream(filePath);

    fileStream.pipe(distStream);
  }
}

bundle(srcPath, distPath, /\.css$/);
