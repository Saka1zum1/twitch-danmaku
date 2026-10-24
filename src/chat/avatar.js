const avatarCache = new Map();

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

function fetchTwitchAvatar(login) {
  const key = String(login || '').trim().toLowerCase();
  if (!key) return Promise.resolve('');
  if (avatarCache.has(key) && !String(avatarCache.get(key)).startsWith('data:')) {
    return Promise.resolve(avatarCache.get(key));
  }

  return new Promise((resolve) => {
    GM_xmlhttpRequest({
      method: 'POST',
      url: 'https://gql.twitch.tv/gql',
      headers: {
        'Client-ID': 'kd1unb4b3q4t58fwlpcbzcbnm76a8fp',
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
