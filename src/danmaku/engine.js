class DanmakuEngine {
  constructor(getSettings) {
    this.getSettings = getSettings;
    this.laneManager = new LaneManager();
    this.layer = null;
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
    this.overlayEl.appendChild(this.layer);

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
    this.layer = null;
  }

  getBottomReserve() {
    const controls = this.playerEl?.querySelector(SELECTORS.playerControlsRoot);
    if (controls) {
      const height = controls.getBoundingClientRect().height;
      if (height > 0) return Math.ceil(height) + 8;
    }
    return SCROLL_AREA_BOTTOM_RESERVE;
  }

  getScrollAreaRect(playerRect) {
    const settings = this.getSettings();
    const h = playerRect.height;
    const laneHeight = settings.fontSize + 6;
    const bottomReserve = this.getBottomReserve();

    switch (settings.scrollArea) {
      case 'top-half':
        return { top: 0, height: Math.max(laneHeight, h * 0.5) };
      case 'top-quarter':
        return { top: 0, height: Math.max(laneHeight, h * 0.25) };
      default:
        return { top: 0, height: Math.max(laneHeight, h - bottomReserve) };
    }
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

  render({ username, message, parts, usernameColor, profileUrl, originalMessage, translated }) {
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
    scheduleRemove();

    item.addEventListener('animationend', () => {
      clearTimeout(removeTimer);
      item.remove();
    }, { once: true });
  }
}
