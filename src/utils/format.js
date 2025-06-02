// Форматирование тегов и проверка на пустое значение
export function formatTag(key, value) {
  if (value === undefined || value === null || value === '') return '';
  switch (key) {
    case 'bedrooms':
      return value === 1 || value === '1' ? '1 спальня' : `${value} спальни`;
    case 'bathrooms':
      return value === 1 || value === '1' ? '1 ванна' : `${value} ванные`;
    case 'area':
      return `${value} кв.м.`;
    case 'floor':
      return `${value} этаж`;
    case 'parking':
      return value === true || value === 'true' || value === 'Есть' ? 'Есть парковка' : 'Нет парковки';
    case 'price':
      return `${Number(value).toLocaleString()} ₽`;
    case 'sea-distance':
      return value;
    default:
      return value;
  }
}

export function isNotEmpty(value) {
  return value !== undefined && value !== null && value !== '';
}
