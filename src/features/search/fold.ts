// Нормализация слов для поиска. Индекс и запрос проходят через одну и ту же функцию,
// поэтому кириллица и латиница сходятся в общий «латинский скелет»:
// «дарксайд» → darksaid ≈ darkside, «хулиган» → huligan ≈ hooligan, «черри» = cherry.

const CYRILLIC: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'sch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
};

/** Слово → латинский скелет; null — слово ничего не значит для поиска. */
export function foldTerm(term: string): string | null {
  const latin = term
    .toLowerCase()
    .normalize('NFD') // ё → е, й → и, é → e: диакритику отбрасываем ниже
    .replace(/\p{M}/gu, '')
    .replace(/[а-я]/g, (ch) => CYRILLIC[ch] ?? ch);
  const folded = latin
    .replace(/ph/g, 'f')
    .replace(/kh/g, 'h')
    .replace(/ck/g, 'k')
    .replace(/dzh|zh/g, 'j')
    .replace(/q/g, 'k')
    .replace(/w/g, 'v')
    .replace(/x/g, 'ks')
    .replace(/c(?=[eiy])/g, 's') // cigar → sigar
    .replace(/c(?!h)/g, 'k') // cola → kola, ch не трогаем
    .replace(/y/g, 'i')
    .replace(/(.)\1+/g, '$1') // green → gren, трофимофф → trofimof
    .replace(/[^a-z0-9]/g, '');
  return folded || null;
}

const EN = "qwertyuiop[]asdfghjkl;'zxcvbnm,.`";
const RU = 'йцукенгшщзхъфывапролджэячсмитьбюё';

/** Текст, набранный не в той раскладке: «vfyuj» → «манго», «ьштп» → «mint». */
export function swapLayout(text: string): string {
  return Array.from(text.toLowerCase(), (ch) => {
    const en = EN.indexOf(ch);
    if (en !== -1) return RU[en];
    const ru = RU.indexOf(ch);
    return ru !== -1 ? EN[ru] : ch;
  }).join('');
}
