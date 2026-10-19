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

function hasCheer(msgEl) {
  return [...msgEl.querySelectorAll('img')].some((img) => {
    const src = img.getAttribute('src') || '';
    const alt = img.getAttribute('alt') || '';
    return /\/bits\//i.test(src) || /^cheer\d+/i.test(alt);
  });
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

function readSuperchatStyle(msgEl) {
  const pinned = !!msgEl.closest('[data-test-selector="pinned-chat"], [data-test-selector="pinned-message"], [class*="pinned-chat"], [class*="paid-pinned"]');
  const cheer = hasCheer(msgEl);
  const background = paidBackground(msgEl);
  if (!cheer && !pinned && !background) return null;
  const textNode = msgEl.querySelector('[data-a-target="chat-message-text"], .text-fragment');
  const color = usableCssColor(textNode && getComputedStyle(textNode).color) || '#ffffff';
  return { background: background || '#9147ff', color };
}

function parseChatMessage(msgEl) {
  if (msgEl.classList.contains('tbc-processed')) return null;
  if (msgEl.closest('.tbc-processed')) return null;

  const parts = extractMessageParts(msgEl);
  const message = partsToPlain(parts);
  if (!message) return null;

  const usernameEl = msgEl.querySelector(SELECTORS.chatUsername);
  const username = usernameEl?.textContent?.trim() || '';
  const usernameColor = getUsernameColor(msgEl);
  const profileUrl = getTwitchProfileUrl(usernameEl, username);

  msgEl.classList.add('tbc-processed');
  const superchatStyle = readSuperchatStyle(msgEl);
  return {
    message,
    parts,
    username,
    usernameColor,
    profileUrl,
    superchat: !!superchatStyle,
    superchatStyle,
  };
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
