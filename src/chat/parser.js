function extractEmoteName(node) {
  return node.alt
    || node.getAttribute('title')
    || node.getAttribute('aria-label')
    || node.dataset?.alt
    || '';
}

function extractMessageContent(msgEl) {
  const root = msgEl.querySelector('[data-a-target="chat-message-text"]')
    || msgEl.querySelector('.chat-line__message-body')
    || msgEl;

  const parts = [];

  const walk = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      parts.push(node.textContent);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    if (node.matches('[data-a-target="chat-message-username"], .chat-author__display-name, .chat-line__username')) {
      return;
    }

    if (node.tagName === 'IMG') {
      const name = extractEmoteName(node);
      if (name) parts.push(name);
      return;
    }

    if (node.matches('[data-a-target="chat-message-emote"], .chat-line__message--emote, .chat-line__message--emote-button')) {
      const img = node.querySelector('img');
      const name = extractEmoteName(img || node);
      if (name) parts.push(name);
      return;
    }

    if (node.matches('span[data-a-target="chat-message-text"], span.text-fragment')) {
      for (const child of node.childNodes) walk(child);
      return;
    }

    for (const child of node.childNodes) walk(child);
  };

  if (root.matches('[data-a-target="chat-message-text"], .chat-line__message-body')) {
    for (const child of root.childNodes) walk(child);
  } else {
    walk(root);
  }

  return parts.join('').trim();
}

function parseChatMessage(msgEl) {
  if (msgEl.classList.contains('tbc-processed')) return null;
  if (msgEl.closest('.tbc-processed')) return null;

  const rawMessage = extractMessageContent(msgEl);
  if (!rawMessage) return null;

  const message = dedupeRepeatedMessage(rawMessage);

  const usernameEl = msgEl.querySelector(SELECTORS.chatUsername);
  const username = usernameEl?.textContent?.trim() || '';
  const usernameColor = getUsernameColor(msgEl);
  const profileUrl = getTwitchProfileUrl(usernameEl, username);

  msgEl.classList.add('tbc-processed');
  return { message, username, usernameColor, profileUrl };
}

function markExistingMessages(chatRoot) {
  chatRoot.querySelectorAll(SELECTORS.chatMessage).forEach((el) => {
    el.classList.add('tbc-processed');
  });
}

function isLiveMessage(msgEl, chatRoot) {
  const messages = chatRoot.querySelectorAll(SELECTORS.chatMessage);
  if (!messages.length) return true;

  const tailStart = Math.max(0, messages.length - LIVE_MESSAGE_TAIL);
  for (let i = tailStart; i < messages.length; i++) {
    const node = messages[i];
    if (node === msgEl || node.contains(msgEl) || msgEl.contains(node)) {
      return true;
    }
  }
  return false;
}
