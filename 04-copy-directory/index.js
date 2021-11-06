const fsp = require('fs/promises');
const path = require('path');

const srcDirPath = path.join(__dirname, 'files');
const distDirPath = path.join(__dirname, 'files-copy');

async function safeFileAction(action) {
  try {
    await action();
  } catch (err) {
    if (err.code !== 'ENOENT' && err.code !== 'EEXIST') {
      throw err;
    }
  }
}

async function copyDir(srcDirPath, distDirPath) {
  await safeFileAction(async () => {
    await fsp.rm(distDirPath, { recursive: true });
  });

  await fsp.mkdir(distDirPath, { recursive: true });

  const files = await fsp.readdir(srcDirPath, { withFileTypes: true });

  for await (const file of files) {
    const srcPath = path.join(srcDirPath, file.name);
    const distPath = path.join(distDirPath, file.name);

    if (file.isFile()) {
      await fsp.copyFile(srcPath, distPath);
    } else if (file.isDirectory()) {
      await copyDir(srcPath, distPath);
    }
  }
}

copyDir(srcDirPath, distDirPath);
