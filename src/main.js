let settings = loadSettings();
let danmaku = null;
let danmakuEmitter = null;
let translateQueue = null;
let chatObserver = null;
let chatContextMenu = null;
let chatClearButton = null;
let favoritesPanel = null;
let fullscreenChat = null;
let enhancedPip = null;
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

function isBackgroundChatKept() {
  if (document.documentElement.dataset.tbcPreview === 'true') return true;
  if (enhancedPip?.isOpen()) return true;
  if (settings.tabAntiFreeze) return true;
  return false;
}

function isActive() {
  if (isBackgroundChatKept()) return true;
  return pageActive;
}

function syncBackgroundChat() {
  syncTabAntiFreeze(getSettings, () => enhancedPip?.isOpen());
  if (isBackgroundChatKept()) {
    chatObserver?.ensureBackgroundIrc?.();
  } else {
    chatObserver?.maybeStopBackgroundIrc?.();
  }
  if (isBackgroundChatKept() && !pageActive) {
    pageActive = true;
  }
}

function onSettingsChange(newSettings) {
  settings = newSettings;
  danmaku?.updateLayout();
  controlButton?.updateDanmakuState();
  controlButton?.updateTranslateState();
  controlButton?.updateSpeechState();
  settingsPanel?.syncFromSettings();
  speechPanel?.syncFromSettings();
  enhancedPip?.syncSettings();
  syncBackgroundChat();
  if (document.documentElement.dataset.tbcPreview === 'true') {
    window.dispatchEvent(new CustomEvent('tbc-settings-updated', { detail: settings }));
  }
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

function toggleTranslate() {
  settings.translateEnabled = !settings.translateEnabled;
  saveSettings(settings);
  onSettingsChange(settings);
}

function toggleSpeechEnabled() {
  settings.speechEnabled = !settings.speechEnabled;
  saveSettings(settings);
  onSettingsChange(settings);
}

function handleVisibilityChange() {
  if (document.documentElement.dataset.tbcPreview === 'true') {
    pageActive = true;
    return;
  }
  const wasChatActive = isActive();
  pageActive = isPageActive();
  syncBackgroundChat();
  const nowChatActive = isActive();

  if (wasChatActive && !nowChatActive) {
    danmakuEmitter?.clear();
    translateQueue?.clear();
    cancelSpeech();
  }
}

function teardown() {
  chatObserver?.stop();
  chatContextMenu?.detach();
  chatClearButton?.destroy();
  favoritesPanel?.destroy();
  fullscreenChat?.destroy();
  enhancedPip?.destroy();
  danmaku?.destroy();
  controlButton?.destroy();
  danmakuEmitter?.clear();
  translateQueue?.clear();
  clearChatTranslations(document, { force: true });
  settingsPanel?.close();
  speechPanel?.close();
  historyPanel?.close();
  cancelSpeech();
  tabAntiFreezeDisable();
  chatObserver = null;
  chatContextMenu = null;
  chatClearButton = null;
  favoritesPanel = null;
  fullscreenChat = null;
  enhancedPip = null;
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

  favoritesPanel = new FavoritesPanel();
  favoritesPanel.attach();

  chatContextMenu = new ChatContextMenu({
    getSettings,
    danmakuEmitter,
    isActive,
    favoritesPanel,
  });
  chatContextMenu.attach(document);

  chatClearButton = new ChatClearButton({
    onClear: () => chatObserver?.clearIrcHistory?.(),
  });

  fullscreenChat = new FullscreenChatInput({ favoritesPanel });
  fullscreenChat.attach();

  enhancedPip = new EnhancedPip({
    getSettings,
    danmaku,
    favoritesPanel,
    onToggleDanmaku: toggleDanmaku,
    onOpenSettings: () => {
      speechPanel?.close();
      historyPanel?.close();
      const anchor = controlButton?.settingsBtn || controlButton?.wrap;
      if (anchor && !settingsPanel?.isOpen) settingsPanel.open(anchor);
      controlButton?.updatePanelState();
    },
    onStateChange: () => {
      syncBackgroundChat();
      controlButton?.updatePipState();
    },
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
    onToggleTranslate: toggleTranslate,
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
    onTogglePip: () => enhancedPip?.toggle(),
    isPipOpen: () => !!enhancedPip?.isOpen(),
  });

  // Mount player UI first so FFZ/chat delays cannot block controls.
  await Promise.all([
    danmaku.mount(),
    controlButton.mount(),
    favoritesPanel.mount(),
  ]);
  await chatClearButton.mount();
  await chatObserver.start();

  window.__tbcApplySettings = onSettingsChange;
  window.__tbcGetSettings = getSettings;
  window.__tbcToggleTranslate = toggleTranslate;
  window.__tbcToggleSpeech = toggleSpeechEnabled;

  syncBackgroundChat();

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
      chatClearButton?.remount();
      favoritesPanel?.remount();
    }
  }, 1500);
}

document.addEventListener('visibilitychange', handleVisibilityChange);

boot().catch((err) => console.error('[TBC] Init failed:', err));
watchNavigation();
