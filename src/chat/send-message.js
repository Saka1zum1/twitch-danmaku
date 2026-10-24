const SEND_CHAT_MESSAGE_HASH = '0435464292cf380ed4b3d905e4edcb73078362e82c06367a5b2181c76c822fa2';

let cachedChatChannel = { login: '', id: '' };

function createChatNonce() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().replace(/-/g, '');
  }
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  }
  return `${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`;
}

async function resolveLiveChannelId() {
  const login = currentChannelLogin();
  if (!login) {
    const error = new Error('no_channel');
    error.code = 'no_channel';
    throw error;
  }
  if (cachedChatChannel.login === login && cachedChatChannel.id) {
    return cachedChatChannel.id;
  }
  const id = await resolveTwitchUserId(login);
  if (!id) {
    const error = new Error('channel_not_found');
    error.code = 'channel_not_found';
    throw error;
  }
  cachedChatChannel = { login, id };
  return id;
}

async function sendTwitchChatMessage(message) {
  const text = String(message || '').trim();
  if (!text) {
    const error = new Error('empty_message');
    error.code = 'empty_message';
    throw error;
  }

  const channelID = await resolveLiveChannelId();
  const nonce = createChatNonce();
  const data = await twitchGqlRequest([
    gqlPersisted(
      'sendChatMessage',
      {
        input: {
          channelID,
          message: text,
          nonce,
          replyParentMessageID: null,
        },
      },
      SEND_CHAT_MESSAGE_HASH,
    ),
  ]);

  const payload = unwrapGqlPayload(data);
  assertNoGqlErrors(payload, 'send_failed');

  const result = payload?.data?.sendChatMessage;
  if (result?.errorCode || result?.error) {
    const error = new Error(result.errorCode || result.error || 'send_failed');
    error.code = 'send_failed';
    error.details = result;
    throw error;
  }

  return { channelID, nonce, result };
}
