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
};

const SELECTORS = {
  chatScroller: '[data-a-target="chat-scroller"], .video-chat__message-list-wrapper',
  chatMessage: '[data-a-target="chat-message-container"], .chat-line__message, [data-test-selector="chat-message"], .vod-message',
  chatText: 'span[data-a-target="chat-message-text"], span.text-fragment',
  chatUsername: '[data-a-target="chat-message-username"], .chat-author__display-name, .chat-line__username',
  chatMessageBody: '[data-a-target="chat-line-message-body"], .chat-line__message-body, .video-chat__message',
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

const STORAGE_KEY = 'tbc_settings_v1';

const LIVE_MESSAGE_TAIL = 8;
const WARMUP_MS = 2500;
const MAX_DANMAKU_QUEUE = 24;
const MAX_TRANSLATE_QUEUE = 32;
