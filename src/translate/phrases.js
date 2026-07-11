const PHRASE_MAP = {
  lol: { 'zh-CN': '哈哈', 'zh-TW': '哈哈', en: 'lol' },
  lo: { 'zh-CN': '哈哈', 'zh-TW': '哈哈', en: 'lo' },
  lmao: { 'zh-CN': '笑死我了', 'zh-TW': '笑死我了', en: 'lmao' },
  lmfao: { 'zh-CN': '笑死我了', 'zh-TW': '笑死我了', en: 'lmfao' },
  rofl: { 'zh-CN': '笑翻', 'zh-TW': '笑翻', en: 'rofl' },
  kekw: { 'zh-CN': '笑死', 'zh-TW': '笑死', en: 'kekw' },
  kek: { 'zh-CN': '笑', 'zh-TW': '笑', en: 'kek' },
  gg: { 'zh-CN': 'GG', 'zh-TW': 'GG', en: 'gg' },
  ggs: { 'zh-CN': 'GG', 'zh-TW': 'GG', en: 'ggs' },
  wp: { 'zh-CN': '打得不错', 'zh-TW': '打得不错', en: 'wp' },
  gl: { 'zh-CN': '祝好运', 'zh-TW': '祝好運', en: 'gl' },
  hf: { 'zh-CN': '玩得开心', 'zh-TW': '玩得開心', en: 'hf' },
  nt: { 'zh-CN': '好尝试', 'zh-TW': '好嘗試', en: 'nt' },
  ns: { 'zh-CN': '好枪', 'zh-TW': '好槍', en: 'ns' },
  pog: { 'zh-CN': '强啊', 'zh-TW': '強啊', en: 'pog' },
  pogchamp: { 'zh-CN': '太强了', 'zh-TW': '太強了', en: 'pogchamp' },
  pepega: { 'zh-CN': '有点蠢', 'zh-TW': '有點蠢', en: 'pepega' },
  monkas: { 'zh-CN': '紧张', 'zh-TW': '緊張', en: 'monkas' },
  sadge: { 'zh-CN': 'Sad', 'zh-TW': 'Sad', en: 'sadge' },
  copium: { 'zh-CN': '做梦呢', 'zh-TW': '做夢呢', en: 'copium' },
  o7: { 'zh-CN': 'o7', 'zh-TW': 'o7', en: 'o7' },
  brb: { 'zh-CN': '马上回来', 'zh-TW': '馬上回來', en: 'brb' },
  afk: { 'zh-CN': '离开了', 'zh-TW': '離開了', en: 'afk' },
  bbl: { 'zh-CN': '待会儿回来', 'zh-TW': '待會兒回來', en: 'bbl' },
  gtg: { 'zh-CN': '得走了', 'zh-TW': '得走了', en: 'gtg' },
  ty: { 'zh-CN': '谢谢', 'zh-TW': '謝謝', en: 'ty' },
  thx: { 'zh-CN': '谢谢', 'zh-TW': '謝謝', en: 'thx' },
  np: { 'zh-CN': '不客气', 'zh-TW': '不客氣', en: 'np' },
  nw: { 'zh-CN': '不客气', 'zh-TW': '不客氣', en: 'nw' },
  imo: { 'zh-CN': '我觉得', 'zh-TW': '我覺得', en: 'imo' },
  imho: { 'zh-CN': '依我看', 'zh-TW': '依我看', en: 'imho' },
  tbh: { 'zh-CN': '老实说', 'zh-TW': '老實說', en: 'tbh' },
  ngl: { 'zh-CN': '说实话', 'zh-TW': '說實話', en: 'ngl' },
  rn: { 'zh-CN': '现在', 'zh-TW': '現在', en: 'rn' },
  idk: { 'zh-CN': '不知道', 'zh-TW': '不知道', en: 'idk' },
  ikr: { 'zh-CN': '确实', 'zh-TW': '確實', en: 'ikr' },
  smh: { 'zh-CN': '无语', 'zh-TW': '無語', en: 'smh' },
  omg: { 'zh-CN': '天呐', 'zh-TW': '天呐', en: 'omg' },
  omfg: { 'zh-CN': '我的天', 'zh-TW': '我的天', en: 'omfg' },
  wtf: { 'zh-CN': '什么鬼', 'zh-TW': '什麼鬼', en: 'wtf' },
  f: { 'zh-CN': 'F', 'zh-TW': 'F', en: 'f' },
  rip: { 'zh-CN': 'RIP', 'zh-TW': 'RIP', en: 'rip' },
  hi: { 'zh-CN': '嗨', 'zh-TW': '嗨', en: 'hi' },
  hello: { 'zh-CN': '你好', 'zh-TW': '你好', en: 'hello' },
  bye: { 'zh-CN': '再见', 'zh-TW': '再見', en: 'bye' },
  ez: { 'zh-CN': '轻松', 'zh-TW': '輕鬆', en: 'ez' },
  diff: { 'zh-CN': '差距', 'zh-TW': '差距', en: 'diff' },
  based: { 'zh-CN': '真不错', 'zh-TW': '真不錯', en: 'based' },
  cringe: { 'zh-CN': '尬', 'zh-TW': '尬', en: 'cringe' },
};

const TOOLTIP_ORIGINAL_MAX = 64;

function normalizePhraseKey(text) {
  return text.trim().toLowerCase().replace(/[!?.,"'`~]+$/g, '').replace(/^[!?.,"'`~]+/g, '');
}

function shouldSkipTranslation(text) {
  const trimmed = text.trim();
  if (!trimmed) return true;
  if (/^[\d\s+\-*/%=^#@&|<>[\]{}\\]+$/u.test(trimmed)) return true;
  if (/^[\p{P}\p{S}\s\d]+$/u.test(trimmed)) return true;
  return false;
}

function lookupPhrase(text, targetLang) {
  const key = normalizePhraseKey(text);
  if (!key || key.includes(' ')) return null;

  const entry = PHRASE_MAP[key];
  if (!entry) return null;

  return entry[targetLang] || entry.en || null;
}

function truncateText(text, max = TOOLTIP_ORIGINAL_MAX) {
  if (!text || text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

async function translateMessage(text, targetLang) {
  if (shouldSkipTranslation(text)) return text;

  const mapped = lookupPhrase(text, targetLang);
  if (mapped) return mapped;

  const translated = await googleTranslate(text, targetLang);
  return translated?.trim() || text;
}
