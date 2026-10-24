const TWITCH_IRC_URL = 'wss://irc-ws.chat.twitch.tv:443';
const IRC_RECONNECT_BASE_MS = 1200;
const IRC_RECONNECT_MAX_MS = 15000;

function randomJustinFanNick() {
  return `justinfan${Math.floor(80000 + Math.random() * 10000)}`;
}

function parseIrcTags(raw) {
  const tags = {};
  if (!raw) return tags;
  for (const part of raw.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) {
      tags[part] = true;
      continue;
    }
    tags[part.slice(0, eq)] = part.slice(eq + 1);
  }
  return tags;
}

function unescapeIrcTag(value) {
  return String(value || '')
    .replace(/\\:/g, ';')
    .replace(/\\s/g, ' ')
    .replace(/\\\\/g, '\\')
    .replace(/\\r/g, '\r')
    .replace(/\\n/g, '\n');
}

function parseIrcEmoteParts(message, emotesTag) {
  if (!emotesTag || !message) return [{ type: 'text', value: message }];

  const ranges = [];
  for (const entry of emotesTag.split('/')) {
    if (!entry) continue;
    const [id, positions] = entry.split(':');
    if (!id || !positions) continue;
    for (const span of positions.split(',')) {
      const [startRaw, endRaw] = span.split('-');
      const start = Number(startRaw);
      const end = Number(endRaw);
      if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) continue;
      ranges.push({ id, start, end });
    }
  }
  if (!ranges.length) return [{ type: 'text', value: message }];

  ranges.sort((a, b) => a.start - b.start);
  const parts = [];
  let cursor = 0;
  for (const range of ranges) {
    if (range.start > cursor) {
      parts.push({ type: 'text', value: message.slice(cursor, range.start) });
    }
    const name = message.slice(range.start, range.end + 1);
    parts.push({
      type: 'emote',
      name,
      src: `https://static-cdn.jtvnw.net/emoticons/v2/${encodeURIComponent(range.id)}/default/dark/1.0`,
    });
    cursor = range.end + 1;
  }
  if (cursor < message.length) {
    parts.push({ type: 'text', value: message.slice(cursor) });
  }
  return parts.length ? parts : [{ type: 'text', value: message }];
}

function bitsFromIrcTags(tags, message) {
  const spent = Number(tags.bits);
  if (Number.isFinite(spent) && spent > 0) return spent;
  return bitsFromText(message);
}

const IRC_SUB_MSG_IDS = new Set([
  'sub', 'resub', 'subgift', 'anonsubgift', 'submysterygift',
  'giftpaidupgrade', 'anongiftpaidupgrade', 'primepaidupgrade',
]);

function buildIrcPayload({ channel, login, displayName, color, message, tags, bits = 0, subscribe = false }) {
  const parts = parseIrcEmoteParts(message, tags.emotes);
  let meta = null;
  if (bits > 0) {
    const style = cheerTierStyle(bits);
    meta = {
      kind: 'cheer',
      bits,
      amountLabel: `${bits} Bits`,
      avatarUrl: '',
      style,
    };
  } else if (subscribe) {
    const style = subscribeStyle();
    meta = {
      kind: 'sub',
      bits: 0,
      amountLabel: 'Sub',
      avatarUrl: '',
      style,
    };
  }

  return {
    channel,
    login,
    username: displayName,
    usernameColor: color,
    profileUrl: login ? `https://www.twitch.tv/${encodeURIComponent(login)}` : null,
    avatarUrl: '',
    message,
    parts,
    originalMessage: message,
    superchat: !!meta,
    superchatStyle: meta?.style || null,
    superchatMeta: meta,
    bits,
  };
}

