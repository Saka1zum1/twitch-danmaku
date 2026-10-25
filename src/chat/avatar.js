const avatarCache = new Map();
let cachedViewerChannel = { login: '', id: '' };

function letterAvatarDataUri(name, color) {
  const letter = String(name || '?').trim().charAt(0).toUpperCase() || '?';
  const fill = String(color || '#9147ff').replace(/[<>&"']/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" rx="32" fill="${fill}"/><text x="32" y="40" text-anchor="middle" font-size="30" font-family="Arial,sans-serif" fill="#fff">${letter}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function cachedAvatar(login, displayName, color) {
  const key = String(login || displayName || '').toLowerCase();
  if (key && avatarCache.has(key)) return avatarCache.get(key);
  return letterAvatarDataUri(displayName || login, color);
}

function rememberAvatar(login, url) {
  const key = String(login || '').toLowerCase();
  if (!key || !url) return;
  avatarCache.set(key, url);
}

async function resolveViewerChannelContext() {
  const login = normalizeTwitchLogin(currentChannelLogin?.() || '');
  if (!login) return { login: '', id: '' };
  if (cachedViewerChannel.login === login && cachedViewerChannel.id) {
    return cachedViewerChannel;
  }
  try {
    const id = await resolveTwitchUserId(login);
    if (id) {
      cachedViewerChannel = { login, id: String(id) };
      return cachedViewerChannel;
    }
  } catch (_) {
    /* ignore */
  }
  return { login, id: '' };
}

function fetchTwitchAvatarViaUserQuery(login) {
  const key = String(login || '').trim().toLowerCase();
  if (!key) return Promise.resolve('');

  return new Promise((resolve) => {
    GM_xmlhttpRequest({
      method: 'POST',
      url: 'https://gql.twitch.tv/gql',
      headers: {
        'Client-ID': typeof TWITCH_WEB_CLIENT_ID !== 'undefined'
          ? TWITCH_WEB_CLIENT_ID
          : 'kimne78kx3ncx6brgo4mv6wki5h1ko',
        'Content-Type': 'application/json',
      },
      data: JSON.stringify({
        query: `query{user(login:${JSON.stringify(key)}){profileImageURL(width:70)}}`,
      }),
      timeout: 8000,
      onload: (res) => {
        try {
          const url = JSON.parse(res.responseText)?.data?.user?.profileImageURL || '';
          if (url) {
            rememberAvatar(key, url);
            resolve(url);
            return;
          }
        } catch {
          /* ignore */
        }
        resolve('');
      },
      onerror: () => resolve(''),
      ontimeout: () => resolve(''),
    });
  });
}

async function fetchTwitchAvatarViaViewerCard(login) {
  const key = normalizeTwitchLogin(login);
  if (!key) return '';
  if (typeof twitchGqlRequest !== 'function' || typeof gqlPersisted !== 'function') return '';

  const channel = await resolveViewerChannelContext();
  if (!channel.login) return '';

  try {
    const data = await twitchGqlRequest([
      gqlPersisted(
        'ViewerCard',
        {
          channelID: channel.id || '',
          channelLogin: channel.login,
          hasChannelID: !!channel.id,
          giftRecipientLogin: key,
          withStandardGifting: true,
          badgeSourceChannelID: channel.id || '',
          badgeSourceChannelLogin: channel.login,
        },
        TWITCH_GQL_HASH.viewerCard,
      ),
    ]);
    const payload = unwrapGqlPayload(data);
    const url = payload?.data?.targetUser?.profileImageURL || '';
    if (url) {
      rememberAvatar(key, url);
      return url;
    }
  } catch (_) {
    /* fall through */
  }
  return '';
}

function fetchTwitchAvatar(login) {
  const key = String(login || '').trim().toLowerCase();
  if (!key) return Promise.resolve('');
  if (avatarCache.has(key) && !String(avatarCache.get(key)).startsWith('data:')) {
    return Promise.resolve(avatarCache.get(key));
  }

  return fetchTwitchAvatarViaViewerCard(key)
    .then((url) => url || fetchTwitchAvatarViaUserQuery(key))
    .catch(() => fetchTwitchAvatarViaUserQuery(key));
}
