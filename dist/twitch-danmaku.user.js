// ==UserScript==
// @name         Twitch Danmaku - Bullet Chat
// @name:zh-CN   Twitch 弹幕
// @name:zh-TW   Twitch 弹幕
// @name:ja      Twitch 弾幕
// @namespace    https://github.com/saka1zum1/twitch-danmaku
// @version      1.7.0
// @description  Convert Twitch live chat to video danmaku with real-time translation
// @description:zh-CN  将 Twitch 直播评论转换为视频弹幕，支持实时翻译
// @description:zh-TW  將聊天室中的新訊息轉換成影片上的滾動彈幕，支持即時翻譯
// @description:ja      Twitch のチャットをリアルタイム翻訳付きで動画の弾幕に変換します
// @author       KaKa
// @license      MIT
// @match        https://www.twitch.tv/*
// @match        https://m.twitch.tv/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// @connect      translate.googleapis.com
// @connect      edge.microsoft.com
// @connect      api-edge.cognitive.microsofttranslator.com
// @connect      transmart.qq.com
// @connect      translate.volcengine.com
// @connect      api.interpreter.caiyunai.com
// @connect      gql.twitch.tv
// @run-at       document-idle
// @icon         https://www.google.com/s2/favicons?sz=64&domain=twitch.com
// ==/UserScript==

