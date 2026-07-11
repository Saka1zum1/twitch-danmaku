const TOOLTIP_ORIGINAL_MAX = 64;

function shouldSkipTranslation(text) {
  const trimmed = text.trim();
  if (!trimmed) return true;
  if (/^[\d\s+\-*/%=^#@&|<>[\]{}\\]+$/u.test(trimmed)) return true;
  if (/^[\p{P}\p{S}\s\d]+$/u.test(trimmed)) return true;
  return false;
}

function needsMachineTranslation(text) {
  const stripped = text.replace(/⟦T\d+⟧/g, '').trim();
  return !!stripped;
}

function truncateText(text, max = TOOLTIP_ORIGINAL_MAX) {
  if (!text || text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

async function translateMessage(text, targetLang, provider = 'microsoft') {
  if (shouldSkipTranslation(text)) return text;

  const { preparedText, placeholders, fullyMapped } = prepareDictionaryText(text, targetLang);
  if (fullyMapped) {
    return restoreDictionaryText(preparedText, placeholders);
  }

  let machineText = preparedText;
  if (needsMachineTranslation(preparedText)) {
    machineText = await translateWithProvider(preparedText, targetLang, provider);
    if (!machineText?.trim()) machineText = preparedText;
  }

  const restored = restoreDictionaryText(machineText, placeholders);
  return restored?.trim() || text;
}
