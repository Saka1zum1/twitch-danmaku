class ChatContextMenu {
  constructor({ getSettings, danmakuEmitter, isActive, favoritesPanel }) {
    this.getSettings = getSettings;
    this.danmakuEmitter = danmakuEmitter;
    this.isActive = isActive;
    this.favoritesPanel = favoritesPanel;
    this.menu = null;
    this.targetEl = null;
    this.boundContext = (event) => this.handleContextMenu(event);
    this.boundClose = (event) => this.handleOutside(event);
    this.boundKey = (event) => {
      if (event.key === 'Escape') this.close();
    };
    this.attachedRoot = null;
  }

  attach(root = document) {
    this.detach();
    this.attachedRoot = root;
    root.addEventListener('contextmenu', this.boundContext, true);
  }

  detach() {
    this.close();
    this.attachedRoot?.removeEventListener('contextmenu', this.boundContext, true);
    this.attachedRoot = null;
  }

  findMessageEl(node) {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) {
      node = node?.parentElement;
    }
    return node?.closest?.(SELECTORS.chatMessage) || null;
  }

  handleContextMenu(event) {
    if (!this.isActive?.()) return;
    const msgEl = this.findMessageEl(event.target);
    if (!msgEl) return;
    const snapshot = snapshotChatMessage(msgEl);
    if (!snapshot?.message) return;

    event.preventDefault();
    event.stopPropagation();
    this.open(event.clientX, event.clientY, msgEl, snapshot);
  }

  handleOutside(event) {
    if (!this.menu) return;
    if (this.menu.contains(event.target)) return;
    this.close();
  }

  close() {
    this.menu?.remove();
    this.menu = null;
    this.targetEl = null;
    document.removeEventListener('click', this.boundClose, true);
    document.removeEventListener('keydown', this.boundKey, true);
    window.removeEventListener('scroll', this.boundClose, true);
    window.removeEventListener('resize', this.boundClose, true);
  }

  open(x, y, msgEl, snapshot) {
    this.close();
    this.targetEl = msgEl;
    this.menu = document.createElement('div');
    this.menu.className = 'tbc-chat-menu';
    this.menu.setAttribute('role', 'menu');

    const hasTranslation = !!msgEl.querySelector('.tbc-chat-translation');
    const login = normalizeTwitchLogin(snapshot.login || snapshot.username);
    this.menu.append(
      this.createItem(hasTranslation ? t('chatMenuRetranslate') : t('chatMenuTranslate'), () => {
        this.runTranslate(msgEl, snapshot, true);
      }),
      this.createItem(t('chatMenuSpeak'), () => {
        this.runSpeak(msgEl, snapshot);
      }),
      this.createItem(t('chatMenuResend'), () => {
        this.runResend(msgEl, snapshot, false);
      }),
      this.createItem(t('chatMenuFavorite'), () => {
        this.runFavorite(snapshot);
      }),
    );
    if (login) {
      this.menu.append(
        this.createItem(t('chatMenuBlockUser'), () => {
          this.runBlockUser(login);
        }),
      );
    }

    const mount = getFullscreenElement() || document.body;
    mount.appendChild(this.menu);

    const rect = this.menu.getBoundingClientRect();
    const left = clamp(x, 8, window.innerWidth - rect.width - 8);
    const top = clamp(y, 8, window.innerHeight - rect.height - 8);
    Object.assign(this.menu.style, {
      left: `${left}px`,
      top: `${top}px`,
    });

    setTimeout(() => {
      document.addEventListener('click', this.boundClose, true);
      document.addEventListener('keydown', this.boundKey, true);
      window.addEventListener('scroll', this.boundClose, true);
      window.addEventListener('resize', this.boundClose, true);
    }, 0);
  }

  createItem(label, onClick) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tbc-chat-menu-item';
    button.setAttribute('role', 'menuitem');
    button.textContent = label;
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.close();
      onClick();
    });
    return button;
  }

  async translateParts(snapshot, bustCache = false) {
    const settings = this.getSettings();
    const parts = snapshot.parts?.length
      ? snapshot.parts.map((part) => ({ ...part }))
      : [{ type: 'text', value: snapshot.message }];
    const refs = [];
    const pieces = [];
    parts.forEach((part, index) => {
      const core = part.type === 'text' ? translatableCore(part.value) : '';
      if (!core) return;
      if (bustCache) forgetCachedTranslation(core, settings.translateTargetLang);
      refs.push(index);
      pieces.push(core);
    });
    if (!pieces.length) return { parts, message: snapshot.message, translated: false };

    let provider = settings.translateProvider || 'auto';
    let outcome = await translateMessages(pieces, settings.translateTargetLang, provider);
    if (outcome.retryAfter && provider !== 'auto') {
      outcome = await translateMessages(pieces, settings.translateTargetLang, 'auto');
    }
    if (outcome.retryAfter || !Array.isArray(outcome.texts)) {
      return { parts, message: snapshot.message, translated: false, failed: true };
    }

    refs.forEach((partIndex, i) => {
      const part = parts[partIndex];
      const match = String(part.value).match(/^(\s*)([\s\S]*?)(\s*)$/);
      const translated = outcome.texts[i] || match[2];
      parts[partIndex] = {
        type: 'text',
        value: `${match[1]}${translated}${match[3]}`,
      };
    });
    const message = partsToPlain(parts) || snapshot.message;
    return { parts, message, translated: message !== snapshot.message, failed: false };
  }

  async runBlockUser(login) {
    try {
      await blockTwitchUser(login, { sourceContext: 'CHAT' });
      console.info(`[TBC] ${t('chatMenuBlockDone')}: ${login}`);
    } catch (error) {
      const code = error?.code || '';
      if (code === 'not_logged_in') {
        console.warn(`[TBC] ${t('chatMenuBlockNeedLogin')}`);
        return;
      }
      if (code === 'user_not_found') {
        console.warn(`[TBC] ${t('chatMenuBlockNotFound')}: ${login}`);
        return;
      }
      console.warn(`[TBC] ${t('chatMenuBlockFailed')}`, error);
    }
  }

  runFavorite(snapshot) {
    const text = String(snapshot?.message || '').trim();
    if (!text) return;
    if (this.favoritesPanel?.addFromText) {
      this.favoritesPanel.addFromText(text);
      if (!this.favoritesPanel.isOpen && this.favoritesPanel.btn) {
        this.favoritesPanel.open(this.favoritesPanel.btn);
      }
      return;
    }
    const result = addFavoriteText(text);
    if (result.full) {
      console.warn(`[TBC] ${t('favoritesFull')}`);
      return;
    }
    if (result.added) console.info(`[TBC] ${t('favoritesAdded')}`);
    else if (result.item) console.info(`[TBC] ${t('favoritesExists')}`);
  }

  async runTranslate(msgEl, snapshot, bustCache) {
    // Context-menu translate is always available; does not require settings.translateEnabled.
    const result = await this.translateParts(snapshot, bustCache);
    if (result.failed) return;
    applyChatTranslation(msgEl, result.message, snapshot.message, { manual: true });
  }

  runSpeak(msgEl, snapshot) {
    const settings = this.getSettings();
    if (!speechSupported()) return;
    // Prefer the on-screen chat translation when the user already translated this line.
    const translated = readChatTranslationText(msgEl);
    const source = translated || speechSourceText(snapshot.message, snapshot.parts);
    // Explicit menu action: use panel voice/rate/volume, even if auto-speak is off.
    if (Number(settings.speechVolume) <= 0) return;
    speakTextNow(source);
  }

  async runResend(msgEl, snapshot, forceTranslate) {
    const settings = this.getSettings();
    let message = snapshot.message;
    let parts = snapshot.parts;
    let translated = false;

    const shouldTranslate = forceTranslate || settings.translateEnabled;
    if (shouldTranslate) {
      const result = await this.translateParts(snapshot, forceTranslate);
      if (!result.failed) {
        message = result.message;
        parts = result.parts;
        translated = result.translated;
        if (settings.translateInChat || forceTranslate) {
          applyChatTranslation(msgEl, message, snapshot.message, {
            manual: !!forceTranslate,
          });
        }
      }
    }

    this.danmakuEmitter?.enqueue({
      username: snapshot.username,
      usernameColor: snapshot.usernameColor,
      profileUrl: snapshot.profileUrl,
      avatarUrl: snapshot.avatarUrl,
      originalMessage: snapshot.message,
      message,
      parts,
      translated,
      superchat: !!snapshot.superchat,
      superchatStyle: snapshot.superchatStyle,
      superchatMeta: snapshot.superchatMeta,
    });
  }
}
