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
