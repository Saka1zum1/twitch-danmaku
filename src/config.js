const SCROLL_AREA_BOTTOM_RESERVE = 56;

const DEFAULT_SETTINGS = {
  enabled: true,
  speed: 5,
  fontSize: 22,
  danmakuOpacity: 100,
  fontFamily: 'system-ui, sans-serif',
  scrollArea: 'full',
  translateEnabled: false,
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
  superchatDuration: 6,
  superchatAnimation: 'slide',
};

const SELECTORS = {
  chatScroller: '[data-a-target="chat-scroller"]',
  chatMessage: '[data-a-target="chat-message-container"], .chat-line__message, [data-test-selector="chat-message"]',
  chatText: 'span[data-a-target="chat-message-text"], span.text-fragment',
  chatUsername: '[data-a-target="chat-message-username"], .chat-author__display-name, .chat-line__username',
  videoPlayer: '.video-player__container',
  videoOverlay: '.video-player__overlay',
  playerControlsRoot: '[data-a-target="player-controls"], .player-controls',
  playerControls: '.player-controls__right-control-group',
  chatInput: 'textarea[data-a-target="chat-input"]',
  chatInputSlate: '[data-a-target="chat-input"][contenteditable="true"], .chat-wysiwyg-input__editor[contenteditable="true"]',
  chatInputEditable: '[data-a-target="chat-input"][contenteditable="true"], [data-a-target="chat-input-text"]',
};

const TRANSLATE_PROVIDERS = ['auto', 'microsoft', 'google', 'volcengine', 'caiyun', 'tencent'];

const STORAGE_KEY = 'tbc_settings_v1';

const LIVE_MESSAGE_TAIL = 8;
const WARMUP_MS = 2500;
const MAX_DANMAKU_QUEUE = 24;
const MAX_TRANSLATE_QUEUE = 32;
