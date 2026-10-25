class FullscreenChatInput {
  constructor({ favoritesPanel } = {}) {
    this.favoritesPanel = favoritesPanel || null;
    this.root = null;
    this.input = null;
    this.sendBtn = null;
    this.closeBtn = null;
    this.favBtn = null;
    this.favList = null;
    this.statusEl = null;
    this.sending = false;
    this.favOpen = false;
    this.boundKeyDown = (e) => this.onKeyDown(e);
    this.boundFsChange = () => this.onFullscreenChange();
    this.boundPointerDown = (e) => this.onPointerDownOutside(e);
  }

  attach() {
    document.addEventListener('keydown', this.boundKeyDown, true);
    document.addEventListener('pointerdown', this.boundPointerDown, true);
    document.addEventListener('fullscreenchange', this.boundFsChange);
    document.addEventListener('webkitfullscreenchange', this.boundFsChange);
  }

  destroy() {
    this.close();
    document.removeEventListener('keydown', this.boundKeyDown, true);
    document.removeEventListener('pointerdown', this.boundPointerDown, true);
    document.removeEventListener('fullscreenchange', this.boundFsChange);
    document.removeEventListener('webkitfullscreenchange', this.boundFsChange);
  }

  isEditableTarget(target) {
    if (!target || target === document.body || target === document.documentElement) return false;
    const el = target.nodeType === 1 ? target : target.parentElement;
    if (!el) return false;
    const tag = el.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (el.isContentEditable) return true;
    return !!el.closest?.('input, textarea, select, [contenteditable="true"], [role="textbox"]');
  }

  canOpen() {
    if (!getFullscreenElement()) return false;
    if (currentVodId()) return false;
    return !!currentChannelLogin();
  }

  stopEvent(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  }

  onKeyDown(e) {
    if (e.isComposing) return;
    if (e.key === 'Escape' && this.root) {
      if (this.favOpen) {
        this.stopEvent(e);
        this.closeFavorites();
        return;
      }
    }
    if (e.key !== 'Enter') return;
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;

    if (this.root) {
      if (e.target === this.input || this.root.contains(e.target)) {
        this.stopEvent(e);
        this.submit();
      }
      return;
    }

    if (!this.canOpen()) return;
    if (this.isEditableTarget(e.target)) return;

    this.stopEvent(e);
    this.open();
  }

  onPointerDownOutside(e) {
    if (!this.root) return;
    if (this.root.contains(e.target)) return;
    if (this.input?.value.trim()) return;
    this.close();
  }

  onFullscreenChange() {
    if (!getFullscreenElement()) this.close();
  }

  setStatus(message, ok = false) {
    if (!this.statusEl) return;
    this.statusEl.textContent = message || '';
    this.statusEl.classList.toggle('is-ok', !!ok && !!message);
  }

  listFavoriteItems() {
    if (this.favoritesPanel?.visibleItems) {
      this.favoritesPanel.state = loadFavoritesState();
      return this.favoritesPanel.visibleItems();
    }
    const state = loadFavoritesState();
    return listFavoritesForChannel(state, currentChannelLogin?.() || '');
  }

  open() {
    if (this.root) {
      this.input?.focus();
      return;
    }

    const mount = getFullscreenElement();
    if (!mount) return;

    if (getComputedStyle(mount).position === 'static') {
      mount.style.position = 'relative';
    }

    const root = document.createElement('div');
    root.className = 'tbc-fs-chat';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', t('fsChatPlaceholder'));

    const row = document.createElement('div');
    row.className = 'tbc-fs-chat-row';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'tbc-fs-chat-input';
    input.maxLength = 500;
    input.autocomplete = 'off';
    input.spellcheck = true;
    input.placeholder = t('fsChatPlaceholder');

    const favWrap = document.createElement('div');
    favWrap.className = 'tbc-fs-chat-fav-wrap';

    const favBtn = document.createElement('button');
    favBtn.type = 'button';
    favBtn.className = 'tbc-fs-chat-fav';
    favBtn.setAttribute('aria-label', t('fsChatFavorites'));
    favBtn.setAttribute('aria-expanded', 'false');
    favBtn.innerHTML = `${ICON_FAVORITE}<span>${t('fsChatFavorites')}</span>`;

    const favList = document.createElement('div');
    favList.className = 'tbc-fs-chat-fav-list';
    favList.hidden = true;
    favList.setAttribute('role', 'listbox');
    favList.setAttribute('aria-label', t('fsChatFavorites'));

    favWrap.append(favBtn, favList);

    const sendBtn = document.createElement('button');
    sendBtn.type = 'button';
    sendBtn.className = 'tbc-fs-chat-send';
    sendBtn.setAttribute('aria-label', t('fsChatSend'));
    sendBtn.innerHTML = `${ICON_CHAT_SEND}<span>${t('fsChatSend')}</span>`;

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'tbc-fs-chat-close';
    closeBtn.setAttribute('aria-label', t('fsChatClose'));
    closeBtn.textContent = t('fsChatClose');

    const meta = document.createElement('div');
    meta.className = 'tbc-fs-chat-meta';

    const status = document.createElement('div');
    status.className = 'tbc-fs-chat-status';

    row.append(input, favWrap, sendBtn, closeBtn);
    meta.append(status);
    root.append(row, meta);

    const trap = (e) => {
      e.stopPropagation();
    };
    root.addEventListener('keydown', trap);
    root.addEventListener('keyup', trap);
    root.addEventListener('keypress', trap);
    root.addEventListener('mousedown', trap);
    root.addEventListener('pointerdown', trap);
    root.addEventListener('click', trap);

    favBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleFavorites();
    });

    sendBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.submit();
    });

    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.close();
    });

    mount.appendChild(root);
    this.root = root;
    this.input = input;
    this.favBtn = favBtn;
    this.favList = favList;
    this.sendBtn = sendBtn;
    this.closeBtn = closeBtn;
    this.statusEl = status;
    this.favOpen = false;

    requestAnimationFrame(() => {
      input.focus();
    });
  }

  toggleFavorites() {
    if (this.favOpen) this.closeFavorites();
    else this.openFavorites();
  }

  openFavorites() {
    if (!this.favList || !this.favBtn) return;
    this.renderFavorites();
    this.favList.hidden = false;
    this.favBtn.setAttribute('aria-expanded', 'true');
    this.favBtn.classList.add('is-open');
    this.favOpen = true;
  }

  closeFavorites() {
    if (!this.favList || !this.favBtn) return;
    this.favList.hidden = true;
    this.favList.replaceChildren();
    this.favBtn.setAttribute('aria-expanded', 'false');
    this.favBtn.classList.remove('is-open');
    this.favOpen = false;
  }

  renderFavorites() {
    if (!this.favList) return;
    this.favList.replaceChildren();

    const items = this.listFavoriteItems();
    if (!items.length) {
      const empty = document.createElement('div');
      empty.className = 'tbc-fs-chat-fav-empty';
      empty.textContent = t('fsChatFavoritesEmpty');
      this.favList.appendChild(empty);
      return;
    }

    items.forEach((item) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tbc-fs-chat-fav-item';
      btn.setAttribute('role', 'option');
      btn.title = item.text;
      btn.textContent = item.text;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.input) {
          this.input.value = item.text;
          this.input.focus();
          const len = this.input.value.length;
          this.input.setSelectionRange(len, len);
        }
        this.closeFavorites();
      });
      this.favList.appendChild(btn);
    });
  }

  close() {
    this.closeFavorites();
    this.root?.remove();
    this.root = null;
    this.input = null;
    this.sendBtn = null;
    this.closeBtn = null;
    this.favBtn = null;
    this.favList = null;
    this.statusEl = null;
    this.sending = false;
    this.favOpen = false;
  }

  async submit() {
    if (!this.input || this.sending) return;
    const text = this.input.value.trim();
    if (!text) {
      this.setStatus('');
      return;
    }

    this.sending = true;
    if (this.sendBtn) this.sendBtn.disabled = true;
    this.closeFavorites();
    this.setStatus('');

    try {
      await sendTwitchChatMessage(text);
      this.input.value = '';
      this.setStatus(t('fsChatSent'), true);
      setTimeout(() => {
        if (this.statusEl?.textContent === t('fsChatSent')) this.setStatus('');
      }, 1200);
    } catch (error) {
      this.setStatus(chatSendErrorMessage(error));
    } finally {
      this.sending = false;
      if (this.sendBtn) this.sendBtn.disabled = false;
      this.input?.focus();
    }
  }
}
