function loadSettings() {
  try {
    const saved = GM_getValue(STORAGE_KEY, null);
    if (saved && typeof saved === 'object') {
      const merged = { ...DEFAULT_SETTINGS, ...saved };
      if (merged.scrollArea === 'half') {
        merged.scrollArea = 'top-half';
      }
      if (!TRANSLATE_PROVIDERS.includes(merged.translateProvider)) {
        merged.translateProvider = DEFAULT_SETTINGS.translateProvider;
      }
      merged.blockedKeywords = sanitizeBlockedKeywords(merged.blockedKeywords);
      merged.danmakuOpacity = clamp(Number(merged.danmakuOpacity) || DEFAULT_SETTINGS.danmakuOpacity, 10, 100);
      merged.speechEnabled = !!merged.speechEnabled;
      merged.speechVolume = clamp(finiteNumber(merged.speechVolume, DEFAULT_SETTINGS.speechVolume), 0, 100);
      merged.speechPitch = clamp(finiteNumber(merged.speechPitch, DEFAULT_SETTINGS.speechPitch), 0, 200);
      merged.speechRate = clamp(finiteNumber(merged.speechRate, DEFAULT_SETTINGS.speechRate), 50, 200);
      merged.speechPace = merged.speechPace !== false;
      merged.speechMaxSeconds = clamp(finiteNumber(merged.speechMaxSeconds, DEFAULT_SETTINGS.speechMaxSeconds), 1, 15);
      merged.speechBuffer = clamp(finiteNumber(merged.speechBuffer, DEFAULT_SETTINGS.speechBuffer), 1, 25);
      merged.speechVoice = typeof merged.speechVoice === 'string' ? merged.speechVoice : '';
      merged.speechLang = typeof merged.speechLang === 'string' ? merged.speechLang : '';
      merged.superchatPinned = !!merged.superchatPinned;
      if (!['top', 'bottom'].includes(merged.superchatPosition)) merged.superchatPosition = 'top';
      if (!['fade', 'slide', 'pop', 'shine'].includes(merged.superchatAnimation)) merged.superchatAnimation = 'slide';
      merged.superchatDuration = clamp(finiteNumber(merged.superchatDuration, DEFAULT_SETTINGS.superchatDuration), 2, 15);
      return merged;
    }
  } catch (_) {
    /* ignore */
  }
  return { ...DEFAULT_SETTINGS };
}

function saveSettings(settings) {
  GM_setValue(STORAGE_KEY, settings);
}

function finiteNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

const BLOCKED_KEYWORD_LIMIT = 50;
const BLOCKED_KEYWORD_LENGTH = 40;

function sanitizeBlockedKeywords(value) {
  if (!Array.isArray(value)) return [];

  const seen = new Set();
  const keywords = [];
  for (const item of value) {
    const keyword = String(item || '').trim().slice(0, BLOCKED_KEYWORD_LENGTH);
    const key = keyword.toLowerCase();
    if (!keyword || seen.has(key)) continue;
    seen.add(key);
    keywords.push(keyword);
    if (keywords.length >= BLOCKED_KEYWORD_LIMIT) break;
  }
  return keywords;
}

function isKeywordBlocked(text, keywords) {
  const haystack = String(text || '').toLowerCase();
  if (!haystack || !keywords?.length) return false;
  return keywords.some((keyword) => {
    const needle = String(keyword || '').trim().toLowerCase();
    return needle && haystack.includes(needle);
  });
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function isPageActive() {
  return !document.hidden && document.visibilityState === 'visible';
}
