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

/** Normalize Twitch drop / restriction codes to stable keys. */
function normalizeChatSendCode(raw) {
  const code = String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/-/g, '_')
    .replace(/\s+/g, '_');
  if (!code) return '';

  if (
    code.includes('follower')
    || code === 'followers_only'
    || code === 'followers_only_mode'
    || code === 'followers_only_zero'
    || code === 'msg_followersonly'
    || code === 'msg_followersonly_zero'
  ) {
    // Followed but not long enough — treat as follow-time gate.
    if (
      code.includes('followed')
      || code.includes('duration')
      || code.includes('minutes')
      || code === 'msg_followersonly_followed'
    ) {
      return 'followers_only_time';
    }
    return 'followers_only';
  }
  if (code.includes('sub') && (code.includes('only') || code.includes('subscriber'))) {
    return 'subscribers_only';
  }
  if (
    code.includes('verified_phone')
    || code.includes('require_verified_phone')
    || code.includes('requires_verified_phone')
    || code === 'msg_requires_verified_phone_number'
  ) {
    return 'verified_phone';
  }
  if (
    code === 'verified_only'
    || code === 'verified_account'
    || code === 'msg_verified_email'
    || (code.includes('verified') && !code.includes('phone'))
  ) {
    return 'verified_only';
  }
  if (code.includes('slow')) return 'slow_mode';
  if (code.includes('emote')) return 'emote_only';
  if (code.includes('r9k') || code.includes('unique')) return 'unique_mode';
  if (code.includes('automod')) return 'automod_held';
  if (code.includes('timed_out') || code.includes('timeout')) return 'timed_out';
  if (code.includes('banned') || code.includes('suspended')) return 'banned';
  if (code.includes('duplicate')) return 'duplicate';
  if (code.includes('ratelimit') || code.includes('rate_limit')) return 'rate_limit';
  if (code === 'not_logged_in') return 'not_logged_in';
  if (code === 'no_channel' || code === 'channel_not_found' || code === 'empty_message') return code;
  return code || 'send_failed';
}

function readDropReasonCode(drop) {
  // Twitch web GQL returns dropReason as a string enum, e.g. "REQUIRES_VERIFIED_PHONE_NUMBER".
  // Helix-style payloads may use { code, message }.
  if (!drop) return '';
  if (typeof drop === 'string') return drop;
  if (typeof drop === 'object') return drop.code || drop.errorCode || '';
  return '';
}

function readDropReasonMessage(drop) {
  if (!drop || typeof drop !== 'object') return '';
  return String(drop.message || '').trim();
}

function extractChatSendFailure(result) {
  if (!result || typeof result !== 'object') {
    return { code: 'send_failed', userMessage: '' };
  }

  const drop = result.dropReason ?? result.drop_reason ?? null;
  const errObj = result.error && typeof result.error === 'object' ? result.error : null;
  const rawCode = result.errorCode
    || readDropReasonCode(drop)
    || errObj?.code
    || (typeof result.error === 'string' ? result.error : '')
    || '';
  const userMessage = String(
    readDropReasonMessage(drop)
    || errObj?.message
    || result.errorMessage
    || (typeof result.message === 'string' ? result.message : '')
    || '',
  ).trim();

  const isSent = result.isSent ?? result.is_sent;
  const hasMessageId = !!(
    result.message?.id
    || result.messageID
    || result.message_id
  );

  // Explicit success.
  if (isSent === true || hasMessageId) {
    if (!rawCode && drop == null && !errObj) return null;
  }

  const dropped = isSent === false
    || drop != null
    || !!rawCode
    || !!errObj
    || result.message === null;

  if (!dropped) return null;

  return {
    code: normalizeChatSendCode(rawCode) || 'send_failed',
    userMessage,
  };
}

function createChatSendError(failure, details) {
  const error = new Error(failure?.code || 'send_failed');
  error.code = failure?.code || 'send_failed';
  error.userMessage = failure?.userMessage || '';
  error.details = details;
  return error;
}

/** Localized status text for chat send failures (favorites / fullscreen / etc.). */
function chatSendErrorMessage(error) {
  const code = normalizeChatSendCode(error?.code || error?.message);
  switch (code) {
    case 'not_logged_in':
      return t('fsChatNeedLogin');
    case 'no_channel':
    case 'channel_not_found':
      return t('favoritesNeedChannel');
    case 'followers_only':
      return t('fsChatNeedFollow');
    case 'followers_only_time':
      return t('fsChatNeedFollowTime');
    case 'subscribers_only':
      return t('fsChatNeedSub');
    case 'verified_only':
      return t('fsChatNeedVerified');
    case 'verified_phone':
      return t('fsChatNeedPhone');
    case 'slow_mode':
      return t('fsChatSlowMode');
    case 'emote_only':
      return t('fsChatEmoteOnly');
    case 'unique_mode':
      return t('fsChatUniqueMode');
    case 'automod_held':
      return t('fsChatAutomod');
    case 'timed_out':
      return t('fsChatTimedOut');
    case 'banned':
      return t('fsChatBanned');
    case 'duplicate':
      return t('fsChatDuplicate');
    case 'rate_limit':
      return t('fsChatRateLimit');
    case 'empty_message':
      return t('favoritesEmptyText');
    default:
      break;
  }
  const twitchMsg = String(error?.userMessage || '').trim();
  if (twitchMsg) return twitchMsg;
  return t('fsChatFailed');
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
  if (!result) {
    throw createChatSendError({ code: 'send_failed', userMessage: '' }, payload);
  }

  const failure = extractChatSendFailure(result);
  if (failure) {
    throw createChatSendError(failure, result);
  }

  return { channelID, nonce, result };
}
