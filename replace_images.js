import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

// Определяем __dirname в ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Папка с реальными изображениями
const REAL_IMAGES_DIR = path.join(__dirname, 'public', 'real_images');
// Папка с текущими изображениями (developers)
const DEVELOPERS_DIR = path.join(__dirname, 'public', 'developers');

// Функция для проверки существования директории
async function checkDirectoryExists(dir) {
  try {
    await fs.access(dir);
    console.log(`Директория существует: ${dir}`);
    return true;
  } catch (err) {
    console.error(`Директория не найдена: ${dir}`);
    return false;
  }
}

// Функция для получения списка всех папок images с использованием асинхронного API glob
async function findImagesFolders() {
  console.log('Поиск папок images...');
  console.log(`Ищем в директории: ${DEVELOPERS_DIR}`);
  try {
    const folders = await glob('**/images/', { cwd: DEVELOPERS_DIR });
    console.log(`Найдено папок images: ${folders.length}`);
    if (folders.length > 0) {
      console.log('Примеры найденных папок:', folders.slice(0, 3));
    }
    return folders.map(folder => path.join(DEVELOPERS_DIR, folder));
  } catch (err) {
    console.error('Ошибка при поиске папок images:', err);
    throw err;
  }
}

// Функция для получения списка всех реальных изображений
async function getRealImages() {
  console.log('Получение списка реальных изображений...');
  console.log(`Ищем в директории: ${REAL_IMAGES_DIR}`);
  try {
    const files = await fs.readdir(REAL_IMAGES_DIR);
    const imageFiles = files
      .filter(file => /\.(jpg|jpeg|png)$/i.test(file)) // Только изображения
      .map(file => path.join(REAL_IMAGES_DIR, file));
    console.log(`Найдено реальных изображений: ${imageFiles.length}`);
    if (imageFiles.length > 0) {
      console.log('Примеры реальных изображений:', imageFiles.slice(0, 3));
    }
    return imageFiles;
  } catch (err) {
    console.error('Ошибка при получении списка реальных изображений:', err);
    throw err;
  }
}

// Функция для получения случайного изображения из списка
function getRandomImage(realImages) {
  const randomIndex = Math.floor(Math.random() * realImages.length);
  return realImages[randomIndex];
}

// Основная функция для замены всех изображений
async function replaceImages() {
  try {
    console.log('Запуск скрипта replace_images.js...');
    console.log('Текущая директория:', process.cwd());

    // Проверяем существование директорий
    const developersExists = await checkDirectoryExists(DEVELOPERS_DIR);
    const realImagesExists = await checkDirectoryExists(REAL_IMAGES_DIR);

    if (!developersExists || !realImagesExists) {
      throw new Error('Одна или обе директории (developers или real_images) не существуют');
    }

    // Получаем список всех папок images
    const imagesFolders = await findImagesFolders();
    if (imagesFolders.length === 0) {
      console.log('Папки images не найдены. Завершение работы.');
      return;
    }

    // Получаем список реальных изображений
    const realImages = await getRealImages();
    if (realImages.length === 0) {
      throw new Error('Папка real_images пуста');
    }

    // Обрабатываем каждую папку images
    for (const folder of imagesFolders) {
      console.log(`Обработка папки: ${folder}`);
      // Получаем список всех файлов в папке images
      const files = await fs.readdir(folder);
      const imageFiles = files.filter(file => /\.(jpg|jpeg|png)$/i.test(file));
      console.log(`Найдено изображений в папке ${folder}: ${imageFiles.length}`);

      // Если папка пуста, пропускаем
      if (imageFiles.length === 0) {
        console.log(`Папка ${folder} пуста, пропускаем...`);
        continue;
      }

      // Заменяем каждый файл
      for (const imageFile of imageFiles) {
        const targetPath = path.join(folder, imageFile);

        // Выбираем случайное изображение
        const sourceImage = getRandomImage(realImages);

        // Копируем и заменяем изображение
        await fs.copyFile(sourceImage, targetPath);
        console.log(`Заменено: ${sourceImage} → ${targetPath}`);
      }
    }

    console.log('Все изображения успешно заменены!');
  } catch (err) {
    console.error('Ошибка при замене изображений:', err);
  }
}

// Запускаем скрипт
console.log('Запуск функции replaceImages...');
replaceImages().then(() => {
  console.log('Скрипт завершён.');
}).catch(err => {
  console.error('Необработанная ошибка в replaceImages:', err);
});