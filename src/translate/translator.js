const MS_LANG_MAP = {
  'zh-CN': 'zh-Hans',
  'zh-TW': 'zh-Hant',
  en: 'en',
  ja: 'ja',
  ko: 'ko',
  es: 'es',
  fr: 'fr',
  de: 'de',
  ru: 'ru',
  pt: 'pt',
};

const TRANSLATE_TIMEOUT_MS = 8000;

let msAuthCache = { token: '', expiresAt: 0, inflight: null };

function gmRequest(options) {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      timeout: TRANSLATE_TIMEOUT_MS,
      ...options,
      onload: (res) => resolve(res),
      onerror: () => reject(new Error('network error')),
      ontimeout: () => reject(new Error('timeout')),
    });
  });
}

function parseJwtExp(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.exp * 1000;
  } catch {
    return Date.now() + 9 * 60 * 1000;
  }
}

function toMicrosoftLang(code) {
  return MS_LANG_MAP[code] || code;
}

async function getMicrosoftAuthToken() {
  const now = Date.now();
  if (msAuthCache.token && msAuthCache.expiresAt > now + 30000) {
    return msAuthCache.token;
  }

  if (msAuthCache.inflight) return msAuthCache.inflight;

  msAuthCache.inflight = (async () => {
    try {
      const res = await gmRequest({
        method: 'GET',
        url: 'https://edge.microsoft.com/translate/auth',
      });
      const token = res.responseText?.trim();
      if (!token) throw new Error('empty auth token');
      msAuthCache.token = token;
      msAuthCache.expiresAt = parseJwtExp(token);
      return token;
    } finally {
      msAuthCache.inflight = null;
    }
  })();

  return msAuthCache.inflight;
}

async function microsoftTranslate(text, targetLang) {
  if (!text.trim() || text.length > 500) return '';

  try {
    const token = await getMicrosoftAuthToken();
    const to = toMicrosoftLang(targetLang);
    const url = `https://api-edge.cognitive.microsofttranslator.com/translate?api-version=3.0&to=${encodeURIComponent(to)}`;

    const res = await gmRequest({
      method: 'POST',
      url,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: JSON.stringify([{ Text: text }]),
    });

    const json = JSON.parse(res.responseText);
    return json?.[0]?.translations?.[0]?.text?.trim() || '';
  } catch {
    return '';
  }
}

async function googleTranslate(text, targetLang) {
  if (!text.trim() || text.length > 500) return '';

  try {
    const res = await gmRequest({
      method: 'GET',
      url: `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(text)}`,
    });

    const json = JSON.parse(
      res.responseText.replace(/,\s*,/g, ',null,').replace(/,\s*]/g, ',null]'),
    );
    return json[0].map((x) => x[0]).join('').trim();
  } catch {
    return '';
  }
}

async function translateWithProvider(text, targetLang, provider) {
  const primary = provider === 'google' ? googleTranslate : microsoftTranslate;
  const fallback = provider === 'google' ? microsoftTranslate : googleTranslate;

  const result = await primary(text, targetLang);
  if (result) return result;

  return fallback(text, targetLang);
}
