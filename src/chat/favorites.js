const FAVORITES_STORAGE_KEY = 'tbc_favorites_v1';
const FAVORITES_LIMIT = 80;
const FAVORITE_TEXT_LIMIT = 500;

const DEFAULT_FAVORITES_STATE = {
  items: [],
  wheel: {
    minIntervalSec: 3,
    maxIntervalSec: 20,
    maxCount: 30,
    maxDurationSec: 300,
  },
};

const WHEEL_MIN_INTERVAL_FLOOR = 1.5;

function createFavoriteId() {
  return `fav-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function sanitizeFavoriteShortcut(value) {
  if (value === null || value === undefined || value === '') return null;
  const digit = String(value).trim();
  if (!/^[0-9]$/.test(digit)) return null;
  return digit;
}

function sanitizeFavoriteChannel(value) {
  const login = normalizeTwitchLogin
    ? normalizeTwitchLogin(value)
    : String(value || '').trim().replace(/^@+/, '').toLowerCase();
  return login || null;
}

function sanitizeFavoriteItem(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const text = String(raw.text || '').trim().slice(0, FAVORITE_TEXT_LIMIT);
  if (!text) return null;
  // null channel => site-wide; string => channel-scoped.
  // Legacy items without `channel` are treated as global for backward compatibility.
  let channel = null;
  if (Object.prototype.hasOwnProperty.call(raw, 'channel')) {
    channel = raw.channel == null || raw.channel === ''
      ? null
      : sanitizeFavoriteChannel(raw.channel);
  }
  return {
    id: String(raw.id || createFavoriteId()),
    text,
    shortcut: sanitizeFavoriteShortcut(raw.shortcut),
    channel,
  };
}

function sanitizeFavoritesState(raw) {
  const base = {
    items: [],
    wheel: { ...DEFAULT_FAVORITES_STATE.wheel },
  };
  if (!raw || typeof raw !== 'object') return base;

  const seen = new Set();
  const items = [];
  for (const entry of Array.isArray(raw.items) ? raw.items : []) {
    const item = sanitizeFavoriteItem(entry);
    if (!item || seen.has(item.id)) continue;
    seen.add(item.id);
    items.push(item);
    if (items.length >= FAVORITES_LIMIT) break;
  }

  // Shortcuts must be unique within the same scope (global or a channel).
  const used = new Map();
  for (const item of items) {
    if (!item.shortcut) continue;
    const scope = item.channel || '__global__';
    const key = `${scope}:${item.shortcut}`;
    if (used.has(key)) item.shortcut = null;
    else used.set(key, item.id);
  }

  const wheelRaw = raw.wheel && typeof raw.wheel === 'object' ? raw.wheel : {};
  let minIntervalSec = clamp(
    finiteNumber(wheelRaw.minIntervalSec, DEFAULT_FAVORITES_STATE.wheel.minIntervalSec),
    WHEEL_MIN_INTERVAL_FLOOR,
    600,
  );
  let maxIntervalSec = clamp(
    finiteNumber(wheelRaw.maxIntervalSec, DEFAULT_FAVORITES_STATE.wheel.maxIntervalSec),
    WHEEL_MIN_INTERVAL_FLOOR,
    600,
  );
  if (minIntervalSec > maxIntervalSec) {
    const swap = minIntervalSec;
    minIntervalSec = maxIntervalSec;
    maxIntervalSec = swap;
  }
  return {
    items,
    wheel: {
      minIntervalSec,
      maxIntervalSec,
      maxCount: clamp(finiteNumber(wheelRaw.maxCount, DEFAULT_FAVORITES_STATE.wheel.maxCount), 1, 500),
      maxDurationSec: clamp(finiteNumber(wheelRaw.maxDurationSec, DEFAULT_FAVORITES_STATE.wheel.maxDurationSec), 10, 7200),
    },
  };
}

function loadFavoritesState() {
  try {
    return sanitizeFavoritesState(GM_getValue(FAVORITES_STORAGE_KEY, null));
  } catch (_) {
    return sanitizeFavoritesState(null);
  }
}

function saveFavoritesState(state) {
  const next = sanitizeFavoritesState(state);
  GM_setValue(FAVORITES_STORAGE_KEY, next);
  return next;
}

function favoriteVisibleForChannel(item, channelLogin) {
  if (!item) return false;
  if (!item.channel) return true;
  const channel = sanitizeFavoriteChannel(channelLogin);
  return !!channel && item.channel === channel;
}

function listFavoritesForChannel(state, channelLogin) {
  const items = Array.isArray(state?.items) ? state.items : [];
  return items.filter((item) => favoriteVisibleForChannel(item, channelLogin));
}

function addFavoriteText(text, { shortcut = null, channel = undefined } = {}) {
  const state = loadFavoritesState();
  const currentChannel = sanitizeFavoriteChannel(
    channel === undefined ? currentChannelLogin?.() : channel,
  );
  // Default: bind to current live channel. Fallback to global when channel unknown.
  const item = sanitizeFavoriteItem({
    text,
    shortcut,
    channel: channel === null ? null : currentChannel,
  });
  if (!item) return { state, item: null, added: false };

  if (item.shortcut) {
    state.items.forEach((entry) => {
      if (entry.shortcut !== item.shortcut) return;
      const sameScope = (entry.channel || null) === (item.channel || null);
      if (sameScope) entry.shortcut = null;
    });
  }

  const existing = state.items.find((entry) => (
    entry.text === item.text && (entry.channel || null) === (item.channel || null)
  ));
  if (existing) {
    if (item.shortcut) existing.shortcut = item.shortcut;
    return { state: saveFavoritesState(state), item: existing, added: false };
  }

  if (state.items.length >= FAVORITES_LIMIT) {
    return { state, item: null, added: false, full: true };
  }

  state.items.unshift(item);
  return { state: saveFavoritesState(state), item, added: true };
}

function setFavoriteGlobal(itemId, global = true) {
  const state = loadFavoritesState();
  const item = state.items.find((entry) => entry.id === itemId);
  if (!item) return { state, item: null };
  item.channel = global ? null : (sanitizeFavoriteChannel(currentChannelLogin?.()) || item.channel);
  if (item.shortcut) {
    state.items.forEach((entry) => {
      if (entry.id === item.id || entry.shortcut !== item.shortcut) return;
      const sameScope = (entry.channel || null) === (item.channel || null);
      if (sameScope) entry.shortcut = null;
    });
  }
  return { state: saveFavoritesState(state), item };
}
