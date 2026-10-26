function safeCssColor(value, fallback) {
  const color = String(value || '').trim();
  if (!color || /[;{}]|url\s*\(/i.test(color)) return fallback;
  return color;
}

class DanmakuEngine {
  constructor(getSettings) {
    this.getSettings = getSettings;
    this._superchatHelpers = () => ({ getSettings: this.getSettings });
    this.laneManager = new LaneManager();
    this.layer = null;
    this.superchatLayer = null;
    this.pinnedItems = [];
    this.superchatQueue = [];
    this.maxPinned = SUPERCHAT_MAX_PINS;
    this.playerEl = null;
    this.overlayEl = null;
    this.controlsObserver = null;
    this.resizeObserver = null;
    this.boundUpdate = () => this.updateLayout();
  }

  setSuperchatHelpers(factory) {
    if (typeof factory === 'function') this._superchatHelpers = factory;
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
    closeSuperchatDetailCard();
    this.layer?.remove();
    this.superchatLayer?.remove();
    this.layer = null;
    this.superchatLayer = null;
    this.pinnedItems = [];
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

  estimatePinnedItemHeight() {
    const settings = this.getSettings();
    if (settings.superchatCompact) {
      return Math.max(32, settings.fontSize + 10);
    }
    return Math.max(48, settings.fontSize + 20);
  }

  getPinnedBandHeight() {
    const live = this.pinnedItems.filter((item) => item?.isConnected);
    const gap = 6;
    const layerPad = 10;
    if (!live.length) {
      return this.estimatePinnedItemHeight() + layerPad;
    }
    let total = layerPad;
    live.forEach((item, index) => {
      const h = item.offsetHeight || this.estimatePinnedItemHeight();
      total += h + (index > 0 ? gap : 0);
    });
    return total;
  }

  getPinnedBandRect(playerHeight) {
    const live = this.pinnedItems.filter((item) => item?.isConnected);
    this.pinnedItems = live;
    if (!live.length || !this.getSettings().superchatPinned || !this.getSettings().enabled) return null;
    const placement = resolveSuperchatPlacement(this.getSettings().superchatPosition);
    const bottomReserve = this.getBottomReserve();
    const contentHeight = this.getPinnedBandHeight();
    let bandHeight = contentHeight;
    const maxBand = Math.max(this.estimatePinnedItemHeight(), playerHeight - bottomReserve - 12);
    bandHeight = Math.min(bandHeight, maxBand);

    let top;
    if (placement.vertical === 'bottom') {
      top = Math.max(0, playerHeight - bottomReserve - bandHeight);
    } else {
      top = 4;
      const maxTopBand = playerHeight - bottomReserve - top - 4;
      bandHeight = Math.min(bandHeight, maxTopBand);
    }
    return { ...placement, top, height: bandHeight, contentHeight, maxBand };
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
      case 'bottom-half':
        area = {
          top: h * 0.5,
          height: Math.max(laneHeight, h * 0.5 - bottomReserve),
        };
        break;
      case 'top-quarter':
        area = { top: 0, height: Math.max(laneHeight, h * 0.25) };
        break;
      default:
        area = { top: 0, height: Math.max(laneHeight, h - bottomReserve) };
        break;
    }

    if (settings.superchatOverlayDanmaku === false && settings.superchatPinned && settings.enabled) {
      const band = this.getPinnedBandRect(h);
      if (band?.height) {
        if (band.vertical === 'top') {
          area.top += band.height;
          area.height = Math.max(laneHeight, area.height - band.height);
        } else if (band.vertical === 'bottom') {
          area.height = Math.max(laneHeight, area.height - band.height);
        }
      }
    }

    return area;
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
      this.pinnedItems.forEach((item) => item.remove());
      this.pinnedItems = [];
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
    const settings = this.getSettings();
    const parent = fullscreen ? (getFullscreenElement() || this.overlayEl) : this.overlayEl;
    if (parent && this.superchatLayer.parentElement !== parent) parent.appendChild(this.superchatLayer);
    const band = this.getPinnedBandRect(playerRect.height);
    if (!band) {
      this.superchatLayer.style.display = 'none';
      return;
    }
    this.superchatLayer.classList.toggle('tbc-sc-bottom', band.vertical === 'bottom');
    this.superchatLayer.classList.toggle('tbc-sc-align-left', band.horizontal === 'left');
    this.superchatLayer.classList.toggle('tbc-sc-align-right', band.horizontal === 'right');
    const needsPinScroll = band.contentHeight > band.height + 2;
    this.superchatLayer.classList.toggle('tbc-sc-scrollable', needsPinScroll);
    const layerSize = needsPinScroll
      ? { height: `${band.height}px`, maxHeight: '' }
      : { height: 'auto', maxHeight: `${band.maxBand}px` };
    Object.assign(this.superchatLayer.style, fullscreen ? {
      display: 'flex',
      position: 'fixed',
      top: `${playerRect.top + band.top}px`,
      left: `${playerRect.left}px`,
      width: `${playerRect.width}px`,
      ...layerSize,
      zIndex: '10000',
    } : {
      display: 'flex',
      position: 'absolute',
      top: `${band.top}px`,
      left: '0',
      width: '100%',
      ...layerSize,
      zIndex: settings.superchatOverlayDanmaku === false ? '4' : '5',
    });
  }

  render(payload) {
    const settings = this.getSettings();
    if (payload.superchat && shouldSuppressSubscribeSuperchat(settings, payload)) return;
    if (payload.superchat && settings.superchatPinned) {
      this.queueSuperchat(payload);
      return;
    }
    this.renderScrolling(payload);
  }

  buildSuperchatMetaRow(meta, options = {}) {
    const badgeBeforeAmount = !!options.badgeBeforeAmount;
    const metaRow = document.createElement('div');
    metaRow.className = 'tbc-sc-meta';
    if (!meta) return metaRow;

    if (meta.kind === 'cheer' && meta.bits) {
      const amount = document.createElement('span');
      amount.className = 'tbc-sc-amount';
      amount.textContent = meta.amountLabel || `${meta.bits} Bits`;
      const tierText = meta.tierLabel || cheerTierBadgeLabel(meta.bits);
      const tier = tierText ? document.createElement('span') : null;
      if (tier) {
        tier.className = 'tbc-sc-badge tbc-sc-tier';
        tier.textContent = tierText;
      }
      if (badgeBeforeAmount && tier) {
        metaRow.append(tier, amount);
      } else if (tier) {
        metaRow.append(amount, tier);
      } else {
        metaRow.appendChild(amount);
      }
    } else if (meta.amountLabel) {
      const badge = document.createElement('span');
      badge.className = 'tbc-sc-badge';
      badge.textContent = meta.amountLabel;
      metaRow.appendChild(badge);
    }
    return metaRow;
  }

  queueSuperchat(payload) {
    if (!this.superchatLayer || !this.getSettings().enabled) return;
    this.pinnedItems = this.pinnedItems.filter((item) => item?.isConnected);
    if (this.pinnedItems.length >= this.maxPinned) {
      this.superchatQueue.push(payload);
      if (this.superchatQueue.length > this.maxPinned * 2) this.superchatQueue.shift();
      return;
    }
    this.mountSuperchat(payload);
  }

  truncateName(name, max = 12) {
    const text = String(name || '').trim();
    if (text.length <= max) return text;
    return `${text.slice(0, Math.max(1, max - 1))}…`;
  }

  mountSuperchat(payload) {
    const {
      username,
      message,
      parts,
      usernameColor,
      profileUrl,
      originalMessage,
      translated,
      superchatStyle,
      superchatMeta,
      avatarUrl,
      login,
    } = payload;
    const settings = this.getSettings();
    const hasEmote = Array.isArray(parts) && parts.some((part) => part.type === 'emote' && part.src);
    if (!this.superchatLayer || (!message && !hasEmote)) return;

    const animation = ['fade', 'slide', 'pop', 'shine'].includes(settings.superchatAnimation)
      ? settings.superchatAnimation
      : 'slide';
    const meta = superchatMeta || null;
    const duration = resolveSuperchatDuration(settings, meta);
    const compact = !!settings.superchatCompact;
    const maxWidth = clamp(Number(settings.superchatMaxWidth) || 420, 240, 720);
    const style = meta?.style || superchatStyle || {
      background: 'linear-gradient(135deg, #9147ff 0%, #772ce8 100%)',
      color: '#ffffff',
      accent: '#bf94ff',
    };
    const item = document.createElement('div');
    item.className = `tbc-superchat-item tbc-sc-${animation}${compact ? ' tbc-sc-compact' : ''}`;
    item.style.setProperty('--tbc-sc-duration', `${duration}s`);
    item.style.maxWidth = `min(${maxWidth}px, calc(100% - 24px))`;
    if (compact) item.style.minWidth = 'unset';
    item.style.setProperty('--tbc-sc-accent', safeCssColor(style.accent, '#bf94ff'));
    item.style.background = style.background || safeCssColor(style.background, '#9147ff');
    item.style.color = safeCssColor(style.color, '#ffffff');
    const baseFont = Math.max(14, settings.fontSize - 2);
    item.style.fontSize = compact
      ? `${Math.max(12, settings.fontSize - 5)}px`
      : `${baseFont}px`;
    item.style.fontFamily = settings.fontFamily;

    const avatar = document.createElement('img');
    avatar.className = 'tbc-sc-avatar';
    avatar.alt = '';
    avatar.draggable = false;
    avatar.src = avatarUrl || cachedAvatar(login || username, username, usernameColor);

    let main = null;
    let body = null;
    let track = null;

    if (compact) {
      const compactMain = document.createElement('div');
      compactMain.className = 'tbc-sc-compact-main';
      const nameEl = document.createElement('span');
      nameEl.className = 'tbc-sc-compact-name';
      const displayName = username || login || 'User';
      nameEl.textContent = this.truncateName(displayName, 10);
      nameEl.title = displayName;
      const metaRow = this.buildSuperchatMetaRow(meta, { badgeBeforeAmount: true });
      compactMain.append(nameEl, metaRow);
      item.append(avatar, compactMain);
    } else {
      const metaRow = this.buildSuperchatMetaRow(meta);
      main = document.createElement('div');
      main.className = 'tbc-sc-main';

      const head = document.createElement('div');
      head.className = 'tbc-sc-head';
      const nameEl = document.createElement('span');
      nameEl.className = 'tbc-sc-name';
      const displayName = username || login || 'User';
      nameEl.textContent = this.truncateName(displayName, 18);
      nameEl.title = displayName;
      head.appendChild(nameEl);
      if (metaRow.childElementCount) head.appendChild(metaRow);

      body = document.createElement('div');
      body.className = 'tbc-sc-body';
      track = document.createElement('div');
      track.className = 'tbc-sc-body-track';
      this.appendParts(track, parts?.length ? parts : [{ type: 'text', value: message }]);
      body.appendChild(track);
      main.append(head, body);
      item.append(avatar, main);
    }

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'tbc-sc-close';
    closeBtn.setAttribute('aria-label', t('superchatClose'));
    closeBtn.innerHTML = ICON_CLOSE;

    item.appendChild(closeBtn);
    item._tbcPayload = payload;
    this.superchatLayer.appendChild(item);
    this.pinnedItems.push(item);
    this.updateLayout();
    requestAnimationFrame(() => this.updateLayout());
    if (!compact && body && track) {
      requestAnimationFrame(() => this.armSuperchatMarquee(body, track));
    }
    if (!compact) requestSpeech(speechSourceText(message, parts));

    const loginKey = String(login || username || '').toLowerCase().replace(/^@+/, '');
    // Always resolve a real profile image via ViewerCard when possible (letter avatars are fallback only).
    if (loginKey && (!avatarUrl || String(avatarUrl).startsWith('data:'))) {
      fetchTwitchAvatar(loginKey).then((url) => {
        if (!url || !item.isConnected) return;
        avatar.src = url;
      });
    }

    let fallback = null;
    const armFallback = (ms) => {
      clearTimeout(fallback);
      fallback = setTimeout(() => this.finishSuperchat(item), ms);
    };
    armFallback((duration + 2) * 1000);
    item.addEventListener('animationend', (event) => {
      if (event.target !== item) return;
      if (/shine-sweep|marquee/i.test(event.animationName || '')) return;
      clearTimeout(fallback);
      this.finishSuperchat(item);
    });

    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      clearTimeout(fallback);
      if (typeof hideDanmakuTooltip === 'function' && activeTooltipItem === item) {
        hideDanmakuTooltip();
      }
      this.finishSuperchat(item);
    });

    const pausePin = () => clearTimeout(fallback);
    const resumePin = () => armFallback(20000);

    if (compact) {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.tbc-sc-close')) return;
        e.preventDefault();
        e.stopPropagation();
        pausePin();
        item.classList.add('tbc-paused');
        const mount = getDanmakuMount(item) || this.overlayEl || this.playerEl;
        openSuperchatDetailCard(mount, payload, {
          ...this._superchatHelpers(),
          onDismiss: () => {
            item.classList.remove('tbc-paused');
            resumePin();
          },
        });
      });
    } else {
      attachDanmakuInteraction(item, {
        username,
        usernameColor,
        profileUrl,
        originalMessage,
        translated,
        onPause: pausePin,
        onResume: resumePin,
      });
    }
  }

  armSuperchatMarquee(body, track) {
    if (!body || !track) return;
    const overflow = track.scrollWidth - body.clientWidth;
    if (overflow <= 8) return;
    track.classList.add('tbc-sc-marquee');
    track.style.setProperty('--tbc-sc-marquee-distance', `${overflow + 16}px`);
    track.style.setProperty('--tbc-sc-marquee-duration', `${Math.max(4, overflow / 28)}s`);
  }

  finishSuperchat(item) {
    if (!item) return;
    const index = this.pinnedItems.indexOf(item);
    if (index >= 0) this.pinnedItems.splice(index, 1);
    item.remove();
    while (this.pinnedItems.length < this.maxPinned) {
      const next = this.superchatQueue.shift();
      if (!next || !this.getSettings().superchatPinned || !this.getSettings().enabled) break;
      this.mountSuperchat(next);
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

  renderScrolling(payload) {
    const {
      username,
      message,
      parts,
      usernameColor,
      profileUrl,
      originalMessage,
      translated,
    } = payload || {};
    const settings = this.getSettings();
    const displayParts = parts?.length
      ? parts
      : (message ? [{ type: 'text', value: message }] : []);
    if (!settings.enabled || !displayParts.length) return;

    if (typeof this.onComment === 'function') {
      try {
        this.onComment(payload);
      } catch (error) {
        console.error('[TBC] PiP danmaku failed:', error);
      }
    }

    if (!this.layer) return;

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