(function () {
  'use strict';
const LOCALES = {
  zh: {
    danmakuToggle: '弹幕开关',
    danmakuOn: '关闭弹幕',
    danmakuOff: '开启弹幕',
    settingsToggle: '弹幕设置',
    panelTitle: '弹幕设置',
    panelClose: '关闭',
    scrollSpeed: '滚动速度',
    fontSize: '字体大小',
    danmakuOpacity: '弹幕透明度',
    fontFamily: '字体',
    scrollArea: '滚动区域',
    translateEnable: '启用翻译',
    translateInChat: '聊天室显示译文',
    translateInChatHint: '在聊天消息下方显示译文，使用 Twitch 紫色样式与原文区分。关闭后只影响聊天室，不影响弹幕译文。',
    translateBadge: '译',
    translateProvider: '翻译引擎',
    translateProviderAuto: '自动切换',
    translateProviderMicrosoft: 'Microsoft 翻译',
    translateProviderGoogle: 'Google 翻译',
    translateProviderVolcengine: '火山翻译',
    translateProviderCaiyun: '彩云小译',
    translateProviderTencent: '腾讯交互翻译',
    translateTarget: '目标语言',
    translateSpeed: '翻译速度',
    translateSpeedUnit: '条/秒',
    blockKeywords: '关键词屏蔽',
    blockKeywordsHint: '原文或译文包含关键词时不显示',
    blockKeywordsPlaceholder: '输入关键词',
    blockKeywordsAdd: '添加',
    blockKeywordsRemove: '移除',
    blockKeywordsEmpty: '暂无关键词',
    speechToggle: '弹幕朗读',
    speechPanelTitle: '弹幕朗读',
    speechEnable: '启用朗读',
    speechOn: '朗读已开启',
    speechMute: '朗读已静音',
    speechOff: '朗读已关闭',
    speechTest: '试读',
    speechTestText: '这是一条测试弹幕 ABC',
    speechPlay: '按设定速度试读',
    speechPlayFast: '按变速模式试读',
    speechVolume: '音量',
    speechPitch: '音高',
    speechVoice: '声音',
    speechVoiceLang: '语言',
    speechVoiceDefault: '默认',
    speechRate: '朗读速度',
    speechPace: '变速模式',
    speechMaxSeconds: '单条最长',
    speechSeconds: '秒',
    speechPaceHint: '超出最长朗读时间时自动加快。开启翻译后按译文朗读。重复内容最多读 3 遍，纯符号、纯表情和纯数字不朗读。',
    speechBuffer: '保留条数',
    speechBufferHint: '超过这个数量时丢掉更早的弹幕，避免朗读一直追不上',
    speechUnsupported: '当前浏览器不支持语音朗读',
    historyToggle: '下载聊天记录',
    historyPanelTitle: '下载聊天记录',
    historyKeyword: '内容关键词',
    historyKeywordPlaceholder: '关键词，逗号分隔',
    historyKeywordHint: '只导出包含这些词的消息。留空表示不过滤。',
    historyUsername: '用户名',
    historyUsernamePlaceholder: '用户名，逗号分隔',
    historyUsernameHint: '匹配登录名或显示名。留空表示不过滤。',
    historyIncludeSuperchat: '包含 Super Chat',
    historyIncludeSuperchatHint: 'Super Chat 指 Bits Cheers。关闭后不导出这些消息。',
    historyRange: '时间范围',
    historyRangeUnknown: '未能读取时长，将下载整段聊天。',
    historyLiveHint: '直播页会导出当前聊天面板里已加载的消息，不是完整历史。',
    historyLiveReady: '已就绪：可导出当前聊天面板中的消息。',
    historyFormat: '导出格式',
    historyFormatJson: 'JSON',
    historyFormatCsv: 'CSV',
    historyFormatTxt: 'TXT',
    historyDownload: '下载',
    historyPause: '暂停',
    historyResume: '继续',
    historyCancel: '取消',
    historyLoading: '正在读取回放…',
    historyNeedSource: '请打开直播页，或打开回放页（网址中包含 /videos/）。',
    historyMissing: '找不到这个回放，或聊天记录已不可用。',
    historyFailed: '下载失败，请稍后再试。',
    historyEmpty: '没有可导出的聊天记录。',
    historyNoMatch: '没有符合筛选条件的聊天记录。',
    historyProgress: '已获取 {count} 条',
    historyPaused: '已暂停，已获取 {count} 条',
    historyDone: '已导出 {count} 条',
    historyCancelled: '已取消',
    superchatPinned: 'Super Chat 悬停',
    superchatPosition: '悬停位置',
    superchatDuration: '悬停时间',
    superchatAnimation: '悬停动画',
    superchatTop: '顶部',
    superchatBottom: '底部',
    superchatFade: '淡入淡出',
    superchatSlide: '滑入',
    superchatPop: '弹出',
    superchatShine: '闪光',
    scrollAreaFull: '全屏',
    scrollAreaTopHalf: '上半屏',
    scrollAreaTopQuarter: '顶部 1/4',
    fontSystem: '系统默认',
    fontYaHei: '微软雅黑',
    fontSimSun: '宋体',
    fontSimHei: '黑体',
    fontArial: 'Arial',
    fontRoboto: 'Roboto',
    fontImpact: 'Impact',
    fontGeorgia: 'Georgia',
    fontTimes: 'Times New Roman',
    fontVerdana: 'Verdana',
    fontTahoma: 'Tahoma',
    fontTrebuchet: 'Trebuchet MS',
    fontCourier: 'Courier New',
    fontConsolas: 'Consolas',
    fontComicSans: 'Comic Sans MS',
    fontSerif: 'Serif 衬线',
    fontSansSerif: 'Sans-serif 无衬线',
    fontMonospace: 'Monospace 等宽',
    langZhCN: '简体中文',
    langZhTW: '繁体中文',
    langEn: 'English',
    langJa: '日本語',
    langKo: '한국어',
    langEs: 'Español',
    langFr: 'Français',
    langDe: 'Deutsch',
    langRu: 'Русский',
    langPt: 'Português',
    tooltipCopy: '复制到聊天框',
    tooltipOpenProfile: '打开发送者主页',
  },
  en: {
    danmakuToggle: 'Danmaku toggle',
    danmakuOn: 'Turn off danmaku',
    danmakuOff: 'Turn on danmaku',
    settingsToggle: 'Danmaku settings',
    panelTitle: 'Danmaku Settings',
    panelClose: 'Close',
    scrollSpeed: 'Scroll speed',
    fontSize: 'Font size',
    danmakuOpacity: 'Danmaku opacity',
    fontFamily: 'Font',
    scrollArea: 'Scroll area',
    translateEnable: 'Enable translation',
    translateInChat: 'Show translation in chat',
    translateInChatHint: 'Show the translation under each chat line in Twitch purple so it stands out from the original. Turning this off only hides chat translations; danmaku translations are unchanged.',
    translateBadge: 'TL',
    translateProvider: 'Translation engine',
    translateProviderAuto: 'Auto',
    translateProviderMicrosoft: 'Microsoft Translator',
    translateProviderGoogle: 'Google Translate',
    translateProviderVolcengine: 'Volcengine',
    translateProviderCaiyun: 'Caiyun',
    translateProviderTencent: 'Tencent Transmart',
    translateTarget: 'Target language',
    translateSpeed: 'Translation speed',
    translateSpeedUnit: '/sec',
    blockKeywords: 'Block keywords',
    blockKeywordsHint: 'Hidden when the original or translation contains a keyword',
    blockKeywordsPlaceholder: 'Keyword',
    blockKeywordsAdd: 'Add',
    blockKeywordsRemove: 'Remove',
    blockKeywordsEmpty: 'No keywords',
    speechToggle: 'Read danmaku',
    speechPanelTitle: 'Read danmaku',
    speechEnable: 'Read danmaku aloud',
    speechOn: 'Reading is on',
    speechMute: 'Reading is muted',
    speechOff: 'Reading is off',
    speechTest: 'Trial',
    speechTestText: 'This is a test ABC',
    speechPlay: 'Play at set speed',
    speechPlayFast: 'Play with pace mode',
    speechVolume: 'Volume',
    speechPitch: 'Pitch',
    speechVoice: 'Voice',
    speechVoiceLang: 'Language',
    speechVoiceDefault: 'Default',
    speechRate: 'Reading speed',
    speechPace: 'Pace mode',
    speechMaxSeconds: 'Max per line',
    speechSeconds: 'sec',
    speechPaceHint: 'Speed up when a line would exceed the max time. With translation on, the translated text is read. Repeated phrases are read at most 3 times. Symbols, emotes, and numbers alone are skipped.',
    speechBuffer: 'Keep latest',
    speechBufferHint: 'Older lines beyond this count are dropped so reading can catch up',
    speechUnsupported: 'Speech synthesis is not available in this browser',
    historyToggle: 'Download chat history',
    historyPanelTitle: 'Download chat history',
    historyKeyword: 'Keyword',
    historyKeywordPlaceholder: 'Keywords, comma separated',
    historyKeywordHint: 'Export only messages that contain one of these words. Leave empty to keep all.',
    historyUsername: 'Username',
    historyUsernamePlaceholder: 'Usernames, comma separated',
    historyUsernameHint: 'Matches login or display name. Leave empty to keep all.',
    historyIncludeSuperchat: 'Include Super Chats',
    historyIncludeSuperchatHint: 'Super Chat means Bits cheers. Turn this off to leave them out.',
    historyRange: 'Time range',
    historyRangeUnknown: 'Duration is unavailable, so the full chat will be downloaded.',
    historyLiveHint: 'On a live page, export collects messages currently loaded in the chat panel — not the full stream history.',
    historyLiveReady: 'Ready to export messages currently in the chat panel.',
    historyFormat: 'Format',
    historyFormatJson: 'JSON',
    historyFormatCsv: 'CSV',
    historyFormatTxt: 'TXT',
    historyDownload: 'Download',
    historyPause: 'Pause',
    historyResume: 'Resume',
    historyCancel: 'Cancel',
    historyLoading: 'Loading VOD…',
    historyNeedSource: 'Open a live channel page, or a VOD page (the URL contains /videos/).',
    historyMissing: 'This VOD was not found, or its chat is no longer available.',
    historyFailed: 'Download failed. Try again later.',
    historyEmpty: 'No chat available to export.',
    historyNoMatch: 'No messages match these filters.',
    historyProgress: 'Collected {count}',
    historyPaused: 'Paused, collected {count}',
    historyDone: 'Exported {count}',
    historyCancelled: 'Cancelled',
    superchatPinned: 'Pin Super Chats',
    superchatPosition: 'Pin position',
    superchatDuration: 'Pin time',
    superchatAnimation: 'Pin animation',
    superchatTop: 'Top',
    superchatBottom: 'Bottom',
    superchatFade: 'Fade',
    superchatSlide: 'Slide',
    superchatPop: 'Pop',
    superchatShine: 'Shine',
    scrollAreaFull: 'Full screen',
    scrollAreaTopHalf: 'Top half',
    scrollAreaTopQuarter: 'Top quarter',
    fontSystem: 'System default',
    fontYaHei: 'Microsoft YaHei',
    fontSimSun: 'SimSun',
    fontSimHei: 'SimHei',
    fontArial: 'Arial',
    fontRoboto: 'Roboto',
    fontImpact: 'Impact',
    fontGeorgia: 'Georgia',
    fontTimes: 'Times New Roman',
    fontVerdana: 'Verdana',
    fontTahoma: 'Tahoma',
    fontTrebuchet: 'Trebuchet MS',
    fontCourier: 'Courier New',
    fontConsolas: 'Consolas',
    fontComicSans: 'Comic Sans MS',
    fontSerif: 'Serif',
    fontSansSerif: 'Sans-serif',
    fontMonospace: 'Monospace',
    langZhCN: 'Chinese (Simplified)',
    langZhTW: 'Chinese (Traditional)',
    langEn: 'English',
    langJa: 'Japanese',
    langKo: 'Korean',
    langEs: 'Spanish',
    langFr: 'French',
    langDe: 'German',
    langRu: 'Russian',
    langPt: 'Portuguese',
    tooltipCopy: 'Copy to chat',
    tooltipOpenProfile: 'Open sender profile',
  },
};

function detectLocale() {
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const lang of langs) {
    if (lang && /^zh(-|$)/i.test(lang)) return 'zh';
  }
  return 'en';
}

const LOCALE = detectLocale();
const STRINGS = LOCALES[LOCALE];

function t(key) {
  return STRINGS[key] || LOCALES.en[key] || key;
}

function fill(key, vars) {
  let text = t(key);
  for (const [name, value] of Object.entries(vars || {})) {
    text = text.replaceAll(`{${name}}`, String(value));
  }
  return text;
}

function getFontOptions() {
  return [
    { label: t('fontSystem'), value: 'system-ui, sans-serif' },
    { label: t('fontYaHei'), value: '"Microsoft YaHei", sans-serif' },
    { label: t('fontSimSun'), value: 'SimSun, serif' },
    { label: t('fontSimHei'), value: 'SimHei, sans-serif' },
    { label: t('fontArial'), value: 'Arial, Helvetica, sans-serif' },
    { label: t('fontRoboto'), value: 'Roboto, sans-serif' },
    { label: t('fontVerdana'), value: 'Verdana, Geneva, sans-serif' },
    { label: t('fontTahoma'), value: 'Tahoma, Geneva, sans-serif' },
    { label: t('fontTrebuchet'), value: '"Trebuchet MS", sans-serif' },
    { label: t('fontGeorgia'), value: 'Georgia, serif' },
    { label: t('fontTimes'), value: '"Times New Roman", Times, serif' },
    { label: t('fontCourier'), value: '"Courier New", Courier, monospace' },
    { label: t('fontConsolas'), value: 'Consolas, monospace' },
    { label: t('fontImpact'), value: 'Impact, Haettenschweiler, sans-serif' },
    { label: t('fontComicSans'), value: '"Comic Sans MS", cursive, sans-serif' },
    { label: t('fontSerif'), value: 'serif' },
    { label: t('fontSansSerif'), value: 'sans-serif' },
    { label: t('fontMonospace'), value: 'monospace' },
  ];
}

function getScrollAreaOptions() {
  return [
    { label: t('scrollAreaFull'), value: 'full' },
    { label: t('scrollAreaTopHalf'), value: 'top-half' },
    { label: t('scrollAreaTopQuarter'), value: 'top-quarter' },
  ];
}

function getSuperchatPositionOptions() {
  return [
    { label: t('superchatTop'), value: 'top' },
    { label: t('superchatBottom'), value: 'bottom' },
  ];
}

function getSuperchatAnimationOptions() {
  return [
    { label: t('superchatFade'), value: 'fade' },
    { label: t('superchatSlide'), value: 'slide' },
    { label: t('superchatPop'), value: 'pop' },
    { label: t('superchatShine'), value: 'shine' },
  ];
}

function getTranslateProviderOptions() {
  return [
    { label: t('translateProviderAuto'), value: 'auto' },
    { label: t('translateProviderMicrosoft'), value: 'microsoft' },
    { label: t('translateProviderGoogle'), value: 'google' },
    { label: t('translateProviderVolcengine'), value: 'volcengine' },
    { label: t('translateProviderCaiyun'), value: 'caiyun' },
    { label: t('translateProviderTencent'), value: 'tencent' },
  ];
}

function getTranslateLangOptions() {
  return [
    { label: t('langZhCN'), value: 'zh-CN' },
    { label: t('langZhTW'), value: 'zh-TW' },
    { label: t('langEn'), value: 'en' },
    { label: t('langJa'), value: 'ja' },
    { label: t('langKo'), value: 'ko' },
    { label: t('langEs'), value: 'es' },
    { label: t('langFr'), value: 'fr' },
    { label: t('langDe'), value: 'de' },
    { label: t('langRu'), value: 'ru' },
    { label: t('langPt'), value: 'pt' },
  ];
}

function getDefaultTranslateTargetLang() {
  return LOCALE === 'zh' ? 'zh-CN' : 'en';
}

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
  superchatDuration: 6,
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

function loadSettings() {
  try {
    const saved = GM_getValue(STORAGE_KEY, null);
    if (saved && typeof saved === 'object') {
      const merged = { ...DEFAULT_SETTINGS, ...saved };
      if (merged.scrollArea === 'half') {
        merged.scrollArea = 'top-half';
      }
      if (!TRANSLATE_PROVIDERS.includes(merged.translateProvider)) {
        merged.translateProvider = DEFAULT_SETTINGS.translateProvider;
      }
      merged.blockedKeywords = sanitizeBlockedKeywords(merged.blockedKeywords);
      merged.translateEnabled = !!merged.translateEnabled;
      merged.translateInChat = merged.translateInChat !== false;
      merged.danmakuOpacity = clamp(Number(merged.danmakuOpacity) || DEFAULT_SETTINGS.danmakuOpacity, 10, 100);
      merged.speechEnabled = !!merged.speechEnabled;
      merged.speechVolume = clamp(finiteNumber(merged.speechVolume, DEFAULT_SETTINGS.speechVolume), 0, 100);
      merged.speechPitch = clamp(finiteNumber(merged.speechPitch, DEFAULT_SETTINGS.speechPitch), 0, 200);
      merged.speechRate = clamp(finiteNumber(merged.speechRate, DEFAULT_SETTINGS.speechRate), 50, 200);
      merged.speechPace = merged.speechPace !== false;
      merged.speechMaxSeconds = clamp(finiteNumber(merged.speechMaxSeconds, DEFAULT_SETTINGS.speechMaxSeconds), 1, 15);
      merged.speechBuffer = clamp(finiteNumber(merged.speechBuffer, DEFAULT_SETTINGS.speechBuffer), 1, 25);
      merged.speechVoice = typeof merged.speechVoice === 'string' ? merged.speechVoice : '';
      merged.speechLang = typeof merged.speechLang === 'string' ? merged.speechLang : '';
      merged.superchatPinned = !!merged.superchatPinned;
      if (!['top', 'bottom'].includes(merged.superchatPosition)) merged.superchatPosition = 'top';
      if (!['fade', 'slide', 'pop', 'shine'].includes(merged.superchatAnimation)) merged.superchatAnimation = 'slide';
      merged.superchatDuration = clamp(finiteNumber(merged.superchatDuration, DEFAULT_SETTINGS.superchatDuration), 2, 15);
      return merged;
    }
  } catch (_) {
    /* ignore */
  }
  return { ...DEFAULT_SETTINGS };
}

function saveSettings(settings) {
  GM_setValue(STORAGE_KEY, settings);
}

function finiteNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

const BLOCKED_KEYWORD_LIMIT = 50;
const BLOCKED_KEYWORD_LENGTH = 40;

function sanitizeBlockedKeywords(value) {
  if (!Array.isArray(value)) return [];

  const seen = new Set();
  const keywords = [];
  for (const item of value) {
    const keyword = String(item || '').trim().slice(0, BLOCKED_KEYWORD_LENGTH);
    const key = keyword.toLowerCase();
    if (!keyword || seen.has(key)) continue;
    seen.add(key);
    keywords.push(keyword);
    if (keywords.length >= BLOCKED_KEYWORD_LIMIT) break;
  }
  return keywords;
}

function isKeywordBlocked(text, keywords) {
  const haystack = String(text || '').toLowerCase();
  if (!haystack || !keywords?.length) return false;
  return keywords.some((keyword) => {
    const needle = String(keyword || '').trim().toLowerCase();
    return needle && haystack.includes(needle);
  });
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function isPageActive() {
  return !document.hidden && document.visibilityState === 'visible';
}

function waitForElement(selector, root = document, timeout = 30000) {
  return new Promise((resolve) => {
    const existing = root.querySelector(selector);
    if (existing) {
      resolve(existing);
      return;
    }

    const observer = new MutationObserver(() => {
      const el = root.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(root, { childList: true, subtree: true });

    if (timeout > 0) {
      setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeout);
    }
  });
}

function getUsernameColor(element) {
  const colorEl = element.querySelector('[style*="color"]') ||
    element.querySelector('.chat-author__display-name') ||
    element.querySelector('[data-a-target="chat-message-username"]');
  if (!colorEl) return '#ffffff';
  const style = getComputedStyle(colorEl);
  return style.color && style.color !== 'rgba(0, 0, 0, 0)' ? style.color : '#ffffff';
}

function getFullscreenElement() {
  return document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement;
}

function getDanmakuMount(item) {
  return item.closest('.tbc-danmaku-layer, .tbc-superchat-layer')?.parentElement || null;
}

function getTwitchProfileUrl(usernameEl, displayName) {
  const link = usernameEl?.closest('a') || (usernameEl?.tagName === 'A' ? usernameEl : null);
  const href = link?.getAttribute('href');
  if (href) {
    try {
      const url = new URL(href, 'https://www.twitch.tv');
      const path = url.pathname.replace(/\/+$/, '');
      if (path.length > 1) return `https://www.twitch.tv${path}`;
    } catch (_) {
      /* ignore */
    }
  }

  const login = displayName?.trim();
  if (!login) return null;
  return `https://www.twitch.tv/${encodeURIComponent(login.toLowerCase())}`;
}

function getEditorPlainText(editor) {
  return (editor.innerText || editor.textContent || '')
    .replace(/\u200B/g, '')
    .replace(/\uFEFF/g, '')
    .trim();
}

function selectAllInEditor(editor) {
  editor.focus();
  const range = document.createRange();
  range.selectNodeContents(editor);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

function dispatchEditorBeforeInput(editor, inputType, data) {
  editor.dispatchEvent(new InputEvent('beforeinput', {
    bubbles: true,
    cancelable: true,
    inputType,
    data: data ?? null,
  }));
}

function tryPasteIntoEditor(editor, text) {
  selectAllInEditor(editor);

  try {
    const dataTransfer = new DataTransfer();
    dataTransfer.setData('text/plain', text);
    editor.dispatchEvent(new ClipboardEvent('paste', {
      bubbles: true,
      cancelable: true,
      clipboardData: dataTransfer,
    }));
    if (getEditorPlainText(editor) === text) return true;
  } catch (_) {
    /* ignore */
  }

  selectAllInEditor(editor);
  dispatchEditorBeforeInput(editor, 'insertReplacementText', text);
  if (getEditorPlainText(editor) === text) return true;

  selectAllInEditor(editor);
  document.execCommand('delete', false, null);
  dispatchEditorBeforeInput(editor, 'insertText', text);
  if (getEditorPlainText(editor) === text) return true;

  selectAllInEditor(editor);
  document.execCommand('insertText', false, text);
  return getEditorPlainText(editor) === text;
}

function findSlateChatEditor() {
  return document.querySelector(SELECTORS.chatInputSlate);
}

function findLegacyChatInput() {
  const direct = document.querySelector(SELECTORS.chatInput);
  if (direct) return direct;

  const host = document.querySelector('[data-a-target="chat-input"]');
  if (!host) return null;
  if (host.tagName === 'TEXTAREA' || host.tagName === 'INPUT') return host;
  return host.querySelector('textarea, input[type="text"]');
}

function dispatchReactInput(element, value) {
  const tracker = element._valueTracker;
  if (tracker) {
    tracker.setValue(element.value);
  }

  const prototype = element instanceof HTMLTextAreaElement
    ? HTMLTextAreaElement.prototype
    : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
  if (setter) {
    setter.call(element, value);
  } else {
    element.value = value;
  }

  element.dispatchEvent(new InputEvent('input', {
    bubbles: true,
    cancelable: true,
    inputType: 'insertText',
    data: value,
  }));
}

function setLegacyChatInputText(textarea, text) {
  textarea.focus();
  textarea.setSelectionRange(0, textarea.value.length);

  if (document.execCommand('insertText', false, text)) {
    textarea.setSelectionRange(text.length, text.length);
  } else {
    dispatchReactInput(textarea, text);
    textarea.setSelectionRange(text.length, text.length);
  }

  textarea.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
}

async function setChatInputText(text) {
  if (!text) return false;

  const slateEditor = findSlateChatEditor();
  if (slateEditor) {
    slateEditor.focus();
    selectAllInEditor(slateEditor);

    try {
      if (typeof GM_setClipboard === 'function') {
        GM_setClipboard(text, 'text');
      } else {
        await navigator.clipboard.writeText(text);
      }
      document.execCommand('paste', false, null);
      if (getEditorPlainText(slateEditor) === text) return true;
    } catch (_) {
      /* clipboard API unavailable */
    }

    if (tryPasteIntoEditor(slateEditor, text)) return true;
    return getEditorPlainText(slateEditor).length > 0;
  }

  const textarea = findLegacyChatInput();
  if (textarea) {
    return setLegacyChatInputText(textarea, text);
  }

  return false;
}

const SPEECH_GAP_MS = 250;

let speechSpeaker = null;

class DanmakuSpeaker {
  constructor(getSettings) {
    this.getSettings = getSettings;
    this.queue = [];
    this.token = 0;
    this.busy = false;
    this.timer = null;
    this.supported = typeof window.speechSynthesis !== 'undefined';
    this.keepAlive = null;
    if (!this.supported) return;
    this.keepAlive = setInterval(() => {
      const synth = window.speechSynthesis;
      if (!synth?.speaking || synth.paused) return;
      synth.pause();
      synth.resume();
    }, 10000);
  }

  destroy() {
    clearInterval(this.keepAlive);
    this.keepAlive = null;
    this.cancel();
  }

  canAutoSpeak() {
    const settings = this.getSettings();
    return !!settings.speechEnabled && Number(settings.speechVolume) > 0;
  }

  rateFor(text, paced) {
    const settings = this.getSettings();
    const base = clamp(Number(settings.speechRate) || 100, 50, 200) / 100;
    const usePace = paced ?? !!settings.speechPace;
    if (!usePace) return base;
    const maxSeconds = clamp(Number(settings.speechMaxSeconds) || 4, 1, 15);
    const estimate = estimateSpeechSeconds(text, base);
    if (estimate <= maxSeconds) return base;
    return clamp(base * (estimate / maxSeconds), base, 10);
  }

  listVoices() {
    if (!this.supported) return [];
    return window.speechSynthesis.getVoices();
  }

  findVoice() {
    const voices = this.listVoices();
    if (!voices.length) return null;
    const settings = this.getSettings();
    if (settings.speechVoice) {
      const picked = voices.find((voice) => voice.voiceURI === settings.speechVoice || voice.name === settings.speechVoice);
      if (picked) return picked;
    }
    const lang = String(settings.speechLang || navigator.language || '').toLowerCase();
    const prefix = lang.slice(0, 2);
    return voices.find((voice) => voice.default && voice.lang.toLowerCase().startsWith(prefix))
      || voices.find((voice) => prefix && voice.lang.toLowerCase().startsWith(prefix))
      || voices.find((voice) => voice.default)
      || voices[0];
  }

  request(text) {
    if (!this.supported || document.hidden || !this.canAutoSpeak()) return;
    const spoken = prepareSpeechText(text);
    if (!spoken) return;
    this.queue.push(spoken);
    if (!this.busy) this.pump();
  }

  speakNow(text) {
    const spoken = prepareSpeechText(text);
    if (!spoken || !this.supported) return;
    if (this.busy && this.queue.length) this.queue.shift();
    this.token += 1;
    const token = this.token;
    clearTimeout(this.timer);
    this.busy = true;
    window.speechSynthesis.cancel();
    this.timer = setTimeout(() => {
      if (token !== this.token) return;
      this.play(spoken, this.rateFor(spoken), token, () => this.pump());
    }, 60);
  }

  preview(text, paced) {
    const spoken = limitSpeechRepeats(normalizeSpeechText(text));
    if (!spoken || !this.supported) return;
    this.token += 1;
    const token = this.token;
    clearTimeout(this.timer);
    this.busy = true;
    window.speechSynthesis.cancel();
    this.timer = setTimeout(() => {
      if (token !== this.token) return;
      this.play(spoken, this.rateFor(spoken, paced), token, () => this.pump());
    }, 60);
  }

  pump() {
    if (!this.supported || !this.canAutoSpeak()) {
      this.queue = [];
      this.busy = false;
      return;
    }
    const buffer = clamp(Number(this.getSettings().speechBuffer) || 5, 1, 25);
    if (this.queue.length > buffer) this.queue = this.queue.slice(-buffer);
    if (!this.queue.length) {
      this.busy = false;
      return;
    }
    const text = this.queue[0];
    const rate = this.rateFor(text);
    this.busy = true;
    this.token += 1;
    const token = this.token;
    this.play(text, rate, token, () => {
      if (this.queue[0] === text) this.queue.shift();
      this.timer = setTimeout(() => this.pump(), SPEECH_GAP_MS);
    });
  }

  play(text, rate, token, onDone) {
    if (token !== this.token || !this.supported) return;
    const settings = this.getSettings();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = clamp(Number(settings.speechVolume), 0, 100) / 100;
    utterance.pitch = clamp(Number(settings.speechPitch), 0, 200) / 100;
    utterance.rate = clamp(rate, 0.1, 10);
    const voice = this.findVoice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }
    let settled = false;
    const finish = (event) => {
      if (settled || token !== this.token) return;
      if (event?.type === 'error' && (event.error === 'interrupted' || event.error === 'canceled')) return;
      settled = true;
      onDone?.();
    };
    utterance.addEventListener('end', finish);
    utterance.addEventListener('error', finish);
    window.speechSynthesis.resume();
    window.speechSynthesis.speak(utterance);
  }

  cancel() {
    this.token += 1;
    this.queue = [];
    this.busy = false;
    clearTimeout(this.timer);
    this.timer = null;
    if (this.supported) window.speechSynthesis.cancel();
  }
}

function normalizeSpeechText(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function speechSourceText(message, parts) {
  if (Array.isArray(parts) && parts.length) {
    return parts.map((part) => {
      if (part?.type === 'text') return part.value || part.text || '';
      if (part?.type === 'emote' && /cheer/i.test(part.name || part.alt || '')) return part.name || part.alt || '';
      return '';
    }).filter(Boolean).join(' ');
  }
  return message || '';
}

function limitSpeechRepeats(text, maxRepeats = 3) {
  let out = String(text || '');
  const maxUnit = Math.floor(out.length / (maxRepeats + 1));
  for (let len = maxUnit; len >= 1; len -= 1) {
    const pattern = new RegExp(`([\\s\\S]{${len}})\\1{${maxRepeats},}`, 'g');
    out = out.replace(pattern, (_match, unit) => unit.repeat(maxRepeats));
  }
  return out.replace(/(\S+)(?:\s+\1){3,}/g, (_match, token) => Array(maxRepeats).fill(token).join(' '));
}

function hasReadableSpeech(text) {
  const stripped = String(text || '')
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/\p{N}/gu, '')
    .replace(/\p{P}/gu, '')
    .replace(/\p{S}/gu, '')
    .replace(/\s+/g, '');
  return stripped.length > 0;
}

function prepareSpeechText(text) {
  const spoken = limitSpeechRepeats(normalizeSpeechText(text));
  return hasReadableSpeech(spoken) ? spoken : '';
}

function estimateSpeechSeconds(text, rate) {
  let units = 0;
  for (const ch of String(text || '')) {
    if (/\s/.test(ch)) continue;
    units += /[\u3040-\u30ff\u3400-\u9fff\uf900-\ufaff\uac00-\ud7af]/.test(ch) ? 1 : 0.45;
  }
  return (units * 0.24) / (rate || 1);
}

function ensureSpeechSpeaker(getSettings) {
  if (!speechSpeaker) speechSpeaker = new DanmakuSpeaker(getSettings);
  return speechSpeaker;
}

function requestSpeech(text) {
  speechSpeaker?.request(text);
}

function speakTextNow(text) {
  speechSpeaker?.speakNow(text);
}

function previewSpeech(text, fast) {
  speechSpeaker?.preview(text, fast);
}

function cancelSpeech() {
  speechSpeaker?.cancel();
}

function listSpeechVoices() {
  return speechSpeaker?.listVoices() || [];
}

function speechSupported() {
  return !!speechSpeaker?.supported;
}

class LaneManager {
  constructor() {
    this.lanes = [];
    this.laneHeight = 28;
  }

  reset(laneCount, laneHeight) {
    this.laneHeight = laneHeight;
    this.lanes = Array.from({ length: Math.max(1, laneCount) }, () => 0);
  }

  acquire(durationMs) {
    const now = Date.now();
    let bestLane = 0;
    let bestTime = Infinity;

    for (let i = 0; i < this.lanes.length; i++) {
      if (this.lanes[i] <= now) {
        this.lanes[i] = now + durationMs * 0.6;
        return i;
      }
      if (this.lanes[i] < bestTime) {
        bestTime = this.lanes[i];
        bestLane = i;
      }
    }

    this.lanes[bestLane] = now + durationMs * 0.6;
    return bestLane;
  }
}

function safeCssColor(value, fallback) {
  const color = String(value || '').trim();
  if (!color || /[;{}]|url\s*\(/i.test(color)) return fallback;
  return color;
}

class DanmakuEngine {
  constructor(getSettings) {
    this.getSettings = getSettings;
    this.laneManager = new LaneManager();
    this.layer = null;
    this.superchatLayer = null;
    this.pinnedItem = null;
    this.superchatQueue = [];
    this.playerEl = null;
    this.overlayEl = null;
    this.controlsObserver = null;
    this.resizeObserver = null;
    this.boundUpdate = () => this.updateLayout();
  }

  async mount() {
    this.playerEl = await waitForElement(SELECTORS.videoPlayer);
    this.overlayEl = this.playerEl.querySelector(SELECTORS.videoOverlay) || this.playerEl;

    this.layer = document.createElement('div');
    this.layer.className = 'tbc-danmaku-layer';
    this.layer.setAttribute('aria-hidden', 'true');
    this.superchatLayer = document.createElement('div');
    this.superchatLayer.className = 'tbc-superchat-layer';
    this.superchatLayer.setAttribute('aria-hidden', 'true');
    this.overlayEl.append(this.layer, this.superchatLayer);

    if (getComputedStyle(this.overlayEl).position === 'static') {
      this.overlayEl.style.position = 'relative';
    }

    this.resizeObserver = new ResizeObserver(this.boundUpdate);
    this.resizeObserver.observe(this.playerEl);

    const controlsEl = this.playerEl.querySelector(SELECTORS.playerControlsRoot);
    if (controlsEl) {
      this.controlsObserver = new ResizeObserver(this.boundUpdate);
      this.controlsObserver.observe(controlsEl);
    }

    window.addEventListener('resize', this.boundUpdate);
    document.addEventListener('fullscreenchange', this.boundUpdate);
    document.addEventListener('webkitfullscreenchange', this.boundUpdate);

    this.updateLayout();
  }

  destroy() {
    window.removeEventListener('resize', this.boundUpdate);
    document.removeEventListener('fullscreenchange', this.boundUpdate);
    document.removeEventListener('webkitfullscreenchange', this.boundUpdate);
    this.resizeObserver?.disconnect();
    this.controlsObserver?.disconnect();
    hideDanmakuTooltip();
    this.layer?.remove();
    this.superchatLayer?.remove();
    this.layer = null;
    this.superchatLayer = null;
    this.pinnedItem = null;
    this.superchatQueue = [];
  }

  getBottomReserve() {
    const controls = this.playerEl?.querySelector(SELECTORS.playerControlsRoot);
    if (controls) {
      const height = controls.getBoundingClientRect().height;
      if (height > 0) return Math.ceil(height) + 8;
    }
    return SCROLL_AREA_BOTTOM_RESERVE;
  }

  getPinnedBandHeight() {
    return this.getSettings().fontSize + 24;
  }

  getPinnedBandRect(playerHeight) {
    if (!this.pinnedItem || !this.getSettings().superchatPinned || !this.getSettings().enabled) return null;
    const band = this.getPinnedBandHeight();
    const pos = this.getSettings().superchatPosition === 'bottom' ? 'bottom' : 'top';
    const top = pos === 'bottom'
      ? Math.max(0, playerHeight - this.getBottomReserve() - band)
      : 8;
    return { pos, top, height: band };
  }

  getScrollAreaRect(playerRect) {
    const settings = this.getSettings();
    const h = playerRect.height;
    const laneHeight = settings.fontSize + 6;
    const bottomReserve = this.getBottomReserve();
    let area;

    switch (settings.scrollArea) {
      case 'top-half':
        area = { top: 0, height: Math.max(laneHeight, h * 0.5) };
        break;
      case 'top-quarter':
        area = { top: 0, height: Math.max(laneHeight, h * 0.25) };
        break;
      default:
        area = { top: 0, height: Math.max(laneHeight, h - bottomReserve) };
        break;
    }

    const band = this.getPinnedBandRect(h);
    if (!band) return area;
    const areaBottom = area.top + area.height;
    const bandBottom = band.top + band.height;
    if (bandBottom <= area.top || band.top >= areaBottom) return area;
    if (band.pos === 'top') {
      const nextTop = Math.max(area.top, bandBottom + 4);
      return { top: nextTop, height: Math.max(laneHeight, areaBottom - nextTop) };
    }
    const nextBottom = Math.min(areaBottom, band.top - 4);
    return { top: area.top, height: Math.max(laneHeight, nextBottom - area.top) };
  }

  migrateDanmakuItems(items, oldRect, newWidth, newHeight) {
    const oldWidth = oldRect.width || 1;
    const oldHeight = oldRect.height || 1;

    for (const item of items) {
      if (!item.isConnected) continue;

      const top = parseFloat(item.style.top) || 0;
      item.style.top = `${(top / oldHeight) * newHeight}px`;

      const oldTravel = parseFloat(item.style.getPropertyValue('--tbc-travel')) || oldWidth;
      const oldDuration = parseFloat(item.style.getPropertyValue('--tbc-duration')) || 8000;
      const matrix = new DOMMatrixReadOnly(getComputedStyle(item).transform);
      const progress = oldTravel > 0 ? clamp(-matrix.m41 / oldTravel, 0, 1) : 0;

      const itemWidth = item.offsetWidth;
      const newTravel = newWidth + itemWidth;
      const newDuration = (newTravel / oldTravel) * oldDuration;
      const remaining = Math.max(0, newDuration * (1 - progress));

      item._tbcClearRemoveTimer?.();

      const wasPaused = item.classList.contains('tbc-paused');
      if (wasPaused) {
        item.classList.remove('tbc-paused');
      }

      item.style.setProperty('--tbc-travel', `${newTravel}px`);
      item.style.setProperty('--tbc-start', `${-progress * newTravel}px`);
      item.style.setProperty('--tbc-duration', `${remaining}ms`);
      item.style.animation = 'none';
      void item.offsetWidth;
      item.style.animation = '';

      if (wasPaused) {
        item.classList.add('tbc-paused');
      }

      item._tbcScheduleRemove?.(remaining);
    }
  }

  updateLayout() {
    if (!this.layer || !this.playerEl) return;

    const settings = this.getSettings();
    if (!settings.superchatPinned || !settings.enabled) {
      this.superchatQueue = [];
      this.pinnedItem?.remove();
      this.pinnedItem = null;
    }
    const fsEl = getFullscreenElement();
    const anchor = fsEl || this.playerEl;
    const rect = anchor.getBoundingClientRect();
    const area = this.getScrollAreaRect(rect);

    const oldParent = this.layer.parentElement;
    const oldRect = this.layer.getBoundingClientRect();
    const items = [...this.layer.querySelectorAll('.tbc-danmaku-item')];
    const shouldMigrate = items.length > 0;

    if (shouldMigrate) {
      hideDanmakuTooltip();
    }

    if (fsEl && fsEl.contains(this.playerEl)) {
      if (this.layer.parentElement !== fsEl) {
        fsEl.appendChild(this.layer);
      }
      Object.assign(this.layer.style, {
        position: 'fixed',
        top: `${rect.top + area.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${area.height}px`,
        zIndex: '9999',
      });
    } else {
      if (this.layer.parentElement !== this.overlayEl) {
        this.overlayEl.appendChild(this.layer);
      }
      Object.assign(this.layer.style, {
        position: 'absolute',
        top: `${area.top}px`,
        left: '0',
        width: '100%',
        height: `${area.height}px`,
        zIndex: '4',
      });
    }

    const newWidth = this.layer.clientWidth;
    const newHeight = this.layer.clientHeight;

    if (shouldMigrate && (
      oldParent !== this.layer.parentElement
      || Math.abs(oldRect.width - newWidth) > 1
      || Math.abs(oldRect.height - newHeight) > 1
    )) {
      this.migrateDanmakuItems(items, oldRect, newWidth, newHeight);
    }

    const laneHeight = settings.fontSize + 6;
    const laneCount = Math.floor(newHeight / laneHeight);
    this.laneManager.reset(laneCount, laneHeight);
    this.layer.style.display = settings.enabled ? 'block' : 'none';
    this.layer.style.setProperty(
      '--tbc-opacity',
      String(clamp(Number(settings.danmakuOpacity) || 100, 10, 100) / 100),
    );
    this.layoutSuperchat(rect, !!(fsEl && fsEl.contains(this.playerEl)));
  }

  layoutSuperchat(playerRect, fullscreen) {
    if (!this.superchatLayer) return;
    const parent = fullscreen ? (getFullscreenElement() || this.overlayEl) : this.overlayEl;
    if (parent && this.superchatLayer.parentElement !== parent) parent.appendChild(this.superchatLayer);
    const band = this.getPinnedBandRect(playerRect.height);
    if (!band) {
      this.superchatLayer.style.display = 'none';
      return;
    }
    this.superchatLayer.classList.toggle('tbc-sc-bottom', band.pos === 'bottom');
    Object.assign(this.superchatLayer.style, fullscreen ? {
      display: 'flex',
      position: 'fixed',
      top: `${playerRect.top + band.top}px`,
      left: `${playerRect.left}px`,
      width: `${playerRect.width}px`,
      height: `${band.height}px`,
      zIndex: '10000',
    } : {
      display: 'flex',
      position: 'absolute',
      top: `${band.top}px`,
      left: '0',
      width: '100%',
      height: `${band.height}px`,
      zIndex: '5',
    });
  }

  render(payload) {
    const settings = this.getSettings();
    if (payload.superchat && settings.superchatPinned) {
      this.queueSuperchat(payload);
      return;
    }
    this.renderScrolling(payload);
  }

  queueSuperchat(payload) {
    if (!this.superchatLayer || !this.getSettings().enabled) return;
    if (this.pinnedItem) {
      this.superchatQueue.push(payload);
      if (this.superchatQueue.length > 6) this.superchatQueue.shift();
      return;
    }
    this.mountSuperchat(payload);
  }

  mountSuperchat({ username, message, parts, usernameColor, profileUrl, originalMessage, translated, superchatStyle }) {
    const settings = this.getSettings();
    const hasEmote = Array.isArray(parts) && parts.some((part) => part.type === 'emote' && part.src);
    if (!this.superchatLayer || (!message && !hasEmote)) return;

    const animation = ['fade', 'slide', 'pop', 'shine'].includes(settings.superchatAnimation)
      ? settings.superchatAnimation
      : 'slide';
    const duration = clamp(Number(settings.superchatDuration) || 6, 2, 15);
    const item = document.createElement('div');
    item.className = `tbc-superchat-item tbc-sc-${animation}`;
    item.style.setProperty('--tbc-sc-duration', `${duration}s`);
    item.style.background = safeCssColor(superchatStyle?.background, '#9147ff');
    item.style.color = safeCssColor(superchatStyle?.color, '#ffffff');
    item.style.fontSize = `${settings.fontSize}px`;
    item.style.fontFamily = settings.fontFamily;
    this.appendParts(item, parts?.length ? parts : [{ type: 'text', value: message }]);
    this.superchatLayer.appendChild(item);
    this.pinnedItem = item;
    this.updateLayout();
    requestSpeech(speechSourceText(message, parts));

    let fallback = null;
    const armFallback = (ms) => {
      clearTimeout(fallback);
      fallback = setTimeout(() => this.finishSuperchat(item), ms);
    };
    armFallback((duration + 2) * 1000);
    item.addEventListener('animationend', (event) => {
      if (event.target !== item || event.animationName === 'tbc-sc-shine-sweep') return;
      clearTimeout(fallback);
      this.finishSuperchat(item);
    });

    attachDanmakuInteraction(item, {
      username,
      usernameColor,
      profileUrl,
      originalMessage,
      translated,
      onPause: () => clearTimeout(fallback),
      onResume: () => armFallback(20000),
    });
  }

  finishSuperchat(item) {
    if (!item || (!item.isConnected && this.pinnedItem !== item)) return;
    if (this.pinnedItem === item) this.pinnedItem = null;
    item.remove();
    const next = this.superchatQueue.shift();
    if (next && this.getSettings().superchatPinned && this.getSettings().enabled) {
      this.mountSuperchat(next);
      return;
    }
    this.updateLayout();
  }

  appendParts(item, parts) {
    for (const part of parts) {
      if (part.type === 'emote' && part.src) {
        const img = document.createElement('img');
        img.className = 'tbc-emote';
        img.src = part.src;
        img.alt = part.name || '';
        img.title = part.name || '';
        img.draggable = false;
        item.appendChild(img);
        continue;
      }

      const text = part.type === 'emote' ? (part.name || '') : (part.value || '');
      if (text) item.appendChild(document.createTextNode(text));
    }
  }

  renderScrolling({ username, message, parts, usernameColor, profileUrl, originalMessage, translated }) {
    const settings = this.getSettings();
    const displayParts = parts?.length
      ? parts
      : (message ? [{ type: 'text', value: message }] : []);
    if (!settings.enabled || !this.layer || !displayParts.length) return;

    const layerWidth = this.layer.clientWidth || 800;
    const speed = clamp(settings.speed, 1, 10);
    const baseDuration = 30000;
    const laneHeight = settings.fontSize + 6;

    const item = document.createElement('div');
    item.className = 'tbc-danmaku-item';
    this.appendParts(item, displayParts);
    item.style.cssText = `
      top: 0;
      color: ${usernameColor || '#efeff1'};
      font-size: ${settings.fontSize}px;
      font-family: ${settings.fontFamily};
      visibility: hidden;
      animation: none;
    `;

    this.layer.appendChild(item);
    const itemWidth = item.offsetWidth;
    const travel = layerWidth + itemWidth;
    const durationMs = Math.round((travel / layerWidth) * (baseDuration / speed));
    const lane = this.laneManager.acquire(durationMs);
    const top = lane * laneHeight;

    item.style.top = `${top}px`;
    item.style.visibility = '';
    item.style.setProperty('--tbc-travel', `${travel}px`);
    item.style.setProperty('--tbc-start', '0px');
    item.style.setProperty('--tbc-duration', `${durationMs}ms`);
    void item.offsetWidth;
    item.style.animation = '';

    const startAt = Date.now();
    let pausedAt = 0;
    let totalPaused = 0;
    let removeTimer = null;

    const scheduleRemove = (remainingMs = durationMs) => {
      const elapsed = Date.now() - startAt - totalPaused;
      const remaining = remainingMs ?? Math.max(0, durationMs - elapsed);
      clearTimeout(removeTimer);
      removeTimer = setTimeout(() => item.remove(), remaining + 500);
    };

    item._tbcClearRemoveTimer = () => clearTimeout(removeTimer);
    item._tbcScheduleRemove = scheduleRemove;

    const onPause = () => {
      pausedAt = Date.now();
      clearTimeout(removeTimer);
    };

    const onResume = () => {
      if (pausedAt) {
        totalPaused += Date.now() - pausedAt;
        pausedAt = 0;
      }
      scheduleRemove();
    };

    attachDanmakuInteraction(item, {
      username,
      usernameColor,
      profileUrl,
      originalMessage,
      translated,
      onPause,
      onResume,
    });
    requestSpeech(speechSourceText(message, parts));
    scheduleRemove();

    item.addEventListener('animationend', () => {
      clearTimeout(removeTimer);
      item.remove();
    }, { once: true });
  }
}

const MAX_DANMAKU_PAUSE_MS = 15000;
const RESUME_DELAY_MS = 300;

let activeTooltip = null;
let activeTooltipItem = null;
let hoverPausedItem = null;
let clickLockBackdrop = null;
let tooltipRepositionHandler = null;
let tooltipDismissBound = false;

function removeClickLockBackdrop() {
  clickLockBackdrop?.remove();
  clickLockBackdrop = null;
}

function showClickLockBackdrop(mount) {
  removeClickLockBackdrop();
  if (!mount) return;

  if (getComputedStyle(mount).position === 'static') {
    mount.style.position = 'relative';
  }

  clickLockBackdrop = document.createElement('div');
  clickLockBackdrop.className = 'tbc-click-lock-backdrop';
  clickLockBackdrop.addEventListener('pointerdown', (e) => {
    const otherDanmaku = document.elementsFromPoint(e.clientX, e.clientY)
      .find((el) => (el.classList?.contains('tbc-danmaku-item') || el.classList?.contains('tbc-superchat-item')) && el !== activeTooltipItem);

    hideDanmakuTooltip();

    if (otherDanmaku) {
      requestAnimationFrame(() => {
        otherDanmaku.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      });
    }
  }, true);

  mount.appendChild(clickLockBackdrop);
}

function hideDanmakuTooltip() {
  if (tooltipRepositionHandler) {
    window.removeEventListener('resize', tooltipRepositionHandler);
    document.removeEventListener('fullscreenchange', tooltipRepositionHandler);
    document.removeEventListener('webkitfullscreenchange', tooltipRepositionHandler);
    tooltipRepositionHandler = null;
  }

  removeClickLockBackdrop();

  const resumeFn = activeTooltipItem?._tbcResume;
  activeTooltipItem?.classList.remove('tbc-click-locked');
  activeTooltip?.remove();
  activeTooltip = null;
  activeTooltipItem = null;
  resumeFn?.();
}

function ensureTooltipDismissListener() {
  if (tooltipDismissBound) return;
  tooltipDismissBound = true;
  document.addEventListener('pointerdown', (e) => {
    if (!activeTooltip) return;
    if (activeTooltip.contains(e.target)) return;
    if (e.target.closest('.tbc-danmaku-item, .tbc-superchat-item') === activeTooltipItem) return;
    if (clickLockBackdrop?.contains(e.target)) return;
    hideDanmakuTooltip();
  }, true);
}

function positionDanmakuTooltip(item, tooltip, mount) {
  if (!mount) return;

  const margin = 8;
  const gap = 6;
  const bounds = mount.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();
  const tipRect = tooltip.getBoundingClientRect();
  const tipHeight = tipRect.height;
  const tipWidth = tipRect.width;

  const spaceAbove = itemRect.top - bounds.top - margin;
  const spaceBelow = bounds.bottom - itemRect.bottom - margin;
  const needed = tipHeight + gap;

  let placement = 'above';
  if (spaceAbove < needed && spaceBelow >= needed) {
    placement = 'below';
  } else if (spaceAbove < needed && spaceBelow < needed) {
    placement = spaceBelow > spaceAbove ? 'below' : 'above';
  }

  tooltip.classList.toggle('tbc-danmaku-tooltip--above', placement === 'above');
  tooltip.classList.toggle('tbc-danmaku-tooltip--below', placement === 'below');

  let left = itemRect.left - bounds.left + itemRect.width / 2 - tipWidth / 2;
  left = clamp(left, margin, Math.max(margin, bounds.width - tipRect.width - margin));

  let top;
  if (placement === 'below') {
    top = itemRect.bottom - bounds.top + gap;
  } else {
    top = itemRect.top - bounds.top - tipHeight - gap;
  }

  Object.assign(tooltip.style, {
    position: 'absolute',
    left: `${left}px`,
    top: `${top}px`,
    zIndex: '100001',
  });
}

function bindTooltipReposition(item, tooltip, mount) {
  tooltipRepositionHandler = () => positionDanmakuTooltip(item, tooltip, mount);
  window.addEventListener('resize', tooltipRepositionHandler);
  document.addEventListener('fullscreenchange', tooltipRepositionHandler);
  document.addEventListener('webkitfullscreenchange', tooltipRepositionHandler);
}

function attachDanmakuInteraction(item, {
  username, usernameColor, profileUrl, originalMessage, translated, onPause, onResume,
}) {
  let hoverResumeTimer = null;
  let maxPauseTimer = null;
  let pauseReason = null;

  const clearHoverResumeTimer = () => {
    clearTimeout(hoverResumeTimer);
    hoverResumeTimer = null;
  };

  const clearMaxPauseTimer = () => {
    clearTimeout(maxPauseTimer);
    maxPauseTimer = null;
  };

  const armMaxPauseTimer = () => {
    clearMaxPauseTimer();
    maxPauseTimer = setTimeout(() => {
      if (item.classList.contains('tbc-paused')) doResume();
    }, MAX_DANMAKU_PAUSE_MS);
  };

  const doResume = () => {
    clearHoverResumeTimer();
    clearMaxPauseTimer();
    if (!item.classList.contains('tbc-paused')) {
      pauseReason = null;
      item.classList.remove('tbc-click-locked');
      return;
    }

    pauseReason = null;
    item.classList.remove('tbc-paused', 'tbc-click-locked');
    if (hoverPausedItem === item) hoverPausedItem = null;
    if (activeTooltipItem === item) {
      removeClickLockBackdrop();
      activeTooltip?.remove();
      activeTooltip = null;
      activeTooltipItem = null;
    }
    onResume?.();
  };

  item._tbcResume = () => doResume();

  item._tbcResumeHover = () => {
    if (pauseReason !== 'hover') return;
    doResume();
  };

  const scheduleHoverResume = () => {
    if (pauseReason === 'click') return;
    clearHoverResumeTimer();
    hoverResumeTimer = setTimeout(() => {
      if (pauseReason === 'hover') doResume();
    }, RESUME_DELAY_MS);
  };

  const pauseForHover = () => {
    if (activeTooltipItem) return;
    if (pauseReason === 'click') return;

    clearHoverResumeTimer();

    if (hoverPausedItem && hoverPausedItem !== item) {
      hoverPausedItem._tbcResumeHover?.();
    }
    hoverPausedItem = item;

    if (!item.classList.contains('tbc-paused')) {
      pauseReason = 'hover';
      item.classList.add('tbc-paused');
      onPause?.();
    } else if (pauseReason !== 'hover') {
      pauseReason = 'hover';
    }

    armMaxPauseTimer();
  };

  const pauseForClick = () => {
    clearHoverResumeTimer();

    if (hoverPausedItem && hoverPausedItem !== item) {
      hoverPausedItem._tbcResumeHover?.();
    }
    hoverPausedItem = null;

    pauseReason = 'click';
    item.classList.add('tbc-click-locked');
    if (!item.classList.contains('tbc-paused')) {
      item.classList.add('tbc-paused');
      onPause?.();
    }

    armMaxPauseTimer();
  };

  const showTooltip = () => {
    const messageText = originalMessage || item.textContent;
    const showOriginal = translated && originalMessage && originalMessage !== item.textContent;
    if (!username && !showOriginal && !messageText) return;

    ensureTooltipDismissListener();
    hideDanmakuTooltip();
    pauseForClick();

    item.dataset.tbcId = item.dataset.tbcId || String(Date.now() + Math.random());

    const mount = getDanmakuMount(item);
    if (!mount) {
      doResume();
      return;
    }

    showClickLockBackdrop(mount);

    const tooltip = document.createElement('div');
    tooltip.className = 'tbc-danmaku-tooltip tbc-danmaku-tooltip--above';
    tooltip.dataset.itemId = item.dataset.tbcId;

    const bubble = document.createElement('div');
    bubble.className = 'tbc-danmaku-tooltip-bubble';

    const header = document.createElement('div');
    header.className = 'tbc-danmaku-tooltip-header';

    if (username) {
      const nameRow = document.createElement('a');
      nameRow.className = 'tbc-danmaku-tooltip-name';
      nameRow.href = profileUrl || `https://www.twitch.tv/${encodeURIComponent(username.toLowerCase())}`;
      nameRow.target = '_blank';
      nameRow.rel = 'noopener noreferrer';
      nameRow.setAttribute('aria-label', t('tooltipOpenProfile'));
      nameRow.style.color = usernameColor || '#a970ff';
      nameRow.textContent = username;
      nameRow.addEventListener('click', (e) => e.stopPropagation());
      header.appendChild(nameRow);
    } else {
      header.classList.add('tbc-danmaku-tooltip-header--solo');
    }

    if (messageText) {
      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'tbc-danmaku-tooltip-copy';
      copyBtn.setAttribute('aria-label', t('tooltipCopy'));
      copyBtn.innerHTML = ICON_COPY;
      copyBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await setChatInputText(messageText);
        hideDanmakuTooltip();
      });
      header.appendChild(copyBtn);
    }

    bubble.appendChild(header);

    if (showOriginal) {
      const originalRow = document.createElement('div');
      originalRow.className = 'tbc-danmaku-tooltip-original';
      originalRow.textContent = truncateText(originalMessage);
      bubble.appendChild(originalRow);
    }

    const tail = document.createElement('div');
    tail.className = 'tbc-danmaku-tooltip-tail';

    tooltip.append(bubble, tail);
    tooltip.addEventListener('click', (e) => e.stopPropagation());

    mount.appendChild(tooltip);
    positionDanmakuTooltip(item, tooltip, mount);
    bindTooltipReposition(item, tooltip, mount);
    activeTooltip = tooltip;
    activeTooltipItem = item;

    requestAnimationFrame(() => {
      if (activeTooltip === tooltip) positionDanmakuTooltip(item, tooltip, mount);
    });
  };

  item.addEventListener('mouseenter', () => {
    pauseForHover();
  });

  item.addEventListener('mouseleave', () => {
    if (pauseReason === 'click') return;
    scheduleHoverResume();
  });

  item.addEventListener('click', (e) => {
    e.stopPropagation();
    showTooltip();
  });

  item.addEventListener('animationend', () => {
    clearHoverResumeTimer();
    clearMaxPauseTimer();
    if (activeTooltipItem === item) hideDanmakuTooltip();
  }, { once: true });
}

class DanmakuEmitter {
  constructor(engine, getSettings, isActive) {
    this.engine = engine;
    this.getSettings = getSettings;
    this.isActive = isActive;
    this.queue = [];
    this.timer = null;
  }

  enqueue(payload) {
    if (!this.isActive()) return;

    if (this.queue.length >= MAX_DANMAKU_QUEUE) {
      this.queue.shift();
    }
    this.queue.push(payload);
    this.schedule();
  }

  clear() {
    this.queue = [];
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  schedule() {
    if (this.timer || !this.isActive()) return;

    const speed = clamp(this.getSettings().speed, 1, 10);
    const intervalMs = Math.max(120, Math.round(550 / speed));

    this.timer = setTimeout(() => {
      this.timer = null;
      const item = this.queue.shift();
      if (item) this.engine.render(item);
      if (this.queue.length && this.isActive()) this.schedule();
    }, intervalMs);
  }
}

function dictEntry(zhCN, zhTW, en) {
  return { 'zh-CN': zhCN, 'zh-TW': zhTW, en };
}

// Case-sensitive keys — emotes and slang must match exact casing.
const TWITCH_DICTIONARY = {
  PogChamp: dictEntry('（神操作）', '（神操作）', 'PogChamp'),
  PepeHands: dictEntry('（哭哭）', '（哭哭）', 'PepeHands'),
  OMEGALUL: dictEntry('（笑死）', '（笑死）', 'OMEGALUL'),
  PepeLaugh: dictEntry('（大笑）', '（大笑）', 'PepeLaugh'),
  PauseChamp: dictEntry('（等等）', '（等等）', 'PauseChamp'),
  monkaS: dictEntry('（紧张）', '（緊張）', 'monkaS'),
  monkaW: dictEntry('（紧张）', '（緊張）', 'monkaW'),
  KEKW: dictEntry('（爆笑）', '（爆笑）', 'KEKW'),
  LULW: dictEntry('（笑）', '（笑）', 'LULW'),
  LUL: dictEntry('（笑）', '（笑）', 'LUL'),
  Sadge: dictEntry('（难受）', '（難受）', 'Sadge'),
  Pepega: dictEntry('（有点蠢）', '（有點蠢）', 'Pepega'),
  Kappa: dictEntry('（反讽）', '（反諷）', 'Kappa'),
  Copium: dictEntry('自我安慰', '自我安慰', 'Copium'),
  Hopium: dictEntry('抱有幻想', '抱有幻想', 'Hopium'),
  Based: dictEntry('真敢说', '真敢說', 'Based'),
  Cringe: dictEntry('尴尬', '尷尬', 'Cringe'),
  PogU: dictEntry('（太神了）', '（太神了）', 'PogU'),
  Pog: dictEntry('（太神了）', '（太神了）', 'Pog'),
  EZ: dictEntry('轻松', '輕鬆', 'EZ'),
  Clap: dictEntry('（鼓掌）', '（鼓掌）', 'Clap'),
  NPC: dictEntry('工具人', '工具人', 'NPC'),
  ICANT: dictEntry('我做不到', '我做不到', 'ICANT'),
  W: dictEntry('神', '神', 'W'),
  L: dictEntry('拉胯', '拉胯', 'L'),
  F: dictEntry('F', 'F', 'F'),
  o7: dictEntry('o7', 'o7', 'o7'),
  lol: dictEntry('哈哈', '哈哈', 'lol'),
  LMFAO: dictEntry('笑死我了', '笑死我了', 'LMFAO'),
  lmao: dictEntry('笑死我了', '笑死我了', 'lmao'),
  lmfao: dictEntry('笑死我了', '笑死我了', 'lmfao'),
  rofl: dictEntry('笑翻', '笑翻', 'rofl'),
  kek: dictEntry('笑', '笑', 'kek'),
  gg: dictEntry('GG', 'GG', 'gg'),
  ggs: dictEntry('GG', 'GG', 'ggs'),
  wp: dictEntry('打得不错', '打得不错', 'wp'),
  gl: dictEntry('祝好运', '祝好運', 'gl'),
  hf: dictEntry('玩得开心', '玩得開心', 'hf'),
  nt: dictEntry('好尝试', '好嘗試', 'nt'),
  ns: dictEntry('好枪', '好槍', 'ns'),
  brb: dictEntry('马上回来', '馬上回來', 'brb'),
  afk: dictEntry('离开了', '離開了', 'afk'),
  bbl: dictEntry('待会儿回来', '待會兒回來', 'bbl'),
  gtg: dictEntry('得走了', '得走了', 'gtg'),
  ty: dictEntry('谢谢', '謝謝', 'ty'),
  thx: dictEntry('谢谢', '謝謝', 'thx'),
  np: dictEntry('不客气', '不客氣', 'np'),
  nw: dictEntry('不客气', '不客氣', 'nw'),
  imo: dictEntry('我觉得', '我覺得', 'imo'),
  imho: dictEntry('依我看', '依我看', 'imho'),
  tbh: dictEntry('老实说', '老實說', 'tbh'),
  ngl: dictEntry('说实话', '說實話', 'ngl'),
  rn: dictEntry('现在', '現在', 'rn'),
  idk: dictEntry('不知道', '不知道', 'idk'),
  ikr: dictEntry('确实', '確實', 'ikr'),
  smh: dictEntry('无语', '無語', 'smh'),
  omg: dictEntry('天呐', '天呐', 'omg'),
  omfg: dictEntry('我的天', '我的天', 'omfg'),
  wtf: dictEntry('什么鬼', '什麼鬼', 'wtf'),
  rip: dictEntry('RIP', 'RIP', 'rip'),
  ez: dictEntry('轻松', '輕鬆', 'ez'),
  diff: dictEntry('差距', '差距', 'diff'),
};

const PLACEHOLDER_PREFIX = '⟦T';
const PLACEHOLDER_SUFFIX = '⟧';

let dictionaryPattern = null;

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getDictionaryPattern() {
  if (dictionaryPattern) return dictionaryPattern;

  const keys = Object.keys(TWITCH_DICTIONARY).sort((a, b) => b.length - a.length);
  const body = keys.map(escapeRegExp).join('|');
  dictionaryPattern = new RegExp(`(?<![\\w])(${body})(?![\\w])`, 'g');
  return dictionaryPattern;
}

function lookupDictionary(term, targetLang) {
  const entry = TWITCH_DICTIONARY[term];
  if (!entry) return null;
  return entry[targetLang] || entry.en || term;
}

function collectDictionaryMatches(text) {
  const pattern = getDictionaryPattern();
  const matches = [];
  let match;

  pattern.lastIndex = 0;
  while ((match = pattern.exec(text)) !== null) {
    matches.push({
      start: match.index,
      end: match.index + match[0].length,
      term: match[1],
    });
  }

  if (matches.length === 0) return [];

  matches.sort((a, b) => a.start - b.start || b.end - a.end);

  const selected = [];
  let cursor = 0;
  for (const item of matches) {
    if (item.start < cursor) continue;
    selected.push(item);
    cursor = item.end;
  }
  return selected;
}

function prepareDictionaryText(text, targetLang) {
  const matches = collectDictionaryMatches(text);
  if (matches.length === 0) {
    return { preparedText: text, placeholders: [], fullyMapped: false };
  }

  const placeholders = [];
  let preparedText = '';
  let cursor = 0;

  for (let i = 0; i < matches.length; i += 1) {
    const { start, end, term } = matches[i];
    preparedText += text.slice(cursor, start);

    const token = `${PLACEHOLDER_PREFIX}${i}${PLACEHOLDER_SUFFIX}`;
    const replacement = lookupDictionary(term, targetLang) || term;
    placeholders.push({ token, replacement });
    preparedText += token;
    cursor = end;
  }

  preparedText += text.slice(cursor);

  const withoutPlaceholders = preparedText.replace(
    new RegExp(`${escapeRegExp(PLACEHOLDER_PREFIX)}\\d+${escapeRegExp(PLACEHOLDER_SUFFIX)}`, 'g'),
    '',
  );

  const fullyMapped = matches.length > 0 && !withoutPlaceholders.trim();

  return { preparedText, placeholders, fullyMapped };
}

function restoreDictionaryText(text, placeholders) {
  if (!text || placeholders.length === 0) return text;

  let restored = text;
  for (const { token, replacement } of placeholders) {
    restored = restored.split(token).join(replacement);
  }
  return restored;
}

const MS_LANG_MAP = {
  'zh-CN': 'zh-Hans',
  'zh-TW': 'zh-Hant',
  en: 'en',
  ja: 'ja',
  ko: 'ko',
  es: 'es',
  fr: 'fr',
  de: 'de',
  ru: 'ru',
  pt: 'pt',
};

const TENCENT_LANG_MAP = {
  'zh-CN': 'zh',
  'zh-TW': 'zh-TW',
  en: 'en',
  ja: 'ja',
  ko: 'ko',
  es: 'es',
  fr: 'fr',
  de: 'de',
  ru: 'ru',
  pt: 'pt',
};

const TRANSLATE_TIMEOUT_MS = 8000;
const TRANSLATE_MAX_BATCH = 10;
const TRANSLATE_MAX_BATCH_CHARS = 1600;
const PROVIDER_GAP_MS = 1000;
const PRIMARY_PROVIDERS = ['microsoft', 'google'];
const ALL_PROVIDERS = ['microsoft', 'google', 'volcengine', 'caiyun', 'tencent'];
const MAX_PROVIDER_ATTEMPTS = 2;
const HARD_COOLDOWNS_MS = [5000, 15000, 40000, 60000];
const SOFT_COOLDOWNS_MS = [2000, 5000, 15000, 30000];
const TRANSLATION_CACHE_LIMIT = 200;
const TRANSLATION_CACHE_TTL_MS = 10 * 60 * 1000;

const VOLC_LANG_MAP = {
  'zh-CN': 'zh',
  'zh-TW': 'zh-Hant',
  en: 'en',
  ja: 'ja',
  ko: 'ko',
  es: 'es',
  fr: 'fr',
  de: 'de',
  ru: 'ru',
  pt: 'pt',
};

const CAIYUN_LANG_MAP = {
  'zh-CN': 'auto2zh',
  'zh-TW': 'auto2zh-Hant',
  en: 'auto2en',
  ja: 'auto2ja',
  ko: 'auto2ko',
  es: 'auto2es',
  fr: 'auto2fr',
  de: 'auto2de',
  ru: 'auto2ru',
  pt: 'auto2pt',
};

const CAIYUN_TOKEN = '3975l6lr5pcbvidl6jl2';

const translationCache = new Map();
const providerState = {};
const unsupportedTargets = new Set();
const disabledProviders = new Set();

let msAuthCache = { token: '', expiresAt: 0, inflight: null };
let tencentClientKey = '';
let primaryCursor = 0;

for (const id of ALL_PROVIDERS) {
  providerState[id] = { nextAt: 0, cooldownUntil: 0, failures: 0 };
}

function translationCacheKey(text, targetLang) {
  return `${targetLang}\n${text}`;
}

function getCachedTranslation(text, targetLang) {
  const key = translationCacheKey(text, targetLang);
  const hit = translationCache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > TRANSLATION_CACHE_TTL_MS) {
    translationCache.delete(key);
    return null;
  }
  translationCache.delete(key);
  translationCache.set(key, hit);
  return hit.value;
}

function setCachedTranslation(text, targetLang, value) {
  if (!value) return;
  const key = translationCacheKey(text, targetLang);
  if (translationCache.has(key)) translationCache.delete(key);
  translationCache.set(key, { value, at: Date.now() });
  while (translationCache.size > TRANSLATION_CACHE_LIMIT) {
    const oldest = translationCache.keys().next().value;
    translationCache.delete(oldest);
  }
}

function gmRequest(options) {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      timeout: TRANSLATE_TIMEOUT_MS,
      ...options,
      onload: (res) => resolve(res),
      onerror: () => reject(new Error('network error')),
      ontimeout: () => reject(new Error('timeout')),
    });
  });
}

