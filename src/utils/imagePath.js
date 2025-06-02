// Генерация пути к изображению для объекта недвижимости
// developer, complex, n — обязательные параметры
// i — номер изображения (по умолчанию 1)
export function imagePath({ developer, complex, n, i = 1 }) {
  // n — порядковый номер объекта внутри комплекса (начинается с 1 для каждого комплекса)
  // developer, complex — строки без пробелов и спецсимволов
  // Пример: /developers/lsr/rayskiy_bereg/lsr_rayskiy_bereg_1/1.jpg
  const folder = `${developer}_${complex}_${n}`;
  return `/developers/${developer}/${complex}/${folder}/${i}.jpg`;
}
