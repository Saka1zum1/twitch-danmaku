class ChatObserver {
  constructor({ getSettings, danmakuEmitter, translateQueue, isActive }) {
    this.getSettings = getSettings;
    this.danmakuEmitter = danmakuEmitter;
    this.translateQueue = translateQueue;
    this.isActive = isActive;
    this.observer = null;
    this.chatRoot = null;
    this.readyAt = 0;
    this.isVodChat = false;
    this.mode = 'dom';
    this.ffzActive = false;
    this.ircSource = null;
    this.ircBuffer = [];
    this.ircBackgroundOnly = false;
    this.recentEmitKeys = new Map();
  }

  isDuplicateEmit(login, message) {
    const text = String(message || '').trim();
    if (!text) return false;
    const key = `${String(login || '').toLowerCase()}|${text}`.slice(0, 240);
    const now = Date.now();
    const prev = this.recentEmitKeys.get(key);
    if (prev && now - prev < 3500) return true;
    this.recentEmitKeys.set(key, now);
    if (this.recentEmitKeys.size > 200) {
      for (const [k, ts] of this.recentEmitKeys) {
        if (now - ts > 4000) this.recentEmitKeys.delete(k);
      }
    }
    return false;
  }

  async start() {
    this.stop();
    this.readyAt = Date.now();
    this.ffzActive = await waitForFrankerFaceZ(1600);
    const vodId = currentVodId();
    const channel = currentChannelLogin();
    const preferIrc = !vodId && !!channel && this.ffzActive;

    if (preferIrc) {
      this.mode = 'irc';
      this.isVodChat = false;
      this.startIrc(channel);
      console.log('[TBC] Chat source: IRC (FrankerFaceZ detected)');
      return;
    }

    this.mode = 'dom';
    this.chatRoot = await waitForElement(SELECTORS.chatScroller, document, this.ffzActive ? 4000 : 30000);
    if (!this.chatRoot) {
      if (!vodId && channel) {
        this.mode = 'irc';
        this.isVodChat = false;
        this.startIrc(channel);
        console.warn('[TBC] Chat scroller missing; falling back to IRC');
        return;
      }
      console.warn('[TBC] Chat scroller not found');
      return;
    }

    markExistingMessages(this.chatRoot);
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
    console.log(`[TBC] Chat observer started (${this.isVodChat ? 'vod' : 'live'}${this.ffzActive ? ', ffz-dom' : ''})`);
  }

  startIrc(fallbackChannel, { backgroundOnly = false } = {}) {
    if (this.ircSource) return;
    this.ircBackgroundOnly = !!backgroundOnly;
    this.ircBuffer = [];
    this.ircSource = new TwitchIrcChatSource({
      getChannel: () => currentChannelLogin() || fallbackChannel || '',
      isActive: this.isActive,
      onMessage: (parsed) => this.handleIrcMessage(parsed),
    });
    this.ircSource.start();
  }

  stop() {
    this.observer?.disconnect();
    this.observer = null;
    this.chatRoot = null;
    this.isVodChat = false;
    this.mode = 'dom';
    this.ircSource?.stop();
    this.ircSource = null;
    this.ircBuffer = [];
    this.ircBackgroundOnly = false;
    this.recentEmitKeys.clear();
  }

  ensureBackgroundIrc() {
    if (currentVodId()) return;
    const channel = currentChannelLogin();
    if (!channel || this.ircSource) return;
    this.startIrc(channel, { backgroundOnly: this.mode === 'dom' });
    console.log('[TBC] IRC started for background / PiP chat');
  }

  maybeStopBackgroundIrc() {
    if (!this.ircSource || !this.ircBackgroundOnly) return;
    if (enhancedPip?.isOpen?.()) return;
    if (document.hidden) return;
    this.ircSource.stop();
    this.ircSource = null;
    this.ircBackgroundOnly = false;
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
      if (shouldIgnoreChatPayload(parsed, msgEl, this.getSettings())) continue;
      this.emitDanmaku(parsed, msgEl);
    }
  }

  handleIrcMessage(parsed) {
    if (!this.isActive()) return;
    if (Date.now() - this.readyAt < WARMUP_MS) return;

    this.pushIrcBuffer(parsed);
    const payload = {
      username: parsed.username,
      usernameColor: parsed.usernameColor,
      profileUrl: parsed.profileUrl,
      avatarUrl: parsed.avatarUrl || '',
      login: parsed.login || '',
      message: parsed.message,
      parts: parsed.parts,
      originalMessage: parsed.originalMessage,
      superchat: !!parsed.superchat,
      superchatStyle: parsed.superchatStyle || null,
      superchatMeta: parsed.superchatMeta || null,
    };
    if (shouldIgnoreChatPayload(payload, null, this.getSettings())) return;
    this.emitDanmaku(payload, null);
  }

  pushIrcBuffer(parsed) {
    this.ircBuffer.push({
      id: `irc-${Date.now()}-${this.ircBuffer.length}-${parsed.login}`,
      offsetSeconds: this.ircBuffer.length,
      createdAt: new Date().toISOString(),
      userId: '',
      login: parsed.login || '',
      displayName: parsed.username || parsed.login || '',
      message: parsed.message || '',
      color: parsed.usernameColor || '',
      bits: Number(parsed.bits) || 0,
      superchat: !!parsed.superchat,
    });
    while (this.ircBuffer.length > 500) this.ircBuffer.shift();
  }

  getIrcHistoryComments() {
    return this.ircBuffer.slice();
  }

  clearIrcHistory() {
    this.ircBuffer = [];
  }

  emitDanmaku(parsed, msgEl) {
    const settings = this.getSettings();
    if (!this.isActive()) return;

    if (this.isDuplicateEmit(parsed.login || parsed.username, parsed.message)) return;

    if (isKeywordBlocked(parsed.message, settings.blockedKeywords)) return;

    const base = {
      username: parsed.username,
      usernameColor: parsed.usernameColor,
      profileUrl: parsed.profileUrl,
      avatarUrl: parsed.avatarUrl || '',
      login: parsed.login || '',
      originalMessage: parsed.message,
      superchat: !!parsed.superchat,
      superchatStyle: parsed.superchatStyle || null,
      superchatMeta: parsed.superchatMeta || null,
    };

    const hasTranslatableText = parsed.parts.some((part) => (
      part.type === 'text' && translatableCore(part.value)
    ));

    // Avoid injecting translations into FFZ-managed chat DOM.
    const allowChatTranslation = !!msgEl && !this.ffzActive && this.mode === 'dom';

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
      const manualTl = hasManualChatTranslation(msgEl);
      if (latest.translateEnabled && latest.translateInChat && allowChatTranslation && !manualTl) {
        applyChatTranslation(msgEl, message, parsed.message);
      } else if (msgEl && !manualTl) {
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