function isRateLimited(res) {
  const status = Number(res?.status) || 0;
  if (status === 429 || status === 403 || status === 503) return true;
  const body = String(res?.responseText || '');
  return /<\s*html/i.test(body) && /sorry|too many|rate limit|quota/i.test(body);
}

function parseJwtExp(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.exp * 1000;
  } catch {
    return Date.now() + 9 * 60 * 1000;
  }
}

function toMicrosoftLang(code) {
  return MS_LANG_MAP[code] || code;
}

function getTencentClientKey() {
  if (!tencentClientKey) {
    const uuid = crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    tencentClientKey = `browser-chrome-122.0.0-Windows_10-${uuid}`;
  }
  return tencentClientKey;
}

function detectScript(text) {
  if (/\p{Script=Hangul}/u.test(text)) return 'ko';
  if (/[\u3040-\u30ff]/.test(text)) return 'ja';
  if (/\p{Script=Cyrillic}/u.test(text)) return 'ru';
  if (/\p{Script=Han}/u.test(text)) return 'zh';
  if (/\p{Script=Arabic}/u.test(text)) return 'ar';
  return 'latin';
}

async function getMicrosoftAuthToken() {
  const now = Date.now();
  if (msAuthCache.token && msAuthCache.expiresAt > now + 30000) {
    return msAuthCache.token;
  }

  if (msAuthCache.inflight) return msAuthCache.inflight;

  msAuthCache.inflight = (async () => {
    try {
      const res = await gmRequest({
        method: 'GET',
        url: 'https://edge.microsoft.com/translate/auth',
      });
      if (isRateLimited(res)) {
        const error = new Error('auth rate limited');
        error.rateLimited = true;
        throw error;
      }
      const token = res.responseText?.trim();
      if (!res.status || res.status >= 400 || !token) throw new Error('empty auth token');
      msAuthCache.token = token;
      msAuthCache.expiresAt = parseJwtExp(token);
      return token;
    } finally {
      msAuthCache.inflight = null;
    }
  })();

  return msAuthCache.inflight;
}

