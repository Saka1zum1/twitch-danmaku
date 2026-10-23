const TWITCH_GQL_URL = 'https://gql.twitch.tv/gql';
const TWITCH_GQL_CLIENT_ID = 'kd1unb4b3q4t58fwlpcbzcbnm76a8fp';
const VOD_COMMENTS_HASH = 'b70a3591ff0f4e0313d126c6a1502d79a1c02baebb288227c582044aa76adf6a';
const BITS_PATTERN = '(?:^|\\s)(?:4Head|Anon|BibleThumb|BitBoss|bday|Cheer|Charity|Corgo|cheerwal|DansGame|DoodleCheer|EleGiggle|FrankerZ|FailFish|Goal|HeyGuys|HolidayCheer|Kappa|Kreygasm|MrDestructoid|Muxy|NotLikeThis|Party|Pride|PJSalt|RIPCheer|Scoops|ShowLove|Shamrock|SeemsGood|SwiftRage|Streamlabs|TriHard|uni|VoHiYo)([1-9]\\d{0,6})(?=\\s|$)';
const LIVE_CHAT_CONTAINER = '[data-test-selector="chat-scrollable-area__message-container"], .chat-scrollable-area__message-container';
const LIVE_CHAT_MESSAGE = '.chat-line__message, [data-a-target="chat-line-message"], [data-a-target="chat-message-container"]';
const CHANNEL_PATH_BLOCKLIST = /^(videos?|directory|settings|subscriptions|inventory|wallet|downloads|search|prime|popout|turbo|products|drops|u|p)$/i;

function historyError(code, message) {
  const error = new Error(message || code);
  error.code = code;
  return error;
}

function currentVodId() {
  const demoId = typeof window !== 'undefined' ? window.__TBC_DEMO_VOD_ID__ : '';
  if (demoId) return String(demoId).replace(/\D/g, '');
  const match = location.pathname.match(/\/(?:videos|video)\/(\d+)/i);
  return match ? match[1] : '';
}

function currentChannelLogin() {
  const demoLogin = typeof window !== 'undefined' ? window.__TBC_DEMO_CHANNEL__ : '';
  if (demoLogin) return String(demoLogin).trim().toLowerCase();
  const parts = location.pathname.split('/').filter(Boolean);
  if (!parts.length) return '';
  const first = parts[0].toLowerCase();
  if (CHANNEL_PATH_BLOCKLIST.test(first)) return '';
  if (first === 'moderator' || first === 'embed') return (parts[1] || '').toLowerCase();
  return first;
}

function findLiveChatContainer() {
  return document.querySelector(LIVE_CHAT_CONTAINER);
}

function readLiveChannelInfo() {
  const login = currentChannelLogin();
  if (!login || currentVodId()) return null;
  const hasDomChat = !!findLiveChatContainer();
  const ffz = typeof detectFrankerFaceZ === 'function' && detectFrankerFaceZ();
  if (!hasDomChat && !ffz) return null;
  const titleEl = document.querySelector('[data-a-target="stream-title"], h2[data-a-target="stream-title"]');
  const nameEl = document.querySelector('[data-a-target="user-channel-header-name"]');
  const title = titleEl?.textContent?.trim()
    || document.title.replace(/\s*[-–|]\s*Twitch\s*$/i, '').trim();
  return {
    id: `live-${login}`,
    title: title || login,
    createdAt: '',
    lengthSeconds: 0,
    channel: nameEl?.textContent?.trim() || login,
    login,
    live: true,
    source: ffz && !hasDomChat ? 'live-irc' : 'live-dom',
  };
}

function playerDurationSeconds() {
  const video = document.querySelector('video');
  const duration = Number(video?.duration);
  if (!Number.isFinite(duration) || duration <= 0 || duration === Infinity) return 0;
  return Math.floor(duration);
}

