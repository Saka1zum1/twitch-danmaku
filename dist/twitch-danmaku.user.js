// ==UserScript==
// @name         Twitch Danmaku
// @name:zh-CN   Twitch 弹幕
// @namespace    https://github.com/twitch-danmaku
// @version      1.0.0
// @description  Convert Twitch live chat to video danmaku with real-time translation
// @description:zh-CN  将 Twitch 直播评论转换为视频弹幕，支持实时翻译
// @author       KaKa
// @license      MIT
// @match        https://www.twitch.tv/*
// @match        https://m.twitch.tv/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @connect      translate.googleapis.com
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
    fontFamily: '字体',
    scrollArea: '滚动区域',
    translateEnable: '启用翻译',
    translateTarget: '目标语言',
    translateSpeed: '翻译速度',
    translateSpeedUnit: '条/秒',
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
    fontFamily: 'Font',
    scrollArea: 'Scroll area',
    translateEnable: 'Enable translation',
    translateTarget: 'Target language',
    translateSpeed: 'Translation speed',
    translateSpeedUnit: '/sec',
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

const DEFAULT_SETTINGS = {
  enabled: true,
  speed: 5,
  fontSize: 22,
  fontFamily: 'system-ui, sans-serif',
  scrollArea: 'full',
  translateEnabled: false,
  translateTargetLang: getDefaultTranslateTargetLang(),
  translateSpeed: 3,
};

const SELECTORS = {
  chatScroller: '[data-a-target="chat-scroller"]',
  chatMessage: '[data-a-target="chat-message-container"], .chat-line__message, [data-test-selector="chat-message"]',
  chatText: 'span[data-a-target="chat-message-text"], span.text-fragment',
  chatUsername: '[data-a-target="chat-message-username"], .chat-author__display-name, .chat-line__username',
  videoPlayer: '.video-player__container',
  videoOverlay: '.video-player__overlay',
  playerControls: '.player-controls__right-control-group',
};

const STORAGE_KEY = 'tbc_settings_v1';

const LIVE_MESSAGE_TAIL = 5;
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

class DanmakuEngine {
  constructor(getSettings) {
    this.getSettings = getSettings;
    this.laneManager = new LaneManager();
    this.layer = null;
    this.playerEl = null;
    this.overlayEl = null;
    this.resizeObserver = null;
    this.boundUpdate = () => this.updateLayout();
  }

  async mount() {
    this.playerEl = await waitForElement(SELECTORS.videoPlayer);
    this.overlayEl = this.playerEl.querySelector(SELECTORS.videoOverlay) || this.playerEl;

    this.layer = document.createElement('div');
    this.layer.className = 'tbc-danmaku-layer';
    this.layer.setAttribute('aria-hidden', 'true');
    this.overlayEl.appendChild(this.layer);

    this.resizeObserver = new ResizeObserver(this.boundUpdate);
    this.resizeObserver.observe(this.playerEl);

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
    hideDanmakuTooltip();
    this.layer?.remove();
    this.layer = null;
  }

  getScrollAreaRect(playerRect) {
    const settings = this.getSettings();
    const h = playerRect.height;

    switch (settings.scrollArea) {
      case 'top-half':
        return { top: 0, height: h * 0.5 };
      case 'top-quarter':
        return { top: 0, height: h * 0.25 };
      default:
        return { top: 0, height: h };
    }
  }

  updateLayout() {
    if (!this.layer || !this.playerEl) return;

    const settings = this.getSettings();
    const fsEl = getFullscreenElement();
    const anchor = fsEl || this.playerEl;
    const rect = anchor.getBoundingClientRect();
    const area = this.getScrollAreaRect(rect);

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

    const laneHeight = settings.fontSize + 6;
    const laneCount = Math.floor(area.height / laneHeight);
    this.laneManager.reset(laneCount, laneHeight);
    this.layer.style.display = settings.enabled ? 'block' : 'none';
  }