async function microsoftRequest(texts, targetLang) {
  const token = await getMicrosoftAuthToken();
  const url = `https://api-edge.cognitive.microsofttranslator.com/translate?api-version=3.0&to=${encodeURIComponent(targetLang)}`;
  const res = await gmRequest({
    method: 'POST',
    url,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: JSON.stringify(texts.map((text) => ({ Text: text }))),
  });

  if (res?.status === 401) return { ok: false, unauthorized: true, rateLimited: false };
  if (isRateLimited(res)) return { ok: false, rateLimited: true };
  if (!res || res.status !== 200) return { ok: false, rateLimited: false };

  const json = JSON.parse(res.responseText);
  if (!Array.isArray(json) || json.length !== texts.length) {
    return { ok: false, rateLimited: false };
  }

  return {
    ok: true,
    texts: json.map((item) => item?.translations?.[0]?.text || ''),
  };
}

async function microsoftTranslate(texts, targetLang) {
  const to = toMicrosoftLang(targetLang);
  let result = await microsoftRequest(texts, to);
  if (result.unauthorized) {
    msAuthCache.token = '';
    msAuthCache.expiresAt = 0;
    result = await microsoftRequest(texts, to);
  }
  if (result.unauthorized) return { ok: false, rateLimited: false };
  return result;
}

function parseGoogleBatch(json, count) {
  if (!Array.isArray(json) || json.length !== count) return null;
  const texts = [];
  for (const item of json) {
    if (typeof item === 'string') {
      texts.push(item);
      continue;
    }
    if (Array.isArray(item) && typeof item[0] === 'string') {
      texts.push(item[0]);
      continue;
    }
    return null;
  }
  return texts;
}

async function googleTranslate(texts, targetLang) {
  const query = texts.map((text) => `q=${encodeURIComponent(text)}`).join('&');
  const url = `https://translate.googleapis.com/translate_a/t?client=dict-chrome-ex&sl=auto&tl=${encodeURIComponent(targetLang)}&${query}`;
  const res = await gmRequest({ method: 'GET', url });

  if (isRateLimited(res)) return { ok: false, rateLimited: true };
  if (!res || res.status !== 200) return { ok: false, rateLimited: false };

  const json = JSON.parse(res.responseText);
  const parsed = parseGoogleBatch(json, texts.length);
  if (!parsed) return { ok: false, rateLimited: false };
  return { ok: true, texts: parsed };
}

async function tencentRequest(texts, targetLang) {
  const res = await gmRequest({
    method: 'POST',
    url: 'https://transmart.qq.com/api/imt',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://transmart.qq.com',
      Referer: 'https://transmart.qq.com/',
    },
    data: JSON.stringify({
      header: {
        fn: 'auto_translation',
        client_key: getTencentClientKey(),
      },
      type: 'plain',
      model_category: 'normal',
      source: {
        lang: 'auto',
        text_list: texts,
      },
      target: { lang: targetLang },
    }),
  });

  if (isRateLimited(res)) return { ok: false, rateLimited: true };
  if (!res || res.status !== 200) return { ok: false, rateLimited: false };

  const json = JSON.parse(res.responseText);
  const code = json?.header?.ret_code;
  if (code === 'succ' && Array.isArray(json.auto_translation) && json.auto_translation.length === texts.length) {
    return {
      ok: true,
      texts: json.auto_translation.map((item) => (item == null ? '' : String(item))),
    };
  }

  const message = String(json?.message || '');
  if (/unrecognized target language/i.test(message)) {
    return { ok: false, rateLimited: false, unsupported: true };
  }
  const rateLimited = code === 'Auth-Failed' || /frequent|limit|quota/i.test(message);
  return { ok: false, rateLimited };
}

async function tencentTranslate(texts, targetLang) {
  const to = TENCENT_LANG_MAP[targetLang];
  if (!to) return { ok: false, rateLimited: false, unsupported: true };
  if (unsupportedTargets.has(`tencent:${targetLang}`)) {
    return { ok: false, rateLimited: false, unsupported: true };
  }

  const buckets = new Map();
  texts.forEach((text, index) => {
    const script = detectScript(text);
    if (!buckets.has(script)) buckets.set(script, []);
    buckets.get(script).push({ text, index });
  });

  const output = texts.map(() => '');
  let translated = 0;

  for (const items of buckets.values()) {
    const result = await tencentRequest(items.map((item) => item.text), to);
    if (result.unsupported) unsupportedTargets.add(`tencent:${targetLang}`);
    if (!result.ok) {
      if (!translated) return result;
      break;
    }
    result.texts.forEach((value, index) => {
      output[items[index].index] = value;
      if (value && value.trim()) translated += 1;
    });
  }

  if (!translated) return { ok: false, rateLimited: false };
  return { ok: true, texts: output };
}

async function volcengineRequest(texts, targetLang) {
  const res = await gmRequest({
    method: 'POST',
    url: 'https://translate.volcengine.com/crx/translate/v1/',
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify({
      target_language: targetLang,
      text: texts.map((text) => text.replace(/\r?\n/g, ' ')).join('\n'),
    }),
  });

  if (isRateLimited(res)) return { ok: false, rateLimited: true };
  if (!res || res.status !== 200) return { ok: false, rateLimited: false };

  const json = JSON.parse(res.responseText);
  if (json?.base_resp && Number(json.base_resp.status_code) !== 0) {
    const detail = `${json.base_resp.status_message || ''}`;
    return { ok: false, rateLimited: /limit|quota|frequent/i.test(detail) };
  }

  const parts = String(json?.translation ?? '').split('\n');
  if (parts.length !== texts.length) return { ok: false, rateLimited: false };
  return { ok: true, texts: parts };
}

async function volcengineTranslate(texts, targetLang) {
  const to = VOLC_LANG_MAP[targetLang];
  if (!to) return { ok: false, rateLimited: false, unsupported: true };

  const buckets = new Map();
  texts.forEach((text, index) => {
    const script = detectScript(text);
    if (!buckets.has(script)) buckets.set(script, []);
    buckets.get(script).push({ text, index });
  });

  const output = texts.map(() => '');
  let translated = 0;

  for (const items of buckets.values()) {
    const result = await volcengineRequest(items.map((item) => item.text), to);
    if (!result.ok) {
      if (!translated) return result;
      break;
    }
    result.texts.forEach((value, index) => {
      output[items[index].index] = value;
      if (value && value.trim()) translated += 1;
    });
  }

  if (!translated) return { ok: false, rateLimited: false };
  return { ok: true, texts: output };
}

async function caiyunTranslate(texts, targetLang) {
  const transType = CAIYUN_LANG_MAP[targetLang];
  if (!transType) return { ok: false, rateLimited: false, unsupported: true };

  const res = await gmRequest({
    method: 'POST',
    url: 'https://api.interpreter.caiyunai.com/v1/translator',
    headers: {
      'Content-Type': 'application/json',
      'X-Authorization': `token:${CAIYUN_TOKEN}`,
    },
    data: JSON.stringify({
      source: texts,
      trans_type: transType,
      request_id: 'twitch-danmaku',
      detect: true,
    }),
  });

  if (res?.status === 401) return { ok: false, rateLimited: false, disabled: true };
  if (res?.status === 409) return { ok: false, rateLimited: false, unsupported: true };
  if (isRateLimited(res)) return { ok: false, rateLimited: true };
  if (!res || res.status !== 200) return { ok: false, rateLimited: false };

  const json = JSON.parse(res.responseText);
  if (!Array.isArray(json?.target) || json.target.length !== texts.length) {
    return { ok: false, rateLimited: false };
  }
  return {
    ok: true,
    texts: json.target.map((item) => (item == null ? '' : String(item))),
  };
}

const PROVIDER_CALLS = {
  microsoft: microsoftTranslate,
  google: googleTranslate,
  volcengine: volcengineTranslate,
  caiyun: caiyunTranslate,
  tencent: tencentTranslate,
};

function noteProviderFailure(id, rateLimited) {
  const state = providerState[id];
  state.failures += 1;
  const table = rateLimited ? HARD_COOLDOWNS_MS : SOFT_COOLDOWNS_MS;
  const delay = table[Math.min(state.failures - 1, table.length - 1)];
  state.cooldownUntil = Date.now() + delay;
  if (rateLimited) {
    console.warn('[TBC] translation provider cooling down:', id);
  }
}

function providerReadyAt(id) {
  const state = providerState[id];
  return Math.max(state.nextAt, state.cooldownUntil);
}

function waitForProviders(ids, failed) {
  const now = Date.now();
  const wait = ids.reduce((soonest, id) => Math.min(soonest, providerReadyAt(id) - now), Infinity);
  return {
    retryAfter: Math.max(50, Math.min(Number.isFinite(wait) ? wait : 1000, 60000)),
    failed,
  };
}

function autoSequence(ready) {
  const primaryReady = PRIMARY_PROVIDERS.filter((id) => ready.includes(id));
  if (!primaryReady.length) return ready.slice();

  const id = primaryReady[primaryCursor % primaryReady.length];
  primaryCursor = (primaryCursor + 1) % primaryReady.length;
  return [id, ...ready.filter((candidate) => candidate !== id)];
}

function markProviderUsed(id, startedAt) {
  const elapsed = Date.now() - startedAt;
  providerState[id].nextAt = Date.now() + Math.max(0, PROVIDER_GAP_MS - elapsed);
}

function isPreviewPage() {
  return typeof document !== 'undefined'
    && document.documentElement?.dataset?.tbcPreview === 'true';
}

function previewTranslateText(text, targetLang) {
  const source = String(text || '').trim();
  if (!source) return source;
  const toZh = /^zh/i.test(String(targetLang || ''));
  const hasHan = /[\u4e00-\u9fff]/.test(source);
  if (toZh) {
    if (hasHan) return source;
    return `〔演示译文〕${source}`;
  }
  if (hasHan) return `[Demo TL] ${source}`;
  return source;
}

async function translateBatch(texts, targetLang, preferred) {
  if (!texts.length) return { texts: [] };

  // Demo pages cannot call real translation APIs; return marked text so UI can be verified.
  if (isPreviewPage()) {
    return { texts: texts.map((text) => previewTranslateText(text, targetLang)) };
  }

  const order = preferred && preferred !== 'auto'
    ? [preferred, ...ALL_PROVIDERS.filter((id) => id !== preferred)]
    : ALL_PROVIDERS.slice();
  const supported = order.filter((id) => (
    !disabledProviders.has(id) && !unsupportedTargets.has(`${id}:${targetLang}`)
  ));
  const candidates = supported.length ? supported : order;
  const now = Date.now();

  if (preferred && preferred !== 'auto' && candidates[0] === preferred) {
    const pinned = providerState[preferred];
    if (pinned.cooldownUntil <= now && pinned.nextAt > now) {
      return waitForProviders([preferred], false);
    }
  }

  const usable = candidates.filter((id) => providerState[id].cooldownUntil <= now);
  if (!usable.length) return waitForProviders(candidates, true);

  const ready = usable.filter((id) => providerState[id].nextAt <= now);
  if (!ready.length) return waitForProviders(usable, false);

  const sequence = !preferred || preferred === 'auto'
    ? autoSequence(ready)
    : [preferred, ...ready.filter((id) => id !== preferred)].filter((id) => ready.includes(id));

  const flushStarted = Date.now();
  const attemptLimit = Math.min(MAX_PROVIDER_ATTEMPTS, sequence.length);
  for (let attempt = 0; attempt < attemptLimit; attempt += 1) {
    if (attempt > 0 && Date.now() - flushStarted > TRANSLATE_TIMEOUT_MS) break;
    const id = sequence[attempt];
    const startedAt = Date.now();
    let result;
    try {
      result = await PROVIDER_CALLS[id](texts, targetLang);
    } catch (err) {
      result = { ok: false, rateLimited: !!err?.rateLimited };
    }
    markProviderUsed(id, startedAt);

    if (result?.disabled) {
      disabledProviders.add(id);
      continue;
    }
    if (result?.unsupported) unsupportedTargets.add(`${id}:${targetLang}`);
    if (result?.ok && Array.isArray(result.texts) && result.texts.length === texts.length) {
      providerState[id].failures = 0;
      return { texts: result.texts };
    }
    noteProviderFailure(id, !!result?.rateLimited);
  }

  return { retryAfter: 800, failed: true };
}

const TOOLTIP_ORIGINAL_MAX = 64;

