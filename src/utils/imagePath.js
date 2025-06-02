// Генерация пути к изображениям для объекта недвижимости
// Используйте normalize/decodeURIComponent если нужно
export function getImagePath({ developer, complex, id, index = 1 }) {
  if (!developer || !complex || !id) return '';
  return `/developers/${developer}/${complex}/${id}/images/${id}-${index}.jpg`;
}
