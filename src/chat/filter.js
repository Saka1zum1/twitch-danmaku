const IGNORED_CHAT_BOTS = new Set([
  'streamelements',
  'streamelement',
  'nightbot',
  'moobot',
  'fossabot',
  'streamlabs',
  'wizebot',
  'botrix',
  'botrixlive',
  'coeabot',
  'phantombot',
  'stay_hydrated_bot',
  'soundalerts',
  'streamholics',
  'commanderroot',
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

function isUserNoticeLine(msgEl) {
  return !!msgEl?.matches?.('[data-test-selector="user-notice-line"], .user-notice-line');
}

function hasUserAuthoredChatBody(msgEl) {
  if (!msgEl) return false;

  const customRoot = msgEl.querySelector('[data-a-target="chat-resubscription-message__custom-message"]');
  const chatRoot = customRoot || msgEl;
  const body = chatRoot.querySelector(
    '[data-a-target="chat-line-message-body"], .chat-line__message-body, [data-a-target="chat-message-container"]',
  ) || chatRoot;

  if (body.querySelector('[data-a-target="chat-message-text"], .text-fragment')?.textContent?.trim()) {
    return true;
  }
  if (body.querySelector('img[data-emote-name], img.chat-line__message--emote, .chat-line__message--emote')) {
    return true;
  }
  return false;
}

function isPaidSuperChatNotice(snapshot) {
  const meta = snapshot?.superchatMeta;
  return !!snapshot?.superchat && !!meta && (meta.kind === 'cheer' || meta.kind === 'sub');
}

function lacksUserLiveChatContent(snapshot, msgEl = null) {
  if (!snapshot) return true;

  if (isPaidSuperChatNotice(snapshot)) return false;

  if (msgEl && hasUserAuthoredChatBody(msgEl)) return false;

  const plain = String(snapshot.message || '').replace(/\s+/g, ' ').trim();
  const hasRenderableParts = Array.isArray(snapshot.parts) && snapshot.parts.some((part) => (
    (part.type === 'text' && String(part.value || '').trim())
    || (part.type === 'emote' && (part.name || part.src))
  ));
  if (hasRenderableParts && !isUserNoticeLine(msgEl)) return false;

  if (msgEl && isUserNoticeLine(msgEl)) return true;

  if (!msgEl) return !plain;

  return !plain && !hasRenderableParts;
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

function shouldSuppressSubscribeSuperchat(settings, snapshot) {
  if (!settings?.superchatHideSubscribe) return false;
  const meta = snapshot?.superchatMeta;
  return !!snapshot?.superchat && meta?.kind === 'sub';
}

function shouldIgnoreChatPayload(snapshot, msgEl = null, settings = null) {
  if (!snapshot) return true;
  if (shouldSuppressSubscribeSuperchat(settings, snapshot)) return true;
  if (isIgnoredChatBot(snapshot.login, snapshot.username)) return true;
  if (isPaidSuperChatNotice(snapshot)) {
    if (isPureLinkMessage(snapshot.message)) return true;
    return false;
  }
  if (lacksUserLiveChatContent(snapshot, msgEl)) return true;
  if (isChatDividerMessage(msgEl, snapshot)) return true;
  if (isPureLinkMessage(snapshot.message)) return true;
  return false;
}