function shouldSkipTranslation(text) {
  const trimmed = text.trim();
  if (!trimmed) return true;
  if (/^[\d\s+\-*/%=^#@&|<>[\]{}\\]+$/u.test(trimmed)) return true;
  if (/^[\p{P}\p{S}\s\d]+$/u.test(trimmed)) return true;
  return false;
}

function translatableCore(text) {
  if (!text) return '';
  const core = String(text).trim();
  if (!core || core.length > 500 || shouldSkipTranslation(core)) return '';
  return core;
}

function needsMachineTranslation(text) {
  const stripped = text.replace(/⟦T\d+⟧/g, '').trim();
  return !!stripped;
}

function truncateText(text, max = TOOLTIP_ORIGINAL_MAX) {
  if (!text || text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

function preparedGroupKey(preparedText, placeholders) {
  return `${preparedText}\0${placeholders.map((item) => item.replacement).join('\0')}`;
}

async function translateMessages(texts, targetLang, provider = 'microsoft') {
  const results = new Array(texts.length);
  const pending = [];

  texts.forEach((text, index) => {
    const cached = getCachedTranslation(text, targetLang);
    if (cached != null) {
      results[index] = cached;
      return;
    }

    if (shouldSkipTranslation(text) || text.length > 500) {
      results[index] = text;
      return;
    }

    const prepared = prepareDictionaryText(text, targetLang);
    if (prepared.fullyMapped || !needsMachineTranslation(prepared.preparedText)) {
      results[index] = restoreDictionaryText(prepared.preparedText, prepared.placeholders);
      return;
    }

    pending.push({
      index,
      original: text,
      preparedText: prepared.preparedText,
      placeholders: prepared.placeholders,
    });
  });

  if (!pending.length) return { texts: results };

  const groups = new Map();
  for (const item of pending) {
    const key = preparedGroupKey(item.preparedText, item.placeholders);
    if (!groups.has(key)) {
      groups.set(key, { preparedText: item.preparedText, items: [] });
    }
    groups.get(key).items.push(item);
  }

  const unique = [...groups.values()];
  const outcome = await translateBatch(
    unique.map((group) => group.preparedText),
    targetLang,
    provider,
  );
  if (outcome.retryAfter) return outcome;

  unique.forEach((group, groupIndex) => {
    const machine = outcome.texts[groupIndex]?.trim()
      ? outcome.texts[groupIndex]
      : group.preparedText;
    const cacheable = !!outcome.texts[groupIndex]?.trim();

    for (const item of group.items) {
      const restored = restoreDictionaryText(machine, item.placeholders)?.trim() || item.original;
      results[item.index] = restored;
      if (cacheable) setCachedTranslation(item.original, targetLang, restored);
    }
  });

  return { texts: results };
}

const TRANSLATE_SINGLE_GRACE_MS = 220;
const TRANSLATE_BURST_WINDOW_MS = 1000;
const TRANSLATE_GIVE_UP_ATTEMPTS = 2;

class TranslateQueue {
  constructor(getSettings, isActive) {
    this.getSettings = getSettings;
    this.isActive = isActive;
    this.queue = [];
    this.inflight = false;
    this.timer = null;
    this.timerDelay = null;
    this.epoch = 0;
    this.nextSlotAt = 0;
    this.collectStartedAt = 0;
  }

  currentSpeed() {
    return clamp(Number(this.getSettings().translateSpeed) || 1, 1, 10);
  }

  enqueue(text, parts, callback) {
    if (!this.isActive()) return;
    const settings = this.getSettings();
    if (!settings.translateEnabled) return;

    while (this.queue.length >= MAX_TRANSLATE_QUEUE) {
      this.queue.shift();
    }
    if (!this.collectStartedAt) this.collectStartedAt = Date.now();
    this.queue.push({
      text,
      parts: parts?.length ? parts : [{ type: 'text', value: text }],
      callback,
      attempts: 0,
    });
    this.schedule();
  }

  clearTimer() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.timerDelay = null;
  }

  armTimer(delay) {
    this.clearTimer();
    this.timerDelay = delay;
    this.timer = setTimeout(() => {
      this.timer = null;
      this.timerDelay = null;
      this.flush();
    }, delay);
  }

  schedule() {
    if (this.inflight || !this.isActive()) return;
    if (!this.getSettings().translateEnabled) return;

    if (this.queue.length === 0) {
      this.collectStartedAt = 0;
      this.clearTimer();
      return;
    }

    const delay = this.computeDelay();
    if (delay === 0 && this.timer && this.timerDelay === 0) return;
    this.armTimer(delay);
  }

  computeDelay() {
    const now = Date.now();
    const speed = this.currentSpeed();
    const slotWait = Math.max(0, this.nextSlotAt - now);
    const started = this.collectStartedAt || now;

    if (this.queue.length >= speed) return slotWait;

    const grace = speed <= 1 || this.queue.length < 2
      ? (speed <= 1 ? 0 : TRANSLATE_SINGLE_GRACE_MS)
      : TRANSLATE_BURST_WINDOW_MS;
    const collectWait = Math.max(0, started + grace - now);
    return Math.max(slotWait, collectWait);
  }

  pieceCount(parts) {
    return parts.reduce((count, part) => (
      part.type === 'text' && translatableCore(part.value) ? count + 1 : count
    ), 0);
  }

  takeJobs(speed) {
    const jobs = [];
    let chars = 0;
    let pieces = 0;

    while (this.queue.length && jobs.length < Math.min(speed, TRANSLATE_MAX_BATCH)) {
      const next = this.queue[0];
      const nextPieces = this.pieceCount(next.parts);
      if (jobs.length > 0 && (
        chars + next.text.length > TRANSLATE_MAX_BATCH_CHARS
        || pieces + nextPieces > TRANSLATE_MAX_BATCH
      )) break;
      chars += next.text.length;
      pieces += nextPieces;
      jobs.push(this.queue.shift());
    }

    return jobs;
  }

  deliver(jobs, partLists) {
    if (!this.isActive()) return;
    jobs.forEach((job, index) => {
      const parts = partLists[index] || job.parts;
      try {
        job.callback(parts, job.text);
      } catch {
        /* ignore */
      }
    });
  }

  stitch(jobs, translations, refs) {
    const outputs = jobs.map((job) => job.parts.map((part) => ({ ...part })));
    refs.forEach((ref, index) => {
      const part = outputs[ref.jobIndex][ref.partIndex];
      const match = String(part.value).match(/^(\s*)([\s\S]*?)(\s*)$/);
      const translated = translations[index] || match[2];
      outputs[ref.jobIndex][ref.partIndex] = {
        type: 'text',
        value: `${match[1]}${translated}${match[3]}`,
      };
    });
    return outputs;
  }

  pace(count, speed, startedAt) {
    const spent = Date.now() - startedAt;
    const budget = Math.round(count * (1000 / speed));
    const nextAt = Date.now() + Math.max(0, budget - spent);
    this.nextSlotAt = Math.max(this.nextSlotAt, nextAt);
  }

  async flush() {
    if (this.inflight || this.queue.length === 0 || !this.isActive()) {
      this.schedule();
      return;
    }

    const settings = this.getSettings();
    if (!settings.translateEnabled) return;

    const epoch = this.epoch;
    const speed = this.currentSpeed();
    const jobs = this.takeJobs(speed);
    if (!jobs.length) return;

    this.collectStartedAt = this.queue.length ? Date.now() : 0;
    this.inflight = true;
    const startedAt = Date.now();

    const refs = [];
    const pieces = [];
    jobs.forEach((job, jobIndex) => {
      job.parts.forEach((part, partIndex) => {
        const core = part.type === 'text' ? translatableCore(part.value) : '';
        if (!core) return;
        refs.push({ jobIndex, partIndex });
        pieces.push(core);
      });
    });

    try {
      if (!pieces.length) {
        this.deliver(jobs, jobs.map((job) => job.parts));
        this.pace(jobs.length, speed, startedAt);
        return;
      }

      const outcome = await translateMessages(
        pieces,
        settings.translateTargetLang,
        settings.translateProvider,
      );

      if (epoch !== this.epoch || !this.isActive()) return;

      if (outcome.retryAfter) {
        const failed = !!outcome.failed;
        if (failed) {
          for (const job of jobs) job.attempts += 1;
        }
        const exhausted = failed && jobs.every((job) => job.attempts >= TRANSLATE_GIVE_UP_ATTEMPTS);
        const blocked = failed && outcome.retryAfter > 1500;
        if (exhausted || blocked) {
          this.deliver(jobs, jobs.map((job) => job.parts));
          this.pace(jobs.length, speed, startedAt);
        } else {
          this.queue = jobs.concat(this.queue);
          while (this.queue.length > MAX_TRANSLATE_QUEUE) this.queue.pop();
          this.collectStartedAt = Date.now() - TRANSLATE_BURST_WINDOW_MS;
          this.nextSlotAt = Math.max(this.nextSlotAt, Date.now() + outcome.retryAfter);
        }
        return;
      }

      this.deliver(jobs, this.stitch(jobs, outcome.texts || [], refs));
      this.pace(jobs.length, speed, startedAt);
    } catch {
      if (epoch !== this.epoch || !this.isActive()) return;
      this.deliver(jobs, jobs.map((job) => job.parts));
      this.pace(jobs.length, speed, startedAt);
    } finally {
      if (epoch === this.epoch) this.inflight = false;
      if (this.queue.length && epoch === this.epoch) this.schedule();
    }
  }

  clear() {
    this.epoch += 1;
    this.queue = [];
    this.collectStartedAt = 0;
    this.nextSlotAt = 0;
    this.clearTimer();
    this.inflight = false;
  }
}

const MAX_REPEAT_SEGMENTS = 3;

function dedupeRepeatedMessage(text) {
  const trimmed = text.trim();
  if (!trimmed) return text;

  const tokens = trimmed.split(/\s+/);
  if (tokens.length <= MAX_REPEAT_SEGMENTS) return text;

  const maxUnitLen = Math.floor(tokens.length / (MAX_REPEAT_SEGMENTS + 1));

  for (let unitLen = 1; unitLen <= maxUnitLen; unitLen += 1) {
    if (tokens.length % unitLen !== 0) continue;

    const repeatCount = tokens.length / unitLen;
    if (repeatCount <= MAX_REPEAT_SEGMENTS) continue;

    const unit = tokens.slice(0, unitLen);
    let matched = true;

    for (let i = 1; i < repeatCount; i += 1) {
      for (let j = 0; j < unitLen; j += 1) {
        if (tokens[i * unitLen + j] !== unit[j]) {
          matched = false;
          break;
        }
      }
      if (!matched) break;
    }

    if (matched) {
      const kept = [];
      for (let i = 0; i < MAX_REPEAT_SEGMENTS; i += 1) {
        kept.push(...unit);
      }
      return kept.join(' ');
    }
  }

  return text;
}

function extractEmoteName(node) {
  if (!node) return '';
  return node.getAttribute?.('data-emote-name')
    || node.alt
    || node.getAttribute?.('title')
    || node.dataset?.alt
    || '';
}

function pickEmoteSrc(img) {
  const srcset = img.getAttribute('srcset') || '';
  const candidates = srcset.split(',')
    .map((item) => item.trim().split(/\s+/)[0])
    .filter(Boolean);
  const preferred = candidates.find((url) => /\/2\.0(?:$|[?#])/.test(url))
    || candidates[candidates.length - 1]
    || img.getAttribute('src')
    || '';

  try {
    const url = new URL(preferred, location.href);
    if (url.protocol !== 'https:') return '';
    url.hash = '';
    return url.href;
  } catch {
    return '';
  }
}

function partsToPlain(parts) {
  let out = '';
  for (const part of parts) {
    if (part.type === 'emote') {
      if (out && !/\s$/.test(out)) out += ' ';
      out += part.name || '';
      continue;
    }
    out += part.value || '';
  }
  return out.trim();
}

function mergeTextParts(parts) {
  const merged = [];
  for (const part of parts) {
    if (part.type === 'text') {
      if (!part.value) continue;
      const last = merged[merged.length - 1];
      if (last?.type === 'text') last.value += part.value;
      else merged.push({ type: 'text', value: part.value });
      continue;
    }
    if (part.name || part.src) merged.push(part);
  }
  return merged;
}

function dedupeParts(parts) {
  const units = [];
  for (const part of parts) {
    if (part.type === 'emote') {
      units.push(part.name || '');
      continue;
    }
    const words = String(part.value || '').trim().split(/\s+/).filter(Boolean);
    units.push(...words);
  }

  const original = units.join(' ');
  const deduped = dedupeRepeatedMessage(original);
  if (!original || deduped === original) return mergeTextParts(parts);

  const kept = deduped.split(/\s+/).filter(Boolean);
  const rebuilt = [];
  let cursor = 0;

  const visit = (part) => {
    if (cursor >= kept.length) return;
    if (part.type === 'emote') {
      if ((part.name || '') === kept[cursor]) {
        if (rebuilt.length) rebuilt.push({ type: 'text', value: ' ' });
        rebuilt.push(part);
        cursor += 1;
      }
      return;
    }
    const words = String(part.value || '').trim().split(/\s+/).filter(Boolean);
    words.forEach((word) => {
      if (cursor >= kept.length || word !== kept[cursor]) return;
      if (rebuilt.length) rebuilt.push({ type: 'text', value: ' ' });
      rebuilt.push({ type: 'text', value: word });
      cursor += 1;
    });
  };

  parts.forEach(visit);
  return cursor === kept.length ? mergeTextParts(rebuilt) : mergeTextParts(parts);
}

function extractMessageParts(msgEl) {
  const root = msgEl.querySelector(SELECTORS.chatMessageBody);
  if (!root) return [];

  const parts = [];

  const pushText = (text) => {
    if (!text) return;
    const last = parts[parts.length - 1];
    if (last?.type === 'text') last.value += text;
    else parts.push({ type: 'text', value: text });
  };

  const pushEmote = (img) => {
    const name = extractEmoteName(img).trim();
    const src = pickEmoteSrc(img);
    if (!name && !src) return;
    parts.push({ type: 'emote', name, src });
  };

  const walk = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      pushText(node.textContent);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    if (node.matches('.chat-badge, [data-a-target="chat-badge"], .chat-line__icons, .chat-line__username, [data-a-target="chat-message-username"], .video-chat__message-author, .vod-message__header, .video-chat__message-menu')) {
      return;
    }

    // VOD chat puts a lone ":" separator before the message body text.
    if (!node.querySelector('img, [data-a-target="emote-name"], [data-a-target="chat-message-text"]')
      && node.textContent?.trim() === ':') {
      return;
    }

    if (node.tagName === 'IMG') {
      if (node.classList.contains('chat-badge') || node.closest('[data-a-target="chat-badge"]')) return;
      pushEmote(node);
      return;
    }

    if (node.matches('.chat-line__message--emote-button, [data-a-target="emote-name"]')) {
      const img = node.querySelector('img');
      if (img) pushEmote(img);
      return;
    }

    for (const child of node.childNodes) walk(child);
  };

  for (const child of root.childNodes) walk(child);
  return dedupeParts(parts);
}

function usableCssColor(value) {
  if (!value || value === 'transparent' || value === 'rgba(0, 0, 0, 0)') return '';
  return value;
}

function hasCheer(msgEl) {
  return [...msgEl.querySelectorAll('img')].some((img) => {
    const src = img.getAttribute('src') || '';
    const alt = img.getAttribute('alt') || '';
    return /\/bits\//i.test(src) || /^cheer\d+/i.test(alt);
  });
}

function paidBackground(msgEl) {
  const nodes = [msgEl, msgEl.querySelector('.chat-line__message-container')].filter(Boolean);
  for (const node of nodes) {
    const color = usableCssColor(node.style?.backgroundColor);
    if (color) return color;
    const styled = node.querySelector?.('[style*="background"]');
    const nested = usableCssColor(styled?.style?.backgroundColor);
    if (nested) return nested;
  }
  return '';
}

function readSuperchatStyle(msgEl) {
  const pinned = !!msgEl.closest('[data-test-selector="pinned-chat"], [data-test-selector="pinned-message"], [class*="pinned-chat"], [class*="paid-pinned"]');
  const cheer = hasCheer(msgEl);
  const background = paidBackground(msgEl);
  if (!cheer && !pinned && !background) return null;
  const textNode = msgEl.querySelector('[data-a-target="chat-message-text"], .text-fragment');
  const color = usableCssColor(textNode && getComputedStyle(textNode).color) || '#ffffff';
  return { background: background || '#9147ff', color };
}

function parseChatMessage(msgEl) {
  if (msgEl.classList.contains('tbc-processed')) return null;
  if (msgEl.closest('.tbc-processed')) return null;

  const parts = extractMessageParts(msgEl);
  const message = partsToPlain(parts);
  if (!message) return null;

  const usernameEl = msgEl.querySelector(SELECTORS.chatUsername);
  const username = usernameEl?.textContent?.trim() || '';
  const usernameColor = getUsernameColor(msgEl);
  const profileUrl = getTwitchProfileUrl(usernameEl, username);

  msgEl.classList.add('tbc-processed');
  const superchatStyle = readSuperchatStyle(msgEl);
  return {
    message,
    parts,
    username,
    usernameColor,
    profileUrl,
    superchat: !!superchatStyle,
    superchatStyle,
  };
}

function markExistingMessages(chatRoot) {
  chatRoot.querySelectorAll(SELECTORS.chatMessage).forEach((el) => {
    el.classList.add('tbc-processed');
  });
}

function isLiveMessage(msgEl, chatRoot) {
  const messages = chatRoot.querySelectorAll(SELECTORS.chatMessage);
  if (!messages.length) return true;

  const tailStart = Math.max(0, messages.length - LIVE_MESSAGE_TAIL);
  for (let i = tailStart; i < messages.length; i++) {
    const node = messages[i];
    if (node === msgEl || node.contains(msgEl) || msgEl.contains(node)) {
      return true;
    }
  }
  return false;
}

function clearChatTranslations(root = document) {
  root.querySelectorAll?.('.tbc-chat-translation').forEach((node) => node.remove());
}

function removeChatTranslation(msgEl) {
  msgEl?.querySelectorAll?.('.tbc-chat-translation').forEach((node) => node.remove());
}

function normalizeCompareText(text) {
  return String(text || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function applyChatTranslation(msgEl, translatedText, originalText) {
  if (!msgEl?.isConnected) return false;
  const translated = String(translatedText || '').replace(/\s+/g, ' ').trim();
  if (!translated) {
    removeChatTranslation(msgEl);
    return false;
  }
  if (normalizeCompareText(translated) === normalizeCompareText(originalText)) {
    removeChatTranslation(msgEl);
    return false;
  }

  let row = msgEl.querySelector(':scope > .tbc-chat-translation');
  if (!row) {
    row = msgEl.querySelector('.tbc-chat-translation');
  }
  if (!row) {
    row = document.createElement('div');
    row.className = 'tbc-chat-translation';
    row.setAttribute('data-a-target', 'tbc-chat-translation');

    const badge = document.createElement('span');
    badge.className = 'tbc-chat-translation-badge';
    badge.textContent = t('translateBadge');

    const text = document.createElement('span');
    text.className = 'tbc-chat-translation-text';

    row.append(badge, text);

    const body = msgEl.querySelector(SELECTORS.chatMessageBody);
    if (body?.parentElement) {
      body.insertAdjacentElement('afterend', row);
    } else {
      msgEl.appendChild(row);
    }
  }

  const textEl = row.querySelector('.tbc-chat-translation-text');
  if (textEl) textEl.textContent = translated;
  const badgeEl = row.querySelector('.tbc-chat-translation-badge');
  if (badgeEl) badgeEl.textContent = t('translateBadge');
  return true;
}

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
  if (!findLiveChatContainer()) return null;
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
    source: 'live-dom',
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

async function collectLiveDomChat({
  keywords = '',
  usernames = '',
  includeSuperchat = true,
  onProgress,
  shouldCancel,
  shouldPause,
}) {
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

class ChatObserver {
  constructor({ getSettings, danmakuEmitter, translateQueue, isActive }) {
    this.getSettings = getSettings;
    this.danmakuEmitter = danmakuEmitter;
    this.translateQueue = translateQueue;
    this.isActive = isActive;
    this.observer = null;
    this.chatRoot = null;
    this.readyAt = 0;
  }

  async start() {
    this.chatRoot = await waitForElement(SELECTORS.chatScroller);
    if (!this.chatRoot) {
      console.warn('[TBC] Chat scroller not found');
      return;
    }

    markExistingMessages(this.chatRoot);
    this.readyAt = Date.now();
    this.isVodChat = !!this.chatRoot.closest('.video-chat')
      || this.chatRoot.classList.contains('video-chat__message-list-wrapper')
      || !!this.chatRoot.querySelector('.vod-message');

    this.observer = new MutationObserver((mutations) => {
      if (!this.isActive()) return;
      for (const mut of mutations) {
        for (const node of mut.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;
          this.handleNode(node);
        }
      }
    });

    this.observer.observe(this.chatRoot, { childList: true, subtree: true });
    console.log(`[TBC] Chat observer started (${this.isVodChat ? 'vod' : 'live'})`);
  }

  stop() {
    this.observer?.disconnect();
    this.observer = null;
    this.chatRoot = null;
    this.isVodChat = false;
  }

  shouldEmit(msgEl) {
    if (!this.isActive()) return false;

    if (Date.now() - this.readyAt < WARMUP_MS) {
      msgEl.classList.add('tbc-processed');
      return false;
    }

    if (!isLiveMessage(msgEl, this.chatRoot)) {
      msgEl.classList.add('tbc-processed');
      return false;
    }

    return true;
  }

  handleNode(node) {
    const candidates = node.matches?.(SELECTORS.chatMessage)
      ? [node]
      : Array.from(node.querySelectorAll?.(SELECTORS.chatMessage) || []);

    for (const msgEl of candidates) {
      if (!this.shouldEmit(msgEl)) continue;
      const parsed = parseChatMessage(msgEl);
      if (!parsed) continue;
      this.emitDanmaku(parsed, msgEl);
    }
  }

  emitDanmaku(parsed, msgEl) {
    const settings = this.getSettings();
    if (!this.isActive()) return;

    if (isKeywordBlocked(parsed.message, settings.blockedKeywords)) return;

    const base = {
      username: parsed.username,
      usernameColor: parsed.usernameColor,
      profileUrl: parsed.profileUrl,
      originalMessage: parsed.message,
      superchat: !!parsed.superchat,
      superchatStyle: parsed.superchatStyle || null,
    };

    const hasTranslatableText = parsed.parts.some((part) => (
      part.type === 'text' && translatableCore(part.value)
    ));

    if (!settings.translateEnabled || !hasTranslatableText) {
      this.danmakuEmitter.enqueue({
        ...base,
        message: parsed.message,
        parts: parsed.parts,
        translated: false,
      });
      return;
    }

    this.translateQueue.enqueue(parsed.message, parsed.parts, (parts) => {
      if (!this.isActive()) return;
      const latest = this.getSettings();
      const message = partsToPlain(parts) || parsed.message;
      if (isKeywordBlocked(parsed.message, latest.blockedKeywords)) return;
      if (isKeywordBlocked(message, latest.blockedKeywords)) return;
      if (latest.translateEnabled && latest.translateInChat) {
        applyChatTranslation(msgEl, message, parsed.message);
      } else if (msgEl) {
        removeChatTranslation(msgEl);
      }
      this.danmakuEmitter.enqueue({
        ...base,
        message,
        parts,
        translated: message !== parsed.message,
      });
    });
  }
}

function injectStyles() {
  GM_addStyle(`
    .tbc-danmaku-layer {
      pointer-events: none;
      overflow: hidden;
    }

    .tbc-danmaku-item {
      position: absolute;
      left: 100%;
      white-space: nowrap;
      opacity: var(--tbc-opacity, 1);
      font-weight: 600;
      pointer-events: auto;
      cursor: default;
      text-shadow:
        1px 1px 2px rgba(0, 0, 0, 0.9),
        -1px -1px 2px rgba(0, 0, 0, 0.9),
        0 0 4px rgba(0, 0, 0, 0.8);
      animation: tbc-scroll var(--tbc-duration, 8s) linear forwards;
      will-change: transform;
    }

    .tbc-danmaku-item img.tbc-emote {
      display: inline-block !important;
      height: 1.2em !important;
      width: auto !important;
      min-height: 1.2em !important;
      max-height: 1.2em !important;
      max-width: 6em !important;
      object-fit: contain !important;
      object-position: center !important;
      vertical-align: -0.22em !important;
      margin: 0 0.1em !important;
      pointer-events: none !important;
      user-select: none !important;
    }

    .tbc-danmaku-item.tbc-paused {
      animation-play-state: paused;
      z-index: 20;
      cursor: pointer;
      pointer-events: auto;
    }

    .tbc-danmaku-item.tbc-paused.tbc-click-locked {
      z-index: 100002;
    }

    .tbc-click-lock-backdrop {
      position: absolute;
      inset: 0;
      z-index: 100000;
      pointer-events: auto;
      background: transparent;
    }

    .tbc-danmaku-tooltip {
      display: flex;
      flex-direction: column;
      align-items: center;
      pointer-events: auto;
      filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.4));
      max-width: calc(100% - 16px);
    }

    .tbc-danmaku-tooltip-bubble {
      background: rgba(24, 24, 27, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      padding: 6px 8px;
      max-width: min(280px, 100%);
      max-height: min(40vh, 240px);
      overflow-y: auto;
    }

    .tbc-danmaku-tooltip-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 6px;
    }

    .tbc-danmaku-tooltip-header--solo {
      justify-content: flex-end;
    }

    .tbc-danmaku-tooltip-name {
      flex: 1;
      min-width: 0;
      font-size: 12px;
      font-weight: 600;
      line-height: 1.3;
      word-break: break-word;
      text-decoration: none;
      cursor: pointer;
    }

    .tbc-danmaku-tooltip-name:hover {
      text-decoration: underline;
    }

    .tbc-danmaku-tooltip-copy {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: clamp(24px, 6vw, 28px);
      height: clamp(24px, 6vw, 28px);
      padding: 0;
      border: none;
      border-radius: 4px;
      background: transparent;
      color: #adadb8;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }

    .tbc-danmaku-tooltip-copy:hover {
      background: rgba(255, 255, 255, 0.12);
      color: #efeff1;
    }

    .tbc-danmaku-tooltip-copy svg {
      width: clamp(14px, 3.5vw, 16px);
      height: clamp(14px, 3.5vw, 16px);
      fill: currentColor;
      display: block;
    }

    .tbc-danmaku-tooltip-original {
      margin-top: 4px;
      color: #adadb8;
      font-size: 11px;
      line-height: 1.3;
      word-break: break-word;
    }

    .tbc-danmaku-tooltip-tail {
      width: 6px;
      height: 6px;
      flex-shrink: 0;
      background: rgba(24, 24, 27, 0.95);
      transform: rotate(45deg);
    }

    .tbc-danmaku-tooltip--above .tbc-danmaku-tooltip-tail {
      margin: -3px auto 0;
      border-right: 1px solid rgba(255, 255, 255, 0.1);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .tbc-danmaku-tooltip--below .tbc-danmaku-tooltip-bubble {
      order: 2;
    }

    .tbc-danmaku-tooltip--below .tbc-danmaku-tooltip-tail {
      order: 1;
      margin: 0 auto -3px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      border-left: 1px solid rgba(255, 255, 255, 0.1);
    }

    @keyframes tbc-scroll {
      from { transform: translateX(var(--tbc-start, 0)); }
      to { transform: translateX(calc(-1 * var(--tbc-travel, 100vw))); }
    }

    .tbc-controls-wrap {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      margin-left: 2px;
    }

    .tbc-control-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      padding: 0;
      border: none;
      border-radius: 4px;
      background: transparent;
      color: #efeff1;
      cursor: pointer;
      transition: background 0.15s, opacity 0.15s;
      flex-shrink: 0;
    }

    .tbc-control-btn:hover,
    .tbc-control-btn.tbc-active {
      background: rgba(255, 255, 255, 0.15);
    }

    .tbc-control-btn svg {
      width: 20px;
      height: 20px;
      fill: currentColor;
      display: block;
    }

    .tbc-danmaku-btn .tbc-icon {
      display: none;
      line-height: 0;
    }

    .tbc-danmaku-btn.tbc-danmaku-enabled .tbc-icon-on,
    .tbc-danmaku-btn.tbc-danmaku-disabled .tbc-icon-off {
      display: block;
    }

    .tbc-danmaku-btn.tbc-danmaku-disabled {
      opacity: 0.55;
    }

    .tbc-speech-btn .tbc-icon {
      display: none;
      line-height: 0;
    }

    .tbc-speech-btn.tbc-speech-on .tbc-icon-on,
    .tbc-speech-btn.tbc-speech-mute .tbc-icon-mute,
    .tbc-speech-btn.tbc-speech-off .tbc-icon-off {
      display: block;
    }

    .tbc-speech-btn.tbc-speech-mute,
    .tbc-speech-btn.tbc-speech-off {
      opacity: 0.55;
    }

    .tbc-superchat-layer {
      pointer-events: none;
      display: none;
      align-items: center;
      justify-content: center;
      overflow: visible;
    }

    .tbc-superchat-item {
      position: relative;
      max-width: calc(100% - 24px);
      padding: 6px 16px;
      border-radius: 999px;
      font-weight: 700;
      line-height: 1.2;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      pointer-events: auto;
      cursor: pointer;
      animation-duration: var(--tbc-sc-duration, 6s);
      animation-timing-function: ease;
      animation-fill-mode: forwards;
    }

    .tbc-superchat-item.tbc-sc-fade,
    .tbc-superchat-item.tbc-sc-shine {
      animation-name: tbc-sc-fade;
    }

    .tbc-superchat-item.tbc-sc-slide {
      animation-name: tbc-sc-slide;
    }

    .tbc-superchat-layer.tbc-sc-bottom .tbc-superchat-item.tbc-sc-slide {
      animation-name: tbc-sc-slide-up;
    }

    .tbc-superchat-item.tbc-sc-pop {
      animation-name: tbc-sc-pop;
    }

    .tbc-superchat-item.tbc-sc-shine::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(110deg, transparent 28%, rgba(255, 255, 255, 0.55) 50%, transparent 72%);
      transform: translateX(-130%);
      animation: tbc-sc-shine-sweep 1.15s ease 0.25s;
      pointer-events: none;
    }

    .tbc-superchat-item.tbc-paused,
    .tbc-superchat-item.tbc-paused.tbc-click-locked,
    .tbc-superchat-item.tbc-paused::after {
      animation-play-state: paused;
    }

    .tbc-superchat-item.tbc-paused,
    .tbc-superchat-item.tbc-paused.tbc-click-locked {
      z-index: 20;
    }

    @keyframes tbc-sc-fade {
      0% { opacity: 0; }
      12% { opacity: 1; }
      88% { opacity: 1; }
      100% { opacity: 0; }
    }

    @keyframes tbc-sc-slide {
      0% { opacity: 0; transform: translateY(-14px); }
      14% { opacity: 1; transform: translateY(0); }
      86% { opacity: 1; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(10px); }
    }

    @keyframes tbc-sc-slide-up {
      0% { opacity: 0; transform: translateY(14px); }
      14% { opacity: 1; transform: translateY(0); }
      86% { opacity: 1; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(-10px); }
    }

    @keyframes tbc-sc-pop {
      0% { opacity: 0; transform: scale(0.7); }
      16% { opacity: 1; transform: scale(1); }
      86% { opacity: 1; transform: scale(1); }
      100% { opacity: 0; transform: scale(0.92); }
    }

    @keyframes tbc-sc-shine-sweep {
      from { transform: translateX(-130%); }
      to { transform: translateX(130%); }
    }

    .tbc-balloon-body--speech {
      max-height: min(70vh, 520px);
    }

    .tbc-speech-test {
      display: flex;
      gap: 6px;
    }

    .tbc-balloon-input {
      flex: 1;
      min-width: 0;
      padding: 6px 8px;
      border: 1px solid #3a3a3d;
      border-radius: 4px;
      background: #0e0e10;
      color: #efeff1;
      font-size: 13px;
    }

    .tbc-speech-play {
      flex-shrink: 0;
      min-width: 36px;
      border: none;
      border-radius: 4px;
      background: #3a3a3d;
      color: #efeff1;
      cursor: pointer;
      font-size: 12px;
    }

    .tbc-speech-note {
      margin: 0;
      padding: 0 12px 8px;
      color: #adadb8;
      font-size: 12px;
      line-height: 1.4;
    }

    .tbc-balloon {
      background: #26262c;
      color: #efeff1;
      border-radius: 6px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
      font-family: "Inter", "Segoe UI", system-ui, sans-serif;
      font-size: 14px;
      overflow: hidden;
    }

    .tbc-balloon-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 12px 8px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .tbc-balloon-title {
      font-size: 14px;
      font-weight: 600;
      line-height: 1.4;
    }

    .tbc-balloon-close {
      background: none;
      border: none;
      color: #9147ff;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      padding: 4px 6px;
      border-radius: 4px;
    }

    .tbc-balloon-close:hover {
      background: rgba(145, 71, 255, 0.12);
    }

    .tbc-balloon-body {
      padding: 4px 0 8px;
      max-height: min(60vh, 420px);
      overflow-y: auto;
    }

    .tbc-balloon-row {
      padding: 8px 12px;
    }

    .tbc-balloon-row--toggle {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .tbc-balloon-row--field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .tbc-balloon-field-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .tbc-balloon-label {
      color: #efeff1;
      font-size: 13px;
      line-height: 1.4;
    }

    .tbc-balloon-value {
      color: #adadb8;
      font-size: 12px;
    }

    .tbc-balloon-range {
      width: 100%;
      accent-color: #9147ff;
      height: 4px;
    }

    .tbc-balloon-select {
      width: 100%;
      padding: 6px 8px;
      border: 1px solid #3a3a3d;
      border-radius: 4px;
      background: #0e0e10;
      color: #efeff1;
      font-size: 13px;
    }

    .tbc-balloon-divider {
      height: 1px;
      margin: 4px 12px;
      background: rgba(255, 255, 255, 0.08);
    }

    .tbc-chat-translation {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin-top: 5px;
      padding: 6px 10px 6px 8px;
      border: 1px solid rgba(145, 71, 255, 0.55);
      border-left: 3px solid #9147ff;
      border-radius: 4px;
      background:rgba(27, 16, 48, 0.8);
      font-size: 13px;
      line-height: 1.45;
      max-width: 100%;
      box-sizing: border-box;
    }

    .tbc-chat-translation-badge {
      flex-shrink: 0;
      margin-top: 1px;
      padding: 1px 6px;
      border-radius: 3px;
      background: #9147ff;
      color: #ffffff;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.04em;
      line-height: 1.45;
      user-select: none;
    }

    .tbc-chat-translation-text {
      color: #f3eeff;
      font-weight: 600;
      word-break: break-word;
    }

    .tbc-keyword-hint,
    .tbc-keyword-empty {
      color: #adadb8;
      font-size: 12px;
      line-height: 1.4;
    }

    .tbc-setting-hint {
      margin: -2px 0 0;
      padding: 0 12px 6px;
      color: #adadb8;
      font-size: 12px;
      line-height: 1.4;
    }

    .tbc-keyword-form {
      display: flex;
      gap: 6px;
    }

    .tbc-keyword-input {
      flex: 1;
      min-width: 0;
      padding: 6px 8px;
      border: 1px solid #3a3a3d;
      border-radius: 4px;
      background: #0e0e10;
      color: #efeff1;
      font-size: 13px;
    }

    .tbc-keyword-add {
      flex-shrink: 0;
      border: none;
      border-radius: 4px;
      background: #9147ff;
      color: #fff;
      padding: 6px 10px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }

    .tbc-keyword-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      max-height: 96px;
      overflow-y: auto;
    }

    .tbc-keyword {
      display: inline-flex;
      align-items: center;
      max-width: 100%;
      padding: 2px 2px 2px 8px;
      border-radius: 999px;
      background: rgba(145, 71, 255, 0.16);
      color: #efeff1;
      font-size: 12px;
    }

    .tbc-keyword-text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 180px;
    }

    .tbc-keyword-remove {
      border: none;
      background: transparent;
      color: #adadb8;
      cursor: pointer;
      font-size: 14px;
      line-height: 1;
      padding: 0 6px;
    }

    .tbc-switch {
      position: relative;
      width: 40px;
      height: 22px;
      flex-shrink: 0;
    }

    .tbc-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .tbc-switch-slider {
      position: absolute;
      inset: 0;
      background: #3a3a3d;
      border-radius: 11px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .tbc-switch-slider::before {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      left: 3px;
      bottom: 3px;
      background: #fff;
      border-radius: 50%;
      transition: transform 0.2s;
    }

    .tbc-switch input:checked + .tbc-switch-slider {
      background: #9147ff;
    }

    .tbc-switch input:checked + .tbc-switch-slider::before {
      transform: translateX(18px);
    }

    .tbc-balloon-body--history {
      max-height: min(70vh, 560px);
    }

    .tbc-history-meta,
    .tbc-history-hint,
    .tbc-history-status {
      margin: 0;
      color: #adadb8;
      font-size: 12px;
      line-height: 1.4;
    }

    .tbc-history-meta {
      padding: 8px 12px 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .tbc-history-status {
      min-height: 1.4em;
      padding-top: 8px;
    }

    .tbc-history-status--error {
      color: #ff8280;
    }

    .tbc-history-status--ok {
      color: #00f593;
    }

    .tbc-history-range {
      position: relative;
      height: 28px;
    }

    .tbc-history-track,
    .tbc-history-fill {
      position: absolute;
      top: 12px;
      height: 4px;
      border-radius: 2px;
    }

    .tbc-history-track {
      left: 0;
      right: 0;
      background: #3a3a3d;
    }

    .tbc-history-fill {
      background: #9147ff;
    }

    .tbc-history-range input[type="range"] {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 28px;
      margin: 0;
      background: none;
      pointer-events: none;
      appearance: none;
      -webkit-appearance: none;
    }

    .tbc-history-range input[type="range"]::-webkit-slider-runnable-track {
      height: 4px;
      background: transparent;
    }

    .tbc-history-range input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      pointer-events: auto;
      width: 14px;
      height: 14px;
      margin-top: -5px;
      border: 2px solid #9147ff;
      border-radius: 50%;
      background: #fff;
      cursor: pointer;
    }

    .tbc-history-range input[type="range"]::-moz-range-track {
      height: 4px;
      background: transparent;
      border: none;
    }

    .tbc-history-range input[type="range"]::-moz-range-thumb {
      pointer-events: auto;
      width: 14px;
      height: 14px;
      border: 2px solid #9147ff;
      border-radius: 50%;
      background: #fff;
      cursor: pointer;
    }

    .tbc-history-actions {
      padding: 4px 12px 8px;
    }

    .tbc-history-buttons {
      display: flex;
      gap: 8px;
    }

    .tbc-history-download,
    .tbc-history-pause,
    .tbc-history-resume,
    .tbc-history-cancel {
      flex: 1;
      border: none;
      border-radius: 4px;
      font-size: 13px;
      font-weight: 600;
      padding: 8px 12px;
      cursor: pointer;
      color: #fff;
    }

    .tbc-history-download,
    .tbc-history-resume {
      background: #9147ff;
    }

    .tbc-history-pause {
      background: #3a3a3d;
    }

    .tbc-history-cancel {
      background: #ad1c1c;
    }

    .tbc-history-download:disabled {
      opacity: 0.45;
      cursor: default;
    }
  `);
}

const ICON_DANMAKU_ON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M11.989 4.828c-.47 0-.975.004-1.515.012l-1.71-2.566a1.008 1.008 0 0 0-1.678 1.118l.999 1.5c-.681.018-1.403.04-2.164.068a4.013 4.013 0 0 0-3.83 3.44c-.165 1.15-.245 2.545-.245 4.185 0 1.965.115 3.67.35 5.116a4.012 4.012 0 0 0 3.763 3.363l.906.046c1.205.063 1.808.095 3.607.095a.988.988 0 0 0 0-1.975c-1.758 0-2.339-.03-3.501-.092l-.915-.047a2.037 2.037 0 0 1-1.91-1.708c-.216-1.324-.325-2.924-.325-4.798 0-1.563.076-2.864.225-3.904.14-.977.96-1.713 1.945-1.747 2.444-.087 4.465-.13 6.063-.131 1.598 0 3.62.044 6.064.13.96.034 1.71.81 1.855 1.814.075.524.113 1.962.141 3.065v.002c.01.342.017.65.025.88a.987.987 0 1 0 1.974-.068c-.008-.226-.016-.523-.025-.856v-.027c-.03-1.118-.073-2.663-.16-3.276-.273-1.906-1.783-3.438-3.74-3.507-.9-.032-1.743-.058-2.531-.078l1.05-1.46a1.008 1.008 0 0 0-1.638-1.177l-1.862 2.59c-.38-.004-.744-.007-1.088-.007h-.13Zm.521 4.775h-1.32v4.631h2.222v.847h-2.618v1.078h2.618l.003.678c.36.026.714.163 1.01.407h.11v-1.085h2.694v-1.078h-2.695v-.847H16.8v-4.63h-1.276a8.59 8.59 0 0 0 .748-1.42L15.183 7.8a14.232 14.232 0 0 1-.814 1.804h-1.518l.693-.308a8.862 8.862 0 0 0-.814-1.408l-1.045.352c.297.396.572.847.825 1.364Zm-4.18 3.564.154-1.485h1.98V8.294h-3.2v.98H9.33v1.43H7.472l-.308 3.453h2.277c0 1.166-.044 1.925-.12 2.277-.078.352-.386.528-.936.528-.308 0-.616-.022-.902-.055l.297 1.067.062.005c.285.02.551.04.818.04 1.001-.067 1.562-.419 1.694-1.057.11-.638.176-1.903.176-3.795h-2.2Zm7.458.11v-.858h-1.254v.858h1.254Zm-2.376-.858v.858h-1.199v-.858h1.2Zm-1.199-.946h1.2v-.902h-1.2v.902Zm2.321 0v-.902h1.254v.902h-1.254Z" clip-rule="evenodd"/><path fill-rule="evenodd" d="M22.846 14.627a1 1 0 0 0-1.412.075l-5.091 5.703-2.216-2.275-.097-.086-.008-.005a1 1 0 0 0-1.322 1.493l2.963 3.041.093.083.007.005c.407.315 1 .27 1.354-.124l5.81-6.505.08-.102.005-.008a1 1 0 0 0-.166-1.295Z" clip-rule="evenodd"/></svg>`;

const ICON_DANMAKU_OFF = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="m8.085 4.891-.999-1.499a1.008 1.008 0 0 1 1.679-1.118l1.709 2.566c.54-.008 1.045-.012 1.515-.012h.13c.345 0 .707.003 1.088.007l1.862-2.59a1.008 1.008 0 0 1 1.637 1.177l-1.049 1.46c.788.02 1.631.046 2.53.078 1.958.069 3.468 1.6 3.74 3.507.088.613.13 2.158.16 3.276l.001.027c.01.333.017.63.025.856a.987.987 0 0 1-1.974.069c-.008-.23-.016-.539-.025-.881v-.002c-.028-1.103-.066-2.541-.142-3.065-.143-1.004-.895-1.78-1.854-1.813-2.444-.087-4.466-.13-6.064-.131-1.598 0-3.619.044-6.063.13a2.037 2.037 0 0 0-1.945 1.748c-.15 1.04-.225 2.341-.225 3.904 0 1.874.11 3.474.325 4.798.154.949.95 1.66 1.91 1.708a97.58 97.58 0 0 0 5.416.139.988.988 0 0 1 0 1.975c-2.196 0-3.61-.047-5.513-.141A4.012 4.012 0 0 1 2.197 17.7c-.236-1.446-.351-3.151-.351-5.116 0-1.64.08-3.035.245-4.184A4.013 4.013 0 0 1 5.92 4.96c.761-.027 1.483-.05 2.164-.069Zm4.436 4.707h-1.32v4.63h2.222v.848h-2.618v1.078h2.431a5.01 5.01 0 0 1 3.575-3.115V9.598h-1.276a8.59 8.59 0 0 0 .748-1.42l-1.089-.384a14.232 14.232 0 0 1-.814 1.804h-1.518l.693-.308a8.862 8.862 0 0 0-.814-1.408l-1.045.352c.297.396.572.847.825 1.364Zm-4.18 3.564.154-1.485h1.98V8.289h-3.2v.979h2.067v1.43H7.483l-.308 3.454h2.277c0 1.166-.044 1.925-.12 2.277-.078.352-.386.528-.936.528-.308 0-.616-.022-.902-.055l.297 1.067.062.004c.285.02.551.04.818.04 1.001-.066 1.562-.418 1.694-1.056.11-.638.176-1.903.176-3.795h-2.2Zm7.458.11v-.858h-1.254v.858H15.8Zm-2.376-.858v.858h-1.199v-.858h1.2Zm-1.199-.946h1.2v-.902h-1.2v.902Zm2.321 0v-.902H15.8v.902h-1.254Zm3.517 10.594a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-.002-1.502a2.5 2.5 0 0 1-2.217-3.657l3.326 3.398a2.49 2.49 0 0 1-1.109.259Zm2.5-2.5c0 .42-.103.815-.286 1.162l-3.328-3.401a2.5 2.5 0 0 1 3.614 2.239Z" clip-rule="evenodd"/></svg>`;

const ICON_SETTINGS = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="m15.645 4.881 1.06-1.473a.998.998 0 1 0-1.622-1.166L13.22 4.835a110.67 110.67 0 0 0-1.1-.007h-.131c-.47 0-.975.004-1.515.012L8.783 2.3A.998.998 0 0 0 7.12 3.408l.988 1.484c-.688.019-1.418.042-2.188.069a4.013 4.013 0 0 0-3.83 3.44c-.165 1.15-.245 2.545-.245 4.185 0 1.965.115 3.67.35 5.116a4.012 4.012 0 0 0 3.763 3.363c1.903.094 3.317.141 5.513.141a.988.988 0 0 0 0-1.975 97.58 97.58 0 0 1-5.416-.139 2.037 2.037 0 0 1-1.91-1.708c-.216-1.324-.325-2.924-.325-4.798 0-1.563.076-2.864.225-3.904.14-.977.96-1.713 1.945-1.747 2.444-.087 4.465-.13 6.063-.131 1.598 0 3.62.044 6.064.13.96.034 1.71.81 1.855 1.814.075.524.113 1.962.141 3.065v.002c.005.183.01.07.014-.038.004-.096.008-.189.011-.081a.987.987 0 1 0 1.974-.069c-.004-.105-.007-.009-.011.09-.002.056-.004.112-.007.135l-.002.01a.574.574 0 0 1-.005-.091v-.027c-.03-1.118-.073-2.663-.16-3.276-.273-1.906-1.783-3.438-3.74-3.507-.905-.032-1.752-.058-2.543-.079Zm-3.113 4.703h-1.307v4.643h2.2v.04l.651-1.234c.113-.215.281-.389.482-.509v-.11h.235c.137-.049.283-.074.433-.074h1.553V9.584h-1.264a8.5 8.5 0 0 0 .741-1.405l-1.078-.381c-.24.631-.501 1.23-.806 1.786h-1.503l.686-.305c-.228-.501-.5-.959-.806-1.394l-1.034.348c.294.392.566.839.817 1.35Zm-1.7 5.502h2.16l-.564 1.068h-1.595v-1.068Zm-2.498-1.863.152-1.561h1.96V8.289H7.277v.969h2.048v1.435h-1.84l-.306 3.51h2.254c0 1.155-.043 1.906-.12 2.255-.076.348-.38.523-.925.523-.305 0-.61-.022-.893-.055l.294 1.056.061.005c.282.02.546.039.81.039.991-.065 1.547-.414 1.677-1.046.11-.631.175-1.883.175-3.757H8.334Zm5.09-.8v.85h-1.188v-.85h1.187Zm-1.188-.955h1.187v-.893h-1.187v.893Zm2.322.007v-.893h1.241v.893h-1.241Zm.528 2.757a1.26 1.26 0 0 1 1.087-.627l4.003-.009a1.26 1.26 0 0 1 1.094.63l1.721 2.982c.226.39.225.872-.001 1.263l-1.743 3a1.26 1.26 0 0 1-1.086.628l-4.003.009a1.26 1.26 0 0 1-1.094-.63l-1.722-2.982a1.26 1.26 0 0 1 .002-1.263l1.742-3Zm1.967.858a1.26 1.26 0 0 0-1.08.614l-.903 1.513a1.26 1.26 0 0 0-.002 1.289l.885 1.492c.227.384.64.62 1.086.618l2.192-.005a1.26 1.26 0 0 0 1.08-.615l.904-1.518a1.26 1.26 0 0 0 .001-1.288l-.884-1.489a1.26 1.26 0 0 0-1.086-.616l-2.193.005Zm2.517 2.76a1.4 1.4 0 1 1-2.8 0 1.4 1.4 0 0 1 2.8 0Z" clip-rule="evenodd"/></svg>`;

const ICON_COPY = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`;

const ICON_SPEECH_ON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4.03v8.05A4.5 4.5 0 0 0 16.5 12zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;

const ICON_SPEECH_MUTE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.8 8.8 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z"/></svg>`;

const ICON_SPEECH_OFF = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3z"/></svg>`;

const ICON_DOWNLOAD = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a1 1 0 0 1 1 1v8.59l2.3-2.3a1 1 0 0 1 1.4 1.42l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.42l2.3 2.3V4a1 1 0 0 1 1-1zM5 19a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1z"/></svg>`;

class SettingsPanel {
  constructor({ settings, onChange, onClose }) {
    this.settings = settings;
    this.onChange = onChange;
    this.onClose = onClose;
    this.balloon = null;
    this.anchor = null;
    this.isOpen = false;
    this.boundReposition = () => this.reposition();
    this.boundOutsideClick = (e) => this.handleOutsideClick(e);
  }

  toggle(anchor) {
    if (this.isOpen && this.anchor === anchor) {
      this.close();
    } else {
      this.open(anchor);
    }
  }

  open(anchor) {
    this.close();
    this.anchor = anchor;
    this.isOpen = true;
    this.render();
    this.reposition();
    requestAnimationFrame(() => this.reposition());

    window.addEventListener('resize', this.boundReposition);
    document.addEventListener('fullscreenchange', this.boundReposition);
    document.addEventListener('webkitfullscreenchange', this.boundReposition);
    document.addEventListener('scroll', this.boundReposition, true);
    setTimeout(() => document.addEventListener('click', this.boundOutsideClick, true), 0);
  }

  close() {
    this.isOpen = false;
    this.anchor = null;
    this.balloon?.remove();
    this.balloon = null;

    window.removeEventListener('resize', this.boundReposition);
    document.removeEventListener('fullscreenchange', this.boundReposition);
    document.removeEventListener('webkitfullscreenchange', this.boundReposition);
    document.removeEventListener('scroll', this.boundReposition, true);
    document.removeEventListener('click', this.boundOutsideClick, true);
    this.onClose?.();
  }

  handleOutsideClick(e) {
    if (!this.balloon || !this.isOpen) return;
    if (this.balloon.contains(e.target)) return;
    if (this.anchor?.contains(e.target)) return;
    this.close();
  }

  reposition() {
    if (!this.balloon || !this.anchor) return;

    const mountTarget = getFullscreenElement() || document.body;
    if (this.balloon.parentElement !== mountTarget) {
      mountTarget.appendChild(this.balloon);
    }

    const rect = this.anchor.getBoundingClientRect();
    const width = 300;
    const gap = 8;
    const height = this.balloon.offsetHeight;

    let left = rect.right - width;
    let top = rect.top - height - gap;

    left = clamp(left, 8, window.innerWidth - width - 8);
    if (top < 8) {
      top = rect.bottom + gap;
    }

    Object.assign(this.balloon.style, {
      position: 'fixed',
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      zIndex: '100000',
    });
  }

  updateSetting(key, value) {
    this.settings[key] = value;
    saveSettings(this.settings);
    this.onChange(this.settings);
  }

  createToggle(label, key, options = {}) {
    const row = document.createElement('div');
    row.className = 'tbc-balloon-row tbc-balloon-row--toggle';

    const labelEl = document.createElement('span');
    labelEl.className = 'tbc-balloon-label';
    labelEl.textContent = label;

    const switchWrap = document.createElement('label');
    switchWrap.className = 'tbc-switch';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = !!this.settings[key];

    const slider = document.createElement('span');
    slider.className = 'tbc-switch-slider';

    input.addEventListener('change', () => {
      this.updateSetting(key, input.checked);
      options.onChange?.(input.checked);
    });

    switchWrap.append(input, slider);
    row.append(labelEl, switchWrap);
    return row;
  }

  createHint(text) {
    const hint = document.createElement('p');
    hint.className = 'tbc-setting-hint';
    hint.textContent = text;
    return hint;
  }

  syncTranslateDependentRows() {
    const enabled = !!this.settings.translateEnabled;
    if (this.translateInChatRow) this.translateInChatRow.hidden = !enabled;
    if (this.translateInChatHint) this.translateInChatHint.hidden = !enabled;
  }

  createRange(label, key, min, max, step, format) {
    const row = document.createElement('div');
    row.className = 'tbc-balloon-row tbc-balloon-row--field';

    const header = document.createElement('div');
    header.className = 'tbc-balloon-field-header';

    const labelEl = document.createElement('span');
    labelEl.className = 'tbc-balloon-label';
    labelEl.textContent = label;

    const valueSpan = document.createElement('span');
    valueSpan.className = 'tbc-balloon-value';
    valueSpan.textContent = format(this.settings[key]);

    header.append(labelEl, valueSpan);

    const input = document.createElement('input');
    input.type = 'range';
    input.className = 'tbc-balloon-range';
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.value = String(this.settings[key]);

    input.addEventListener('input', () => {
      const val = Number(input.value);
      valueSpan.textContent = format(val);
      this.updateSetting(key, val);
    });

    row.append(header, input);
    return row;
  }

  createSelect(label, key, options) {
    const row = document.createElement('div');
    row.className = 'tbc-balloon-row tbc-balloon-row--field';

    const labelEl = document.createElement('div');
    labelEl.className = 'tbc-balloon-label';
    labelEl.textContent = label;

    const select = document.createElement('select');
    select.className = 'tbc-balloon-select';
    for (const opt of options) {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.label;
      if (opt.value === this.settings[key]) option.selected = true;
      select.appendChild(option);
    }

    select.addEventListener('change', () => {
      this.updateSetting(key, select.value);
    });

    row.append(labelEl, select);
    return row;
  }

  createKeywordBlock() {
    const row = document.createElement('div');
    row.className = 'tbc-balloon-row tbc-balloon-row--field';

    const labelEl = document.createElement('div');
    labelEl.className = 'tbc-balloon-label';
    labelEl.textContent = t('blockKeywords');

    const hint = document.createElement('div');
    hint.className = 'tbc-keyword-hint';
    hint.textContent = t('blockKeywordsHint');

    const form = document.createElement('div');
    form.className = 'tbc-keyword-form';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'tbc-keyword-input';
    input.maxLength = 40;
    input.placeholder = t('blockKeywordsPlaceholder');
    input.setAttribute('aria-label', t('blockKeywords'));

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'tbc-keyword-add';
    addBtn.textContent = t('blockKeywordsAdd');

    const list = document.createElement('div');
    list.className = 'tbc-keyword-list';

    const commit = () => {
      const incoming = input.value.split(/[,，]/).map((item) => item.trim()).filter(Boolean);
      if (!incoming.length) return;
      const next = sanitizeBlockedKeywords([...(this.settings.blockedKeywords || []), ...incoming]);
      input.value = '';
      this.updateSetting('blockedKeywords', next);
      this.renderKeywordList(list);
    };

    addBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      commit();
    });
    input.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') {
        e.preventDefault();
        commit();
      }
    });

    form.append(input, addBtn);
    row.append(labelEl, hint, form, list);
    this.renderKeywordList(list);
    return row;
  }

  renderKeywordList(list) {
    list.replaceChildren();
    const keywords = this.settings.blockedKeywords || [];
    if (!keywords.length) {
      const empty = document.createElement('div');
      empty.className = 'tbc-keyword-empty';
      empty.textContent = t('blockKeywordsEmpty');
      list.appendChild(empty);
      return;
    }

    keywords.forEach((keyword, index) => {
      const chip = document.createElement('span');
      chip.className = 'tbc-keyword';

      const text = document.createElement('span');
      text.className = 'tbc-keyword-text';
      text.textContent = keyword;
      text.title = keyword;

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'tbc-keyword-remove';
      removeBtn.setAttribute('aria-label', `${t('blockKeywordsRemove')} ${keyword}`);
      removeBtn.textContent = '×';
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const next = (this.settings.blockedKeywords || []).filter((_, itemIndex) => itemIndex !== index);
        this.updateSetting('blockedKeywords', next);
        this.renderKeywordList(list);
      });

      chip.append(text, removeBtn);
      list.appendChild(chip);
    });
  }

  createDivider() {
    const div = document.createElement('div');
    div.className = 'tbc-balloon-divider';
    return div;
  }

  render() {
    this.balloon = document.createElement('div');
    this.balloon.className = 'tbc-balloon';
    this.balloon.setAttribute('role', 'dialog');
    this.balloon.setAttribute('aria-label', t('panelTitle'));

    const header = document.createElement('div');
    header.className = 'tbc-balloon-header';

    const title = document.createElement('div');
    title.className = 'tbc-balloon-title';
    title.textContent = t('panelTitle');

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'tbc-balloon-close';
    closeBtn.setAttribute('aria-label', t('panelClose'));
    closeBtn.textContent = t('panelClose');
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.close();
    });

    header.append(title, closeBtn);

    const body = document.createElement('div');
    body.className = 'tbc-balloon-body';

    body.append(
      this.createRange(t('scrollSpeed'), 'speed', 1, 10, 1, (v) => String(v)),
      this.createRange(t('fontSize'), 'fontSize', 14, 40, 1, (v) => `${v}px`),
      this.createRange(t('danmakuOpacity'), 'danmakuOpacity', 10, 100, 5, (v) => `${v}%`),
      this.createSelect(t('fontFamily'), 'fontFamily', getFontOptions()),
      this.createSelect(t('scrollArea'), 'scrollArea', getScrollAreaOptions()),
      this.createDivider(),
      this.createToggle(t('superchatPinned'), 'superchatPinned'),
      this.createSelect(t('superchatPosition'), 'superchatPosition', getSuperchatPositionOptions()),
      this.createRange(t('superchatDuration'), 'superchatDuration', 2, 15, 1, (v) => `${v} ${t('speechSeconds')}`),
      this.createSelect(t('superchatAnimation'), 'superchatAnimation', getSuperchatAnimationOptions()),
      this.createDivider(),
      this.createToggle(t('translateEnable'), 'translateEnabled', {
        onChange: () => this.syncTranslateDependentRows(),
      }),
      this.createSelect(t('translateProvider'), 'translateProvider', getTranslateProviderOptions()),
      this.createSelect(t('translateTarget'), 'translateTargetLang', getTranslateLangOptions()),
      this.createRange(t('translateSpeed'), 'translateSpeed', 1, 10, 1, (v) => `${v} ${t('translateSpeedUnit')}`),
    );

    this.translateInChatRow = this.createToggle(t('translateInChat'), 'translateInChat');
    this.translateInChatHint = this.createHint(t('translateInChatHint'));
    body.append(
      this.translateInChatRow,
      this.translateInChatHint,
      this.createDivider(),
      this.createKeywordBlock(),
    );
    this.syncTranslateDependentRows();

    this.balloon.append(header, body);
    this.balloon.addEventListener('click', (e) => e.stopPropagation());

    const mountTarget = getFullscreenElement() || document.body;
    mountTarget.appendChild(this.balloon);
  }
}

