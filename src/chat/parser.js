function parseChatMessage(msgEl) {
  if (msgEl.classList.contains('tbc-processed')) return null;
  if (msgEl.closest('.tbc-processed')) return null;

  const textSpans = msgEl.querySelectorAll(SELECTORS.chatText);
  const message = Array.from(textSpans).map((s) => s.textContent).join('').trim();
  if (!message) return null;

  const usernameEl = msgEl.querySelector(SELECTORS.chatUsername);
  const username = usernameEl?.textContent?.trim() || '';
  const usernameColor = getUsernameColor(msgEl);

  msgEl.classList.add('tbc-processed');
  return { message, username, usernameColor };
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
