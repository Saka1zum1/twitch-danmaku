class TranslateQueue {
  constructor(getSettings, isActive) {
    this.getSettings = getSettings;
    this.isActive = isActive;
    this.queue = [];
    this.processing = false;
    this.timer = null;
  }

  enqueue(text, callback) {
    if (!this.isActive()) return;

    if (this.queue.length >= MAX_TRANSLATE_QUEUE) {
      this.queue.shift();
    }
    this.queue.push({ text, callback });
    this.schedule();
  }

  schedule() {
    if (this.timer || !this.isActive()) return;
    const settings = this.getSettings();
    if (!settings.translateEnabled) return;

    const intervalMs = Math.max(200, Math.round(1000 / clamp(settings.translateSpeed, 1, 10)));
    this.timer = setTimeout(() => {
      this.timer = null;
      this.processNext();
    }, intervalMs);
  }

  async processNext() {
    const settings = this.getSettings();
    if (!this.isActive() || !settings.translateEnabled || this.processing || this.queue.length === 0) {
      if (this.isActive()) this.schedule();
      return;
    }

    this.processing = true;
    const job = this.queue.shift();
    const original = job.text;

    try {
      const translated = await translateMessage(original, settings.translateTargetLang);
      if (this.isActive()) {
        job.callback(translated, original);
      }
    } catch {
      if (this.isActive()) job.callback(original, original);
    }

    this.processing = false;
    this.schedule();
  }

  clear() {
    this.queue = [];
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.processing = false;
  }
}
