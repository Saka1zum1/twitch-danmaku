class ChatObserver {
  constructor({ getSettings, danmakuEmitter, translateQueue, isActive }) {
    this.getSettings = getSettings;
    this.danmakuEmitter = danmakuEmitter;
    this.translateQueue = translateQueue;
    this.isActive = isActive;
    this.observer = null;
    this.chatRoot = null;
    this.readyAt = 0;
  }

  async start() {
    this.chatRoot = await waitForElement(SELECTORS.chatScroller);
    if (!this.chatRoot) {
      console.warn('[TBC] Chat scroller not found');
      return;
    }

    markExistingMessages(this.chatRoot);
    this.readyAt = Date.now();

    this.observer = new MutationObserver((mutations) => {
      if (!this.isActive()) return;
      for (const mut of mutations) {
        for (const node of mut.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;
          this.handleNode(node);
        }
      }
    });

    this.observer.observe(this.chatRoot, { childList: true, subtree: true });
    console.log('[TBC] Chat observer started');
  }

  stop() {
    this.observer?.disconnect();
    this.observer = null;
    this.chatRoot = null;
  }

  shouldEmit(msgEl) {
    if (!this.isActive()) return false;

    if (Date.now() - this.readyAt < WARMUP_MS) {
      msgEl.classList.add('tbc-processed');
      return false;
    }

    if (!isLiveMessage(msgEl, this.chatRoot)) {
      msgEl.classList.add('tbc-processed');
      return false;
    }

    return true;
  }

  handleNode(node) {
    const candidates = node.matches?.(SELECTORS.chatMessage)
      ? [node]
      : Array.from(node.querySelectorAll?.(SELECTORS.chatMessage) || []);

    for (const msgEl of candidates) {
      if (!this.shouldEmit(msgEl)) continue;
      const parsed = parseChatMessage(msgEl);
      if (!parsed) continue;
      this.emitDanmaku(parsed);
    }
  }

  emitDanmaku(parsed) {
    const settings = this.getSettings();
    if (!this.isActive()) return;

    const base = {
      username: parsed.username,
      usernameColor: parsed.usernameColor,
      profileUrl: parsed.profileUrl,
      originalMessage: parsed.message,
    };

    if (!settings.translateEnabled) {
      this.danmakuEmitter.enqueue({
        ...base,
        message: parsed.message,
        translated: false,
      });
      return;
    }

    this.translateQueue.enqueue(parsed.message, (translated, original) => {
      if (!this.isActive()) return;
      const message = translated?.trim() ? translated : original;
      const wasTranslated = message !== original;
      this.danmakuEmitter.enqueue({
        ...base,
        message,
        translated: wasTranslated,
      });
    });
  }
}
