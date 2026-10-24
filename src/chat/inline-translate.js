function clearChatTranslations(root = document, { force = false } = {}) {
  root.querySelectorAll?.('.tbc-chat-translation').forEach((node) => {
    if (!force && node.getAttribute('data-tbc-manual-tl') === 'true') return;
    node.remove();
  });
}

function removeChatTranslation(msgEl, { force = false } = {}) {
  msgEl?.querySelectorAll?.('.tbc-chat-translation').forEach((node) => {
    if (!force && node.getAttribute('data-tbc-manual-tl') === 'true') return;
    node.remove();
  });
}

function hasManualChatTranslation(msgEl) {
  return !!msgEl?.querySelector?.('.tbc-chat-translation[data-tbc-manual-tl="true"]');
}

function readChatTranslationText(msgEl) {
  return String(msgEl?.querySelector?.('.tbc-chat-translation-text')?.textContent || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeCompareText(text) {
  return String(text || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function applyChatTranslation(msgEl, translatedText, originalText, options = {}) {
  if (!msgEl?.isConnected) return false;
  const manual = !!options.manual;
  const translated = String(translatedText || '').replace(/\s+/g, ' ').trim();
  if (!translated) {
    removeChatTranslation(msgEl, { force: manual });
    return false;
  }
  if (normalizeCompareText(translated) === normalizeCompareText(originalText)) {
    removeChatTranslation(msgEl, { force: manual });
    return false;
  }

  // Auto pipeline must not overwrite a context-menu translation.
  if (!manual && hasManualChatTranslation(msgEl)) return true;

  let row = msgEl.querySelector(':scope > .tbc-chat-translation');
  if (!row) {
    row = msgEl.querySelector('.tbc-chat-translation');
  }
  if (!row) {
    row = document.createElement('div');
    row.className = 'tbc-chat-translation';
    row.setAttribute('data-a-target', 'tbc-chat-translation');

    const badge = document.createElement('span');
    badge.className = 'tbc-chat-translation-badge';
    badge.textContent = t('translateBadge');

    const text = document.createElement('span');
    text.className = 'tbc-chat-translation-text';

    row.append(badge, text);

    const body = msgEl.querySelector(SELECTORS.chatMessageBody);
    if (body?.parentElement) {
      body.insertAdjacentElement('afterend', row);
    } else {
      msgEl.appendChild(row);
    }
  }

  if (manual) row.setAttribute('data-tbc-manual-tl', 'true');
  else row.removeAttribute('data-tbc-manual-tl');

  const textEl = row.querySelector('.tbc-chat-translation-text');
  if (textEl) textEl.textContent = translated;
  const badgeEl = row.querySelector('.tbc-chat-translation-badge');
  if (badgeEl) badgeEl.textContent = t('translateBadge');
  return true;
}