class SpeechPanel {
  constructor({ settings, onChange, onClose }) {
    this.settings = settings;
    this.onChange = onChange;
    this.onClose = onClose;
    this.balloon = null;
    this.anchor = null;
    this.isOpen = false;
    this.langSelect = null;
    this.voiceSelect = null;
    this.boundReposition = () => this.reposition();
    this.boundOutsideClick = (e) => this.handleOutsideClick(e);
    this.boundVoices = () => this.fillVoices();
  }

  toggle(anchor) {
    if (this.isOpen && this.anchor === anchor) this.close();
    else this.open(anchor);
  }

  open(anchor) {
    this.close();
    this.anchor = anchor;
    this.isOpen = true;
    this.render();
    this.reposition();
    requestAnimationFrame(() => this.reposition());
    window.speechSynthesis?.addEventListener('voiceschanged', this.boundVoices);

    window.addEventListener('resize', this.boundReposition);
    document.addEventListener('fullscreenchange', this.boundReposition);
    document.addEventListener('webkitfullscreenchange', this.boundReposition);
    document.addEventListener('scroll', this.boundReposition, true);
    setTimeout(() => document.addEventListener('click', this.boundOutsideClick, true), 0);
  }

  close() {
    const wasOpen = this.isOpen;
    this.isOpen = false;
    this.anchor = null;
    this.balloon?.remove();
    this.balloon = null;
    this.langSelect = null;
    this.voiceSelect = null;
    window.speechSynthesis?.removeEventListener('voiceschanged', this.boundVoices);
    window.removeEventListener('resize', this.boundReposition);
    document.removeEventListener('fullscreenchange', this.boundReposition);
    document.removeEventListener('webkitfullscreenchange', this.boundReposition);
    document.removeEventListener('scroll', this.boundReposition, true);
    document.removeEventListener('click', this.boundOutsideClick, true);
    if (wasOpen) this.onClose?.();
  }

