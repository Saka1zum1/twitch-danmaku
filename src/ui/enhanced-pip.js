class EnhancedPip {
  constructor({ getSettings, danmaku, favoritesPanel, onToggleDanmaku, onOpenSettings, onStateChange } = {}) {
    this.getSettings = getSettings;
    this.danmaku = danmaku || null;
    this.favoritesPanel = favoritesPanel || null;
    this.onToggleDanmaku = onToggleDanmaku;
    this.onOpenSettings = onOpenSettings;
    this.onStateChange = onStateChange;
    this.pipWindow = null;
    this.sourceVideo = null;
    this.pipVideo = null;
    this.laneManager = new LaneManager();
    this.opening = false;
    this.inputOpen = false;
    this.favOpen = false;
    this.sending = false;
    this.nodes = null;
    this.keepAliveVideo = null;
    this.keepAliveHandle = null;
    this.keepAliveTimer = null;
    this.closedTimer = null;
    this.pageToastTimer = null;
    this.toastTimer = null;
    this.statusTimer = null;
    this.boundPlay = () => this.syncPlayback();
    this.boundPause = () => this.syncPlayback();
    this.boundResize = () => this.resetLanes();
    this.boundPageHide = () => this.cleanup();
    this.boundKeyDown = (event) => this.onKeyDown(event);
    this.boundComment = (payload) => this.renderComment(payload);
  }

  pageWindow() {
    try {
      if (typeof unsafeWindow !== 'undefined' && unsafeWindow?.documentPictureInPicture) {
        return unsafeWindow;
      }
    } catch (error) {
      // The sandbox may refuse unsafeWindow; the page window is the fallback.
    }
    return window;
  }

  isSupported() {
    const api = this.pageWindow().documentPictureInPicture;
    return typeof api?.requestWindow === 'function';
  }

  isOpen() {
    return !!(this.pipWindow && !this.pipWindow.closed);
  }

  isMediaStream(value) {
    return !!value && typeof value.getVideoTracks === 'function' && typeof value.getTracks === 'function';
  }

  captureSource(video) {
    const existing = video?.srcObject;
    if (this.isMediaStream(existing)) {
      try {
        const clone = typeof existing.clone === 'function' ? existing.clone() : null;
        if (this.isMediaStream(clone) && clone.getVideoTracks().length) return clone;
      } catch (error) {
        // Fall through to a fresh capture of a decoded element.
      }
    }
    if (typeof video?.captureStream !== 'function') return null;
    return video.captureStream();
  }

  findSourceVideo() {
    const root = document.querySelector(SELECTORS.videoPlayer);
    if (!root) return null;
    const videos = [...root.querySelectorAll('video')];
    const area = (video) => (video.videoWidth || 0) * (video.videoHeight || 0);
    const playing = videos
      .filter((video) => video.videoWidth > 0 && !video.paused && video.readyState >= 2)
      .sort((a, b) => area(b) - area(a));
    if (playing.length) return playing[0];
    const sized = videos
      .filter((video) => video.videoWidth > 0)
      .sort((a, b) => area(b) - area(a));
    if (sized.length) return sized[0];
    return videos[0] || null;
  }

  toggle() {
    if (this.opening) return;
    if (this.isOpen()) {
      this.close(true);
      return;
    }
    this.open();
  }

  async open() {
    if (this.opening || this.isOpen()) {
      if (this.isOpen()) {
        try { this.pipWindow.focus(); } catch (error) { /* window may already be closing */ }
      }
      return;
    }
    if (!this.isSupported()) {
      this.showPageToast(t('pipNeedBrowser'));
      return;
    }

    const source = this.findSourceVideo();
    if (!source || (typeof source.captureStream !== 'function' && !this.isMediaStream(source.srcObject))) {
      this.showPageToast(t('pipNoVideo'));
      return;
    }

    let stream = null;
    try {
      stream = this.captureSource(source);
    } catch (error) {
      this.showPageToast(t('pipCaptureFailed'));
      return;
    }
    if (!stream) {
      this.showPageToast(t('pipCaptureFailed'));
      return;
    }

    this.opening = true;
    let pipWindow = null;
    try {
      pipWindow = await this.pageWindow().documentPictureInPicture.requestWindow({
        width: 670,
        height: 380,
      });
    } catch (error) {
      this.stopStream(stream);
      this.showPageToast(t('pipOpenFailed'));
      return;
    } finally {
      this.opening = false;
    }

    if (!pipWindow) {
      this.stopStream(stream);
      this.showPageToast(t('pipOpenFailed'));
      return;
    }

    this.pipWindow = pipWindow;
    this.sourceVideo = source;
    this.mountDocument(pipWindow);
    const pipVideo = this.nodes.video;
    this.pipVideo = pipVideo;
    pipVideo.srcObject = stream;
    pipVideo.muted = true;
    try { await pipVideo.play(); } catch (error) { /* autoplay can reject until the next frame */ }

    this.dimSource(true);
    this.bindSourceSync(source);
    this.startKeepAlive(source);
    this.attachDanmaku();
    this.bindCleanup(pipWindow);
    this.syncSettings();
    this.syncPlayback();
    this.onStateChange?.();
    try { pipWindow.focus(); } catch (error) { /* focus is best-effort */ }
  }

  close(focusOpener = false) {
    const source = this.sourceVideo;
    this.cleanup();
    if (focusOpener) {
      try { window.focus(); } catch (error) { /* opener may be gone */ }
      try { source?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (error) { /* not laid out */ }
    }
  }

  destroy() {
    this.close(false);
    this.clearPageToast();
  }

  cleanup() {
    if (!this.pipWindow && !this.sourceVideo && !this.pipVideo) return;
    const win = this.pipWindow;
    const pipVideo = this.pipVideo;
    this.pipWindow = null;
    this.pipVideo = null;

    this.detachDanmaku();
    this.stopKeepAlive();
    this.unbindSourceSync();
    this.dimSource(false);
    clearInterval(this.closedTimer);
    this.closedTimer = null;
    clearTimeout(this.toastTimer);
    this.toastTimer = null;
    clearTimeout(this.statusTimer);
    this.statusTimer = null;

    if (win) {
      win.removeEventListener('pagehide', this.boundPageHide);
      win.removeEventListener('resize', this.boundResize);
      win.document?.removeEventListener('keydown', this.boundKeyDown, true);
    }
    this.stopStream(pipVideo?.srcObject);
    if (pipVideo) pipVideo.srcObject = null;

    this.nodes = null;
    this.inputOpen = false;
    this.favOpen = false;
    this.sending = false;
    this.sourceVideo = null;

    if (win && !win.closed) {
      try { win.close(); } catch (error) { /* already closing */ }
    }
    this.onStateChange?.();
  }

  stopStream(stream) {
    try {
      stream?.getTracks?.().forEach((track) => track.stop());
    } catch (error) {
      // Stopping a capture track must not break the source video.
    }
  }

  dimSource(hidden) {
    const video = this.sourceVideo;
    if (!video) return;
    if (hidden) {
      video.style.setProperty('opacity', '0.01', 'important');
      video.style.setProperty('pointer-events', 'none', 'important');
      return;
    }
    video.style.removeProperty('opacity');
    video.style.removeProperty('pointer-events');
  }

  bindSourceSync(source) {
    source.addEventListener('play', this.boundPlay);
    source.addEventListener('pause', this.boundPause);
  }

  unbindSourceSync() {
    const source = this.sourceVideo;
    if (!source) return;
    source.removeEventListener('play', this.boundPlay);
    source.removeEventListener('pause', this.boundPause);
  }

  syncPlayback() {
    const source = this.sourceVideo;
    const pipVideo = this.pipVideo;
    if (!source || !pipVideo) return;
    if (source.paused) pipVideo.pause();
    else pipVideo.play().catch(() => {});
  }

  startKeepAlive(video) {
    this.stopKeepAlive();
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 2;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    this.keepAliveVideo = video;
    const tick = () => {
      if (!this.isOpen() || this.keepAliveVideo !== video) return;
      try {
        if (video.readyState >= 2) context.drawImage(video, 0, 0, 2, 2);
      } catch (error) {
        // A tainted frame should not stop the keep-alive loop.
      }
      if (typeof video.requestVideoFrameCallback === 'function') {
        this.keepAliveHandle = video.requestVideoFrameCallback(tick);
      } else {
        this.keepAliveTimer = setTimeout(tick, 200);
      }
    };
    tick();
  }

  stopKeepAlive() {
    const video = this.keepAliveVideo;
    if (video && this.keepAliveHandle != null && typeof video.cancelVideoFrameCallback === 'function') {
      try { video.cancelVideoFrameCallback(this.keepAliveHandle); } catch (error) { /* already cancelled */ }
    }
    clearTimeout(this.keepAliveTimer);
    this.keepAliveHandle = null;
    this.keepAliveTimer = null;
    this.keepAliveVideo = null;
  }

  bindCleanup(pipWindow) {
    pipWindow.addEventListener('pagehide', this.boundPageHide);
    clearInterval(this.closedTimer);
    this.closedTimer = setInterval(() => {
      if (this.pipWindow?.closed) this.cleanup();
    }, 1000);
  }

  attachDanmaku() {
    if (!this.danmaku) return;
    this.danmaku.onComment = this.boundComment;
  }

  detachDanmaku() {
    if (this.danmaku?.onComment === this.boundComment) this.danmaku.onComment = null;
  }

  syncSettings() {
    if (!this.isOpen()) return;
    this.applyDanmakuVisibility();
    this.resetLanes();
  }

  applyDanmakuVisibility() {
    const layer = this.nodes?.layer;
    const button = this.nodes?.danmakuBtn;
    if (!layer) return;
    const enabled = !!this.getSettings().enabled;
    layer.style.visibility = enabled ? '' : 'hidden';
    button?.classList.toggle('is-off', !enabled);
    if (button) {
      button.title = enabled ? t('danmakuOn') : t('danmakuOff');
      button.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    }
  }

  resetLanes() {
    if (!this.isOpen()) return;
    const metrics = this.laneMetrics();
    this.laneManager.reset(metrics.count, metrics.laneHeight);
  }

  laneMetrics() {
    const settings = this.getSettings();
    const win = this.pipWindow;
    const main = this.nodes?.main;
    const height = main?.clientHeight || win?.innerHeight || 1;
    const laneHeight = Math.max(14, (Number(settings.fontSize) || 22) + 6);
    let areaHeight = height;
    if (settings.scrollArea === 'top-half') areaHeight = height * 0.5;
    else if (settings.scrollArea === 'bottom-half') {
      const reserve = this.inputOpen ? (this.nodes?.input?.offsetHeight || 52) + 4 : 0;
      areaHeight = Math.max(laneHeight, height * 0.5 - reserve);
    } else if (settings.scrollArea === 'top-quarter') areaHeight = height * 0.25;
    else {
      const reserve = this.inputOpen ? (this.nodes?.input?.offsetHeight || 52) + 4 : 0;
      areaHeight = Math.max(laneHeight, height - reserve);
    }
    return {
      laneHeight,
      count: Math.max(1, Math.floor(areaHeight / laneHeight)),
    };
  }

  renderComment(payload) {
    if (!this.isOpen() || !this.nodes?.layer) return;
    const settings = this.getSettings();
    if (!settings.enabled) return;
    const parts = payload?.parts?.length
      ? payload.parts
      : (payload?.message ? [{ type: 'text', value: payload.message }] : []);
    if (!parts.length) return;

    const doc = this.pipWindow.document;
    const layer = this.nodes.layer;
    const item = doc.createElement('div');
    item.className = 'tbc-pip-dm';
    this.appendParts(doc, item, parts);
    const opacity = clamp(Number(settings.danmakuOpacity) || 100, 10, 100) / 100;
    item.style.color = payload.usernameColor || '#efeff1';
    item.style.fontSize = `${settings.fontSize || 22}px`;
    item.style.fontFamily = settings.fontFamily || 'sans-serif';
    item.style.opacity = String(opacity);
    item.style.visibility = 'hidden';
    item.style.animation = 'none';
    layer.appendChild(item);

    const layerWidth = layer.clientWidth || this.pipWindow.innerWidth || 670;
    const itemWidth = item.offsetWidth;
    const speed = clamp(Number(settings.speed) || 5, 1, 10);
    const travel = layerWidth + itemWidth;
    const durationMs = Math.round((travel / Math.max(1, layerWidth)) * (30000 / speed));
    const metrics = this.laneMetrics();
    if (!this.laneManager.lanes.length) this.laneManager.reset(metrics.count, metrics.laneHeight);
    const lane = this.laneManager.acquire(durationMs);

    item.style.top = `${lane * metrics.laneHeight}px`;
    item.style.left = `${layerWidth}px`;
    item.style.setProperty('--tbc-travel', `${travel}px`);
    item.style.setProperty('--tbc-duration', `${durationMs}ms`);
    item.style.visibility = '';
    item.addEventListener('animationend', () => item.remove(), { once: true });
    void item.offsetWidth;
    item.style.animation = '';
  }

  appendParts(doc, item, parts) {
    for (const part of parts) {
      if (part.type === 'emote' && part.src) {
        const img = doc.createElement('img');
        img.className = 'tbc-pip-emote';
        img.src = part.src;
        img.alt = part.name || '';
        img.draggable = false;
        item.appendChild(img);
        continue;
      }
      const text = part.type === 'emote' ? (part.name || '') : (part.value || '');
      if (text) item.appendChild(doc.createTextNode(text));
    }
  }

  mountDocument(pipWindow) {
    const doc = pipWindow.document;
    doc.documentElement.lang = document.documentElement.lang || 'zh-CN';
    doc.head.replaceChildren();
    doc.body.replaceChildren();
    const title = doc.createElement('title');
    title.textContent = t('pipTitle');
    doc.head.appendChild(title);
    doc.title = t('pipTitle');

    const style = doc.createElement('style');
    style.textContent = this.windowCss();
    doc.head.appendChild(style);

    const wrap = doc.createElement('div');
    wrap.id = 'tbc-pip-wrap';
    const main = doc.createElement('div');
    main.id = 'tbc-pip-main';

    const back = this.makeButton(doc, 'tbc-pip-back', t('pipBack'), t('pipBack'));
    back.textContent = t('pipBack');

    const buttons = doc.createElement('div');
    buttons.id = 'tbc-pip-btns';
    const reloadBtn = this.makeButton(doc, 'tbc-pip-reload', t('pipReload'), t('pipReload'), this.iconReload());
    const danmakuBtn = this.makeButton(doc, 'tbc-pip-danmaku-btn', t('pipDanmaku'), t('pipDanmaku'), ICON_DANMAKU_ON);
    const settingsBtn = this.makeButton(doc, 'tbc-pip-settings', t('pipSettings'), t('pipSettings'), ICON_SETTINGS);
    const sendBtn = this.makeButton(doc, 'tbc-pip-send', t('pipSend'), t('pipSend'), ICON_CHAT_SEND);
    buttons.append(reloadBtn, danmakuBtn, settingsBtn, sendBtn);

    const video = doc.createElement('video');
    video.id = 'tbc-pip-video';
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');

    const layer = doc.createElement('div');
    layer.id = 'tbc-pip-danmaku';

    const toast = doc.createElement('div');
    toast.id = 'tbc-pip-toast';

    const input = doc.createElement('div');
    input.id = 'tbc-pip-input';
    const field = doc.createElement('input');
    field.id = 'tbc-pip-field';
    field.type = 'text';
    field.maxLength = 500;
    field.autocomplete = 'off';
    field.spellcheck = true;
    field.placeholder = currentVodId() ? t('pipVodNoSend') : t('fsChatPlaceholder');

    const favWrap = doc.createElement('div');
    favWrap.className = 'tbc-pip-fav-wrap';
    const favBtn = this.makeButton(doc, 'tbc-pip-fav', t('fsChatFavorites'), t('fsChatFavorites'), ICON_FAVORITE);
    const favList = doc.createElement('div');
    favList.id = 'tbc-pip-fav-list';
    favList.hidden = true;
    favWrap.append(favBtn, favList);

    const submit = this.makeButton(doc, 'tbc-pip-submit', t('fsChatSend'), t('fsChatSend'));
    submit.textContent = t('fsChatSend');

    const status = doc.createElement('div');
    status.id = 'tbc-pip-status';

    input.append(field, favWrap, submit, status);
    main.append(back, buttons, video, layer, toast);
    wrap.append(main, input);
    doc.body.appendChild(wrap);

    this.nodes = {
      wrap, main, back, reloadBtn, danmakuBtn, settingsBtn, sendBtn,
      video, layer, toast, input, field, favBtn, favList, submit, status,
    };

    const stop = (event) => event.stopPropagation();
    reloadBtn.addEventListener('click', (event) => {
      stop(event);
      this.reloadVideo();
    });
    danmakuBtn.addEventListener('click', (event) => {
      stop(event);
      this.onToggleDanmaku?.();
    });
    settingsBtn.addEventListener('click', (event) => {
      stop(event);
      this.openSettings();
    });
    sendBtn.addEventListener('click', (event) => {
      stop(event);
      this.setInputOpen(true);
    });
    back.addEventListener('click', (event) => {
      stop(event);
      this.close(true);
    });
    favBtn.addEventListener('click', (event) => {
      event.preventDefault();
      stop(event);
      this.toggleFavorites();
    });
    submit.addEventListener('click', (event) => {
      event.preventDefault();
      stop(event);
      this.submit();
    });
    main.addEventListener('click', (event) => {
      if (event.target.closest('#tbc-pip-btns, #tbc-pip-back, #tbc-pip-input')) return;
      this.setInputOpen(false);
    });
    pipWindow.addEventListener('resize', this.boundResize);
    doc.addEventListener('keydown', this.boundKeyDown, true);
    this.resetLanes();
    pipWindow.requestAnimationFrame(() => this.resetLanes());
  }

  makeButton(doc, id, label, title, html) {
    const button = doc.createElement('button');
    button.type = 'button';
    button.id = id;
    button.className = id === 'tbc-pip-back' || id === 'tbc-pip-submit' || id === 'tbc-pip-fav'
      ? id
      : 'tbc-pip-btn';
    if (id === 'tbc-pip-fav' || id === 'tbc-pip-submit' || id === 'tbc-pip-back') {
      button.className = id;
    }
    button.setAttribute('aria-label', label);
    button.title = title;
    if (html) button.innerHTML = html;
    return button;
  }

  iconReload() {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.65 6.35A7.95 7.95 0 0 0 12 4a8 8 0 1 0 7.75 10h-2.1A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>';
  }

  windowCss() {
    return `
      html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; background: #000; }
      #tbc-pip-wrap, #tbc-pip-main { position: relative; width: 100%; height: 100%; overflow: hidden; }
      #tbc-pip-video {
        position: absolute; inset: 0; width: 100%; height: 100%;
        object-fit: fill; background: #000; z-index: 1;
      }
      #tbc-pip-danmaku { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 2; }
      .tbc-pip-dm {
        position: absolute; white-space: nowrap; font-weight: 700; line-height: 1.2;
        pointer-events: none; will-change: transform;
        text-shadow: 1px 1px 2px rgba(0,0,0,.9), -1px -1px 2px rgba(0,0,0,.9), 0 0 4px rgba(0,0,0,.8);
        animation: tbc-pip-scroll var(--tbc-duration, 8s) linear forwards;
      }
      .tbc-pip-emote {
        height: 1.2em; width: auto; vertical-align: -0.22em; margin: 0 0.1em; pointer-events: none;
      }
      @keyframes tbc-pip-scroll {
        from { transform: translateX(0); }
        to { transform: translateX(calc(-1 * var(--tbc-travel, 100vw))); }
      }
      #tbc-pip-btns {
        position: absolute; top: 50%; left: -50px; transform: translateY(-50%);
        display: flex; flex-direction: column; gap: 8px; z-index: 5;
        transition: left 0.3s ease;
      }
      #tbc-pip-wrap:hover #tbc-pip-btns { left: 10px; }
      .tbc-pip-btn, #tbc-pip-fav {
        position: relative; width: 36px; height: 36px; padding: 0; box-sizing: border-box;
        border: 2px solid #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center;
        background: rgba(0,0,0,.58); color: #fff; cursor: pointer;
      }
      .tbc-pip-btn svg, #tbc-pip-fav svg { width: 18px; height: 18px; fill: currentColor; display: block; }
      .tbc-pip-btn:hover, #tbc-pip-fav:hover { background: rgba(0,0,0,.82); }
      #tbc-pip-danmaku-btn.is-off { opacity: 0.45; }
      #tbc-pip-danmaku-btn.is-off::after {
        content: ""; position: absolute; width: 22px; height: 2px; background: #fff; transform: rotate(-40deg);
      }
      #tbc-pip-back {
        position: absolute; top: 10px; right: -180px; z-index: 6;
        padding: 6px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,.35);
        background: rgba(0,0,0,.65); color: #fff; font: 600 14px/1.25 sans-serif;
        cursor: pointer; white-space: nowrap; transition: right 0.3s ease;
      }
      #tbc-pip-wrap:hover #tbc-pip-back { right: 10px; }
      #tbc-pip-back:hover { background: rgba(0,0,0,.88); }
      #tbc-pip-toast {
        position: absolute; left: 50%; top: 16px; transform: translateX(-50%);
        z-index: 7; padding: 6px 12px; border-radius: 6px; background: rgba(0,0,0,.72);
        color: #fff; font: 13px/1.3 sans-serif; opacity: 0; pointer-events: none; transition: opacity .2s;
      }
      #tbc-pip-toast.is-show { opacity: 1; }
      #tbc-pip-input {
        display: none; position: absolute; left: 0; right: 0; bottom: 0; z-index: 8;
        box-sizing: border-box; gap: 8px; padding: 8px 10px; align-items: center; flex-wrap: wrap;
        background: rgba(14,14,16,.94); border-top: 1px solid rgba(255,255,255,.12);
        font-family: sans-serif;
      }
      #tbc-pip-input.is-active { display: flex; }
      #tbc-pip-field {
        flex: 1; min-width: 0; height: 34px; box-sizing: border-box; padding: 0 10px;
        border-radius: 6px; border: 1px solid rgba(255,255,255,.16); background: #18181b;
        color: #efeff1; font-size: 14px; outline: none;
      }
      #tbc-pip-field:focus { border-color: #9147ff; }
      #tbc-pip-fav { flex-shrink: 0; }
      .tbc-pip-fav-wrap { position: relative; flex-shrink: 0; }
      #tbc-pip-fav-list {
        position: absolute; left: 0; bottom: calc(100% + 6px); width: 220px; max-height: 180px;
        overflow: auto; background: #18181b; border: 1px solid rgba(255,255,255,.14); border-radius: 6px;
      }
      .tbc-pip-fav-item, .tbc-pip-fav-empty {
        display: block; width: 100%; box-sizing: border-box; text-align: left; background: transparent;
        color: #efeff1; border: 0; padding: 8px 10px; font-size: 13px;
      }
      .tbc-pip-fav-item { cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .tbc-pip-fav-item:hover { background: rgba(255,255,255,.08); }
      .tbc-pip-fav-empty { color: #adadb8; }
      #tbc-pip-submit {
        flex-shrink: 0; height: 34px; padding: 0 12px; border: 0; border-radius: 6px;
        background: #9147ff; color: #fff; font-weight: 700; cursor: pointer;
      }
      #tbc-pip-submit:disabled { opacity: 0.55; cursor: default; }
      #tbc-pip-status { flex: 1 0 100%; min-height: 0; color: #ff8280; font-size: 12px; line-height: 1.35; }
      #tbc-pip-status:empty { display: none; }
      #tbc-pip-status.is-ok { color: #00f593; }
    `;
  }

  onKeyDown(event) {
    if (!this.isOpen() || event.isComposing) return;
    if (event.key === 'Escape') {
      if (this.favOpen) {
        event.preventDefault();
        this.closeFavorites();
        return;
      }
      if (this.inputOpen) {
        event.preventDefault();
        this.setInputOpen(false);
      }
      return;
    }
    if (event.key !== 'Enter' || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const field = this.nodes?.field;
    if (field && this.pipWindow.document.activeElement === field) {
      event.preventDefault();
      this.submit();
      return;
    }
    event.preventDefault();
    this.setInputOpen(true);
  }

  setInputOpen(open) {
    if (!this.nodes?.input) return;
    this.inputOpen = !!open;
    this.nodes.input.classList.toggle('is-active', this.inputOpen);
    if (!this.inputOpen) this.closeFavorites();
    if (this.inputOpen) {
      this.nodes.field.placeholder = currentVodId() ? t('pipVodNoSend') : t('fsChatPlaceholder');
      this.pipWindow.requestAnimationFrame(() => this.nodes?.field?.focus());
    }
    this.resetLanes();
  }

  async reloadVideo() {
    const source = this.sourceVideo;
    const pipVideo = this.pipVideo;
    if (!source || !pipVideo || (typeof source.captureStream !== 'function' && !this.isMediaStream(source.srcObject))) {
      this.showToast(t('pipReloadFailed'));
      return;
    }
    try {
      if (source.paused) await source.play();
    } catch (error) {
      // Keep going; a paused source can still be recaptured.
    }
    let stream = null;
    try {
      stream = this.captureSource(source);
    } catch (error) {
      this.showToast(t('pipReloadFailed'));
      return;
    }
    if (!stream) {
      this.showToast(t('pipReloadFailed'));
      return;
    }
    const previous = pipVideo.srcObject;
    pipVideo.srcObject = stream;
    pipVideo.muted = true;
    if (previous && previous !== stream) this.stopStream(previous);
    if (source.paused) pipVideo.pause();
    else {
      try { await pipVideo.play(); } catch (error) { /* the next source play event retries */ }
    }
    try { this.pipWindow?.focus(); } catch (error) { /* focus is best-effort */ }
    this.showToast(t('pipReloaded'));
  }

  openSettings() {
    try { window.focus(); } catch (error) { /* opener focus can fail */ }
    try { this.sourceVideo?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (error) { /* not laid out */ }
    this.onOpenSettings?.();
    this.showToast(t('pipSettingsHint'));
  }

  showToast(message) {
    const toast = this.nodes?.toast;
    if (!toast) return;
    toast.textContent = message || '';
    toast.classList.add('is-show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => toast.classList.remove('is-show'), 2000);
  }

  showPageToast(message) {
    let toast = document.getElementById('tbc-pip-page-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'tbc-pip-page-toast';
      toast.className = 'tbc-pip-page-toast';
      (document.body || document.documentElement).appendChild(toast);
    }
    toast.textContent = message || '';
    toast.classList.add('is-show');
    clearTimeout(this.pageToastTimer);
    this.pageToastTimer = setTimeout(() => toast.classList.remove('is-show'), 2800);
  }

  clearPageToast() {
    clearTimeout(this.pageToastTimer);
    document.getElementById('tbc-pip-page-toast')?.remove();
  }

  listFavoriteItems() {
    if (this.favoritesPanel?.visibleItems) {
      this.favoritesPanel.state = loadFavoritesState();
      return this.favoritesPanel.visibleItems();
    }
    return listFavoritesForChannel(loadFavoritesState(), currentChannelLogin?.() || '');
  }

  toggleFavorites() {
    if (this.favOpen) this.closeFavorites();
    else this.openFavorites();
  }

  openFavorites() {
    const list = this.nodes?.favList;
    const button = this.nodes?.favBtn;
    if (!list || !button) return;
    this.renderFavorites();
    list.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    this.favOpen = true;
  }

  closeFavorites() {
    const list = this.nodes?.favList;
    const button = this.nodes?.favBtn;
    if (list) {
      list.hidden = true;
      list.replaceChildren();
    }
    button?.setAttribute('aria-expanded', 'false');
    this.favOpen = false;
  }

  renderFavorites() {
    const list = this.nodes?.favList;
    if (!list) return;
    const doc = this.pipWindow.document;
    list.replaceChildren();
    const items = this.listFavoriteItems();
    if (!items.length) {
      const empty = doc.createElement('div');
      empty.className = 'tbc-pip-fav-empty';
      empty.textContent = t('fsChatFavoritesEmpty');
      list.appendChild(empty);
      return;
    }
    items.forEach((item) => {
      const button = doc.createElement('button');
      button.type = 'button';
      button.className = 'tbc-pip-fav-item';
      button.title = item.text;
      button.textContent = item.text;
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const field = this.nodes?.field;
        if (field) {
          field.value = item.text;
          field.focus();
          const len = field.value.length;
          field.setSelectionRange(len, len);
        }
        this.closeFavorites();
      });
      list.appendChild(button);
    });
  }

  setStatus(message, ok = false) {
    const status = this.nodes?.status;
    if (!status) return;
    status.textContent = message || '';
    status.classList.toggle('is-ok', !!ok && !!message);
  }

  async submit() {
    const field = this.nodes?.field;
    if (!field || this.sending) return;
    const text = field.value.trim();
    if (!text) {
      this.setStatus('');
      return;
    }
    if (currentVodId()) {
      this.setStatus(t('pipVodNoSend'), false);
      return;
    }

    this.sending = true;
    if (this.nodes.submit) this.nodes.submit.disabled = true;
    this.closeFavorites();
    this.setStatus('');
    try {
      await sendTwitchChatMessage(text);
      field.value = '';
      this.setStatus(t('fsChatSent'), true);
      clearTimeout(this.statusTimer);
      this.statusTimer = setTimeout(() => {
        if (this.nodes?.status?.textContent === t('fsChatSent')) this.setStatus('');
      }, 1200);
    } catch (error) {
      this.setStatus(chatSendErrorMessage(error), false);
    } finally {
      this.sending = false;
      if (this.nodes?.submit) this.nodes.submit.disabled = false;
      field.focus();
    }
  }
}
