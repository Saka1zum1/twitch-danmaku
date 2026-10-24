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

function extractBitsAmount(msgEl, message = '', parts = []) {
  let total = bitsFromText(message);
  if (total > 0) return total;

  // Emote names in parsed parts (Cheer300 / Kappa100 / partnerFooCheer1000).
  total = bitsFromText(
    (Array.isArray(parts) ? parts : [])
      .map((part) => (part?.type === 'emote' ? part.name : part?.value) || '')
      .join(' '),
  );
  if (total > 0) return total;

  if (!msgEl) return 0;
  const root = msgEl.querySelector(SELECTORS.chatMessageBody) || msgEl;
  for (const img of root.querySelectorAll('img')) {
    total += bitsFromImageAsset(img);
  }
  return total;
}

function isSubscribeNotice(msgEl) {
  if (!msgEl) return false;
  if (msgEl.closest('.user-notice-line, [class*="user-notice"], [data-a-target*="user-notice"], [data-test-selector*="user-notice"]')) {
    return true;
  }
  if (msgEl.querySelector('.user-notice-line, [data-a-target="user-notice-line"], [data-a-target*="sub-message"]')) {
    return true;
  }
  const text = (msgEl.textContent || '').replace(/\s+/g, ' ');
  return /subscribed|resubscribed|gifted\s+\d+\s+sub|is gifting|gift sub|prime gaming|订阅|訂閱|ギフト/i.test(text);
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
  const subscribe = isSubscribeNotice(msgEl);
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
    amountLabel = 'Sub';
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
  return {
    kind,
    bits: bits || 0,
    amountLabel,
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
  const parts = extractMessageParts(msgEl);
  let message = partsToPlain(parts);
  const usernameEl = msgEl.querySelector(SELECTORS.chatUsername);
  const username = usernameEl?.textContent?.trim() || '';
  const login = (
    msgEl.getAttribute('data-a-user')
    || usernameEl?.getAttribute('data-a-user')
    || username
  ).trim().toLowerCase();

  // System / notice lines may put text outside the normal body selector.
  if (!message) {
    const notice = msgEl.querySelector('[data-a-target="chat-line-message-body"], .chat-line__message-body, .user-notice-line');
    message = (notice?.textContent || msgEl.textContent || '').replace(/\s+/g, ' ').trim();
  }
  if (!message && !isSubscribeNotice(msgEl)) return null;

  const finalParts = parts.length ? parts : (message ? [{ type: 'text', value: message }] : []);
  const meta = readSuperchatMeta(msgEl, message, finalParts);
  return {
    message,
    parts: finalParts,
    username: username || login,
    login,
    usernameColor: getUsernameColor(msgEl),
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
