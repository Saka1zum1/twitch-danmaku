const SCROLL_AREA_BOTTOM_RESERVE = 56;

const DEFAULT_SETTINGS = {
  enabled: true,
  speed: 5,
  fontSize: 22,
  danmakuOpacity: 100,
  fontFamily: 'system-ui, sans-serif',
  scrollArea: 'full',
  translateEnabled: false,
  translateInChat: true,
  translateProvider: 'microsoft',
  translateTargetLang: getDefaultTranslateTargetLang(),
  translateSpeed: 3,
  blockedKeywords: [],
  speechEnabled: false,
  speechVolume: 80,
  speechPitch: 100,
  speechVoice: '',
  speechLang: '',
  speechRate: 100,
  speechPace: true,
  speechMaxSeconds: 4,
  speechBuffer: 5,
  superchatPinned: false,
  superchatPosition: 'top',
  superchatDuration: 15,
  superchatAnimation: 'slide',
  superchatHideSubscribe: false,
  superchatCompact: false,
  superchatMaxWidth: 420,
  superchatOverlayDanmaku: true,
  superchatDurationByAmount: false,
};

const SELECTORS = {
  chatScroller: '[data-a-target="chat-scroller"], .video-chat__message-list-wrapper',
  chatMessage: '[data-a-target="chat-message-container"], [data-a-target="chat-line-message"], .chat-line__message, [data-test-selector="chat-message"], [data-test-selector="user-notice-line"], .vod-message',
  chatText: 'span[data-a-target="chat-message-text"], span.text-fragment',
  chatUsername: '[data-a-target="chat-message-username"], .chat-author__display-name, .chat-line__username, .chatter-name',
  chatMessageBody: '[data-a-target="chat-line-message-body"], .chat-line__message-body, .video-chat__message, [data-test-selector="user-notice-line"]',
  videoPlayer: '.video-player__container',
  videoOverlay: '.video-player__overlay',
  playerControlsRoot: '[data-a-target="player-controls"], .player-controls',
  playerControls: '.video-player__default-player .player-controls__right-control-group, .player-controls__right-control-group',
  chatInput: 'textarea[data-a-target="chat-input"]',
  chatInputSlate: '[data-a-target="chat-input"][contenteditable="true"], .chat-wysiwyg-input__editor[contenteditable="true"]',
  chatInputEditable: '[data-a-target="chat-input"][contenteditable="true"], [data-a-target="chat-input-text"]',
  chatHeader: '.stream-chat-header, [class*="stream-chat-header"]',
  chatViewerListBtn: '[data-test-selector="chat-viewer-list"]',
  chatMessageContainer: '[data-test-selector="chat-scrollable-area__message-container"], .chat-scrollable-area__message-container',
  chatInputActions: '[data-tbc-chat-input-actions]',
  bitsButton: '[data-a-target="bits-button"]',
  emotePickerButton: '[data-a-target="emote-picker-button"]',
  chatScrollableArea: '.chat-list--default .scrollable-area, .scrollable-area',
};

const TRANSLATE_PROVIDERS = ['auto', 'microsoft', 'google', 'volcengine', 'caiyun', 'tencent'];

// Global Twitch cheermote prefixes + partner custom "*Cheer" suffixes.
const CHEER_EMOTE_PREFIXES = [
  '4Head', 'Anon', 'BibleThumb', 'BitBoss', 'bday', 'Cheer', 'Charity', 'Corgo', 'cheerwal',
  'DansGame', 'DoodleCheer', 'EleGiggle', 'FrankerZ', 'FailFish', 'Goal', 'HeyGuys',
  'HolidayCheer', 'Kappa', 'Kreygasm', 'MrDestructoid', 'Muxy', 'NotLikeThis', 'Party',
  'Pride', 'PJSalt', 'RIPCheer', 'Scoops', 'ShowLove', 'Shamrock', 'SeemsGood', 'SwiftRage',
  'Streamlabs', 'TriHard', 'uni', 'VoHiYo',
];
const CHEER_PREFIX_PATTERN = CHEER_EMOTE_PREFIXES.map((prefix) => prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
const BITS_TOKEN_PATTERN = `(?:^|\\s)(?:[A-Za-z][\\w]*?(?:Cheer|cheer)|(?:${CHEER_PREFIX_PATTERN}))([1-9]\\d{0,6})(?=\\s|$)`;

const SCROLL_AREAS = ['full', 'top-half', 'bottom-half', 'top-quarter'];
const SUPERCHAT_POSITIONS = ['top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right'];

function resolveSuperchatPlacement(value) {
  const key = String(value || 'top').toLowerCase().replace(/_/g, '-');
  const map = {
    top: { vertical: 'top', horizontal: 'center' },
    bottom: { vertical: 'bottom', horizontal: 'center' },
    'top-left': { vertical: 'top', horizontal: 'left' },
    topleft: { vertical: 'top', horizontal: 'left' },
    'top-right': { vertical: 'top', horizontal: 'right' },
    topright: { vertical: 'top', horizontal: 'right' },
    'bottom-left': { vertical: 'bottom', horizontal: 'left' },
    bottomleft: { vertical: 'bottom', horizontal: 'left' },
    'bottom-right': { vertical: 'bottom', horizontal: 'right' },
    bottomright: { vertical: 'bottom', horizontal: 'right' },
  };
  return map[key] || map.top;
}

function resolveSuperchatDuration(settings, meta) {
  const base = clamp(finiteNumber(settings?.superchatDuration, DEFAULT_SETTINGS.superchatDuration), 2, 300);
  if (!settings?.superchatDurationByAmount || !meta) return base;

  let bonus = 0;
  if (meta.kind === 'cheer' && meta.bits) {
    const bits = Math.max(1, Number(meta.bits) || 1);
    bonus = Math.log10(bits) * 6;
  } else if (meta.kind === 'sub') {
    bonus = 8;
  } else if (meta.kind === 'pin') {
    bonus = 5;
  }
  return clamp(Math.round(base + bonus), 2, 300);
}

const SUPERCHAT_MAX_PINS = 10;

const STORAGE_KEY = 'tbc_settings_v1';

const LIVE_MESSAGE_TAIL = 8;
const WARMUP_MS = 2500;
const MAX_DANMAKU_QUEUE = 24;
const MAX_TRANSLATE_QUEUE = 32;
