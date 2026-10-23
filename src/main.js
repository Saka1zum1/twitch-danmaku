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
      getIrcComments: () => (
        chatObserver?.mode === 'irc' ? chatObserver.getIrcHistoryComments() : null
      ),
    });
  } else {
    historyPanel.getIrcComments = () => (
      chatObserver?.mode === 'irc' ? chatObserver.getIrcHistoryComments() : null
    );
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

  // Mount player UI first so FFZ/chat delays cannot block controls.
  await Promise.all([
    danmaku.mount(),
    controlButton.mount(),
  ]);
  await chatObserver.start();

  console.log(`[TBC] Twitch Danmaku initialized${chatObserver.ffzActive ? ' (FFZ compat)' : ''}`);
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
