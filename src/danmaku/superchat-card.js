let activeSuperchatCard = null;

function appendSuperchatCardParts(container, parts) {
  for (const part of parts) {
    if (part.type === 'emote' && part.src) {
      const img = document.createElement('img');
      img.className = 'tbc-emote';
      img.src = part.src;
      img.alt = part.name || '';
      img.title = part.name || '';
      img.draggable = false;
      container.appendChild(img);
      continue;
    }
    const text = part.type === 'emote' ? (part.name || '') : (part.value || '');
    if (text) container.appendChild(document.createTextNode(text));
  }
}

function closeSuperchatDetailCard() {
  const card = activeSuperchatCard;
  activeSuperchatCard = null;
  if (!card) return;
  card.onDismiss?.();
  card.root?.remove();
}

function openSuperchatDetailCard(mount, payload, helpers = {}) {
  if (!mount || !payload) return;
  closeSuperchatDetailCard();

  const {
    getSettings,
    favoritesPanel,
    chatContextMenu,
    onDismiss,
  } = helpers;

  const settings = getSettings?.() || {};
  const {
    username,
    message,
    parts,
    usernameColor,
    originalMessage,
    superchatMeta,
    avatarUrl,
    login,
    profileUrl,
  } = payload;
  const meta = superchatMeta || null;
  const style = meta?.style || payload.superchatStyle || {
    background: 'linear-gradient(135deg, #9147ff 0%, #772ce8 100%)',
    color: '#ffffff',
    accent: '#bf94ff',
  };
  const displayParts = parts?.length ? parts : (message ? [{ type: 'text', value: message }] : []);

  if (getComputedStyle(mount).position === 'static') {
    mount.style.position = 'relative';
  }

  const root = document.createElement('div');
  root.className = 'tbc-sc-card-root';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');

  const backdrop = document.createElement('button');
  backdrop.type = 'button';
  backdrop.className = 'tbc-sc-card-backdrop';
  backdrop.setAttribute('aria-label', t('superchatCardClose'));

  const card = document.createElement('div');
  card.className = 'tbc-sc-card';
  card.style.background = style.background || '#9147ff';
  card.style.color = safeCssColor(style.color, '#ffffff');
  card.style.setProperty('--tbc-sc-accent', safeCssColor(style.accent, '#bf94ff'));
  card.style.fontFamily = settings.fontFamily || 'system-ui, sans-serif';

  const header = document.createElement('div');
  header.className = 'tbc-sc-card-header';

  const avatar = document.createElement('img');
  avatar.className = 'tbc-sc-card-avatar';
  avatar.alt = '';
  avatar.draggable = false;
  avatar.src = avatarUrl || cachedAvatar(login || username, username, usernameColor);

  const headText = document.createElement('div');
  headText.className = 'tbc-sc-card-headtext';
  const nameEl = document.createElement('div');
  nameEl.className = 'tbc-sc-card-name';
  nameEl.textContent = username || login || 'User';
  headText.appendChild(nameEl);

  if (meta) {
    const metaRow = document.createElement('div');
    metaRow.className = 'tbc-sc-meta tbc-sc-card-meta';
    if (meta.kind === 'cheer' && meta.bits) {
      const amount = document.createElement('span');
      amount.className = 'tbc-sc-amount';
      amount.textContent = meta.amountLabel || `${meta.bits} Bits`;
      const tierText = meta.tierLabel || cheerTierBadgeLabel(meta.bits);
      if (tierText) {
        const tier = document.createElement('span');
        tier.className = 'tbc-sc-badge tbc-sc-tier';
        tier.textContent = tierText;
        metaRow.append(tier, amount);
      } else {
        metaRow.appendChild(amount);
      }
    } else if (meta.amountLabel) {
      const badge = document.createElement('span');
      badge.className = 'tbc-sc-badge';
      badge.textContent = meta.amountLabel;
      metaRow.appendChild(badge);
    }
    headText.appendChild(metaRow);
  }

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'tbc-sc-card-close';
  closeBtn.setAttribute('aria-label', t('superchatCardClose'));
  closeBtn.innerHTML = typeof ICON_CLOSE === 'string' ? ICON_CLOSE : '×';

  header.append(avatar, headText, closeBtn);

  const body = document.createElement('div');
  body.className = 'tbc-sc-card-body';
  appendSuperchatCardParts(body, displayParts);

  const translation = document.createElement('div');
  translation.className = 'tbc-sc-card-translation';
  translation.hidden = true;

  const actions = document.createElement('div');
  actions.className = 'tbc-sc-card-actions';

  const translateBtn = document.createElement('button');
  translateBtn.type = 'button';
  translateBtn.className = 'tbc-sc-card-action';
  translateBtn.textContent = t('chatMenuTranslate');

  const speakBtn = document.createElement('button');
  speakBtn.type = 'button';
  speakBtn.className = 'tbc-sc-card-action';
  speakBtn.textContent = t('chatMenuSpeak');
  if (!speechSupported()) speakBtn.disabled = true;

  const favoriteBtn = document.createElement('button');
  favoriteBtn.type = 'button';
  favoriteBtn.className = 'tbc-sc-card-action';
  favoriteBtn.textContent = t('chatMenuFavorite');

  const profileBtn = document.createElement('button');
  profileBtn.type = 'button';
  profileBtn.className = 'tbc-sc-card-action';
  profileBtn.textContent = t('tooltipOpenProfile');

  const blockBtn = document.createElement('button');
  blockBtn.type = 'button';
  blockBtn.className = 'tbc-sc-card-action';
  blockBtn.textContent = t('chatMenuBlockUser');
  const blockLogin = String(login || username || '').trim().replace(/^@+/, '').toLowerCase();
  if (!blockLogin) blockBtn.disabled = true;

  actions.append(profileBtn, blockBtn, translateBtn, speakBtn, favoriteBtn);
  card.append(header, body, translation, actions);
  root.append(backdrop, card);
  mount.appendChild(root);

  const loginKey = String(login || username || '').toLowerCase().replace(/^@+/, '');
  if (loginKey && (!avatarUrl || String(avatarUrl).startsWith('data:'))) {
    fetchTwitchAvatar(loginKey).then((url) => {
      if (!url || !root.isConnected) return;
      avatar.src = url;
    });
  }

  const snapshot = {
    message: originalMessage || message,
    parts: displayParts.map((part) => ({ ...part })),
    username,
    login,
  };

  let translatedOnce = false;

  translateBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!chatContextMenu?.translateParts) return;
    translateBtn.disabled = true;
    const result = await chatContextMenu.translateParts(snapshot, translatedOnce);
    translateBtn.disabled = false;
    if (result.failed) return;
    translatedOnce = true;
    translateBtn.textContent = t('chatMenuRetranslate');
    if (result.translated) {
      translation.hidden = false;
      translation.textContent = result.message;
      snapshot.message = result.message;
      snapshot.parts = result.parts;
    }
  });

  speakBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!speechSupported() || Number(settings.speechVolume) <= 0) return;
    const source = translation.hidden
      ? speechSourceText(snapshot.message, snapshot.parts)
      : (translation.textContent || snapshot.message);
    speakTextNow(source);
  });

  profileBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = profileUrl || (blockLogin ? `https://www.twitch.tv/${encodeURIComponent(blockLogin)}` : '');
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  });

  blockBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!blockLogin || !chatContextMenu?.runBlockUser) return;
    await chatContextMenu.runBlockUser(blockLogin);
  });

  favoriteBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const text = String(originalMessage || message || '').trim();
    if (!text) return;
    if (favoritesPanel?.addFromText) {
      favoritesPanel.addFromText(text);
      if (!favoritesPanel.isOpen && favoritesPanel.btn) {
        favoritesPanel.open(favoritesPanel.btn);
      }
      return;
    }
    const result = addFavoriteText(text);
    if (result.full) console.warn(`[TBC] ${t('favoritesFull')}`);
    else if (result.added) console.info(`[TBC] ${t('favoritesAdded')}`);
  });

  const dismiss = () => closeSuperchatDetailCard();
  backdrop.addEventListener('click', dismiss);
  closeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dismiss();
  });
  card.addEventListener('click', (e) => e.stopPropagation());

  activeSuperchatCard = {
    root,
    onDismiss: typeof onDismiss === 'function' ? onDismiss : null,
  };
}
