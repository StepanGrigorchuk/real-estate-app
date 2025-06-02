const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const developersDir = path.join(__dirname, '../public/developers');

function getAllImages(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllImages(filePath));
    } else if (/\.(jpe?g|png)$/i.test(file)) {
      results.push(filePath);
    }
  });
  return results;
}

async function compressImages() {
  const images = getAllImages(developersDir);
  for (const imgPath of images) {
    const ext = path.extname(imgPath).toLowerCase();
    const output = imgPath; // перезаписываем
    try {
      const image = sharp(imgPath);
      const metadata = await image.metadata();
      let width = metadata.width;
      let height = metadata.height;
      // Вычисляем новые размеры, если хотя бы одна сторона больше 2000
      if (width > 2000 || height > 2000) {
        if (width >= height) {
          width = 2000;
          height = Math.round((metadata.height / metadata.width) * 2000);
        } else {
          height = 2000;
          width = Math.round((metadata.width / metadata.height) * 2000);
        }
        image.resize(width, height);
      }
      // Сохраняем во временный файл, затем заменяем оригинал
      const tempOutput = imgPath + '.tmp';
      if (ext === '.jpg' || ext === '.jpeg') {
        await image.jpeg({ quality: 50 }).toFile(tempOutput);
      } else if (ext === '.png') {
        await image.png({ quality: 50, compressionLevel: 8 }).toFile(tempOutput);
      }
      fs.renameSync(tempOutput, output);
      console.log('Compressed:', imgPath);
    } catch (e) {
      console.error('Error compressing', imgPath, e);
    }
  }
}

compressImages();