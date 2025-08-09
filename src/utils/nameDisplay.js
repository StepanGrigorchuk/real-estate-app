// Utilities to derive nice Russian display names for developer/complex
// from a sample Russian title and normalized complex slug stored in DB.

const translitMap = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y',
  'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f',
  'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
};

export function normalizeToSlug(input) {
  if (!input) return '';
  const lower = String(input).toLowerCase();
  let out = '';
  for (const ch of lower) {
    if (/[a-z0-9]/.test(ch)) { out += ch; continue; }
    if (ch === ' ' || ch === '-' || ch === '_') { out += '_'; continue; }
    if (translitMap[ch] !== undefined) { out += translitMap[ch]; continue; }
    // drop other chars
  }
  out = out.replace(/[^a-z0-9_]/g, '').replace(/_+/g, '_');
  return out.replace(/^_+|_+$/g, '');
}

export function splitTitleIntoDeveloperAndComplex({ titleRu, complexSlug, roomRu }) {
  if (!titleRu) return { developerRu: null, complexRu: null };
  let title = String(titleRu).trim();
  if (roomRu) {
    const room = String(roomRu).trim();
    if (title.endsWith(room)) {
      title = title.slice(0, -room.length).trim();
    }
  }
  const originalTokens = title.split(/\s+/).filter(Boolean);
  const normalizedTokens = originalTokens.map(normalizeToSlug);
  const complexTokens = (complexSlug || '').split('_').filter(Boolean);

  // find subsequence match of complexTokens in normalizedTokens
  let startIdx = -1;
  for (let i = 0; i <= normalizedTokens.length - complexTokens.length; i++) {
    let ok = true;
    for (let j = 0; j < complexTokens.length; j++) {
      if (normalizedTokens[i + j] !== complexTokens[j]) { ok = false; break; }
    }
    if (ok) { startIdx = i; break; }
  }

  if (startIdx >= 0) {
    const developerRu = originalTokens.slice(0, startIdx).join(' ').trim() || null;
    const complexRu = originalTokens.slice(startIdx).join(' ').trim() || null;
    return { developerRu, complexRu };
  }

  // fallback: return whole as complex, no developer
  return { developerRu: null, complexRu: title };
}

export function titleCaseFromSlug(slug) {
  if (!slug) return '';
  return String(slug)
    .split('_')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}


