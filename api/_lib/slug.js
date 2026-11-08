// URL dostu slug üretimi — Türkçe ve Rusça karakterleri Latin harflere çevirir.
// Hem sunucu (api/) hem admin paneli bu dosyayı kullanır.

const TR_MAP = {
  ç: 'c', ğ: 'g', ı: 'i', i: 'i', ö: 'o', ş: 's', ü: 'u',
  â: 'a', î: 'i', û: 'u',
};

const RU_MAP = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh',
  щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

export function slugify(input) {
  if (!input) return '';
  // Büyük İ / I'yı Türkçe kurala göre küçült
  const lower = String(input).replace(/İ/g, 'i').replace(/I/g, 'ı').toLocaleLowerCase('tr-TR');
  let out = '';
  for (const ch of lower) {
    if (TR_MAP[ch] !== undefined) out += TR_MAP[ch];
    else if (RU_MAP[ch] !== undefined) out += RU_MAP[ch];
    else out += ch;
  }
  return out
    .replace(/['’‘`´]/g, '') // Tuzla’da -> tuzlada
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 90)
    .replace(/-+$/g, '');
}

export function isValidSlug(slug) {
  return typeof slug === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= 120;
}
