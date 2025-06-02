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
      if (ext === '.jpg' || ext === '.jpeg') {
        await sharp(imgPath).jpeg({ quality: 75 }).toFile(output);
      } else if (ext === '.png') {
        await sharp(imgPath).png({ quality: 75, compressionLevel: 8 }).toFile(output);
      }
      console.log('Compressed:', imgPath);
    } catch (e) {
      console.error('Error compressing', imgPath, e);
    }
  }
}

compressImages();