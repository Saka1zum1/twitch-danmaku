class HistoryPanel {
  constructor({ onClose }) {
    this.onClose = onClose;
    this.balloon = null;
    this.anchor = null;
    this.isOpen = false;
    this.job = 0;
    this.loadToken = 0;
    this.state = 'idle';
    this.paused = false;
    this.lastCount = 0;
    this.video = null;
    this.videoId = '';
    this.duration = 0;
    this.start = 0;
    this.end = 0;
    this.boundReposition = () => this.reposition();
    this.boundOutsideClick = (event) => this.handleOutsideClick(event);
  }

  toggle(anchor) {
    if (this.isOpen && this.anchor === anchor) this.close();
    else this.open(anchor);
  }

  open(anchor) {
    this.close();
    this.anchor = anchor;
    this.isOpen = true;
    this.render();
    this.reposition();
    requestAnimationFrame(() => this.reposition());
    window.addEventListener('resize', this.boundReposition);
    document.addEventListener('fullscreenchange', this.boundReposition);
    document.addEventListener('webkitfullscreenchange', this.boundReposition);
    document.addEventListener('scroll', this.boundReposition, true);
    setTimeout(() => document.addEventListener('click', this.boundOutsideClick, true), 0);
    this.loadVideo();
  }

  close() {
    const wasOpen = this.isOpen;
    this.job += 1;
    this.loadToken += 1;
    this.state = 'idle';
    this.paused = false;
    this.lastCount = 0;
    this.isOpen = false;
    this.anchor = null;
    this.balloon?.remove();
    this.balloon = null;
    window.removeEventListener('resize', this.boundReposition);
    document.removeEventListener('fullscreenchange', this.boundReposition);
    document.removeEventListener('webkitfullscreenchange', this.boundReposition);
    document.removeEventListener('scroll', this.boundReposition, true);
    document.removeEventListener('click', this.boundOutsideClick, true);
    if (wasOpen) this.onClose?.();
  }

  handleOutsideClick(event) {
    if (!this.balloon || !this.isOpen) return;
    if (this.balloon.contains(event.target)) return;
    if (this.anchor?.contains(event.target)) return;
    if (this.state !== 'idle') return;
    this.close();
  }

  reposition() {
    if (!this.balloon || !this.anchor) return;
    const mountTarget = getFullscreenElement() || document.body;
    if (this.balloon.parentElement !== mountTarget) mountTarget.appendChild(this.balloon);

    const rect = this.anchor.getBoundingClientRect();
    const width = 360;
    const gap = 8;
    const height = this.balloon.offsetHeight;
    let left = rect.right - width;
    let top = rect.top - height - gap;
    left = clamp(left, 8, window.innerWidth - width - 8);
    if (top < 8) top = rect.bottom + gap;
    Object.assign(this.balloon.style, {
      position: 'fixed',
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      zIndex: '100000',
    });
  }

  setStatus(text, kind) {
    if (!this.statusEl) return;
    this.statusEl.textContent = text || '';
    this.statusEl.classList.toggle('tbc-history-status--error', kind === 'error');
    this.statusEl.classList.toggle('tbc-history-status--ok', kind === 'ok');
  }

  setDownloadState(state) {
    this.state = state;
    const idle = state === 'idle';
    const running = state === 'running';
    const paused = state === 'paused';
    this.downloadBtn.hidden = !idle;
    this.pauseBtn.hidden = !running;
    this.resumeBtn.hidden = !paused;
    this.cancelBtn.hidden = idle;
    this.downloadBtn.disabled = !this.video;
    for (const input of this.balloon.querySelectorAll('input, select')) {
      if (input.closest('.tbc-history-actions')) continue;
      input.disabled = !idle || (input.type === 'range' && !this.duration);
    }
  }

  async loadVideo() {
    const token = ++this.loadToken;
    this.video = null;
    this.videoId = currentVodId();
    this.duration = 0;
    this.metaEl.textContent = '';
    this.setDownloadState('idle');
    this.downloadBtn.disabled = true;
    if (!this.videoId) {
      this.syncRange();
      this.setStatus(t('historyNeedVod'), 'error');
      return;
    }

    this.setStatus(t('historyLoading'), '');
    try {
      const info = await fetchVodInfo(this.videoId);
      if (token !== this.loadToken) return;
      if (!info) {
        this.syncRange();
        this.setStatus(t('historyMissing'), 'error');
        return;
      }
      this.video = info;
      this.duration = info.lengthSeconds || playerDurationSeconds();
      this.start = 0;
      this.end = this.duration;
      this.metaEl.textContent = info.title || info.id;
      this.metaEl.title = info.title || '';
      this.syncRange();
      this.setDownloadState('idle');
      this.setStatus('', '');
    } catch {
      if (token !== this.loadToken) return;
      this.syncRange();
      this.setStatus(t('historyFailed'), 'error');
    }
  }

  syncRange() {
    const known = this.duration > 0;
    this.rangeWrap.hidden = !known;
    this.rangeUnknown.hidden = known || !this.video;
    if (!known) return;
    this.startInput.max = String(this.duration);
    this.endInput.max = String(this.duration);
    this.startInput.value = String(this.start);
    this.endInput.value = String(this.end);
    this.updateRange();
  }

  updateRange() {
    if (!this.duration) return;
    const startPct = (this.start / this.duration) * 100;
    const endPct = (this.end / this.duration) * 100;
    this.rangeFill.style.left = `${startPct}%`;
    this.rangeFill.style.width = `${Math.max(0, endPct - startPct)}%`;
    this.rangeLabel.textContent = `${formatChatClock(this.start)} – ${formatChatClock(this.end)}`;
  }

  selectedFilters() {
    return {
      keywords: this.keywordInput.value,
      usernames: this.usernameInput.value,
      includeSuperchat: this.superchatInput.checked,
      format: this.formatSelect.value,
    };
  }

  pauseDownload() {
    if (this.state !== 'running') return;
    this.paused = true;
    this.setDownloadState('paused');
    this.setStatus(fill('historyPaused', { count: this.lastCount }), '');
    this.reposition();
  }

  resumeDownload() {
    if (this.state !== 'paused') return;
    this.paused = false;
    this.setDownloadState('running');
    this.setStatus(fill('historyProgress', { count: this.lastCount }), '');
  }

  cancelDownload() {
    if (this.state === 'idle') return;
    this.job += 1;
    this.paused = false;
    this.setDownloadState('idle');
    this.setStatus(t('historyCancelled'), '');
  }

  async startDownload() {
    if (!this.video || this.state !== 'idle') return;
    const token = ++this.job;
    const filters = this.selectedFilters();
    this.paused = false;
    this.lastCount = 0;
    this.setDownloadState('running');
    this.setStatus(fill('historyProgress', { count: 0 }), '');

    try {
      const result = await downloadVodChat({
        videoId: this.video.id,
        start: this.duration ? this.start : 0,
        end: this.duration ? this.end : Infinity,
        keywords: filters.keywords,
        usernames: filters.usernames,
        includeSuperchat: filters.includeSuperchat,
        shouldCancel: () => token !== this.job,
        shouldPause: () => token === this.job && this.paused,
        onProgress: ({ count }) => {
          if (token !== this.job) return;
          this.lastCount = count;
          if (!this.paused) {
            this.setStatus(fill('historyProgress', { count }), '');
            this.reposition();
          }
        },
      });
      if (token !== this.job) return;
      if (!result.comments.length) {
        this.setStatus(result.scanned ? t('historyNoMatch') : t('historyEmpty'), 'error');
        return;
      }
      const file = buildChatExport(filters.format, this.video, result);
      saveChatFile(file.filename, file.text, file.mime);
      this.setStatus(fill('historyDone', { count: result.comments.length }), 'ok');
    } catch (error) {
      if (token !== this.job || error?.code === 'cancel') return;
      this.setStatus(error?.code === 'missing' ? t('historyMissing') : t('historyFailed'), 'error');
    } finally {
      if (token === this.job) {
        this.paused = false;
        this.setDownloadState('idle');
      }
    }
  }

  render() {
    this.balloon = document.createElement('div');
    this.balloon.className = 'tbc-balloon tbc-history-panel';

    const header = document.createElement('div');
    header.className = 'tbc-balloon-header';
    const title = document.createElement('div');
    title.className = 'tbc-balloon-title';
    title.textContent = t('historyPanelTitle');
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'tbc-balloon-close';
    closeBtn.textContent = t('panelClose');
    closeBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      this.close();
    });
    header.append(title, closeBtn);

    const body = document.createElement('div');
    body.className = 'tbc-balloon-body tbc-balloon-body--history';
    this.metaEl = document.createElement('p');
    this.metaEl.className = 'tbc-history-meta';
    body.append(
      this.metaEl,
      this.createTextField('historyKeyword', 'keywordInput', 'historyKeywordPlaceholder', 'historyKeywordHint'),
      this.createTextField('historyUsername', 'usernameInput', 'historyUsernamePlaceholder', 'historyUsernameHint'),
      this.createSuperchatToggle(),
      this.createRangeField(),
      this.createFormatField(),
      this.createActions(),
    );

    this.balloon.append(header, body);
    this.balloon.addEventListener('click', (event) => event.stopPropagation());
    this.balloon.addEventListener('pointerdown', (event) => event.stopPropagation());
    (getFullscreenElement() || document.body).appendChild(this.balloon);
  }

  createTextField(labelKey, field, placeholderKey, hintKey) {
    const row = document.createElement('div');
    row.className = 'tbc-balloon-row tbc-balloon-row--field';
    const label = document.createElement('span');
    label.className = 'tbc-balloon-label';
    label.textContent = t(labelKey);
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'tbc-balloon-input';
    input.placeholder = t(placeholderKey);
    input.autocomplete = 'off';
    this[field] = input;
    const hint = document.createElement('p');
    hint.className = 'tbc-history-hint';
    hint.textContent = t(hintKey);
    row.append(label, input, hint);
    return row;
  }

  createSuperchatToggle() {
    const row = document.createElement('div');
    row.className = 'tbc-balloon-row tbc-balloon-row--field';
    const line = document.createElement('div');
    line.className = 'tbc-balloon-row--toggle';
    line.style.padding = '0';
    const label = document.createElement('span');
    label.className = 'tbc-balloon-label';
    label.textContent = t('historyIncludeSuperchat');
    const switchWrap = document.createElement('label');
    switchWrap.className = 'tbc-switch';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = true;
    const slider = document.createElement('span');
    slider.className = 'tbc-switch-slider';
    switchWrap.append(input, slider);
    line.append(label, switchWrap);
    const hint = document.createElement('p');
    hint.className = 'tbc-history-hint';
    hint.textContent = t('historyIncludeSuperchatHint');
    this.superchatInput = input;
    row.append(line, hint);
    return row;
  }

  createRangeField() {
    const row = document.createElement('div');
    row.className = 'tbc-balloon-row tbc-balloon-row--field';
    const header = document.createElement('div');
    header.className = 'tbc-balloon-field-header';
    const label = document.createElement('span');
    label.className = 'tbc-balloon-label';
    label.textContent = t('historyRange');
    this.rangeLabel = document.createElement('span');
    this.rangeLabel.className = 'tbc-balloon-value';
    header.append(label, this.rangeLabel);

    this.rangeWrap = document.createElement('div');
    this.rangeWrap.className = 'tbc-history-range';
    this.rangeWrap.hidden = true;
    const track = document.createElement('div');
    track.className = 'tbc-history-track';
    this.rangeFill = document.createElement('div');
    this.rangeFill.className = 'tbc-history-fill';
    track.appendChild(this.rangeFill);

    this.startInput = document.createElement('input');
    this.startInput.type = 'range';
    this.startInput.min = '0';
    this.startInput.value = '0';
    this.startInput.addEventListener('input', () => {
      this.start = Math.min(Number(this.startInput.value), this.end);
      this.startInput.value = String(this.start);
      this.updateRange();
    });
    this.endInput = document.createElement('input');
    this.endInput.type = 'range';
    this.endInput.min = '0';
    this.endInput.value = '0';
    this.endInput.addEventListener('input', () => {
      this.end = Math.max(Number(this.endInput.value), this.start);
      this.endInput.value = String(this.end);
      this.updateRange();
    });
    this.rangeWrap.append(track, this.startInput, this.endInput);

    this.rangeUnknown = document.createElement('p');
    this.rangeUnknown.className = 'tbc-history-hint';
    this.rangeUnknown.textContent = t('historyRangeUnknown');
    this.rangeUnknown.hidden = true;
    row.append(header, this.rangeWrap, this.rangeUnknown);
    return row;
  }

  createFormatField() {
    const row = document.createElement('div');
    row.className = 'tbc-balloon-row tbc-balloon-row--field';
    const label = document.createElement('span');
    label.className = 'tbc-balloon-label';
    label.textContent = t('historyFormat');
    this.formatSelect = document.createElement('select');
    this.formatSelect.className = 'tbc-balloon-select';
    for (const [value, key] of [['json', 'historyFormatJson'], ['csv', 'historyFormatCsv'], ['txt', 'historyFormatTxt']]) {
      this.formatSelect.appendChild(new Option(t(key), value));
    }
    row.append(label, this.formatSelect);
    return row;
  }

  createActionButton(className, label, onClick) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = label;
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      onClick();
    });
    return button;
  }

  createActions() {
    const row = document.createElement('div');
    row.className = 'tbc-history-actions';
    const buttons = document.createElement('div');
    buttons.className = 'tbc-history-buttons';

    this.downloadBtn = this.createActionButton('tbc-history-download', t('historyDownload'), () => this.startDownload());
    this.pauseBtn = this.createActionButton('tbc-history-pause', t('historyPause'), () => this.pauseDownload());
    this.resumeBtn = this.createActionButton('tbc-history-resume', t('historyResume'), () => this.resumeDownload());
    this.cancelBtn = this.createActionButton('tbc-history-cancel', t('historyCancel'), () => this.cancelDownload());
    this.pauseBtn.hidden = true;
    this.resumeBtn.hidden = true;
    this.cancelBtn.hidden = true;
    this.downloadBtn.disabled = true;

    this.statusEl = document.createElement('p');
    this.statusEl.className = 'tbc-history-status';
    buttons.append(this.downloadBtn, this.pauseBtn, this.resumeBtn, this.cancelBtn);
    row.append(buttons, this.statusEl);
    return row;
  }
}