  render({ username, message, usernameColor, originalMessage, translated }) {
    const settings = this.getSettings();
    if (!settings.enabled || !this.layer || !message) return;

    const layerWidth = this.layer.clientWidth || 800;
    const speed = clamp(settings.speed, 1, 10);
    const baseDuration = 20000;
    const durationMs = baseDuration / speed;
    const lane = this.laneManager.acquire(durationMs);
    const laneHeight = settings.fontSize + 6;
    const top = lane * laneHeight;

    const item = document.createElement('div');
    item.className = 'tbc-danmaku-item';
    item.textContent = message;
    item.style.cssText = `
      top: ${top}px;
      color: ${usernameColor || '#efeff1'};
      font-size: ${settings.fontSize}px;
      font-family: ${settings.fontFamily};
      --tbc-travel: ${layerWidth + 200}px;
      --tbc-duration: ${durationMs}ms;
    `;

    const startAt = Date.now();
    let pausedAt = 0;
    let totalPaused = 0;
    let removeTimer = null;

    const scheduleRemove = () => {
      const elapsed = Date.now() - startAt - totalPaused;
      const remaining = Math.max(0, durationMs - elapsed);
      clearTimeout(removeTimer);
      removeTimer = setTimeout(() => item.remove(), remaining + 500);
    };

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
      originalMessage,
      translated,
      onPause,
      onResume,
    });
    this.layer.appendChild(item);
    scheduleRemove();

    item.addEventListener('animationend', () => {
      clearTimeout(removeTimer);
      item.remove();
    }, { once: true });
  }
}

let activeTooltip = null;

function hideDanmakuTooltip() {
  activeTooltip?.remove();
  activeTooltip = null;
}

function positionDanmakuTooltip(item, tooltip) {
  const rect = item.getBoundingClientRect();
  const tipRect = tooltip.getBoundingClientRect();
  const left = clamp(rect.left + rect.width / 2 - tipRect.width / 2, 8, window.innerWidth - tipRect.width - 8);
  const top = rect.top - tipRect.height - 6;

  Object.assign(tooltip.style, {
    position: 'fixed',
    left: `${left}px`,
    top: `${Math.max(8, top)}px`,
    zIndex: '100001',
  });
}

