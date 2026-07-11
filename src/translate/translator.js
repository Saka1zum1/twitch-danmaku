async function googleTranslate(text, targetLang) {
  if (!text.trim() || text.length > 500) return '';

  return new Promise((resolve) => {
    GM_xmlhttpRequest({
      method: 'GET',
      url: `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(text)}`,
      onload(res) {
        try {
          const json = JSON.parse(
            res.responseText.replace(/,\s*,/g, ',null,').replace(/,\s*]/g, ',null]')
          );
          resolve(json[0].map((x) => x[0]).join(''));
        } catch {
          resolve('');
        }
      },
      onerror: () => resolve(''),
    });
  });
}
