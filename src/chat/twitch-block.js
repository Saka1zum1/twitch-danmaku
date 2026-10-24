const TWITCH_WEB_CLIENT_ID = 'kimne78kx3ncx6brgo4mv6wki5h1ko';
const TWITCH_GQL_ENDPOINT = 'https://gql.twitch.tv/gql';

const TWITCH_GQL_HASH = {
  blockedUsersWithDetails: '031dd899a18968df9fe917bfb1293508f0c106c385283792c4620f8c994e95a7',
  blockedUserDetail: 'f1e276239a93802a4c533616dcb9f79d5e9b439e8b3cafb782be297b99d2d413',
  blockUser: 'c58b580efdc4187fa30c144c57425d7051602c848069be705f07e8d590a12515',
  unblockUser: 'f1b612a6df709cfa5fea630b20c78c9ba7f4c0be386bfd51486eaf02afbfbf92',
};

function getCookieValue(name) {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : '';
}

function getTwitchAuthToken() {
  return getCookieValue('auth-token') || '';
}

function getTwitchDeviceId() {
  return getCookieValue('unique_id')
    || getCookieValue('unique_id_durable')
    || localStorage.getItem('twilight.device_id')
    || '';
}

function normalizeTwitchLogin(value) {
  return String(value || '').trim().replace(/^@+/, '').toLowerCase();
}

function formatTwitchBlockedAt(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return String(iso);
  try {
    return date.toLocaleString();
  } catch {
    return date.toISOString();
  }
}

function twitchGqlRequest(payload) {
  const token = getTwitchAuthToken();
  if (!token) {
    return Promise.reject(Object.assign(new Error('not_logged_in'), { code: 'not_logged_in' }));
  }

  const headers = {
    Accept: '*/*',
    'Client-ID': TWITCH_WEB_CLIENT_ID,
    Authorization: `OAuth ${token}`,
    'Content-Type': 'text/plain;charset=UTF-8',
  };
  const deviceId = getTwitchDeviceId();
  if (deviceId) headers['X-Device-Id'] = deviceId;

  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: 'POST',
      url: TWITCH_GQL_ENDPOINT,
      headers,
      data: JSON.stringify(payload),
      timeout: 15000,
      onload: (res) => {
        if (res.status < 200 || res.status >= 300) {
          reject(Object.assign(new Error(`http_${res.status}`), {
            code: 'http_error',
            status: res.status,
            body: res.responseText,
          }));
          return;
        }
        try {
          resolve(JSON.parse(res.responseText));
        } catch (error) {
          reject(Object.assign(error || new Error('bad_json'), { code: 'bad_json' }));
        }
      },
      onerror: () => reject(Object.assign(new Error('network'), { code: 'network' })),
      ontimeout: () => reject(Object.assign(new Error('timeout'), { code: 'timeout' })),
    });
  });
}

function gqlPersisted(operationName, variables, sha256Hash) {
  return {
    operationName,
    variables,
    extensions: {
      persistedQuery: {
        version: 1,
        sha256Hash,
      },
    },
  };
}

function unwrapGqlPayload(data) {
  return Array.isArray(data) ? data[0] : data;
}

function assertNoGqlErrors(payload, fallbackCode = 'gql_error') {
  if (payload?.errors?.length) {
    const error = new Error(payload.errors[0]?.message || fallbackCode);
    error.code = 'gql_error';
    error.details = payload.errors;
    throw error;
  }
}

async function fetchTwitchBlockedUsers() {
  const data = await twitchGqlRequest(
    gqlPersisted('CommonHooks_BlockedUsersWithDetails', {}, TWITCH_GQL_HASH.blockedUsersWithDetails),
  );
  const payload = unwrapGqlPayload(data);
  assertNoGqlErrors(payload, 'list_failed');

  const edges = payload?.data?.currentUser?.blockedUsersWithMetadata?.edges;
  if (!Array.isArray(edges)) return [];

  return edges.map((edge) => {
    const node = edge?.node || {};
    return {
      id: node.id ? String(node.id) : '',
      login: normalizeTwitchLogin(node.login),
      displayName: String(node.displayName || node.login || '').trim(),
      profileImageURL: String(node.profileImageURL || '').trim(),
      blockedAt: edge?.blockedAt || '',
      blockedAtLabel: formatTwitchBlockedAt(edge?.blockedAt),
    };
  }).filter((user) => user.id || user.login);
}

async function resolveTwitchUserId(login) {
  const normalized = normalizeTwitchLogin(login);
  if (!normalized) return '';

  const data = await twitchGqlRequest([
    gqlPersisted('BlockedUserDetail', { login: normalized }, TWITCH_GQL_HASH.blockedUserDetail),
  ]);
  const payload = unwrapGqlPayload(data);
  assertNoGqlErrors(payload, 'lookup_failed');
  const user = payload?.data?.user;
  return user?.id ? String(user.id) : '';
}

async function blockTwitchUser(login, { sourceContext = 'CHAT' } = {}) {
  const targetUserID = await resolveTwitchUserId(login);
  if (!targetUserID) {
    const error = new Error('user_not_found');
    error.code = 'user_not_found';
    throw error;
  }

  const data = await twitchGqlRequest([
    gqlPersisted(
      'CommonHooks_BlockUser',
      { input: { targetUserID, sourceContext } },
      TWITCH_GQL_HASH.blockUser,
    ),
  ]);
  const payload = unwrapGqlPayload(data);
  assertNoGqlErrors(payload, 'block_failed');
  return { targetUserID, login: normalizeTwitchLogin(login) };
}

async function unblockTwitchUserById(targetUserID) {
  const id = String(targetUserID || '').trim();
  if (!id) {
    const error = new Error('user_not_found');
    error.code = 'user_not_found';
    throw error;
  }

  const data = await twitchGqlRequest([
    gqlPersisted(
      'CommonHooks_UnblockUser',
      { input: { targetUserID: id } },
      TWITCH_GQL_HASH.unblockUser,
    ),
  ]);
  const payload = unwrapGqlPayload(data);
  assertNoGqlErrors(payload, 'unblock_failed');
  return { targetUserID: id };
}

async function unblockTwitchUser(login) {
  const targetUserID = await resolveTwitchUserId(login);
  if (!targetUserID) {
    const error = new Error('user_not_found');
    error.code = 'user_not_found';
    throw error;
  }
  await unblockTwitchUserById(targetUserID);
  return { targetUserID, login: normalizeTwitchLogin(login) };
}
