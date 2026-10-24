class FullscreenChatInput {
  constructor() {
    this.root = null;
    this.input = null;
    this.sendBtn = null;
    this.closeBtn = null;
    this.statusEl = null;
    this.sending = false;
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

    const hint = document.createElement('div');
    hint.className = 'tbc-fs-chat-hint';
    hint.textContent = t('fsChatHint');

    const status = document.createElement('div');
    status.className = 'tbc-fs-chat-status';

    row.append(input, sendBtn, closeBtn);
    meta.append(hint, status);
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
    this.sendBtn = sendBtn;
    this.closeBtn = closeBtn;
    this.statusEl = status;

    requestAnimationFrame(() => {
      input.focus();
    });
  }

  close() {
    this.root?.remove();
    this.root = null;
    this.input = null;
    this.sendBtn = null;
    this.closeBtn = null;
    this.statusEl = null;
    this.sending = false;
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
    this.setStatus('');

    try {
      await sendTwitchChatMessage(text);
      this.input.value = '';
      this.setStatus(t('fsChatSent'), true);
      setTimeout(() => {
        if (this.statusEl?.textContent === t('fsChatSent')) this.setStatus('');
      }, 1200);
    } catch (error) {
      const code = error?.code || '';
      if (code === 'not_logged_in') {
        this.setStatus(t('fsChatNeedLogin'));
      } else {
        this.setStatus(t('fsChatFailed'));
      }
    } finally {
      this.sending = false;
      if (this.sendBtn) this.sendBtn.disabled = false;
      this.input?.focus();
    }
  }
}
