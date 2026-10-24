const CHAT_CLEAR_MESSAGE_SELECTOR = [
  '.chat-line__message',
  '[data-a-target="chat-line-message"]',
  '[data-a-target="chat-message-container"]',
  '.user-notice-line',
  '[data-a-target="chat-welcome-message"]',
  '.chat-line__status',
].join(', ');

class ChatClearButton {
  constructor({ onClear } = {}) {
    this.onClear = onClear;
    this.wrap = null;
    this.btn = null;
    this.retryTimer = null;
  }

  findNativeInjectLayout() {
    const viewerBtn = document.querySelector(SELECTORS.chatViewerListBtn);
    if (!viewerBtn) return null;
    // Twitch wraps each header icon button in its own InjectLayout — clone that shell.
    const wrap = viewerBtn.closest('[class*="InjectLayout"]') || viewerBtn.parentElement;
    if (!wrap?.parentElement) return null;
    return { wrap, host: wrap.parentElement };
  }

  clearLiveChat() {
    const containers = document.querySelectorAll(SELECTORS.chatMessageContainer);
    let removed = 0;
    containers.forEach((container) => {
      container.querySelectorAll(CHAT_CLEAR_MESSAGE_SELECTOR).forEach((node) => {
        node.remove();
        removed += 1;
      });
    });

    if (!containers.length) {
      document.querySelectorAll('[data-a-target="chat-scroller"]').forEach((scroller) => {
        scroller.querySelectorAll(CHAT_CLEAR_MESSAGE_SELECTOR).forEach((node) => {
          node.remove();
          removed += 1;
        });
      });
    }

    this.onClear?.(removed);
    return removed;
  }

  applyClearIcon(btn) {
    const svg = btn.querySelector('svg');
    if (!svg) {
      btn.insertAdjacentHTML('beforeend', ICON_CHAT_CLEAR);
      return;
    }

    svg.setAttribute('viewBox', '0 0 1024 1024');
    svg.setAttribute('fill', 'currentColor');
    svg.removeAttribute('stroke');
    svg.removeAttribute('stroke-width');
    svg.setAttribute('aria-hidden', 'true');
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', ICON_CHAT_CLEAR_PATH);
    svg.appendChild(path);
  }

  applyLabel(btn, label = t('chatClear')) {
    btn.setAttribute('title', label);
    btn.setAttribute('data-a-target', 'tbc-chat-clear');
    btn.setAttribute('data-tbc-chat-clear', 'true');
    btn.removeAttribute('data-test-selector');
    btn.removeAttribute('id');
  }

  createFromInjectLayout(nativeWrap) {
    const wrap = nativeWrap.cloneNode(true);
    wrap.classList.add('tbc-chat-clear-wrap');
    wrap.setAttribute('data-tbc-chat-clear-wrap', 'true');
    wrap.removeAttribute('id');

    const btn = wrap.querySelector('button') || wrap.querySelector('[role="button"]');
    if (!btn) return null;

    btn.classList.add('tbc-chat-clear-btn');
    this.applyClearIcon(btn);
    this.applyLabel(btn);
    btn.type = 'button';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.clearLiveChat();
    });

    return { wrap, btn };
  }

  createFallbackButton() {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tbc-chat-clear-btn tbc-chat-clear-btn--fallback';
    btn.innerHTML = ICON_CHAT_CLEAR;
    this.applyLabel(btn);
    btn.setAttribute('title', t('chatClear'));
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.clearLiveChat();
    });
    return btn;
  }

  async mount() {
    if (this.wrap?.isConnected || this.btn?.isConnected) {
      this.refreshLabel();
      return;
    }

    const header = await waitForElement(SELECTORS.chatHeader, document, 12000);
    if (!header) return;
    if (header.querySelector('[data-tbc-chat-clear-wrap="true"], [data-tbc-chat-clear="true"]')) return;

    const native = this.findNativeInjectLayout();
    if (native?.wrap && native.host) {
      const created = this.createFromInjectLayout(native.wrap);
      if (created) {
        this.wrap = created.wrap;
        this.btn = created.btn;
        native.host.appendChild(this.wrap);
        return;
      }
    }

    // Preview / missing community button: plain styled control in the header actions row.
    const actions = header.querySelector(':scope > div:last-child') || header;
    this.btn = this.createFallbackButton();
    this.wrap = this.btn;
    actions.appendChild(this.btn);
  }

  refreshLabel() {
    if (!this.btn) return;
    this.applyLabel(this.btn);
    if (this.btn.classList.contains('tbc-chat-clear-btn--fallback')) {
      this.btn.setAttribute('title', t('chatClear'));
    }
  }

  remount() {
    if (this.wrap?.isConnected || this.btn?.isConnected) {
      this.refreshLabel();
      return;
    }
    this.wrap?.remove();
    this.btn?.remove();
    this.wrap = null;
    this.btn = null;
    clearTimeout(this.retryTimer);
    this.retryTimer = setTimeout(() => this.mount(), 500);
  }

  destroy() {
    clearTimeout(this.retryTimer);
    this.wrap?.remove();
    if (this.btn && this.btn !== this.wrap) this.btn.remove();
    this.wrap = null;
    this.btn = null;
  }
}
