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
    const baseDuration = 9000;
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
