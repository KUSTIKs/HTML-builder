const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

const distPath = path.resolve(__dirname, 'project-dist');
const componentsSrc = path.resolve(__dirname, 'components');
const templatePath = path.resolve(__dirname, 'template.html');
const templateDistPath = path.resolve(distPath, 'index.html');
const styleFilesSrc = path.resolve(__dirname, 'styles');
const styleDistPath = path.resolve(distPath, 'style.css');
const assetsSrcDir = path.resolve(__dirname, 'assets');
const assetsDistDir = path.resolve(distPath, 'assets');

async function safeFileAction(action) {
  try {
    await action();
  } catch (err) {
    if (err.code !== 'ENOENT' && err.code !== 'EEXIST') {
      throw err;
    }
  }
}

async function replaceAsync(searchValue, regex, asyncFunc) {
  const promises = [];

  searchValue.replace(regex, (...args) => {
    promises.push(asyncFunc(...args));
  });

  const data = await Promise.all(promises);
  return searchValue.replace(regex, () => data.shift());
}

async function bundleHtml(
  srcPath,
  componentsSrc,
  distPath,
  templateTagRegex = /{{(\w*)}}/g
) {
  const srcFile = await fsp.readFile(srcPath);
  const replaceFunction = async (_, filename) => {
    const componentPath = path.resolve(componentsSrc, `${filename}.html`);
    const component = await fsp.readFile(componentPath);
    return component.toString('utf8');
  };

  const distContent = await replaceAsync(
    srcFile.toString('utf8'),
    templateTagRegex,
    replaceFunction
  );

  await fsp.writeFile(distPath, distContent);
}

async function bundleStyles(srcDirPath, distPath, regex) {
  const distStream = fs.createWriteStream(distPath);
  const files = await fsp.readdir(srcDirPath, { withFileTypes: true });

  for await (const file of files) {
    if (!file.isFile() || !regex.test(file.name)) continue;

    const filePath = path.resolve(srcDirPath, file.name);
    const fileStream = fs.createReadStream(filePath);

    fileStream.pipe(distStream);
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

safeFileAction(async () => fsp.rm(distPath, { recursive: true }))
  .then(async () => fsp.mkdir(distPath))
  .then(() => {
    bundleHtml(templatePath, componentsSrc, templateDistPath);
    bundleStyles(styleFilesSrc, styleDistPath, /\.css$/);
    copyDir(assetsSrcDir, assetsDistDir);
  });
