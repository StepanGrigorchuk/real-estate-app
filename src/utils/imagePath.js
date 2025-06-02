// Генерация пути к изображению для объекта недвижимости
// developer, complex, n — обязательные параметры
// n — порядковый номер объекта внутри комплекса (начинается с 1 для каждого комплекса)
// i — номер изображения (по умолчанию 1)
export function imagePath({ developer, complex, n, i = 1 }) {
  const folder = `${developer}_${complex}_${n}`;
  return `/developers/${developer}/${complex}/${folder}/${i}.jpg`;
}

// Вспомогательная функция для вычисления n для property внутри массива всех properties
// Возвращает n для property (индекс внутри своего комплекса + 1)
export function getNForProperty(property, allProperties) {
  if (!property || !allProperties) return 1;
  const { developer, complex, id } = property;
  // Фильтруем только объекты этого комплекса
  const sameComplex = allProperties.filter(
    p => p.developer === developer && p.complex === complex
  );
  // Находим индекс текущего объекта среди объектов этого комплекса
  const idx = sameComplex.findIndex(p => String(p.id) === String(id));
  return idx >= 0 ? idx + 1 : 1;
}

// Генерация массива путей к изображениям для всех объектов внутри комплекса
// developer, complex — обязательные параметры
// filesByObject — массив массивов имён файлов для каждого объекта внутри комплекса
// Возвращает массив путей для всех объектов комплекса, где n начинается с 1 для каждого комплекса
export function generateImagePathsForComplex({ developer, complex, filesByObject }) {
  // filesByObject: [["1.jpg", "2.jpg"], ["1.jpg"], ...] — для каждого объекта внутри комплекса
  return filesByObject.map((files, idx) => {
    const n = idx + 1; // для каждого объекта внутри комплекса
    const folder = `${developer}_${complex}_${n}`;
    return files.map(file => `/developers/${developer}/${complex}/${folder}/${file}`);
  });
}

// Генерация массива путей к изображениям для одного объекта (property)
// Возвращает массив путей вида /developers/developer/complex/developer_complex_n/i.jpg для i=1..maxImages
export function generateImagePathsForProperty(property, allProperties, maxImages = 20) {
  if (!property || !property.developer || !property.complex) return [];
  // n вычисляем как в getNForProperty
  let n = 1;
  if (allProperties && Array.isArray(allProperties)) {
    const { developer, complex, id } = property;
    const sameComplex = allProperties.filter(
      p => p.developer === developer && p.complex === complex
    );
    const idx = sameComplex.findIndex(p => String(p.id) === String(id));
    n = idx >= 0 ? idx + 1 : 1;
  }
  const { developer, complex } = property;
  const paths = [];
  for (let i = 1; i <= maxImages; i++) {
    const folder = `${developer}_${complex}_${n}`;
    paths.push(`/developers/${developer}/${complex}/${folder}/${i}.jpg`);
  }
  return paths;
}