  handleOutsideClick(e) {
    if (!this.balloon || !this.isOpen) return;
    if (this.balloon.contains(e.target)) return;
    if (this.anchor?.contains(e.target)) return;
    this.close();
  }

  reposition() {
    if (!this.balloon || !this.anchor) return;

    const mountTarget = getFullscreenElement() || document.body;
    if (this.balloon.parentElement !== mountTarget) {
      mountTarget.appendChild(this.balloon);
    }

    const rect = this.anchor.getBoundingClientRect();
    const width = 320;
    const gap = 8;
    const height = this.balloon.offsetHeight;
    let left = rect.right - width;
    let top = rect.top - height - gap;

    left = clamp(left, 8, window.innerWidth - width - 8);
    if (top < 8) top = rect.bottom + gap;

    Object.assign(this.balloon.style, {
      position: 'fixed',
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      zIndex: '100000',
    });
  }

  updateSetting(key, value) {
    this.settings[key] = value;
    saveSettings(this.settings);
    this.onChange(this.settings);
    if ((key === 'speechEnabled' && !value) || (key === 'speechVolume' && Number(value) <= 0)) {
      cancelSpeech();
    }
  }

  createToggle(label, key) {
    const row = document.createElement('div');
    row.className = 'tbc-balloon-row tbc-balloon-row--toggle';

    const labelEl = document.createElement('span');
    labelEl.className = 'tbc-balloon-label';
    labelEl.textContent = label;

    const switchWrap = document.createElement('label');
    switchWrap.className = 'tbc-switch';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = !!this.settings[key];

    const slider = document.createElement('span');
    slider.className = 'tbc-switch-slider';

    input.addEventListener('change', () => {
      this.updateSetting(key, input.checked);
    });

    switchWrap.append(input, slider);
    row.append(labelEl, switchWrap);
    return row;
  }

  render() {
    this.balloon = document.createElement('div');
    this.balloon.className = 'tbc-balloon tbc-speech-panel';

    const header = document.createElement('div');
    header.className = 'tbc-balloon-header';

    const title = document.createElement('div');
    title.className = 'tbc-balloon-title';
    title.textContent = t('speechPanelTitle');

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'tbc-balloon-close';
    closeBtn.textContent = t('panelClose');
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.close();
    });
    header.append(title, closeBtn);

    const body = document.createElement('div');
    body.className = 'tbc-balloon-body tbc-balloon-body--speech';

    if (!speechSupported()) {
      const note = document.createElement('p');
      note.className = 'tbc-speech-note';
      note.textContent = t('speechUnsupported');
      body.appendChild(note);
      this.balloon.append(header, body);
      (getFullscreenElement() || document.body).appendChild(this.balloon);
      return;
    }

    body.append(
      this.createToggle(t('speechEnable'), 'speechEnabled'),
      this.createTest(),
      this.createDivider(),
      this.createRange(t('speechVolume'), 'speechVolume', 0, 100, 5, (v) => `${v}%`),
      this.createRange(t('speechPitch'), 'speechPitch', 0, 200, 10, (v) => `${v}%`),
      this.createVoices(),
      this.createDivider(),
      this.createRange(t('speechRate'), 'speechRate', 50, 200, 10, (v) => `${v}%`),
      this.createToggle(t('speechPace'), 'speechPace'),
      this.createRange(t('speechMaxSeconds'), 'speechMaxSeconds', 1, 15, 1, (v) => `${v} ${t('speechSeconds')}`),
      this.createHint(t('speechPaceHint')),
      this.createDivider(),
      this.createRange(t('speechBuffer'), 'speechBuffer', 1, 25, 1, (v) => String(v)),
      this.createHint(t('speechBufferHint')),
    );

    this.balloon.append(header, body);
    this.balloon.addEventListener('click', (e) => e.stopPropagation());
    this.balloon.addEventListener('pointerdown', (e) => e.stopPropagation());
    (getFullscreenElement() || document.body).appendChild(this.balloon);
    this.fillVoices();
  }

  createTest() {
    const row = document.createElement('div');
    row.className = 'tbc-balloon-row tbc-balloon-row--field';

    const label = document.createElement('span');
    label.className = 'tbc-balloon-label';
    label.textContent = t('speechTest');

    const controls = document.createElement('div');
    controls.className = 'tbc-speech-test';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'tbc-balloon-input';
    input.value = t('speechTestText');

    const play = document.createElement('button');
    play.type = 'button';
    play.className = 'tbc-speech-play';
    play.textContent = '\u25B6';
    play.setAttribute('aria-label', t('speechPlay'));
    play.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      previewSpeech(input.value, false);
    });

    const fast = document.createElement('button');
    fast.type = 'button';
    fast.className = 'tbc-speech-play';
    fast.textContent = '▶▶';
    fast.setAttribute('aria-label', t('speechPlayFast'));
    fast.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      previewSpeech(input.value, true);
    });

    controls.append(input, play, fast);
    row.append(label, controls);
    return row;
  }

  createVoices() {
    const row = document.createElement('div');
    row.className = 'tbc-balloon-row tbc-balloon-row--field';

    const langLabel = document.createElement('span');
    langLabel.className = 'tbc-balloon-label';
    langLabel.textContent = t('speechVoiceLang');

    this.langSelect = document.createElement('select');
    this.langSelect.className = 'tbc-balloon-select';
    this.langSelect.addEventListener('change', () => {
      const lang = this.langSelect.value;
      this.updateSetting('speechLang', lang);
      const voices = this.voicesForLang(lang);
      const next = voices[0]?.voiceURI || '';
      this.updateSetting('speechVoice', next);
      this.fillVoices();
    });

    const voiceLabel = document.createElement('span');
    voiceLabel.className = 'tbc-balloon-label';
    voiceLabel.textContent = t('speechVoice');

    this.voiceSelect = document.createElement('select');
    this.voiceSelect.className = 'tbc-balloon-select';
    this.voiceSelect.addEventListener('change', () => {
      this.updateSetting('speechVoice', this.voiceSelect.value);
    });

    row.append(langLabel, this.langSelect, voiceLabel, this.voiceSelect);
    return row;
  }

  voicesForLang(lang) {
    const voices = listSpeechVoices();
    if (!lang) return voices;
    const wanted = lang.toLowerCase();
    return voices.filter((voice) => voice.lang.toLowerCase() === wanted);
  }

  fillVoices() {
    if (!this.langSelect || !this.voiceSelect) return;
    const voices = listSpeechVoices();
    const langs = [];
    for (const voice of voices) {
      if (voice.lang && !langs.includes(voice.lang)) langs.push(voice.lang);
    }
    langs.sort();

    const lang = this.settings.speechLang || '';
    this.langSelect.replaceChildren();
    this.langSelect.appendChild(new Option(t('speechVoiceDefault'), ''));
    for (const code of langs) {
      this.langSelect.appendChild(new Option(code, code));
    }
    this.langSelect.value = langs.includes(lang) ? lang : '';

    const visible = this.voicesForLang(this.langSelect.value);
    this.voiceSelect.replaceChildren();
    this.voiceSelect.appendChild(new Option(t('speechVoiceDefault'), ''));
    for (const voice of visible) {
      const option = new Option(`${voice.name} (${voice.lang})`, voice.voiceURI);
      this.voiceSelect.appendChild(option);
    }
    const selected = this.settings.speechVoice || '';
    this.voiceSelect.value = [...this.voiceSelect.options].some((option) => option.value === selected) ? selected : '';
  }

  createRange(label, key, min, max, step, format) {
    const row = document.createElement('div');
    row.className = 'tbc-balloon-row tbc-balloon-row--field';

    const header = document.createElement('div');
    header.className = 'tbc-balloon-field-header';
    const labelEl = document.createElement('span');
    labelEl.className = 'tbc-balloon-label';
    labelEl.textContent = label;
    const valueSpan = document.createElement('span');
    valueSpan.className = 'tbc-balloon-value';
    valueSpan.textContent = format(this.settings[key]);
    header.append(labelEl, valueSpan);

    const input = document.createElement('input');
    input.type = 'range';
    input.className = 'tbc-balloon-range';
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.value = String(this.settings[key]);
    input.addEventListener('input', () => {
      const val = Number(input.value);
      valueSpan.textContent = format(val);
      this.updateSetting(key, val);
    });

    row.append(header, input);
    return row;
  }

  createSection(text) {
    const el = document.createElement('div');
    el.className = 'tbc-balloon-section';
    el.textContent = text;
    return el;
  }

  createHint(text) {
    const el = document.createElement('p');
    el.className = 'tbc-speech-note';
    el.textContent = text;
    return el;
  }

  createDivider() {
    const el = document.createElement('div');
    el.className = 'tbc-balloon-divider';
    return el;
  }
}

class HistoryPanel {
  constructor({ onClose }) {
    this.onClose = onClose;
    this.balloon = null;
    this.anchor = null;
    this.isOpen = false;
    this.job = 0;
    this.loadToken = 0;
    this.state = 'idle';
    this.paused = false;
    this.lastCount = 0;
    this.video = null;
    this.videoId = '';
    this.mode = null;
    this.duration = 0;
    this.start = 0;
    this.end = 0;
    this.boundReposition = () => this.reposition();
    this.boundOutsideClick = (event) => this.handleOutsideClick(event);
  }

  toggle(anchor) {
    if (this.isOpen && this.anchor === anchor) this.close();
    else this.open(anchor);
  }

  open(anchor) {
    this.close();
    this.anchor = anchor;
    this.isOpen = true;
    this.render();
    this.reposition();
    requestAnimationFrame(() => this.reposition());
    window.addEventListener('resize', this.boundReposition);
    document.addEventListener('fullscreenchange', this.boundReposition);
    document.addEventListener('webkitfullscreenchange', this.boundReposition);
    document.addEventListener('scroll', this.boundReposition, true);
    setTimeout(() => document.addEventListener('click', this.boundOutsideClick, true), 0);
    this.loadVideo();
  }

  close() {
    const wasOpen = this.isOpen;
    this.job += 1;
    this.loadToken += 1;
    this.state = 'idle';
    this.paused = false;
    this.lastCount = 0;
    this.isOpen = false;
    this.anchor = null;
    this.balloon?.remove();
    this.balloon = null;
    window.removeEventListener('resize', this.boundReposition);
    document.removeEventListener('fullscreenchange', this.boundReposition);
    document.removeEventListener('webkitfullscreenchange', this.boundReposition);
    document.removeEventListener('scroll', this.boundReposition, true);
    document.removeEventListener('click', this.boundOutsideClick, true);
    if (wasOpen) this.onClose?.();
  }

  handleOutsideClick(event) {
    if (!this.balloon || !this.isOpen) return;
    if (this.balloon.contains(event.target)) return;
    if (this.anchor?.contains(event.target)) return;
    if (this.state !== 'idle') return;
    this.close();
  }

  reposition() {
    if (!this.balloon || !this.anchor) return;
    const mountTarget = getFullscreenElement() || document.body;
    if (this.balloon.parentElement !== mountTarget) mountTarget.appendChild(this.balloon);

    const rect = this.anchor.getBoundingClientRect();
    const width = 360;
    const gap = 8;
    const height = this.balloon.offsetHeight;
    let left = rect.right - width;
    let top = rect.top - height - gap;
    left = clamp(left, 8, window.innerWidth - width - 8);
    if (top < 8) top = rect.bottom + gap;
    Object.assign(this.balloon.style, {
      position: 'fixed',
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      zIndex: '100000',
    });
  }

