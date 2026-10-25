const IGNORED_CHAT_BOTS = new Set([
  'streamelements',
  'streamelement',
]);

const CHAT_DIVIDER_TEXT_RE = /^(全新|新消息|新訊息|消息分隔|訊息分隔|new messages?|welcome to the chat(?: room)?!?|chat cleared|room modes?)$/i;
const PURE_LINK_TOKEN_RE = /^(?:https?:\/\/|www\.)\S+$/i;

function normalizeChatActor(value) {
  return String(value || '').trim().replace(/^@+/, '').toLowerCase();
}

function isIgnoredChatBot(login, username) {
  const actors = [login, username].map(normalizeChatActor).filter(Boolean);
  return actors.some((name) => IGNORED_CHAT_BOTS.has(name));
}

function isPureLinkMessage(text) {
  const cleaned = String(text || '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim();
  if (!cleaned) return false;
  const tokens = cleaned.split(/\s+/).filter(Boolean);
  if (!tokens.length) return false;
  return tokens.every((token) => PURE_LINK_TOKEN_RE.test(token));
}

function isChatDividerMessage(msgEl, snapshot = null) {
  if (msgEl) {
    if (msgEl.matches?.('.chat-line__status, [data-a-target="chat-welcome-message"], [data-test-selector="chat-line-status"]')) {
      return true;
    }
    if (msgEl.closest?.('.chat-line__status, [data-a-target="chat-welcome-message"], [class*="chat-line-status"]')) {
      return true;
    }
    if (msgEl.querySelector?.('.chat-line__status, [data-a-target="chat-welcome-message"]')) {
      return true;
    }
    if (msgEl.matches?.('[class*="separator"], [class*="divider"], [data-test-selector*="separator"]')
      || msgEl.querySelector?.('[class*="chat-separator"], [class*="message-separator"]')) {
      return true;
    }

    const hasUsername = !!msgEl.querySelector?.(SELECTORS.chatUsername);
    const login = normalizeChatActor(snapshot?.login || msgEl.getAttribute?.('data-a-user'));
    if (!hasUsername && !login) return true;
  }

  const text = String(snapshot?.message || msgEl?.textContent || '')
    .replace(/\s+/g, ' ')
    .trim();
  return !!text && CHAT_DIVIDER_TEXT_RE.test(text);
}

function shouldIgnoreChatPayload(snapshot, msgEl = null) {
  if (!snapshot) return true;
  if (isIgnoredChatBot(snapshot.login, snapshot.username)) return true;
  // Subscribe / cheer Super Chats must not be dropped as "divider" system lines.
  if (snapshot.superchat) return false;
  if (isChatDividerMessage(msgEl, snapshot)) return true;
  if (isPureLinkMessage(snapshot.message)) return true;
  return false;
}
