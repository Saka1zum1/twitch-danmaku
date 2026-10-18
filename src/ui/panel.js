class SettingsPanel {
  constructor({ settings, onChange, onClose }) {
    this.settings = settings;
    this.onChange = onChange;
    this.onClose = onClose;
    this.balloon = null;
    this.anchor = null;
    this.isOpen = false;
    this.boundReposition = () => this.reposition();
    this.boundOutsideClick = (e) => this.handleOutsideClick(e);
  }

  toggle(anchor) {
    if (this.isOpen && this.anchor === anchor) {
      this.close();
    } else {
      this.open(anchor);
    }
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
  }

  close() {
    this.isOpen = false;
    this.anchor = null;
    this.balloon?.remove();
    this.balloon = null;

    window.removeEventListener('resize', this.boundReposition);
    document.removeEventListener('fullscreenchange', this.boundReposition);
    document.removeEventListener('webkitfullscreenchange', this.boundReposition);
    document.removeEventListener('scroll', this.boundReposition, true);
    document.removeEventListener('click', this.boundOutsideClick, true);
    this.onClose?.();
  }

  handleOutsideClick(e) {
    if (!this.balloon || !this.isOpen) return;
    if (this.balloon.contains(e.target)) return;
    if (this.anchor?.contains(e.target)) return;
    this.close();
  }

  reposition() {
    if (!this.balloon || !this.anchor) return;

    const mountTarget = getFullscreenElement() || document.body;
    if (this.balloon.parentElement !== mountTarget) {
      mountTarget.appendChild(this.balloon);
    }

    const rect = this.anchor.getBoundingClientRect();
    const width = 300;
    const gap = 8;
    const height = this.balloon.offsetHeight;

    let left = rect.right - width;
    let top = rect.top - height - gap;

    left = clamp(left, 8, window.innerWidth - width - 8);
    if (top < 8) {
      top = rect.bottom + gap;
    }

    Object.assign(this.balloon.style, {
      position: 'fixed',
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      zIndex: '100000',
    });
  }

  updateSetting(key, value) {
    this.settings[key] = value;
    saveSettings(this.settings);
    this.onChange(this.settings);
  }

  createToggle(label, key) {
    const row = document.createElement('div');
    row.className = 'tbc-balloon-row tbc-balloon-row--toggle';

    const labelEl = document.createElement('span');
    labelEl.className = 'tbc-balloon-label';
    labelEl.textContent = label;

    const switchWrap = document.createElement('label');
    switchWrap.className = 'tbc-switch';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = !!this.settings[key];

    const slider = document.createElement('span');
    slider.className = 'tbc-switch-slider';

    input.addEventListener('change', () => {
      this.updateSetting(key, input.checked);
    });

    switchWrap.append(input, slider);
    row.append(labelEl, switchWrap);
    return row;
  }

  createRange(label, key, min, max, step, format) {
    const row = document.createElement('div');
    row.className = 'tbc-balloon-row tbc-balloon-row--field';

    const header = document.createElement('div');
    header.className = 'tbc-balloon-field-header';

    const labelEl = document.createElement('span');
    labelEl.className = 'tbc-balloon-label';
    labelEl.textContent = label;

    const valueSpan = document.createElement('span');
    valueSpan.className = 'tbc-balloon-value';
    valueSpan.textContent = format(this.settings[key]);

    header.append(labelEl, valueSpan);

    const input = document.createElement('input');
    input.type = 'range';
    input.className = 'tbc-balloon-range';
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.value = String(this.settings[key]);

    input.addEventListener('input', () => {
      const val = Number(input.value);
      valueSpan.textContent = format(val);
      this.updateSetting(key, val);
    });

    row.append(header, input);
    return row;
  }

  createSelect(label, key, options) {
    const row = document.createElement('div');
    row.className = 'tbc-balloon-row tbc-balloon-row--field';

    const labelEl = document.createElement('div');
    labelEl.className = 'tbc-balloon-label';
    labelEl.textContent = label;

    const select = document.createElement('select');
    select.className = 'tbc-balloon-select';
    for (const opt of options) {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.label;
      if (opt.value === this.settings[key]) option.selected = true;
      select.appendChild(option);
    }

    select.addEventListener('change', () => {
      this.updateSetting(key, select.value);
    });

    row.append(labelEl, select);
    return row;
  }

  createKeywordBlock() {
    const row = document.createElement('div');
    row.className = 'tbc-balloon-row tbc-balloon-row--field';

    const labelEl = document.createElement('div');
    labelEl.className = 'tbc-balloon-label';
    labelEl.textContent = t('blockKeywords');

    const hint = document.createElement('div');
    hint.className = 'tbc-keyword-hint';
    hint.textContent = t('blockKeywordsHint');

    const form = document.createElement('div');
    form.className = 'tbc-keyword-form';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'tbc-keyword-input';
    input.maxLength = 40;
    input.placeholder = t('blockKeywordsPlaceholder');
    input.setAttribute('aria-label', t('blockKeywords'));

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'tbc-keyword-add';
    addBtn.textContent = t('blockKeywordsAdd');

    const list = document.createElement('div');
    list.className = 'tbc-keyword-list';

    const commit = () => {
      const incoming = input.value.split(/[,，]/).map((item) => item.trim()).filter(Boolean);
      if (!incoming.length) return;
      const next = sanitizeBlockedKeywords([...(this.settings.blockedKeywords || []), ...incoming]);
      input.value = '';
      this.updateSetting('blockedKeywords', next);
      this.renderKeywordList(list);
    };

    addBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      commit();
    });
    input.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') {
        e.preventDefault();
        commit();
      }
    });

    form.append(input, addBtn);
    row.append(labelEl, hint, form, list);
    this.renderKeywordList(list);
    return row;
  }

  renderKeywordList(list) {
    list.replaceChildren();
    const keywords = this.settings.blockedKeywords || [];
    if (!keywords.length) {
      const empty = document.createElement('div');
      empty.className = 'tbc-keyword-empty';
      empty.textContent = t('blockKeywordsEmpty');
      list.appendChild(empty);
      return;
    }

    keywords.forEach((keyword, index) => {
      const chip = document.createElement('span');
      chip.className = 'tbc-keyword';

      const text = document.createElement('span');
      text.className = 'tbc-keyword-text';
      text.textContent = keyword;
      text.title = keyword;

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'tbc-keyword-remove';
      removeBtn.setAttribute('aria-label', `${t('blockKeywordsRemove')} ${keyword}`);
      removeBtn.textContent = '×';
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const next = (this.settings.blockedKeywords || []).filter((_, itemIndex) => itemIndex !== index);
        this.updateSetting('blockedKeywords', next);
        this.renderKeywordList(list);
      });

      chip.append(text, removeBtn);
      list.appendChild(chip);
    });
  }

  createDivider() {
    const div = document.createElement('div');
    div.className = 'tbc-balloon-divider';
    return div;
  }

  render() {
    this.balloon = document.createElement('div');
    this.balloon.className = 'tbc-balloon';
    this.balloon.setAttribute('role', 'dialog');
    this.balloon.setAttribute('aria-label', t('panelTitle'));

    const header = document.createElement('div');
    header.className = 'tbc-balloon-header';

    const title = document.createElement('div');
    title.className = 'tbc-balloon-title';
    title.textContent = t('panelTitle');

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'tbc-balloon-close';
    closeBtn.setAttribute('aria-label', t('panelClose'));
    closeBtn.textContent = t('panelClose');
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.close();
    });

    header.append(title, closeBtn);

    const body = document.createElement('div');
    body.className = 'tbc-balloon-body';

    body.append(
      this.createRange(t('scrollSpeed'), 'speed', 1, 10, 1, (v) => String(v)),
      this.createRange(t('fontSize'), 'fontSize', 14, 40, 1, (v) => `${v}px`),
      this.createRange(t('danmakuOpacity'), 'danmakuOpacity', 10, 100, 5, (v) => `${v}%`),
      this.createSelect(t('fontFamily'), 'fontFamily', getFontOptions()),
      this.createSelect(t('scrollArea'), 'scrollArea', getScrollAreaOptions()),
      this.createDivider(),
      this.createToggle(t('superchatPinned'), 'superchatPinned'),
      this.createSelect(t('superchatPosition'), 'superchatPosition', getSuperchatPositionOptions()),
      this.createRange(t('superchatDuration'), 'superchatDuration', 2, 15, 1, (v) => `${v} ${t('speechSeconds')}`),
      this.createSelect(t('superchatAnimation'), 'superchatAnimation', getSuperchatAnimationOptions()),
      this.createDivider(),
      this.createToggle(t('translateEnable'), 'translateEnabled'),
      this.createSelect(t('translateProvider'), 'translateProvider', getTranslateProviderOptions()),
      this.createSelect(t('translateTarget'), 'translateTargetLang', getTranslateLangOptions()),
      this.createRange(t('translateSpeed'), 'translateSpeed', 1, 10, 1, (v) => `${v} ${t('translateSpeedUnit')}`),
      this.createDivider(),
      this.createKeywordBlock(),
    );

    this.balloon.append(header, body);
    this.balloon.addEventListener('click', (e) => e.stopPropagation());

    const mountTarget = getFullscreenElement() || document.body;
    mountTarget.appendChild(this.balloon);
  }
}