  setStatus(text, kind) {
    if (!this.statusEl) return;
    this.statusEl.textContent = text || '';
    this.statusEl.classList.toggle('tbc-history-status--error', kind === 'error');
    this.statusEl.classList.toggle('tbc-history-status--ok', kind === 'ok');
  }

  setDownloadState(state) {
    this.state = state;
    const idle = state === 'idle';
    const running = state === 'running';
    const paused = state === 'paused';
    this.downloadBtn.hidden = !idle;
    this.pauseBtn.hidden = !running;
    this.resumeBtn.hidden = !paused;
    this.cancelBtn.hidden = idle;
    this.downloadBtn.disabled = !this.video;
    for (const input of this.balloon.querySelectorAll('input, select')) {
      if (input.closest('.tbc-history-actions')) continue;
      input.disabled = !idle || (input.type === 'range' && !this.duration);
    }
  }

  async loadVideo() {
    const token = ++this.loadToken;
    this.video = null;
    this.videoId = currentVodId();
    this.mode = null;
    this.duration = 0;
    this.metaEl.textContent = '';
    this.setDownloadState('idle');
    this.downloadBtn.disabled = true;

    if (!this.videoId) {
      const liveInfo = readLiveChannelInfo();
      if (token !== this.loadToken) return;
      if (!liveInfo) {
        this.syncRange();
        this.setStatus(t('historyNeedSource'), 'error');
        return;
      }
      this.mode = 'live';
      this.video = liveInfo;
      this.duration = 0;
      this.start = 0;
      this.end = 0;
      this.metaEl.textContent = liveInfo.channel || liveInfo.login;
      this.metaEl.title = liveInfo.title || liveInfo.login;
      this.syncRange();
      this.setDownloadState('idle');
      this.setStatus(t('historyLiveReady'), '');
      return;
    }

    this.mode = 'vod';
    this.setStatus(t('historyLoading'), '');
    try {
      const info = await fetchVodInfo(this.videoId);
      if (token !== this.loadToken) return;
      if (!info) {
        this.syncRange();
        this.setStatus(t('historyMissing'), 'error');
        return;
      }
      this.video = info;
      this.duration = info.lengthSeconds || playerDurationSeconds();
      this.start = 0;
      this.end = this.duration;
      this.metaEl.textContent = info.title || info.id;
      this.metaEl.title = info.title || '';
      this.syncRange();
      this.setDownloadState('idle');
      this.setStatus('', '');
    } catch {
      if (token !== this.loadToken) return;
      this.syncRange();
      this.setStatus(t('historyFailed'), 'error');
    }
  }

  syncRange() {
    if (this.mode === 'live') {
      this.rangeHeader.hidden = true;
      this.rangeWrap.hidden = true;
      this.rangeUnknown.hidden = true;
      this.liveHint.hidden = false;
      return;
    }
    this.rangeHeader.hidden = false;
    this.liveHint.hidden = true;
    const known = this.duration > 0;
    this.rangeWrap.hidden = !known;
    this.rangeUnknown.hidden = known || !this.video;
    if (!known) return;
    this.startInput.max = String(this.duration);
    this.endInput.max = String(this.duration);
    this.startInput.value = String(this.start);
    this.endInput.value = String(this.end);
    this.updateRange();
  }

  updateRange() {
    if (!this.duration) return;
    const startPct = (this.start / this.duration) * 100;
    const endPct = (this.end / this.duration) * 100;
    this.rangeFill.style.left = `${startPct}%`;
    this.rangeFill.style.width = `${Math.max(0, endPct - startPct)}%`;
    this.rangeLabel.textContent = `${formatChatClock(this.start)} – ${formatChatClock(this.end)}`;
  }

  selectedFilters() {
    return {
      keywords: this.keywordInput.value,
      usernames: this.usernameInput.value,
      includeSuperchat: this.superchatInput.checked,
      format: this.formatSelect.value,
    };
  }

  pauseDownload() {
    if (this.state !== 'running') return;
    this.paused = true;
    this.setDownloadState('paused');
    this.setStatus(fill('historyPaused', { count: this.lastCount }), '');
    this.reposition();
  }

  resumeDownload() {
    if (this.state !== 'paused') return;
    this.paused = false;
    this.setDownloadState('running');
    this.setStatus(fill('historyProgress', { count: this.lastCount }), '');
  }

  cancelDownload() {
    if (this.state === 'idle') return;
    this.job += 1;
    this.paused = false;
    this.setDownloadState('idle');
    this.setStatus(t('historyCancelled'), '');
  }

  async startDownload() {
    if (!this.video || this.state !== 'idle') return;
    const token = ++this.job;
    const filters = this.selectedFilters();
    this.paused = false;
    this.lastCount = 0;
    this.setDownloadState('running');
    this.setStatus(fill('historyProgress', { count: 0 }), '');

    try {
      const progress = ({ count }) => {
        if (token !== this.job) return;
        this.lastCount = count;
        if (!this.paused) {
          this.setStatus(fill('historyProgress', { count }), '');
          this.reposition();
        }
      };
      const controls = {
        keywords: filters.keywords,
        usernames: filters.usernames,
        includeSuperchat: filters.includeSuperchat,
        shouldCancel: () => token !== this.job,
        shouldPause: () => token === this.job && this.paused,
        onProgress: progress,
      };
      const result = this.mode === 'live'
        ? await collectLiveDomChat(controls)
        : await downloadVodChat({
          videoId: this.video.id,
          start: this.duration ? this.start : 0,
          end: this.duration ? this.end : Infinity,
          ...controls,
        });
      if (token !== this.job) return;
      if (!result.comments.length) {
        this.setStatus(result.scanned ? t('historyNoMatch') : t('historyEmpty'), 'error');
        return;
      }
      const file = buildChatExport(filters.format, this.video, result);
      saveChatFile(file.filename, file.text, file.mime);
      this.setStatus(fill('historyDone', { count: result.comments.length }), 'ok');
    } catch (error) {
      if (token !== this.job || error?.code === 'cancel') return;
      const missingKey = this.mode === 'live' ? 'historyEmpty' : 'historyMissing';
      this.setStatus(error?.code === 'missing' ? t(missingKey) : t('historyFailed'), 'error');
    } finally {
      if (token === this.job) {
        this.paused = false;
        this.setDownloadState('idle');
      }
    }
  }

  render() {
    this.balloon = document.createElement('div');
    this.balloon.className = 'tbc-balloon tbc-history-panel';

    const header = document.createElement('div');
    header.className = 'tbc-balloon-header';
    const title = document.createElement('div');
    title.className = 'tbc-balloon-title';
    title.textContent = t('historyPanelTitle');
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'tbc-balloon-close';
    closeBtn.textContent = t('panelClose');
    closeBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      this.close();
    });
    header.append(title, closeBtn);

    const body = document.createElement('div');
    body.className = 'tbc-balloon-body tbc-balloon-body--history';
    this.metaEl = document.createElement('p');
    this.metaEl.className = 'tbc-history-meta';
    body.append(
      this.metaEl,
      this.createTextField('historyKeyword', 'keywordInput', 'historyKeywordPlaceholder', 'historyKeywordHint'),
      this.createTextField('historyUsername', 'usernameInput', 'historyUsernamePlaceholder', 'historyUsernameHint'),
      this.createSuperchatToggle(),
      this.createRangeField(),
      this.createFormatField(),
      this.createActions(),
    );

    this.balloon.append(header, body);
    this.balloon.addEventListener('click', (event) => event.stopPropagation());
    this.balloon.addEventListener('pointerdown', (event) => event.stopPropagation());
    (getFullscreenElement() || document.body).appendChild(this.balloon);
  }

  createTextField(labelKey, field, placeholderKey, hintKey) {
    const row = document.createElement('div');
    row.className = 'tbc-balloon-row tbc-balloon-row--field';
    const label = document.createElement('span');
    label.className = 'tbc-balloon-label';
    label.textContent = t(labelKey);
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'tbc-balloon-input';
    input.placeholder = t(placeholderKey);
    input.autocomplete = 'off';
    this[field] = input;
    const hint = document.createElement('p');
    hint.className = 'tbc-history-hint';
    hint.textContent = t(hintKey);
    row.append(label, input, hint);
    return row;
  }

  createSuperchatToggle() {
    const row = document.createElement('div');
    row.className = 'tbc-balloon-row tbc-balloon-row--field';
    const line = document.createElement('div');
    line.className = 'tbc-balloon-row--toggle';
    line.style.padding = '0';
    const label = document.createElement('span');
    label.className = 'tbc-balloon-label';
    label.textContent = t('historyIncludeSuperchat');
    const switchWrap = document.createElement('label');
    switchWrap.className = 'tbc-switch';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = true;
    const slider = document.createElement('span');
    slider.className = 'tbc-switch-slider';
    switchWrap.append(input, slider);
    line.append(label, switchWrap);
    const hint = document.createElement('p');
    hint.className = 'tbc-history-hint';
    hint.textContent = t('historyIncludeSuperchatHint');
    this.superchatInput = input;
    row.append(line, hint);
    return row;
  }

  createRangeField() {
    const row = document.createElement('div');
    row.className = 'tbc-balloon-row tbc-balloon-row--field';
    this.rangeHeader = document.createElement('div');
    this.rangeHeader.className = 'tbc-balloon-field-header';
    const label = document.createElement('span');
    label.className = 'tbc-balloon-label';
    label.textContent = t('historyRange');
    this.rangeLabel = document.createElement('span');
    this.rangeLabel.className = 'tbc-balloon-value';
    this.rangeHeader.append(label, this.rangeLabel);

    this.rangeWrap = document.createElement('div');
    this.rangeWrap.className = 'tbc-history-range';
    this.rangeWrap.hidden = true;
    const track = document.createElement('div');
    track.className = 'tbc-history-track';
    this.rangeFill = document.createElement('div');
    this.rangeFill.className = 'tbc-history-fill';
    track.appendChild(this.rangeFill);

    this.startInput = document.createElement('input');
    this.startInput.type = 'range';
    this.startInput.min = '0';
    this.startInput.value = '0';
    this.startInput.addEventListener('input', () => {
      this.start = Math.min(Number(this.startInput.value), this.end);
      this.startInput.value = String(this.start);
      this.updateRange();
    });
    this.endInput = document.createElement('input');
    this.endInput.type = 'range';
    this.endInput.min = '0';
    this.endInput.value = '0';
    this.endInput.addEventListener('input', () => {
      this.end = Math.max(Number(this.endInput.value), this.start);
      this.endInput.value = String(this.end);
      this.updateRange();
    });
    this.rangeWrap.append(track, this.startInput, this.endInput);

    this.rangeUnknown = document.createElement('p');
    this.rangeUnknown.className = 'tbc-history-hint';
    this.rangeUnknown.textContent = t('historyRangeUnknown');
    this.rangeUnknown.hidden = true;
    this.liveHint = document.createElement('p');
    this.liveHint.className = 'tbc-history-hint';
    this.liveHint.textContent = t('historyLiveHint');
    this.liveHint.hidden = true;
    row.append(this.rangeHeader, this.rangeWrap, this.rangeUnknown, this.liveHint);
    return row;
  }

  createFormatField() {
    const row = document.createElement('div');
    row.className = 'tbc-balloon-row tbc-balloon-row--field';
    const label = document.createElement('span');
    label.className = 'tbc-balloon-label';
    label.textContent = t('historyFormat');
    this.formatSelect = document.createElement('select');
    this.formatSelect.className = 'tbc-balloon-select';
    for (const [value, key] of [['json', 'historyFormatJson'], ['csv', 'historyFormatCsv'], ['txt', 'historyFormatTxt']]) {
      this.formatSelect.appendChild(new Option(t(key), value));
    }
    row.append(label, this.formatSelect);
    return row;
  }

  createActionButton(className, label, onClick) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = label;
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      onClick();
    });
    return button;
  }

  createActions() {
    const row = document.createElement('div');
    row.className = 'tbc-history-actions';
    const buttons = document.createElement('div');
    buttons.className = 'tbc-history-buttons';

    this.downloadBtn = this.createActionButton('tbc-history-download', t('historyDownload'), () => this.startDownload());
    this.pauseBtn = this.createActionButton('tbc-history-pause', t('historyPause'), () => this.pauseDownload());
    this.resumeBtn = this.createActionButton('tbc-history-resume', t('historyResume'), () => this.resumeDownload());
    this.cancelBtn = this.createActionButton('tbc-history-cancel', t('historyCancel'), () => this.cancelDownload());
    this.pauseBtn.hidden = true;
    this.resumeBtn.hidden = true;
    this.cancelBtn.hidden = true;
    this.downloadBtn.disabled = true;

    this.statusEl = document.createElement('p');
    this.statusEl.className = 'tbc-history-status';
    buttons.append(this.downloadBtn, this.pauseBtn, this.resumeBtn, this.cancelBtn);
    row.append(buttons, this.statusEl);
    return row;
  }
}

class ControlButton {
  constructor({ onToggleDanmaku, onTogglePanel, onToggleSpeech, onToggleHistory, getSettings, isPanelOpen, isSpeechPanelOpen, isHistoryPanelOpen }) {
    this.onToggleDanmaku = onToggleDanmaku;
    this.onTogglePanel = onTogglePanel;
    this.onToggleSpeech = onToggleSpeech;
    this.onToggleHistory = onToggleHistory;
    this.getSettings = getSettings;
    this.isPanelOpen = isPanelOpen;
    this.isSpeechPanelOpen = isSpeechPanelOpen;
    this.isHistoryPanelOpen = isHistoryPanelOpen;
    this.wrap = null;
    this.danmakuBtn = null;
    this.speechBtn = null;
    this.historyBtn = null;
    this.settingsBtn = null;
    this.controlsGroup = null;
    this.retryTimer = null;
  }

  createBtn(className, label, html) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `tbc-control-btn ${className}`;
    btn.setAttribute('aria-label', label);
    btn.innerHTML = html;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    return btn;
  }

  async mount() {
    this.controlsGroup = await waitForElement(SELECTORS.playerControls);
    if (!this.controlsGroup || this.controlsGroup.querySelector('.tbc-controls-wrap')) return;

    this.wrap = document.createElement('div');
    this.wrap.className = 'tbc-controls-wrap';

    this.danmakuBtn = this.createBtn('tbc-danmaku-btn', t('danmakuToggle'), `
      <span class="tbc-icon tbc-icon-on">${ICON_DANMAKU_ON}</span>
      <span class="tbc-icon tbc-icon-off">${ICON_DANMAKU_OFF}</span>
    `);
    this.danmakuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onToggleDanmaku();
    });

    this.speechBtn = this.createBtn('tbc-speech-btn', t('speechToggle'), `
      <span class="tbc-icon tbc-icon-on">${ICON_SPEECH_ON}</span>
      <span class="tbc-icon tbc-icon-mute">${ICON_SPEECH_MUTE}</span>
      <span class="tbc-icon tbc-icon-off">${ICON_SPEECH_OFF}</span>
    `);
    this.speechBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onToggleSpeech(this.speechBtn);
    });

    this.settingsBtn = this.createBtn('tbc-settings-btn', t('settingsToggle'), ICON_SETTINGS);
    this.settingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onTogglePanel(this.settingsBtn);
    });

    this.historyBtn = this.createBtn('tbc-history-btn', t('historyToggle'), ICON_DOWNLOAD);
    this.historyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onToggleHistory(this.historyBtn);
    });

    this.wrap.append(this.danmakuBtn, this.settingsBtn, this.speechBtn, this.historyBtn);
    this.controlsGroup.appendChild(this.wrap);
    this.updateDanmakuState();
    this.updateSpeechState();
    this.updatePanelState();
  }

  remount() {
    if (this.wrap?.isConnected && this.wrap.querySelector('.tbc-speech-btn') && this.wrap.querySelector('.tbc-history-btn')) return;
    this.wrap?.remove();
    this.wrap = null;
    this.danmakuBtn = null;
    this.speechBtn = null;
    this.historyBtn = null;
    this.settingsBtn = null;
    clearTimeout(this.retryTimer);
    this.retryTimer = setTimeout(() => this.mount(), 500);
  }

  updateDanmakuState() {
    if (!this.danmakuBtn) return;
    const enabled = this.getSettings().enabled;
    this.danmakuBtn.classList.toggle('tbc-danmaku-enabled', enabled);
    this.danmakuBtn.classList.toggle('tbc-danmaku-disabled', !enabled);
    this.danmakuBtn.title = enabled ? t('danmakuOn') : t('danmakuOff');
  }

  updateSpeechState() {
    if (!this.speechBtn) return;
    const settings = this.getSettings();
    const enabled = !!settings.speechEnabled;
    const muted = enabled && Number(settings.speechVolume) <= 0;
    const current = !enabled ? 'off' : muted ? 'mute' : 'on';
    this.speechBtn.classList.toggle('tbc-speech-on', current === 'on');
    this.speechBtn.classList.toggle('tbc-speech-mute', current === 'mute');
    this.speechBtn.classList.toggle('tbc-speech-off', current === 'off');
    this.speechBtn.classList.toggle('tbc-active', !!this.isSpeechPanelOpen?.());
    const label = current === 'on' ? t('speechOn') : current === 'mute' ? t('speechMute') : t('speechOff');
    this.speechBtn.title = label;
    this.speechBtn.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    this.speechBtn.setAttribute('aria-expanded', this.isSpeechPanelOpen?.() ? 'true' : 'false');
  }

  updateHistoryState() {
    if (!this.historyBtn) return;
    const open = !!this.isHistoryPanelOpen?.();
    this.historyBtn.classList.toggle('tbc-active', open);
    this.historyBtn.title = t('historyToggle');
    this.historyBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  updatePanelState() {
    if (!this.settingsBtn) return;
    this.settingsBtn.classList.toggle('tbc-active', this.isPanelOpen());
    this.settingsBtn.setAttribute('aria-expanded', this.isPanelOpen() ? 'true' : 'false');
    this.updateSpeechState();
    this.updateHistoryState();
  }

  destroy() {
    clearTimeout(this.retryTimer);
    this.wrap?.remove();
    this.wrap = null;
    this.danmakuBtn = null;
    this.speechBtn = null;
    this.historyBtn = null;
    this.settingsBtn = null;
  }
}

let settings = loadSettings();
let danmaku = null;
let danmakuEmitter = null;
let translateQueue = null;
let chatObserver = null;
let settingsPanel = null;
let speechPanel = null;
let historyPanel = null;
let controlButton = null;
let stylesInjected = false;
let navPath = location.pathname;
let pageActive = isPageActive();

function getSettings() {
  return settings;
}

function isActive() {
  if (document.documentElement.dataset.tbcPreview === 'true') return true;
  return pageActive;
}

function onSettingsChange(newSettings) {
  settings = newSettings;
  danmaku?.updateLayout();
  controlButton?.updateDanmakuState();
  controlButton?.updateSpeechState();
  if (!settings.translateEnabled) {
    translateQueue?.clear();
    clearChatTranslations();
  } else if (!settings.translateInChat) {
    clearChatTranslations();
  }
  if (!settings.speechEnabled || Number(settings.speechVolume) <= 0) {
    cancelSpeech();
  }
}

function toggleDanmaku() {
  settings.enabled = !settings.enabled;
  saveSettings(settings);
  onSettingsChange(settings);
}

function handleVisibilityChange() {
  if (document.documentElement.dataset.tbcPreview === 'true') {
    pageActive = true;
    return;
  }
  const wasActive = pageActive;
  pageActive = isPageActive();

  if (wasActive && !pageActive) {
    danmakuEmitter?.clear();
    translateQueue?.clear();
    cancelSpeech();
  }
}

function teardown() {
  chatObserver?.stop();
  danmaku?.destroy();
  controlButton?.destroy();
  danmakuEmitter?.clear();
  translateQueue?.clear();
  clearChatTranslations();
  settingsPanel?.close();
  speechPanel?.close();
  historyPanel?.close();
  cancelSpeech();
  chatObserver = null;
  danmaku = null;
  danmakuEmitter = null;
  translateQueue = null;
  controlButton = null;
}

async function boot() {
  settings = loadSettings();
  pageActive = isPageActive();

  if (!stylesInjected) {
    injectStyles();
    stylesInjected = true;
  }

  ensureSpeechSpeaker(getSettings);

  danmaku = new DanmakuEngine(getSettings);
  danmakuEmitter = new DanmakuEmitter(danmaku, getSettings, isActive);
  translateQueue = new TranslateQueue(getSettings, isActive);
  chatObserver = new ChatObserver({
    getSettings,
    danmakuEmitter,
    translateQueue,
    isActive,
  });

  if (!settingsPanel) {
    settingsPanel = new SettingsPanel({
      settings,
      onChange: onSettingsChange,
      onClose: () => controlButton?.updatePanelState(),
    });
  } else {
    settingsPanel.settings = settings;
  }

  if (!speechPanel) {
    speechPanel = new SpeechPanel({
      settings,
      onChange: onSettingsChange,
      onClose: () => controlButton?.updateSpeechState(),
    });
  } else {
    speechPanel.settings = settings;
  }

  if (!historyPanel) {
    historyPanel = new HistoryPanel({
      onClose: () => controlButton?.updateHistoryState(),
    });
  }

  controlButton = new ControlButton({
    onToggleDanmaku: toggleDanmaku,
    onTogglePanel: (anchor) => {
      speechPanel.close();
      historyPanel.close();
      settingsPanel.toggle(anchor);
      controlButton.updatePanelState();
    },
    onToggleSpeech: (anchor) => {
      settingsPanel.close();
      historyPanel.close();
      speechPanel.toggle(anchor);
      controlButton.updatePanelState();
    },
    onToggleHistory: (anchor) => {
      settingsPanel.close();
      speechPanel.close();
      historyPanel.toggle(anchor);
      controlButton.updatePanelState();
    },
    getSettings,
    isPanelOpen: () => settingsPanel.isOpen,
    isSpeechPanelOpen: () => speechPanel.isOpen,
    isHistoryPanelOpen: () => historyPanel.isOpen,
  });

  await danmaku.mount();
  await chatObserver.start();
  await controlButton.mount();

  console.log('[TBC] Twitch Danmaku initialized');
}

function watchNavigation() {
  setInterval(() => {
    if (location.pathname !== navPath) {
      navPath = location.pathname;
      teardown();
      boot().catch((err) => console.error('[TBC] Reinit failed:', err));
    } else {
      controlButton?.remount();
    }
  }, 1500);
}

document.addEventListener('visibilitychange', handleVisibilityChange);

boot().catch((err) => console.error('[TBC] Init failed:', err));
watchNavigation();
})();