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