function formatChatClock(seconds) {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const pad = (value) => String(value).padStart(2, '0');
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(secs)}` : `${minutes}:${pad(secs)}`;
}

function fileClock(seconds) {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const pad = (value) => String(value).padStart(2, '0');
  return `${pad(hours)}h${pad(minutes)}m${pad(secs)}s`;
}

function splitFilterTerms(text) {
  return String(text || '')
    .split(/[,，]/)
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
}

function twitchGql(body) {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: 'POST',
      url: TWITCH_GQL_URL,
      headers: {
        'Client-ID': TWITCH_GQL_CLIENT_ID,
        'Content-Type': 'application/json',
      },
      data: JSON.stringify(body),
      timeout: 20000,
      onload: (res) => {
        const status = Number(res?.status) || 0;
        if (status < 200 || status >= 300) {
          reject(historyError('failed', `HTTP ${status}`));
          return;
        }
        try {
          resolve(JSON.parse(res.responseText));
        } catch {
          reject(historyError('failed', 'invalid json'));
        }
      },
      onerror: () => reject(historyError('failed', 'network')),
      ontimeout: () => reject(historyError('failed', 'timeout')),
    });
  });
}

function waitMs(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitWhilePaused(shouldPause, shouldCancel) {
  while (shouldPause?.()) {
    if (shouldCancel?.()) throw historyError('cancel');
    await waitMs(120);
  }
  if (shouldCancel?.()) throw historyError('cancel');
}

async function fetchVodInfo(videoId) {
  const id = String(videoId || '').replace(/\D/g, '');
  if (!id) return null;
  const payload = await twitchGql({
    query: `query{video(id:"${id}"){title,createdAt,lengthSeconds,owner{displayName,login}}}`,
  });
  const video = payload?.data?.video;
  if (!video) return null;
  return {
    id,
    title: video.title || '',
    createdAt: video.createdAt || '',
    lengthSeconds: Number(video.lengthSeconds) || 0,
    channel: video.owner?.displayName || video.owner?.login || '',
    login: video.owner?.login || '',
  };
}

function commentText(node) {
  const fragments = node?.message?.fragments;
  if (!Array.isArray(fragments)) return '';
  return fragments.map((fragment) => fragment?.text || '').join('');
}

function commentBits(node, text) {
  const spent = Number(node?.message?.bitsSpent);
  if (Number.isFinite(spent) && spent > 0) return spent;
  const matcher = new RegExp(BITS_PATTERN, 'g');
  let total = 0;
  let match = matcher.exec(text);
  while (match) {
    total += Number(match[1]) || 0;
    match = matcher.exec(text);
  }
  return total;
}

function normalizeVodComment(node) {
  const message = commentText(node).replace(/\s+/g, ' ').trim();
  const bits = commentBits(node, message);
  return {
    id: node.id,
    offsetSeconds: Number(node.contentOffsetSeconds) || 0,
    createdAt: node.createdAt || '',
    userId: node.commenter?.id || '',
    login: node.commenter?.login || '',
    displayName: (node.commenter?.displayName || node.commenter?.login || '').trim(),
    message,
    color: node.message?.userColor || '',
    bits,
    superchat: bits > 0,
  };
}

function commentMatchesFilters(comment, keywords, usernames, includeSuperchat) {
  if (!includeSuperchat && comment.superchat) return false;
  if (keywords.length) {
    const haystack = comment.message.toLowerCase();
    if (!keywords.some((keyword) => haystack.includes(keyword))) return false;
  }
  if (usernames.length) {
    const login = comment.login.toLowerCase();
    const displayName = comment.displayName.toLowerCase();
    if (!usernames.some((name) => login.includes(name) || displayName.includes(name))) return false;
  }
  return true;
}

function bitsFromText(text) {
  const matcher = new RegExp(BITS_PATTERN, 'gi');
  let total = 0;
  let match = matcher.exec(text);
  while (match) {
    total += Number(match[1]) || 0;
    match = matcher.exec(text);
  }
  return total;
}

function bitsFromCheerImages(msgEl) {
  let total = 0;
  for (const img of msgEl.querySelectorAll('img')) {
    const alt = img.getAttribute('alt') || '';
    const match = alt.match(/^cheer([1-9]\d{0,6})$/i);
    if (match) total += Number(match[1]) || 0;
  }
  return total;
}

function normalizeDomComment(msgEl, index) {
  const parts = extractMessageParts(msgEl);
  const message = partsToPlain(parts).replace(/\s+/g, ' ').trim();
  if (!message) return null;

  const usernameEl = msgEl.querySelector(SELECTORS.chatUsername);
  const displayName = usernameEl?.textContent?.trim() || '';
  const login = (
    msgEl.getAttribute('data-a-user')
    || usernameEl?.getAttribute('data-a-user')
    || displayName
  ).trim().toLowerCase();
  if (!login && !displayName) return null;

  const bits = bitsFromText(message) || bitsFromCheerImages(msgEl);
  const superchatStyle = readSuperchatStyle(msgEl);
  const superchat = bits > 0 || !!superchatStyle;
  const id = msgEl.id || `live-${index}-${login}-${message.slice(0, 32)}`;

  return {
    id,
    offsetSeconds: index,
    createdAt: '',
    userId: '',
    login,
    displayName: displayName || login,
    message,
    color: getUsernameColor(msgEl),
    bits,
    superchat,
  };
}

async function collectLiveIrcChat({
  comments: sourceComments = [],
  keywords = '',
  usernames = '',
  includeSuperchat = true,
  onProgress,
  shouldCancel,
  shouldPause,
}) {
  const keywordTerms = splitFilterTerms(keywords);
  const usernameTerms = splitFilterTerms(usernames);
  const comments = [];
  let scanned = 0;

  for (let i = 0; i < sourceComments.length; i++) {
    if (i % 40 === 0) {
      await waitWhilePaused(shouldPause, shouldCancel);
    }
    const comment = sourceComments[i];
    if (!comment?.message) continue;
    scanned += 1;
    if (!commentMatchesFilters(comment, keywordTerms, usernameTerms, includeSuperchat)) continue;
    comments.push(comment);
    if (comments.length % 20 === 0) {
      onProgress?.({ count: comments.length, scanned, offset: i, start: 0, end: sourceComments.length });
    }
  }

  onProgress?.({
    count: comments.length,
    scanned,
    offset: sourceComments.length,
    start: 0,
    end: sourceComments.length,
  });
  return { comments, scanned, start: 0, end: comments.length ? comments.length - 1 : 0, source: 'live-irc' };
}

async function collectLiveDomChat({
  keywords = '',
  usernames = '',
  includeSuperchat = true,
  onProgress,
  shouldCancel,
  shouldPause,
  ircComments = null,
}) {
  if (Array.isArray(ircComments)) {
    return collectLiveIrcChat({
      comments: ircComments,
      keywords,
      usernames,
      includeSuperchat,
      onProgress,
      shouldCancel,
      shouldPause,
    });
  }

  const container = findLiveChatContainer();
  if (!container) throw historyError('missing');

  const keywordTerms = splitFilterTerms(keywords);
  const usernameTerms = splitFilterTerms(usernames);
  const nodes = [...container.querySelectorAll(LIVE_CHAT_MESSAGE)];
  const comments = [];
  const seen = new Set();
  let scanned = 0;

  for (let i = 0; i < nodes.length; i++) {
    if (i % 40 === 0) {
      await waitWhilePaused(shouldPause, shouldCancel);
    }
    const comment = normalizeDomComment(nodes[i], i);
    if (!comment) continue;
    scanned += 1;
    if (seen.has(comment.id)) continue;
    seen.add(comment.id);
    if (!commentMatchesFilters(comment, keywordTerms, usernameTerms, includeSuperchat)) continue;
    comments.push(comment);
    if (comments.length % 20 === 0) {
      onProgress?.({ count: comments.length, scanned, offset: i, start: 0, end: nodes.length });
    }
  }

  onProgress?.({ count: comments.length, scanned, offset: nodes.length, start: 0, end: nodes.length });
  return { comments, scanned, start: 0, end: comments.length ? comments.length - 1 : 0, source: 'live-dom' };
}

async function downloadVodChat({
  videoId,
  start = 0,
  end = Infinity,
  keywords = '',
  usernames = '',
  includeSuperchat = true,
  onProgress,
  shouldCancel,
  shouldPause,
}) {
  const id = String(videoId || '').replace(/\D/g, '');
  if (!id) throw historyError('missing');

  const rangeStart = Math.max(0, Number(start) || 0);
  const selectedEnd = Number.isFinite(Number(end)) ? Math.max(rangeStart, Number(end)) : Infinity;
  const rangeEnd = Number.isFinite(selectedEnd) ? selectedEnd + 1 : Infinity;
  const keywordTerms = splitFilterTerms(keywords);
  const usernameTerms = splitFilterTerms(usernames);
  const comments = [];
  const seen = new Set();
  let cursor = '';
  let first = true;
  let latest = rangeStart - 1;
  let scanned = 0;
  let errorCount = 0;
  let nullCount = 0;
  let pages = 0;

  while (latest < rangeEnd) {
    await waitWhilePaused(shouldPause, shouldCancel);
    if (++pages > 8000) throw historyError('failed', 'too many pages');

    let payload;
    try {
      payload = await twitchGql({
        operationName: 'VideoCommentsByOffsetOrCursor',
        variables: first
          ? { videoID: id, contentOffsetSeconds: Math.floor(rangeStart) }
          : { videoID: id, cursor },
        extensions: { persistedQuery: { version: 1, sha256Hash: VOD_COMMENTS_HASH } },
      });
      errorCount = Math.max(0, errorCount - 0.1);
    } catch (error) {
      if (++errorCount > 8) throw historyError('failed', error.message);
      await waitMs(1000 * errorCount);
      continue;
    }

    const video = payload?.data?.video;
    const edges = video?.comments?.edges;
    if (!video || !edges) {
      if (++nullCount > 8) throw historyError(video ? 'failed' : 'missing');
      await waitMs(150 * nullCount);
      continue;
    }
    nullCount = Math.max(0, nullCount - 0.1);
    if (!edges.length) break;

    for (const edge of edges) {
      const node = edge?.node;
      const offset = Number(node?.contentOffsetSeconds);
      if (Number.isFinite(offset) && offset > latest) latest = offset;
      if (!node?.id || !node.commenter || seen.has(node.id)) continue;
      if (!Number.isFinite(offset) || offset < rangeStart || offset >= rangeEnd) continue;
      seen.add(node.id);
      scanned += 1;
      const comment = normalizeVodComment(node);
      if (!comment.message && !comment.superchat) continue;
      if (!commentMatchesFilters(comment, keywordTerms, usernameTerms, includeSuperchat)) continue;
      comments.push(comment);
    }

    onProgress?.({
      count: comments.length,
      scanned,
      offset: Math.max(rangeStart, latest),
      start: rangeStart,
      end: rangeEnd,
    });

    if (!video.comments.pageInfo?.hasNextPage) break;
    const nextCursor = edges[edges.length - 1]?.cursor;
    if (!nextCursor || nextCursor === cursor) break;
    cursor = nextCursor;
    first = false;
  }

  comments.sort((a, b) => a.offsetSeconds - b.offsetSeconds || String(a.createdAt).localeCompare(String(b.createdAt)));
  return { comments, scanned, start: rangeStart, end: selectedEnd };
}

function csvCell(value) {
  const text = String(value ?? '');
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function buildChatExport(format, video, result) {
  const comments = result.comments || [];
  const start = result.start || 0;
  const isLive = video?.source === 'live-dom' || video?.live || result?.source === 'live-dom';
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const endLabel = Number.isFinite(result.end) ? fileClock(result.end) : 'end';
  const base = isLive
    ? `twitch-chat-live-${video.login || video.id}-${stamp}`
    : `twitch-chat-${video.id}-${fileClock(start)}-${endLabel}`;
  const kind = ['csv', 'txt', 'json'].includes(format) ? format : 'json';

  if (kind === 'csv') {
    const header = ['offset_seconds', 'timestamp', 'created_at', 'login', 'display_name', 'user_id', 'message', 'bits', 'superchat'];
    const lines = comments.map((comment, index) => [
      isLive ? index : comment.offsetSeconds,
      isLive ? '' : formatChatClock(comment.offsetSeconds),
      comment.createdAt,
      comment.login,
      comment.displayName,
      comment.userId,
      comment.message,
      comment.bits,
      comment.superchat ? '1' : '0',
    ].map(csvCell).join(','));
    return {
      filename: `${base}.csv`,
      mime: 'text/csv;charset=utf-8',
      text: `\uFEFF${header.join(',')}\n${lines.join('\n')}\n`,
    };
  }

  if (kind === 'txt') {
    const lines = comments.map((comment, index) => {
      const bits = comment.superchat ? ` [Bits ${comment.bits}]` : '';
      const prefix = isLive ? `#${index + 1}` : `[${formatChatClock(comment.offsetSeconds)}]`;
      return `${prefix} ${comment.displayName}${bits}: ${comment.message}`;
    });
    return {
      filename: `${base}.txt`,
      mime: 'text/plain;charset=utf-8',
      text: `${lines.join('\n')}\n`,
    };
  }

  return {
    filename: `${base}.json`,
    mime: 'application/json;charset=utf-8',
    text: `${JSON.stringify({
      video: {
        id: video.id,
        title: video.title,
        channel: video.channel,
        login: video.login,
        createdAt: video.createdAt,
        lengthSeconds: video.lengthSeconds,
        source: video.source || (isLive ? 'live-dom' : 'vod-gql'),
      },
      range: isLive ? null : {
        start,
        end: Number.isFinite(result.end) ? result.end : null,
      },
      count: comments.length,
      comments,
    }, null, 2)}\n`,
  };
}

function saveChatFile(filename, text, mime) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
