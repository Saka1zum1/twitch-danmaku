function extractEmoteName(node) {
  if (!node) return '';
  return node.getAttribute?.('data-emote-name')
    || node.alt
    || node.getAttribute?.('title')
    || node.dataset?.alt
    || '';
}

function pickEmoteSrc(img) {
  const srcset = img.getAttribute('srcset') || '';
  const candidates = srcset.split(',')
    .map((item) => item.trim().split(/\s+/)[0])
    .filter(Boolean);
  const preferred = candidates.find((url) => /\/2\.0(?:$|[?#])/.test(url))
    || candidates[candidates.length - 1]
    || img.getAttribute('src')
    || '';

  try {
    const url = new URL(preferred, location.href);
    if (url.protocol !== 'https:') return '';
    url.hash = '';
    return url.href;
  } catch {
    return '';
  }
}

function partsToPlain(parts) {
  let out = '';
  for (const part of parts) {
    if (part.type === 'emote') {
      if (out && !/\s$/.test(out)) out += ' ';
      out += part.name || '';
      continue;
    }
    out += part.value || '';
  }
  return out.trim();
}

function mergeTextParts(parts) {
  const merged = [];
  for (const part of parts) {
    if (part.type === 'text') {
      if (!part.value) continue;
      const last = merged[merged.length - 1];
      if (last?.type === 'text') last.value += part.value;
      else merged.push({ type: 'text', value: part.value });
      continue;
    }
    if (part.name || part.src) merged.push(part);
  }
  return merged;
}

function dedupeParts(parts) {
  const units = [];
  for (const part of parts) {
    if (part.type === 'emote') {
      units.push(part.name || '');
      continue;
    }
    const words = String(part.value || '').trim().split(/\s+/).filter(Boolean);
    units.push(...words);
  }

  const original = units.join(' ');
  const deduped = dedupeRepeatedMessage(original);
  if (!original || deduped === original) return mergeTextParts(parts);

  const kept = deduped.split(/\s+/).filter(Boolean);
  const rebuilt = [];
  let cursor = 0;

  const visit = (part) => {
    if (cursor >= kept.length) return;
    if (part.type === 'emote') {
      if ((part.name || '') === kept[cursor]) {
        if (rebuilt.length) rebuilt.push({ type: 'text', value: ' ' });
        rebuilt.push(part);
        cursor += 1;
      }
      return;
    }
    const words = String(part.value || '').trim().split(/\s+/).filter(Boolean);
    words.forEach((word) => {
      if (cursor >= kept.length || word !== kept[cursor]) return;
      if (rebuilt.length) rebuilt.push({ type: 'text', value: ' ' });
      rebuilt.push({ type: 'text', value: word });
      cursor += 1;
    });
  };

  parts.forEach(visit);
  return cursor === kept.length ? mergeTextParts(rebuilt) : mergeTextParts(parts);
}

function extractMessageParts(msgEl) {
  const root = msgEl.querySelector(SELECTORS.chatMessageBody);
  if (!root) return [];

  const parts = [];

  const pushText = (text) => {
    if (!text) return;
    const last = parts[parts.length - 1];
    if (last?.type === 'text') last.value += text;
    else parts.push({ type: 'text', value: text });
  };

  const pushEmote = (img) => {
    const name = extractEmoteName(img).trim();
    const src = pickEmoteSrc(img);
    if (bitsFromImageAsset(img) > 0 || isCheerTierImageSrc(src)) return;
    if (!name && !src) return;
    parts.push({ type: 'emote', name, src });
  };

  const walk = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      pushText(node.textContent);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    if (node.matches('.chat-badge, [data-a-target="chat-badge"], .chat-line__icons, .chat-line__username, [data-a-target="chat-message-username"], .video-chat__message-author, .vod-message__header, .video-chat__message-menu')) {
      return;
    }

    // VOD chat puts a lone ":" separator before the message body text.
    if (!node.querySelector('img, [data-a-target="emote-name"], [data-a-target="chat-message-text"]')
      && node.textContent?.trim() === ':') {
      return;
    }

    if (node.tagName === 'IMG') {
      if (node.classList.contains('chat-badge') || node.closest('[data-a-target="chat-badge"]')) return;
      if (bitsFromImageAsset(node) > 0) return;
      pushEmote(node);
      return;
    }

    if (node.matches('.chat-line__message--emote-button, [data-a-target="emote-name"]')) {
      const img = node.querySelector('img');
      if (img) pushEmote(img);
      return;
    }

    for (const child of node.childNodes) walk(child);
  };

  for (const child of root.childNodes) walk(child);
  return dedupeParts(parts);
}

function usableCssColor(value) {
  if (!value || value === 'transparent' || value === 'rgba(0, 0, 0, 0)') return '';
  return value;
}

function isChatBadgeImage(img) {
  return !!img?.closest?.('.chat-badge, [data-a-target="chat-badge"], .chat-line__icons');
}

function bitsFromText(text) {
  const source = String(text || '');
  if (!source) return 0;
  const matcher = new RegExp(BITS_TOKEN_PATTERN, 'gi');
  let total = 0;
  let match = matcher.exec(source);
  while (match) {
    total += Number(match[1]) || 0;
    match = matcher.exec(source);
  }
  return total;
}

function bitsFromPlainSuffix(text) {
  const match = String(text || '').match(/(?:^|\s)([1-9]\d{0,6})\s+bits\s*$/i);
  return match ? (Number(match[1]) || 0) : 0;
}

function stripCheerAmountSuffixText(text) {
  return String(text || '').replace(/(?:\s*[·•\-–—]\s*|\s+)([1-9]\d{0,6})\s+bits\s*$/i, '').trim();
}

function stripCheerAmountSuffixParts(parts) {
  const list = Array.isArray(parts) ? parts.slice() : [];
  for (let i = list.length - 1; i >= 0; i -= 1) {
    if (list[i].type !== 'text') continue;
    const next = stripCheerAmountSuffixText(list[i].value);
    if (next === list[i].value) return list;
    if (!next) list.splice(i, 1);
    else list[i] = { ...list[i], value: next };
    break;
  }
  return list;
}

function isCheerTierImageSrc(src) {
  const value = String(src || '');
  if (!value) return false;
  return /\/actions\/[^/\s]+\/(?:dark|light)\/(?:animated|static)\/\d+\//i.test(value)
    || /\/bits\/(?:dark|light)\/(?:animated|static)\/[^/\s]+\/\d+(?:\/|[.?#]|$)/i.test(value);
}

function bitsFromImageAsset(img) {
  if (!img || isChatBadgeImage(img)) return 0;
  const alt = img.getAttribute('alt') || '';
  const emoteName = img.getAttribute('data-emote-name') || img.getAttribute('title') || '';
  const labeled = `${alt} ${emoteName}`.trim();
  const fromLabel = bitsFromText(labeled) || bitsFromText(` ${labeled}`);
  if (fromLabel > 0) return fromLabel;

  const src = img.getAttribute('src') || img.getAttribute('srcset') || '';
  // cloudfront actions/.../tier/scale  |  static-cdn bits/{theme}/{type}/{prefix}/{tier}
  const fromSrc = src.match(/\/actions\/[^/\s]+\/(?:dark|light)\/(?:animated|static)\/(\d+)\//i)
    || src.match(/\/bits\/(?:dark|light)\/(?:animated|static)\/[^/\s]+\/(\d+)(?:\/|[.?#]|$)/i)
    || src.match(/\/bits\/[^/\s]+\/[^/\s]+\/(?:dark|light)\/(?:animated|static)\/(\d+)\//i);
  return fromSrc ? (Number(fromSrc[1]) || 0) : 0;
}

function hasCheer(msgEl) {
  if (!msgEl) return false;
  const root = msgEl.querySelector(SELECTORS.chatMessageBody) || msgEl;
  if (bitsFromText(root.textContent || '') > 0) return true;
  return [...root.querySelectorAll('img')].some((img) => bitsFromImageAsset(img) > 0);
}

function paidBackground(msgEl) {
  const nodes = [msgEl, msgEl.querySelector('.chat-line__message-container')].filter(Boolean);
  for (const node of nodes) {
    const color = usableCssColor(node.style?.backgroundColor);
    if (color) return color;
    const styled = node.querySelector?.('[style*="background"]');
    const nested = usableCssColor(styled?.style?.backgroundColor);
    if (nested) return nested;
  }
  return '';
}

function cheerTierStyle(bits) {
  // Twitch cheermote tiers: 1 gray, 100 purple, 1000 teal, 5000 blue, 10000 red, 100000 gold.
  // Bits card presets like 300/1000/5000/10000 are amounts, not separate color thresholds.
  const amount = Math.max(0, Number(bits) || 0);
  if (amount >= 100000) {
    return { background: 'linear-gradient(135deg, #ffb400 0%, #ff7300 100%)', color: '#1a1200', accent: '#ffb400' };
  }
  if (amount >= 10000) {
    return { background: 'linear-gradient(135deg, #f43021 0%, #ff6b6b 100%)', color: '#ffffff', accent: '#f43021' };
  }
  if (amount >= 5000) {
    return { background: 'linear-gradient(135deg, #0099fe 0%, #00d4ff 100%)', color: '#ffffff', accent: '#0099fe' };
  }
  if (amount >= 1000) {
    return { background: 'linear-gradient(135deg, #1db2a5 0%, #24dbcc 100%)', color: '#ffffff', accent: '#1db2a5' };
  }
  if (amount >= 100) {
    return { background: 'linear-gradient(135deg, #9c3ee8 0%, #bf94ff 100%)', color: '#ffffff', accent: '#9c3ee8' };
  }
  return { background: 'linear-gradient(135deg, #7a7a7a 0%, #9b9b9b 100%)', color: '#ffffff', accent: '#c5c5c5' };
}

function subscribeStyle() {
  return { background: 'linear-gradient(135deg, #8205b4 0%, #c13cff 100%)', color: '#ffffff', accent: '#bf94ff' };
}

// Sub / resub / gift / Prime — not watch-streak / raid / follow notices.
// Allow markup splits like: 已通过 <a>Prime</a> <span>订阅</span>
const SUBSCRIBE_NOTICE_RE = /(?:已通过[\s\S]{0,24}Prime[\s\S]{0,12}订阅|已订阅第\s*\d+\s*层级|订阅了|续订了|已經訂閱|續訂|已訂閱|訂閱了|subscribed(?:\s+with\s+Prime)?|resubscribed|gifted\s+\d+|is gifting|gift\s*sub|prime\s+gaming|サブスク|ギフト)/i;

function subscribeAmountLabel(text) {
  const raw = String(text || '');
  if (/prime/i.test(raw)) return 'Prime';
  const tier = raw.match(/(?:第\s*(\d+)\s*层级|tier\s*(\d+)|subscribed at Tier\s*(\d+))/i);
  if (tier) return `Tier ${tier[1] || tier[2] || tier[3]}`;
  if (/gift|赠送|ギフト|gifting/i.test(raw)) return 'Gift';
  return 'Sub';
}

function cheerTierBadgeLabel(bits) {
  const amount = Math.max(0, Number(bits) || 0);
  if (amount >= 100000) return '100K';
  if (amount >= 10000) return '10K';
  if (amount >= 5000) return '5K';
  if (amount >= 1000) return '1K';
  if (amount >= 100) return '100';
  return '1';
}

function cheerTierIconAmount(bits) {
  const amount = Math.max(0, Number(bits) || 0);
  if (amount >= 100000) return 100000;
  if (amount >= 10000) return 10000;
  if (amount >= 5000) return 5000;
  if (amount >= 1000) return 1000;
  if (amount >= 100) return 100;
  return 1;
}

function cheerTierIconUrl(bits) {
  const tier = cheerTierIconAmount(bits);
  return `https://d3aqoihi2n8ty8.cloudfront.net/actions/cheer/dark/animated/${tier}/1.gif`;
}

function readCheerTierIconFromMessage(msgEl) {
  if (!msgEl) return '';
  const root = msgEl.querySelector(SELECTORS.chatMessageBody) || msgEl;
  for (const img of root.querySelectorAll('img')) {
    if (bitsFromImageAsset(img) <= 0) continue;
    const src = pickEmoteSrc(img);
    if (src) return src;
  }
  return '';
}

function createCheerTierBadgeEl(meta) {
  const tierWrap = document.createElement('span');
  tierWrap.className = 'tbc-sc-badge tbc-sc-tier';
  const img = document.createElement('img');
  img.className = 'tbc-sc-tier-img';
  img.src = meta?.tierIconUrl || cheerTierIconUrl(meta?.bits || 1);
  img.alt = meta?.tierLabel || cheerTierBadgeLabel(meta?.bits || 1);
  img.draggable = false;
  tierWrap.appendChild(img);
  return tierWrap;
}

function readUserNoticeSystemText(msgEl) {
  if (!msgEl) return '';
  const clone = msgEl.cloneNode(true);
  clone.querySelectorAll(
    '[data-a-target="chat-resubscription-message__custom-message"], .chat-line__message, [data-a-target="chat-line-message"]',
  ).forEach((node) => node.remove());
  return (clone.textContent || '').replace(/\s+/g, ' ').trim();
}

function readUserNoticeCustomParts(msgEl) {
  const customRoot = msgEl?.querySelector?.(
    '[data-a-target="chat-resubscription-message__custom-message"]',
  );
  if (!customRoot) return [];
  const line = customRoot.querySelector('[data-a-target="chat-line-message"], .chat-line__message') || customRoot;
  return extractMessageParts(line);
}

function bitsFromCheerImageLabels(msgEl) {
  if (!msgEl) return 0;
  const root = msgEl.querySelector(SELECTORS.chatMessageBody) || msgEl;
  let total = 0;
  for (const img of root.querySelectorAll('img')) {
    const src = pickEmoteSrc(img);
    if (bitsFromImageAsset(img) <= 0 && !isCheerTierImageSrc(src)) continue;
    const label = extractEmoteName(img).trim();
    const fromLabel = bitsFromText(label) || bitsFromText(` ${label}`);
    if (fromLabel > 0) total += fromLabel;
  }
  return total;
}

function extractBitsAmount(msgEl, message = '', parts = []) {
  const fromParts = bitsFromText(
    (Array.isArray(parts) ? parts : [])
      .map((part) => (part?.type === 'emote' ? part.name : part?.value) || '')
      .join(' '),
  );
  if (fromParts > 0) return fromParts;

  const fromMessage = bitsFromText(message);
  if (fromMessage > 0) return fromMessage;

  const fromSuffix = bitsFromPlainSuffix(message);
  if (fromSuffix > 0) return fromSuffix;

  const fromCheerLabels = bitsFromCheerImageLabels(msgEl);
  if (fromCheerLabels > 0) return fromCheerLabels;

  return 0;
}

function isSubscribeNotice(msgEl, textHint = '') {
  if (!msgEl && !textHint) return false;
  // Always prefer full notice textContent — custom resub body ("Hii") must not veto detection.
  const systemText = readUserNoticeSystemText(msgEl);
  const fullText = String(msgEl?.textContent || '').replace(/\s+/g, ' ').trim();
  const text = systemText || fullText || String(textHint || '').replace(/\s+/g, ' ').trim();
  return !!text && SUBSCRIBE_NOTICE_RE.test(text);
}

function readNoticeActor(msgEl, message = '') {
  const usernameEl = msgEl?.querySelector?.(SELECTORS.chatUsername);
  let username = usernameEl?.textContent?.trim() || '';
  let login = (
    msgEl?.getAttribute?.('data-a-user')
    || usernameEl?.getAttribute?.('data-a-user')
    || ''
  ).trim().toLowerCase();

  if (!username) {
    const text = String(message || msgEl?.textContent || '').replace(/\s+/g, ' ').trim();
    const match = text.match(/^@?([A-Za-z0-9_]{3,25})\s+(?:已通过|已订阅|订阅了|续订|subscribed|resubscribed|is gifting)/i);
    if (match) username = match[1];
  }
  if (!login && username) login = username.toLowerCase();
  return { username, login, usernameEl };
}

function readChatAvatarUrl(msgEl) {
  const img = msgEl.querySelector(
    'img.chat-line__message--avatar, img.chatter-avatar, .chat-author__image img, img[src*="jtv_user_pictures"], img[src*="user-default-pictures"]',
  );
  if (!img) return '';
  try {
    const url = new URL(img.getAttribute('src') || '', location.href);
    if (url.protocol !== 'https:') return '';
    url.hash = '';
    return url.href;
  } catch {
    return '';
  }
}

function readSuperchatMeta(msgEl, message = '', parts = []) {
  const pinned = !!msgEl.closest('[data-test-selector="pinned-chat"], [data-test-selector="pinned-message"], [class*="pinned-chat"], [class*="paid-pinned"]');
  const bits = extractBitsAmount(msgEl, message, parts);
  const cheer = bits > 0 || hasCheer(msgEl);
  const subscribe = isSubscribeNotice(msgEl, message);
  const background = paidBackground(msgEl);
  if (!cheer && !pinned && !background && !subscribe && bits <= 0) return null;

  let kind = 'pin';
  let style;
  let amountLabel = '';
  if (bits > 0 || cheer) {
    kind = 'cheer';
    style = cheerTierStyle(bits || 1);
    amountLabel = `${bits || 1} Bits`;
  } else if (subscribe) {
    kind = 'sub';
    style = subscribeStyle();
    amountLabel = subscribeAmountLabel(message || msgEl?.textContent || '');
  } else {
    style = {
      background: background || '#9147ff',
      color: '#ffffff',
      accent: '#bf94ff',
    };
  }

  if (background && kind === 'pin') {
    style = { ...style, background };
  }

  const textNode = msgEl.querySelector('[data-a-target="chat-message-text"], .text-fragment');
  const color = usableCssColor(textNode && getComputedStyle(textNode).color) || style.color;
  const tierLabel = kind === 'cheer'
    ? cheerTierBadgeLabel(bits || 1)
    : (kind === 'sub' ? amountLabel : '');
  const tierIconUrl = kind === 'cheer'
    ? (readCheerTierIconFromMessage(msgEl) || cheerTierIconUrl(bits || 1))
    : '';

  return {
    kind,
    bits: bits || 0,
    amountLabel,
    tierLabel,
    tierIconUrl,
    avatarUrl: readChatAvatarUrl(msgEl),
    style: {
      background: style.background,
      color: color || style.color,
      accent: style.accent || '#bf94ff',
    },
  };
}

function readSuperchatStyle(msgEl) {
  return readSuperchatMeta(msgEl)?.style || null;
}

function snapshotChatMessage(msgEl) {
  if (!msgEl) return null;

  const systemText = readUserNoticeSystemText(msgEl);
  const subscribe = isSubscribeNotice(msgEl, systemText);
  const customParts = subscribe ? readUserNoticeCustomParts(msgEl) : [];
  const parts = customParts.length ? customParts : extractMessageParts(msgEl);
  let message = partsToPlain(parts);

  // System / notice lines may put text outside the normal body selector.
  if (!message) {
    if (subscribe && systemText) {
      message = systemText;
    } else {
      const notice = msgEl.querySelector(
        '[data-a-target="chat-line-message-body"], .chat-line__message-body, [data-test-selector="user-notice-line"], .user-notice-line',
      );
      message = (notice?.textContent || msgEl.textContent || '').replace(/\s+/g, ' ').trim();
    }
  }

  const actor = readNoticeActor(msgEl, systemText || message);
  let { username, login, usernameEl } = actor;

  // Nested resub chat-line may carry a better login/color than the notice header.
  if (subscribe) {
    const nestedUser = msgEl.querySelector(
      '[data-a-target="chat-resubscription-message__custom-message"] [data-a-target="chat-message-username"]',
    );
    if (nestedUser) {
      username = nestedUser.textContent?.trim() || username;
      login = (nestedUser.getAttribute('data-a-user') || username || login).trim().toLowerCase();
      usernameEl = nestedUser;
    }
  }

  if (!message && !subscribe) return null;

  // Avoid duplicating the name in the Super Chat body for "user 已订阅…" notices.
  if (username && message && !customParts.length) {
    const escaped = username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const stripped = message.replace(new RegExp(`^@?${escaped}\\s+`, 'i'), '').trim();
    if (stripped) message = stripped;
  }

  // Resub with empty custom body: still show the system notice text.
  if (subscribe && !message && systemText) {
    let noticeBody = systemText;
    if (username) {
      const escaped = username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      noticeBody = noticeBody.replace(new RegExp(`^@?${escaped}\\s+`, 'i'), '').trim() || noticeBody;
    }
    message = noticeBody;
  }

  let finalParts = parts.length ? parts : (message ? [{ type: 'text', value: message }] : []);
  const meta = readSuperchatMeta(msgEl, systemText || message, finalParts);
  if (meta?.kind === 'cheer') {
    message = stripCheerAmountSuffixText(message);
    finalParts = stripCheerAmountSuffixParts(finalParts);
  }
  return {
    message,
    parts: finalParts.length ? finalParts : (message ? [{ type: 'text', value: message }] : []),
    username: username || login,
    login,
    usernameColor: getUsernameColor(msgEl) || (usernameEl ? getComputedStyle(usernameEl).color : ''),
    profileUrl: getTwitchProfileUrl(usernameEl, username || login),
    avatarUrl: meta?.avatarUrl || readChatAvatarUrl(msgEl),
    superchat: !!meta,
    superchatStyle: meta?.style || null,
    superchatMeta: meta,
  };
}

function parseChatMessage(msgEl) {
  if (msgEl.classList.contains('tbc-processed')) return null;
  if (msgEl.closest('.tbc-processed')) return null;

  // Nested resub/chat body is owned by the parent user-notice-line Super Chat path.
  const isNotice = msgEl.matches?.('[data-test-selector="user-notice-line"], .user-notice-line');
  if (
    !isNotice
    && msgEl.closest?.('[data-test-selector="user-notice-line"], .user-notice-line, [data-a-target="chat-resubscription-message__custom-message"]')
  ) {
    msgEl.classList.add('tbc-processed');
    return null;
  }

  const snapshot = snapshotChatMessage(msgEl);
  if (!snapshot) return null;
  msgEl.classList.add('tbc-processed');
  return snapshot;
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