function attachDanmakuInteraction(item, { username, usernameColor, originalMessage, translated, onPause, onResume }) {
  let resumeTimer = null;

  const pause = () => {
    clearTimeout(resumeTimer);
    item.classList.add('tbc-paused');
    onPause?.();
  };

  const resume = () => {
    item.classList.remove('tbc-paused');
    if (activeTooltip?.dataset.itemId === item.dataset.tbcId) {
      hideDanmakuTooltip();
    }
    onResume?.();
  };

  const scheduleResume = () => {
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(resume, 500);
  };

  const showTooltip = () => {
    const showOriginal = translated && originalMessage && originalMessage !== item.textContent;
    if (!username && !showOriginal) return;

    hideDanmakuTooltip();
    item.dataset.tbcId = item.dataset.tbcId || String(Date.now() + Math.random());

    const tooltip = document.createElement('div');
    tooltip.className = 'tbc-danmaku-tooltip';
    tooltip.dataset.itemId = item.dataset.tbcId;

    const bubble = document.createElement('div');
    bubble.className = 'tbc-danmaku-tooltip-bubble';

    if (username) {
      const nameRow = document.createElement('div');
      nameRow.className = 'tbc-danmaku-tooltip-name';
      nameRow.style.color = usernameColor || '#a970ff';
      nameRow.textContent = username;
      bubble.appendChild(nameRow);
    }

    if (showOriginal) {
      const originalRow = document.createElement('div');
      originalRow.className = 'tbc-danmaku-tooltip-original';
      originalRow.textContent = truncateText(originalMessage);
      bubble.appendChild(originalRow);
    }

    const tail = document.createElement('div');
    tail.className = 'tbc-danmaku-tooltip-tail';

    tooltip.append(bubble, tail);

    const mountTarget = getFullscreenElement() || document.body;
    mountTarget.appendChild(tooltip);
    positionDanmakuTooltip(item, tooltip);
    activeTooltip = tooltip;
  };

  item.addEventListener('mouseenter', pause);
  item.addEventListener('mouseleave', scheduleResume);
  item.addEventListener('click', (e) => {
    e.stopPropagation();
    pause();
    showTooltip();
    requestAnimationFrame(() => {
      if (activeTooltip) positionDanmakuTooltip(item, activeTooltip);
    });
  });

  item.addEventListener('animationend', () => {
    clearTimeout(resumeTimer);
    if (activeTooltip?.dataset.itemId === item.dataset.tbcId) {
      hideDanmakuTooltip();
    }
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

async function googleTranslate(text, targetLang) {
  if (!text.trim() || text.length > 500) return '';

  return new Promise((resolve) => {
    GM_xmlhttpRequest({
      method: 'GET',
      url: `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(text)}`,
      onload(res) {
        try {
          const json = JSON.parse(
            res.responseText.replace(/,\s*,/g, ',null,').replace(/,\s*]/g, ',null]')
          );
          resolve(json[0].map((x) => x[0]).join(''));
        } catch {
          resolve('');
        }
      },
      onerror: () => resolve(''),
    });
  });
}

const PHRASE_MAP = {
  lol: { 'zh-CN': '哈哈', 'zh-TW': '哈哈', en: 'lol' },
  lo: { 'zh-CN': '哈哈', 'zh-TW': '哈哈', en: 'lo' },
  lmao: { 'zh-CN': '笑死我了', 'zh-TW': '笑死我了', en: 'lmao' },
  lmfao: { 'zh-CN': '笑死我了', 'zh-TW': '笑死我了', en: 'lmfao' },
  rofl: { 'zh-CN': '笑翻', 'zh-TW': '笑翻', en: 'rofl' },
  kekw: { 'zh-CN': '笑死', 'zh-TW': '笑死', en: 'kekw' },
  kek: { 'zh-CN': '笑', 'zh-TW': '笑', en: 'kek' },
  gg: { 'zh-CN': 'GG', 'zh-TW': 'GG', en: 'gg' },
  ggs: { 'zh-CN': 'GG', 'zh-TW': 'GG', en: 'ggs' },
  wp: { 'zh-CN': '打得不错', 'zh-TW': '打得不错', en: 'wp' },
  gl: { 'zh-CN': '祝好运', 'zh-TW': '祝好運', en: 'gl' },
  hf: { 'zh-CN': '玩得开心', 'zh-TW': '玩得開心', en: 'hf' },
  nt: { 'zh-CN': '好尝试', 'zh-TW': '好嘗試', en: 'nt' },
  ns: { 'zh-CN': '好枪', 'zh-TW': '好槍', en: 'ns' },
  pog: { 'zh-CN': '强啊', 'zh-TW': '強啊', en: 'pog' },
  pogchamp: { 'zh-CN': '太强了', 'zh-TW': '太強了', en: 'pogchamp' },
  pepega: { 'zh-CN': '有点蠢', 'zh-TW': '有點蠢', en: 'pepega' },
  monkas: { 'zh-CN': '紧张', 'zh-TW': '緊張', en: 'monkas' },
  sadge: { 'zh-CN': 'Sad', 'zh-TW': 'Sad', en: 'sadge' },
  copium: { 'zh-CN': '做梦呢', 'zh-TW': '做夢呢', en: 'copium' },
  o7: { 'zh-CN': 'o7', 'zh-TW': 'o7', en: 'o7' },
  brb: { 'zh-CN': '马上回来', 'zh-TW': '馬上回來', en: 'brb' },
  afk: { 'zh-CN': '离开了', 'zh-TW': '離開了', en: 'afk' },
  bbl: { 'zh-CN': '待会儿回来', 'zh-TW': '待會兒回來', en: 'bbl' },
  gtg: { 'zh-CN': '得走了', 'zh-TW': '得走了', en: 'gtg' },
  ty: { 'zh-CN': '谢谢', 'zh-TW': '謝謝', en: 'ty' },
  thx: { 'zh-CN': '谢谢', 'zh-TW': '謝謝', en: 'thx' },
  np: { 'zh-CN': '不客气', 'zh-TW': '不客氣', en: 'np' },
  nw: { 'zh-CN': '不客气', 'zh-TW': '不客氣', en: 'nw' },
  imo: { 'zh-CN': '我觉得', 'zh-TW': '我覺得', en: 'imo' },
  imho: { 'zh-CN': '依我看', 'zh-TW': '依我看', en: 'imho' },
  tbh: { 'zh-CN': '老实说', 'zh-TW': '老實說', en: 'tbh' },
  ngl: { 'zh-CN': '说实话', 'zh-TW': '說實話', en: 'ngl' },
  rn: { 'zh-CN': '现在', 'zh-TW': '現在', en: 'rn' },
  idk: { 'zh-CN': '不知道', 'zh-TW': '不知道', en: 'idk' },
  ikr: { 'zh-CN': '确实', 'zh-TW': '確實', en: 'ikr' },
  smh: { 'zh-CN': '无语', 'zh-TW': '無語', en: 'smh' },
  omg: { 'zh-CN': '天呐', 'zh-TW': '天呐', en: 'omg' },
  omfg: { 'zh-CN': '我的天', 'zh-TW': '我的天', en: 'omfg' },
  wtf: { 'zh-CN': '什么鬼', 'zh-TW': '什麼鬼', en: 'wtf' },
  f: { 'zh-CN': 'F', 'zh-TW': 'F', en: 'f' },
  rip: { 'zh-CN': 'RIP', 'zh-TW': 'RIP', en: 'rip' },
  hi: { 'zh-CN': '嗨', 'zh-TW': '嗨', en: 'hi' },
  hello: { 'zh-CN': '你好', 'zh-TW': '你好', en: 'hello' },
  bye: { 'zh-CN': '再见', 'zh-TW': '再見', en: 'bye' },
  ez: { 'zh-CN': '轻松', 'zh-TW': '輕鬆', en: 'ez' },
  diff: { 'zh-CN': '差距', 'zh-TW': '差距', en: 'diff' },
  based: { 'zh-CN': '真不错', 'zh-TW': '真不錯', en: 'based' },
  cringe: { 'zh-CN': '尬', 'zh-TW': '尬', en: 'cringe' },
};

const TOOLTIP_ORIGINAL_MAX = 64;

function normalizePhraseKey(text) {
  return text.trim().toLowerCase().replace(/[!?.,"'`~]+$/g, '').replace(/^[!?.,"'`~]+/g, '');
}

function shouldSkipTranslation(text) {
  const trimmed = text.trim();
  if (!trimmed) return true;
  if (/^[\d\s+\-*/%=^#@&|<>[\]{}\\]+$/u.test(trimmed)) return true;
  if (/^[\p{P}\p{S}\s\d]+$/u.test(trimmed)) return true;
  return false;
}

function lookupPhrase(text, targetLang) {
  const key = normalizePhraseKey(text);
  if (!key || key.includes(' ')) return null;

  const entry = PHRASE_MAP[key];
  if (!entry) return null;

  return entry[targetLang] || entry.en || null;
}

function truncateText(text, max = TOOLTIP_ORIGINAL_MAX) {
  if (!text || text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

async function translateMessage(text, targetLang) {
  if (shouldSkipTranslation(text)) return text;

  const mapped = lookupPhrase(text, targetLang);
  if (mapped) return mapped;

  const translated = await googleTranslate(text, targetLang);
  return translated?.trim() || text;
}

class TranslateQueue {
  constructor(getSettings, isActive) {
    this.getSettings = getSettings;
    this.isActive = isActive;
    this.queue = [];
    this.processing = false;
    this.timer = null;
  }

  enqueue(text, callback) {
    if (!this.isActive()) return;

    if (this.queue.length >= MAX_TRANSLATE_QUEUE) {
      this.queue.shift();
    }
    this.queue.push({ text, callback });
    this.schedule();
  }

  schedule() {
    if (this.timer || !this.isActive()) return;
    const settings = this.getSettings();
    if (!settings.translateEnabled) return;

    const intervalMs = Math.max(200, Math.round(1000 / clamp(settings.translateSpeed, 1, 10)));
    this.timer = setTimeout(() => {
      this.timer = null;
      this.processNext();
    }, intervalMs);
  }

  async processNext() {
    const settings = this.getSettings();
    if (!this.isActive() || !settings.translateEnabled || this.processing || this.queue.length === 0) {
      if (this.isActive()) this.schedule();
      return;
    }

    this.processing = true;
    const job = this.queue.shift();
    const original = job.text;

    try {
      const translated = await translateMessage(original, settings.translateTargetLang);
      if (this.isActive()) {
        job.callback(translated, original);
      }
    } catch {
      if (this.isActive()) job.callback(original, original);
    }

    this.processing = false;
    this.schedule();
  }

  clear() {
    this.queue = [];
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.processing = false;
  }
}

function parseChatMessage(msgEl) {
  if (msgEl.classList.contains('tbc-processed')) return null;
  if (msgEl.closest('.tbc-processed')) return null;

  const textSpans = msgEl.querySelectorAll(SELECTORS.chatText);
  const message = Array.from(textSpans).map((s) => s.textContent).join('').trim();
  if (!message) return null;

  const usernameEl = msgEl.querySelector(SELECTORS.chatUsername);
  const username = usernameEl?.textContent?.trim() || '';
  const usernameColor = getUsernameColor(msgEl);

  msgEl.classList.add('tbc-processed');
  return { message, username, usernameColor };
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
    console.log('[TBC] Chat observer started');
  }

  stop() {
    this.observer?.disconnect();
    this.observer = null;
    this.chatRoot = null;
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
      this.emitDanmaku(parsed);
    }
  }

  emitDanmaku(parsed) {
    const settings = this.getSettings();
    if (!this.isActive()) return;

    const base = {
      username: parsed.username,
      usernameColor: parsed.usernameColor,
      originalMessage: parsed.message,
    };

    if (!settings.translateEnabled) {
      this.danmakuEmitter.enqueue({
        ...base,
        message: parsed.message,
        translated: false,
      });
      return;
    }

    this.translateQueue.enqueue(parsed.message, (translated, original) => {
      if (!this.isActive()) return;
      const message = translated?.trim() ? translated : original;
      const wasTranslated = message !== original;
      this.danmakuEmitter.enqueue({
        ...base,
        message,
        translated: wasTranslated,
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

    .tbc-danmaku-item.tbc-paused {
      animation-play-state: paused;
      z-index: 20;
      cursor: pointer;
    }

    .tbc-danmaku-tooltip {
      pointer-events: none;
      filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.4));
    }

    .tbc-danmaku-tooltip-bubble {
      background: rgba(24, 24, 27, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      padding: 4px 8px;
      max-width: 160px;
    }

    .tbc-danmaku-tooltip-name {
      font-size: 12px;
      font-weight: 600;
      line-height: 1.3;
      word-break: break-word;
    }

    .tbc-danmaku-tooltip-original {
      margin-top: 2px;
      color: #adadb8;
      font-size: 11px;
      line-height: 1.3;
      word-break: break-word;
    }

    .tbc-danmaku-tooltip-tail {
      width: 6px;
      height: 6px;
      margin: -3px auto 0;
      background: rgba(24, 24, 27, 0.95);
      border-right: 1px solid rgba(255, 255, 255, 0.1);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      transform: rotate(45deg);
    }

    @keyframes tbc-scroll {
      from { transform: translateX(0); }
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
  `);
}

const ICON_DANMAKU_ON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M11.989 4.828c-.47 0-.975.004-1.515.012l-1.71-2.566a1.008 1.008 0 0 0-1.678 1.118l.999 1.5c-.681.018-1.403.04-2.164.068a4.013 4.013 0 0 0-3.83 3.44c-.165 1.15-.245 2.545-.245 4.185 0 1.965.115 3.67.35 5.116a4.012 4.012 0 0 0 3.763 3.363l.906.046c1.205.063 1.808.095 3.607.095a.988.988 0 0 0 0-1.975c-1.758 0-2.339-.03-3.501-.092l-.915-.047a2.037 2.037 0 0 1-1.91-1.708c-.216-1.324-.325-2.924-.325-4.798 0-1.563.076-2.864.225-3.904.14-.977.96-1.713 1.945-1.747 2.444-.087 4.465-.13 6.063-.131 1.598 0 3.62.044 6.064.13.96.034 1.71.81 1.855 1.814.075.524.113 1.962.141 3.065v.002c.01.342.017.65.025.88a.987.987 0 1 0 1.974-.068c-.008-.226-.016-.523-.025-.856v-.027c-.03-1.118-.073-2.663-.16-3.276-.273-1.906-1.783-3.438-3.74-3.507-.9-.032-1.743-.058-2.531-.078l1.05-1.46a1.008 1.008 0 0 0-1.638-1.177l-1.862 2.59c-.38-.004-.744-.007-1.088-.007h-.13Zm.521 4.775h-1.32v4.631h2.222v.847h-2.618v1.078h2.618l.003.678c.36.026.714.163 1.01.407h.11v-1.085h2.694v-1.078h-2.695v-.847H16.8v-4.63h-1.276a8.59 8.59 0 0 0 .748-1.42L15.183 7.8a14.232 14.232 0 0 1-.814 1.804h-1.518l.693-.308a8.862 8.862 0 0 0-.814-1.408l-1.045.352c.297.396.572.847.825 1.364Zm-4.18 3.564.154-1.485h1.98V8.294h-3.2v.98H9.33v1.43H7.472l-.308 3.453h2.277c0 1.166-.044 1.925-.12 2.277-.078.352-.386.528-.936.528-.308 0-.616-.022-.902-.055l.297 1.067.062.005c.285.02.551.04.818.04 1.001-.067 1.562-.419 1.694-1.057.11-.638.176-1.903.176-3.795h-2.2Zm7.458.11v-.858h-1.254v.858h1.254Zm-2.376-.858v.858h-1.199v-.858h1.2Zm-1.199-.946h1.2v-.902h-1.2v.902Zm2.321 0v-.902h1.254v.902h-1.254Z" clip-rule="evenodd"/><path fill-rule="evenodd" d="M22.846 14.627a1 1 0 0 0-1.412.075l-5.091 5.703-2.216-2.275-.097-.086-.008-.005a1 1 0 0 0-1.322 1.493l2.963 3.041.093.083.007.005c.407.315 1 .27 1.354-.124l5.81-6.505.08-.102.005-.008a1 1 0 0 0-.166-1.295Z" clip-rule="evenodd"/></svg>`;

const ICON_DANMAKU_OFF = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="m8.085 4.891-.999-1.499a1.008 1.008 0 0 1 1.679-1.118l1.709 2.566c.54-.008 1.045-.012 1.515-.012h.13c.345 0 .707.003 1.088.007l1.862-2.59a1.008 1.008 0 0 1 1.637 1.177l-1.049 1.46c.788.02 1.631.046 2.53.078 1.958.069 3.468 1.6 3.74 3.507.088.613.13 2.158.16 3.276l.001.027c.01.333.017.63.025.856a.987.987 0 0 1-1.974.069c-.008-.23-.016-.539-.025-.881v-.002c-.028-1.103-.066-2.541-.142-3.065-.143-1.004-.895-1.78-1.854-1.813-2.444-.087-4.466-.13-6.064-.131-1.598 0-3.619.044-6.063.13a2.037 2.037 0 0 0-1.945 1.748c-.15 1.04-.225 2.341-.225 3.904 0 1.874.11 3.474.325 4.798.154.949.95 1.66 1.91 1.708a97.58 97.58 0 0 0 5.416.139.988.988 0 0 1 0 1.975c-2.196 0-3.61-.047-5.513-.141A4.012 4.012 0 0 1 2.197 17.7c-.236-1.446-.351-3.151-.351-5.116 0-1.64.08-3.035.245-4.184A4.013 4.013 0 0 1 5.92 4.96c.761-.027 1.483-.05 2.164-.069Zm4.436 4.707h-1.32v4.63h2.222v.848h-2.618v1.078h2.431a5.01 5.01 0 0 1 3.575-3.115V9.598h-1.276a8.59 8.59 0 0 0 .748-1.42l-1.089-.384a14.232 14.232 0 0 1-.814 1.804h-1.518l.693-.308a8.862 8.862 0 0 0-.814-1.408l-1.045.352c.297.396.572.847.825 1.364Zm-4.18 3.564.154-1.485h1.98V8.289h-3.2v.979h2.067v1.43H7.483l-.308 3.454h2.277c0 1.166-.044 1.925-.12 2.277-.078.352-.386.528-.936.528-.308 0-.616-.022-.902-.055l.297 1.067.062.004c.285.02.551.04.818.04 1.001-.066 1.562-.418 1.694-1.056.11-.638.176-1.903.176-3.795h-2.2Zm7.458.11v-.858h-1.254v.858H15.8Zm-2.376-.858v.858h-1.199v-.858h1.2Zm-1.199-.946h1.2v-.902h-1.2v.902Zm2.321 0v-.902H15.8v.902h-1.254Zm3.517 10.594a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-.002-1.502a2.5 2.5 0 0 1-2.217-3.657l3.326 3.398a2.49 2.49 0 0 1-1.109.259Zm2.5-2.5c0 .42-.103.815-.286 1.162l-3.328-3.401a2.5 2.5 0 0 1 3.614 2.239Z" clip-rule="evenodd"/></svg>`;

const ICON_SETTINGS = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="m15.645 4.881 1.06-1.473a.998.998 0 1 0-1.622-1.166L13.22 4.835a110.67 110.67 0 0 0-1.1-.007h-.131c-.47 0-.975.004-1.515.012L8.783 2.3A.998.998 0 0 0 7.12 3.408l.988 1.484c-.688.019-1.418.042-2.188.069a4.013 4.013 0 0 0-3.83 3.44c-.165 1.15-.245 2.545-.245 4.185 0 1.965.115 3.67.35 5.116a4.012 4.012 0 0 0 3.763 3.363c1.903.094 3.317.141 5.513.141a.988.988 0 0 0 0-1.975 97.58 97.58 0 0 1-5.416-.139 2.037 2.037 0 0 1-1.91-1.708c-.216-1.324-.325-2.924-.325-4.798 0-1.563.076-2.864.225-3.904.14-.977.96-1.713 1.945-1.747 2.444-.087 4.465-.13 6.063-.131 1.598 0 3.62.044 6.064.13.96.034 1.71.81 1.855 1.814.075.524.113 1.962.141 3.065v.002c.005.183.01.07.014-.038.004-.096.008-.189.011-.081a.987.987 0 1 0 1.974-.069c-.004-.105-.007-.009-.011.09-.002.056-.004.112-.007.135l-.002.01a.574.574 0 0 1-.005-.091v-.027c-.03-1.118-.073-2.663-.16-3.276-.273-1.906-1.783-3.438-3.74-3.507-.905-.032-1.752-.058-2.543-.079Zm-3.113 4.703h-1.307v4.643h2.2v.04l.651-1.234c.113-.215.281-.389.482-.509v-.11h.235c.137-.049.283-.074.433-.074h1.553V9.584h-1.264a8.5 8.5 0 0 0 .741-1.405l-1.078-.381c-.24.631-.501 1.23-.806 1.786h-1.503l.686-.305c-.228-.501-.5-.959-.806-1.394l-1.034.348c.294.392.566.839.817 1.35Zm-1.7 5.502h2.16l-.564 1.068h-1.595v-1.068Zm-2.498-1.863.152-1.561h1.96V8.289H7.277v.969h2.048v1.435h-1.84l-.306 3.51h2.254c0 1.155-.043 1.906-.12 2.255-.076.348-.38.523-.925.523-.305 0-.61-.022-.893-.055l.294 1.056.061.005c.282.02.546.039.81.039.991-.065 1.547-.414 1.677-1.046.11-.631.175-1.883.175-3.757H8.334Zm5.09-.8v.85h-1.188v-.85h1.187Zm-1.188-.955h1.187v-.893h-1.187v.893Zm2.322.007v-.893h1.241v.893h-1.241Zm.528 2.757a1.26 1.26 0 0 1 1.087-.627l4.003-.009a1.26 1.26 0 0 1 1.094.63l1.721 2.982c.226.39.225.872-.001 1.263l-1.743 3a1.26 1.26 0 0 1-1.086.628l-4.003.009a1.26 1.26 0 0 1-1.094-.63l-1.722-2.982a1.26 1.26 0 0 1 .002-1.263l1.742-3Zm1.967.858a1.26 1.26 0 0 0-1.08.614l-.903 1.513a1.26 1.26 0 0 0-.002 1.289l.885 1.492c.227.384.64.62 1.086.618l2.192-.005a1.26 1.26 0 0 0 1.08-.615l.904-1.518a1.26 1.26 0 0 0 .001-1.288l-.884-1.489a1.26 1.26 0 0 0-1.086-.616l-2.193.005Zm2.517 2.76a1.4 1.4 0 1 1-2.8 0 1.4 1.4 0 0 1 2.8 0Z" clip-rule="evenodd"/></svg>`;

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
      this.createSelect(t('fontFamily'), 'fontFamily', getFontOptions()),
      this.createSelect(t('scrollArea'), 'scrollArea', getScrollAreaOptions()),
      this.createDivider(),
      this.createToggle(t('translateEnable'), 'translateEnabled'),
      this.createSelect(t('translateTarget'), 'translateTargetLang', getTranslateLangOptions()),
      this.createRange(t('translateSpeed'), 'translateSpeed', 1, 10, 1, (v) => `${v} ${t('translateSpeedUnit')}`),
    );

    this.balloon.append(header, body);
    this.balloon.addEventListener('click', (e) => e.stopPropagation());

    const mountTarget = getFullscreenElement() || document.body;
    mountTarget.appendChild(this.balloon);
  }
}

class ControlButton {
  constructor({ onToggleDanmaku, onTogglePanel, getSettings, isPanelOpen }) {
    this.onToggleDanmaku = onToggleDanmaku;
    this.onTogglePanel = onTogglePanel;
    this.getSettings = getSettings;
    this.isPanelOpen = isPanelOpen;
    this.wrap = null;
    this.danmakuBtn = null;
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

    this.settingsBtn = this.createBtn('tbc-settings-btn', t('settingsToggle'), ICON_SETTINGS);
    this.settingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onTogglePanel(this.settingsBtn);
    });

    this.wrap.append(this.danmakuBtn, this.settingsBtn);
    this.controlsGroup.appendChild(this.wrap);
    this.updateDanmakuState();
    this.updatePanelState();
  }

  remount() {
    if (this.wrap?.isConnected) return;
    this.wrap = null;
    this.danmakuBtn = null;
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

  updatePanelState() {
    if (!this.settingsBtn) return;
    this.settingsBtn.classList.toggle('tbc-active', this.isPanelOpen());
    this.settingsBtn.setAttribute('aria-expanded', this.isPanelOpen() ? 'true' : 'false');
  }

  destroy() {
    clearTimeout(this.retryTimer);
    this.wrap?.remove();
    this.wrap = null;
    this.danmakuBtn = null;
    this.settingsBtn = null;
  }
}

let settings = loadSettings();
let danmaku = null;
let danmakuEmitter = null;
let translateQueue = null;
let chatObserver = null;
let settingsPanel = null;
let controlButton = null;
let stylesInjected = false;
let navPath = location.pathname;
let pageActive = isPageActive();

function getSettings() {
  return settings;
}

function isActive() {
  return pageActive;
}

function onSettingsChange(newSettings) {
  settings = newSettings;
  danmaku?.updateLayout();
  controlButton?.updateDanmakuState();
  if (!settings.translateEnabled) {
    translateQueue?.clear();
  }
}

function toggleDanmaku() {
  settings.enabled = !settings.enabled;
  saveSettings(settings);
  onSettingsChange(settings);
}

function handleVisibilityChange() {
  const wasActive = pageActive;
  pageActive = isPageActive();

  if (wasActive && !pageActive) {
    danmakuEmitter?.clear();
    translateQueue?.clear();
  }
}

function teardown() {
  chatObserver?.stop();
  danmaku?.destroy();
  controlButton?.destroy();
  danmakuEmitter?.clear();
  translateQueue?.clear();
  settingsPanel?.close();
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

  controlButton = new ControlButton({
    onToggleDanmaku: toggleDanmaku,
    onTogglePanel: (anchor) => {
      settingsPanel.toggle(anchor);
      controlButton.updatePanelState();
    },
    getSettings,
    isPanelOpen: () => settingsPanel.isOpen,
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