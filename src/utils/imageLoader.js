
/**
 * Проверяет существование изображения по URL
 * @param {string} imageUrl - URL изображения для проверки
 * @param {number} timeout - Тайм-аут в миллисекундах (по умолчанию 3000)
 * @returns {Promise<boolean>} - Promise, который разрешается в true/false
 */
export const checkImageExists = (imageUrl, timeout = 3000) => {
  return new Promise((resolve) => {
    const img = new Image();
    
    const timeoutId = setTimeout(() => {
      img.onload = null;
      img.onerror = null;
      resolve(false);
    }, timeout);
    
    img.onload = () => {
      clearTimeout(timeoutId);
      resolve(true);
    };
    
    img.onerror = () => {
      clearTimeout(timeoutId);
      resolve(false);
    };
    
    img.src = imageUrl;
  });
};

/**
 * Загружает массив действительных изображений для свойства
 * @param {Object} params - Параметры для генерации путей изображений
 * @param {string} params.developer - Разработчик
 * @param {string} params.complex - Комплекс
 * @param {number} params.n - Номер свойства
 * @param {Function} imagePath - Функция для генерации пути изображения
 * @param {number} maxImages - Максимальное количество изображений для проверки
 * @param {number} maxConsecutiveFailures - Максимальное количество последовательных неудач
 * @returns {Promise<string[]>} - Promise с массивом URL действительных изображений
 */
export const loadValidImages = async ({
  developer,
  complex,
  n,
  imagePath,
  maxImages = 20,
  maxConsecutiveFailures = 3
}) => {
  const validImages = [];
  let consecutiveFailures = 0;
  
  for (let i = 1; i <= maxImages; i++) {
    const imgPath = imagePath({ developer, complex, n, i });
    
    const isValid = await checkImageExists(imgPath);
    
    if (isValid) {
      validImages.push(imgPath);
      consecutiveFailures = 0;
    } else {
      consecutiveFailures++;
      
      // Если достигли лимита последовательных неудач, прекращаем поиск
      if (consecutiveFailures >= maxConsecutiveFailures) {
        break;
      }
    }
  }
  
  return validImages;
};

/**
 * Фильтрует массив изображений, оставляя только существующие
 * @param {string[]} imageUrls - Массив URL изображений
 * @param {number} timeout - Тайм-аут для каждой проверки
 * @returns {Promise<string[]>} - Promise с массивом действительных URL
 */
export const filterValidImages = async (imageUrls, timeout = 3000) => {
  const validationPromises = imageUrls.map(url => 
    checkImageExists(url, timeout).then(isValid => ({ url, isValid }))
  );
  
  const results = await Promise.all(validationPromises);
  
  return results
    .filter(result => result.isValid)
    .map(result => result.url);
};