function normalizeIrcPrivmsg(line) {
  // @tags :nick!user@host PRIVMSG #channel :message
  const match = line.match(/^(?:@(\S+)\s+)?:(\S+?)(?:!(\S+?))?(?:@\S+)?\s+PRIVMSG\s+#(\S+)\s+:([\s\S]*)$/i);
  if (!match) return null;

  const tags = parseIrcTags(match[1] || '');
  const login = (match[3] || match[2] || tags.login || '').toLowerCase();
  const channel = String(match[4] || '').toLowerCase();
  const message = match[5] || '';
  if (!message.trim()) return null;

  const displayName = unescapeIrcTag(tags['display-name']) || login;
  const color = unescapeIrcTag(tags.color) || '#ffffff';
  const bits = bitsFromIrcTags(tags, message);
  return buildIrcPayload({
    channel,
    login,
    displayName,
    color,
    message,
    tags,
    bits,
  });
}

function normalizeIrcUsernotice(line) {
  const match = line.match(/^(?:@(\S+)\s+)?:tmi\.twitch\.tv\s+USERNOTICE\s+#(\S+)(?:\s+:([\s\S]*))?$/i);
  if (!match) return null;
  const tags = parseIrcTags(match[1] || '');
  const msgId = String(tags['msg-id'] || '').toLowerCase();
  if (!IRC_SUB_MSG_IDS.has(msgId)) return null;

  const channel = String(match[2] || '').toLowerCase();
  const login = String(tags.login || '').toLowerCase();
  const displayName = unescapeIrcTag(tags['display-name']) || login;
  const color = unescapeIrcTag(tags.color) || '#ffffff';
  const system = unescapeIrcTag(tags['system-msg'] || '');
  const body = (match[3] || '').trim();
  const message = [system, body].filter(Boolean).join(' — ') || system || 'Subscribed';
  return buildIrcPayload({
    channel,
    login,
    displayName,
    color,
    message,
    tags,
    subscribe: true,
  });
}

function normalizeIrcLine(line) {
  if (/\sPRIVMSG\s/i.test(line)) return normalizeIrcPrivmsg(line);
  if (/\sUSERNOTICE\s/i.test(line)) return normalizeIrcUsernotice(line);
  return null;
}

class TwitchIrcChatSource {
  constructor({ getChannel, onMessage, isActive }) {
    this.getChannel = getChannel;
    this.onMessage = onMessage;
    this.isActive = isActive;
    this.socket = null;
    this.channel = '';
    this.nick = '';
    this.wanted = false;
    this.reconnectAttempt = 0;
    this.reconnectTimer = null;
    this.pingTimer = null;
  }

  start() {
    this.wanted = true;
    this.connect();
  }

  stop() {
    this.wanted = false;
    this.clearReconnect();
    this.clearPing();
    try {
      this.socket?.close();
    } catch {
      /* ignore */
    }
    this.socket = null;
    this.channel = '';
  }

  clearReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
  }

  clearPing() {
    if (this.pingTimer) clearInterval(this.pingTimer);
    this.pingTimer = null;
  }

  scheduleReconnect() {
    if (!this.wanted) return;
    this.clearReconnect();
    const delay = Math.min(
      IRC_RECONNECT_MAX_MS,
      IRC_RECONNECT_BASE_MS * (2 ** Math.min(this.reconnectAttempt, 4)),
    );
    this.reconnectAttempt += 1;
    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  connect() {
    if (!this.wanted) return;
    const channel = String(this.getChannel?.() || '').trim().toLowerCase().replace(/^#/, '');
    if (!channel) {
      this.scheduleReconnect();
      return;
    }

    this.clearReconnect();
    this.clearPing();
    try {
      this.socket?.close();
    } catch {
      /* ignore */
    }

    this.channel = channel;
    this.nick = randomJustinFanNick();
    let socket;
    try {
      socket = new WebSocket(TWITCH_IRC_URL);
    } catch (error) {
      console.warn('[TBC] IRC WebSocket unavailable:', error);
      this.scheduleReconnect();
      return;
    }
    this.socket = socket;

    socket.addEventListener('open', () => {
      if (this.socket !== socket || !this.wanted) return;
      this.reconnectAttempt = 0;
      socket.send('CAP REQ :twitch.tv/tags twitch.tv/commands');
      socket.send('PASS SCHMOOPIIE');
      socket.send(`NICK ${this.nick}`);
      socket.send(`JOIN #${this.channel}`);
      this.pingTimer = setInterval(() => {
        if (this.socket === socket && socket.readyState === WebSocket.OPEN) {
          socket.send('PING :tmi.twitch.tv');
        }
      }, 4 * 60 * 1000);
      console.log(`[TBC] IRC connected (#${this.channel})`);
    });

    socket.addEventListener('message', (event) => {
      if (this.socket !== socket) return;
      this.handlePayload(String(event.data || ''));
    });

    socket.addEventListener('close', () => {
      if (this.socket !== socket) return;
      this.socket = null;
      this.clearPing();
      if (this.wanted) this.scheduleReconnect();
    });

    socket.addEventListener('error', () => {
      try {
        socket.close();
      } catch {
        /* ignore */
      }
    });
  }

  handlePayload(payload) {
    const lines = payload.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    for (const line of lines) {
      if (line.startsWith('PING ')) {
        this.socket?.send(`PONG ${line.slice(5)}`);
        continue;
      }
      if (!/\sPRIVMSG\s/i.test(line) && !/\sUSERNOTICE\s/i.test(line)) continue;
      if (this.isActive && !this.isActive()) continue;
      const parsed = normalizeIrcLine(line);
      if (!parsed) continue;
      if (parsed.channel && this.channel && parsed.channel !== this.channel) continue;
      try {
        this.onMessage?.(parsed);
      } catch (error) {
        console.warn('[TBC] IRC message handler failed:', error);
      }
    }
  }
}
