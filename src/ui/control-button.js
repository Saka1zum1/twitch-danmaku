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
