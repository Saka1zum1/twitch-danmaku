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
    this.isVodChat = !!this.chatRoot.closest('.video-chat')
      || this.chatRoot.classList.contains('video-chat__message-list-wrapper')
      || !!this.chatRoot.querySelector('.vod-message');

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
    console.log(`[TBC] Chat observer started (${this.isVodChat ? 'vod' : 'live'})`);
  }

  stop() {
    this.observer?.disconnect();
    this.observer = null;
    this.chatRoot = null;
    this.isVodChat = false;
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
      this.emitDanmaku(parsed, msgEl);
    }
  }

  emitDanmaku(parsed, msgEl) {
    const settings = this.getSettings();
    if (!this.isActive()) return;

    if (isKeywordBlocked(parsed.message, settings.blockedKeywords)) return;

    const base = {
      username: parsed.username,
      usernameColor: parsed.usernameColor,
      profileUrl: parsed.profileUrl,
      originalMessage: parsed.message,
      superchat: !!parsed.superchat,
      superchatStyle: parsed.superchatStyle || null,
    };

    const hasTranslatableText = parsed.parts.some((part) => (
      part.type === 'text' && translatableCore(part.value)
    ));

    if (!settings.translateEnabled || !hasTranslatableText) {
      this.danmakuEmitter.enqueue({
        ...base,
        message: parsed.message,
        parts: parsed.parts,
        translated: false,
      });
      return;
    }

    this.translateQueue.enqueue(parsed.message, parsed.parts, (parts) => {
      if (!this.isActive()) return;
      const latest = this.getSettings();
      const message = partsToPlain(parts) || parsed.message;
      if (isKeywordBlocked(parsed.message, latest.blockedKeywords)) return;
      if (isKeywordBlocked(message, latest.blockedKeywords)) return;
      if (latest.translateEnabled && latest.translateInChat) {
        applyChatTranslation(msgEl, message, parsed.message);
      } else if (msgEl) {
        removeChatTranslation(msgEl);
      }
      this.danmakuEmitter.enqueue({
        ...base,
        message,
        parts,
        translated: message !== parsed.message,
      });
    });
  }
}
