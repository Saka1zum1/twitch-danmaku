const TWITCH_GQL_URL = 'https://gql.twitch.tv/gql';
const TWITCH_GQL_CLIENT_ID = 'kd1unb4b3q4t58fwlpcbzcbnm76a8fp';
const VOD_COMMENTS_HASH = 'b70a3591ff0f4e0313d126c6a1502d79a1c02baebb288227c582044aa76adf6a';
const BITS_PATTERN = '(?:^|\\s)(?:4Head|Anon|BibleThumb|BitBoss|bday|Cheer|Charity|Corgo|cheerwal|DansGame|DoodleCheer|EleGiggle|FrankerZ|FailFish|Goal|HeyGuys|HolidayCheer|Kappa|Kreygasm|MrDestructoid|Muxy|NotLikeThis|Party|Pride|PJSalt|RIPCheer|Scoops|ShowLove|Shamrock|SeemsGood|SwiftRage|Streamlabs|TriHard|uni|VoHiYo)([1-9]\\d{0,6})(?=\\s|$)';

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
  const endLabel = Number.isFinite(result.end) ? fileClock(result.end) : 'end';
  const base = `twitch-chat-${video.id}-${fileClock(start)}-${endLabel}`;
  const kind = ['csv', 'txt', 'json'].includes(format) ? format : 'json';

  if (kind === 'csv') {
    const header = ['offset_seconds', 'timestamp', 'created_at', 'login', 'display_name', 'user_id', 'message', 'bits', 'superchat'];
    const lines = comments.map((comment) => [
      comment.offsetSeconds,
      formatChatClock(comment.offsetSeconds),
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
    const lines = comments.map((comment) => {
      const bits = comment.superchat ? ` [Bits ${comment.bits}]` : '';
      return `[${formatChatClock(comment.offsetSeconds)}] ${comment.displayName}${bits}: ${comment.message}`;
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
      },
      range: {
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
