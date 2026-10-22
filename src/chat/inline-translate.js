function clearChatTranslations(root = document) {
  root.querySelectorAll?.('.tbc-chat-translation').forEach((node) => node.remove());
}

function removeChatTranslation(msgEl) {
  msgEl?.querySelectorAll?.('.tbc-chat-translation').forEach((node) => node.remove());
}

function normalizeCompareText(text) {
  return String(text || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function applyChatTranslation(msgEl, translatedText, originalText) {
  if (!msgEl?.isConnected) return false;
  const translated = String(translatedText || '').replace(/\s+/g, ' ').trim();
  if (!translated) {
    removeChatTranslation(msgEl);
    return false;
  }
  if (normalizeCompareText(translated) === normalizeCompareText(originalText)) {
    removeChatTranslation(msgEl);
    return false;
  }

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

  const textEl = row.querySelector('.tbc-chat-translation-text');
  if (textEl) textEl.textContent = translated;
  const badgeEl = row.querySelector('.tbc-chat-translation-badge');
  if (badgeEl) badgeEl.textContent = t('translateBadge');
  return true;
}
