const TRANSLATE_SINGLE_GRACE_MS = 220;
const TRANSLATE_BURST_WINDOW_MS = 1000;
const TRANSLATE_GIVE_UP_ATTEMPTS = 2;

class TranslateQueue {
  constructor(getSettings, isActive) {
    this.getSettings = getSettings;
    this.isActive = isActive;
    this.queue = [];
    this.inflight = false;
    this.timer = null;
    this.timerDelay = null;
    this.epoch = 0;
    this.nextSlotAt = 0;
    this.collectStartedAt = 0;
  }

  currentSpeed() {
    return clamp(Number(this.getSettings().translateSpeed) || 1, 1, 10);
  }

  enqueue(text, parts, callback) {
    if (!this.isActive()) return;
    const settings = this.getSettings();
    if (!settings.translateEnabled) return;

    while (this.queue.length >= MAX_TRANSLATE_QUEUE) {
      this.queue.shift();
    }
    if (!this.collectStartedAt) this.collectStartedAt = Date.now();
    this.queue.push({
      text,
      parts: parts?.length ? parts : [{ type: 'text', value: text }],
      callback,
      attempts: 0,
    });
    this.schedule();
  }

  clearTimer() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.timerDelay = null;
  }

  armTimer(delay) {
    this.clearTimer();
    this.timerDelay = delay;
    this.timer = setTimeout(() => {
      this.timer = null;
      this.timerDelay = null;
      this.flush();
    }, delay);
  }

  schedule() {
    if (this.inflight || !this.isActive()) return;
    if (!this.getSettings().translateEnabled) return;

    if (this.queue.length === 0) {
      this.collectStartedAt = 0;
      this.clearTimer();
      return;
    }

    const delay = this.computeDelay();
    if (delay === 0 && this.timer && this.timerDelay === 0) return;
    this.armTimer(delay);
  }

  computeDelay() {
    const now = Date.now();
    const speed = this.currentSpeed();
    const slotWait = Math.max(0, this.nextSlotAt - now);
    const started = this.collectStartedAt || now;

    if (this.queue.length >= speed) return slotWait;

    const grace = speed <= 1 || this.queue.length < 2
      ? (speed <= 1 ? 0 : TRANSLATE_SINGLE_GRACE_MS)
      : TRANSLATE_BURST_WINDOW_MS;
    const collectWait = Math.max(0, started + grace - now);
    return Math.max(slotWait, collectWait);
  }

  pieceCount(parts) {
    return parts.reduce((count, part) => (
      part.type === 'text' && translatableCore(part.value) ? count + 1 : count
    ), 0);
  }

  takeJobs(speed) {
    const jobs = [];
    let chars = 0;
    let pieces = 0;

    while (this.queue.length && jobs.length < Math.min(speed, TRANSLATE_MAX_BATCH)) {
      const next = this.queue[0];
      const nextPieces = this.pieceCount(next.parts);
      if (jobs.length > 0 && (
        chars + next.text.length > TRANSLATE_MAX_BATCH_CHARS
        || pieces + nextPieces > TRANSLATE_MAX_BATCH
      )) break;
      chars += next.text.length;
      pieces += nextPieces;
      jobs.push(this.queue.shift());
    }

    return jobs;
  }

  deliver(jobs, partLists) {
    if (!this.isActive()) return;
    jobs.forEach((job, index) => {
      const parts = partLists[index] || job.parts;
      try {
        job.callback(parts, job.text);
      } catch {
        /* ignore */
      }
    });
  }

  stitch(jobs, translations, refs) {
    const outputs = jobs.map((job) => job.parts.map((part) => ({ ...part })));
    refs.forEach((ref, index) => {
      const part = outputs[ref.jobIndex][ref.partIndex];
      const match = String(part.value).match(/^(\s*)([\s\S]*?)(\s*)$/);
      const translated = translations[index] || match[2];
      outputs[ref.jobIndex][ref.partIndex] = {
        type: 'text',
        value: `${match[1]}${translated}${match[3]}`,
      };
    });
    return outputs;
  }

  pace(count, speed, startedAt) {
    const spent = Date.now() - startedAt;
    const budget = Math.round(count * (1000 / speed));
    const nextAt = Date.now() + Math.max(0, budget - spent);
    this.nextSlotAt = Math.max(this.nextSlotAt, nextAt);
  }

  async flush() {
    if (this.inflight || this.queue.length === 0 || !this.isActive()) {
      this.schedule();
      return;
    }

    const settings = this.getSettings();
    if (!settings.translateEnabled) return;

    const epoch = this.epoch;
    const speed = this.currentSpeed();
    const jobs = this.takeJobs(speed);
    if (!jobs.length) return;

    this.collectStartedAt = this.queue.length ? Date.now() : 0;
    this.inflight = true;
    const startedAt = Date.now();

    const refs = [];
    const pieces = [];
    jobs.forEach((job, jobIndex) => {
      job.parts.forEach((part, partIndex) => {
        const core = part.type === 'text' ? translatableCore(part.value) : '';
        if (!core) return;
        refs.push({ jobIndex, partIndex });
        pieces.push(core);
      });
    });

    try {
      if (!pieces.length) {
        this.deliver(jobs, jobs.map((job) => job.parts));
        this.pace(jobs.length, speed, startedAt);
        return;
      }

      const outcome = await translateMessages(
        pieces,
        settings.translateTargetLang,
        settings.translateProvider,
      );

      if (epoch !== this.epoch || !this.isActive()) return;

      if (outcome.retryAfter) {
        const failed = !!outcome.failed;
        if (failed) {
          for (const job of jobs) job.attempts += 1;
        }
        const exhausted = failed && jobs.every((job) => job.attempts >= TRANSLATE_GIVE_UP_ATTEMPTS);
        const blocked = failed && outcome.retryAfter > 1500;
        if (exhausted || blocked) {
          this.deliver(jobs, jobs.map((job) => job.parts));
          this.pace(jobs.length, speed, startedAt);
        } else {
          this.queue = jobs.concat(this.queue);
          while (this.queue.length > MAX_TRANSLATE_QUEUE) this.queue.pop();
          this.collectStartedAt = Date.now() - TRANSLATE_BURST_WINDOW_MS;
          this.nextSlotAt = Math.max(this.nextSlotAt, Date.now() + outcome.retryAfter);
        }
        return;
      }

      this.deliver(jobs, this.stitch(jobs, outcome.texts || [], refs));
      this.pace(jobs.length, speed, startedAt);
    } catch {
      if (epoch !== this.epoch || !this.isActive()) return;
      this.deliver(jobs, jobs.map((job) => job.parts));
      this.pace(jobs.length, speed, startedAt);
    } finally {
      if (epoch === this.epoch) this.inflight = false;
      if (this.queue.length && epoch === this.epoch) this.schedule();
    }
  }

  clear() {
    this.epoch += 1;
    this.queue = [];
    this.collectStartedAt = 0;
    this.nextSlotAt = 0;
    this.clearTimer();
    this.inflight = false;
  }
}
