// Безопасно получить tags из property (строка или объект)
export function getParsedTags(property) {
  if (!property || !property.tags) return {};
  if (typeof property.tags === 'string') {
    try {
      return JSON.parse(property.tags);
    } catch {
      return {};
    }
  }
  if (typeof property.tags === 'object' && property.tags !== null) {
    return property.tags;
  }
  return {};
}
