const MAX_DANMAKU_PAUSE_MS = 15000;
const RESUME_DELAY_MS = 300;

let activeTooltip = null;
let activeTooltipItem = null;
let hoverPausedItem = null;
let clickLockBackdrop = null;
let tooltipRepositionHandler = null;
let tooltipDismissBound = false;

function removeClickLockBackdrop() {
  clickLockBackdrop?.remove();
  clickLockBackdrop = null;
}

function showClickLockBackdrop(mount) {
  removeClickLockBackdrop();
  if (!mount) return;

  if (getComputedStyle(mount).position === 'static') {
    mount.style.position = 'relative';
  }

  clickLockBackdrop = document.createElement('div');
  clickLockBackdrop.className = 'tbc-click-lock-backdrop';
  clickLockBackdrop.addEventListener('pointerdown', (e) => {
    const otherDanmaku = document.elementsFromPoint(e.clientX, e.clientY)
      .find((el) => el.classList?.contains('tbc-danmaku-item') && el !== activeTooltipItem);

    hideDanmakuTooltip();

    if (otherDanmaku) {
      requestAnimationFrame(() => {
        otherDanmaku.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      });
    }
  }, true);

  mount.appendChild(clickLockBackdrop);
}

function hideDanmakuTooltip() {
  if (tooltipRepositionHandler) {
    window.removeEventListener('resize', tooltipRepositionHandler);
    document.removeEventListener('fullscreenchange', tooltipRepositionHandler);
    document.removeEventListener('webkitfullscreenchange', tooltipRepositionHandler);
    tooltipRepositionHandler = null;
  }

  removeClickLockBackdrop();

  const resumeFn = activeTooltipItem?._tbcResume;
  activeTooltipItem?.classList.remove('tbc-click-locked');
  activeTooltip?.remove();
  activeTooltip = null;
  activeTooltipItem = null;
  resumeFn?.();
}

function ensureTooltipDismissListener() {
  if (tooltipDismissBound) return;
  tooltipDismissBound = true;
  document.addEventListener('pointerdown', (e) => {
    if (!activeTooltip) return;
    if (activeTooltip.contains(e.target)) return;
    if (e.target.closest('.tbc-danmaku-item') === activeTooltipItem) return;
    if (clickLockBackdrop?.contains(e.target)) return;
    hideDanmakuTooltip();
  }, true);
}

function positionDanmakuTooltip(item, tooltip, mount) {
  if (!mount) return;

  const margin = 8;
  const gap = 6;
  const bounds = mount.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();
  const tipRect = tooltip.getBoundingClientRect();
  const tipHeight = tipRect.height;
  const tipWidth = tipRect.width;

  const spaceAbove = itemRect.top - bounds.top - margin;
  const spaceBelow = bounds.bottom - itemRect.bottom - margin;
  const needed = tipHeight + gap;

  let placement = 'above';
  if (spaceAbove < needed && spaceBelow >= needed) {
    placement = 'below';
  } else if (spaceAbove < needed && spaceBelow < needed) {
    placement = spaceBelow > spaceAbove ? 'below' : 'above';
  }

  tooltip.classList.toggle('tbc-danmaku-tooltip--above', placement === 'above');
  tooltip.classList.toggle('tbc-danmaku-tooltip--below', placement === 'below');

  let left = itemRect.left - bounds.left + itemRect.width / 2 - tipWidth / 2;
  left = clamp(left, margin, Math.max(margin, bounds.width - tipRect.width - margin));

  let top;
  if (placement === 'below') {
    top = itemRect.bottom - bounds.top + gap;
  } else {
    top = itemRect.top - bounds.top - tipHeight - gap;
  }

  Object.assign(tooltip.style, {
    position: 'absolute',
    left: `${left}px`,
    top: `${top}px`,
    zIndex: '100001',
  });
}

function bindTooltipReposition(item, tooltip, mount) {
  tooltipRepositionHandler = () => positionDanmakuTooltip(item, tooltip, mount);
  window.addEventListener('resize', tooltipRepositionHandler);
  document.addEventListener('fullscreenchange', tooltipRepositionHandler);
  document.addEventListener('webkitfullscreenchange', tooltipRepositionHandler);
}

function attachDanmakuInteraction(item, { username, usernameColor, originalMessage, translated, onPause, onResume }) {
  let hoverResumeTimer = null;
  let maxPauseTimer = null;
  let pauseReason = null;

  const clearHoverResumeTimer = () => {
    clearTimeout(hoverResumeTimer);
    hoverResumeTimer = null;
  };

  const clearMaxPauseTimer = () => {
    clearTimeout(maxPauseTimer);
    maxPauseTimer = null;
  };

  const armMaxPauseTimer = () => {
    clearMaxPauseTimer();
    maxPauseTimer = setTimeout(() => {
      if (item.classList.contains('tbc-paused')) doResume();
    }, MAX_DANMAKU_PAUSE_MS);
  };

  const doResume = () => {
    clearHoverResumeTimer();
    clearMaxPauseTimer();
    if (!item.classList.contains('tbc-paused')) {
      pauseReason = null;
      item.classList.remove('tbc-click-locked');
      return;
    }

    pauseReason = null;
    item.classList.remove('tbc-paused', 'tbc-click-locked');
    if (hoverPausedItem === item) hoverPausedItem = null;
    if (activeTooltipItem === item) {
      removeClickLockBackdrop();
      activeTooltip?.remove();
      activeTooltip = null;
      activeTooltipItem = null;
    }
    onResume?.();
  };

  item._tbcResume = () => doResume();

  item._tbcResumeHover = () => {
    if (pauseReason !== 'hover') return;
    doResume();
  };

  const scheduleHoverResume = () => {
    if (pauseReason === 'click') return;
    clearHoverResumeTimer();
    hoverResumeTimer = setTimeout(() => {
      if (pauseReason === 'hover') doResume();
    }, RESUME_DELAY_MS);
  };

  const pauseForHover = () => {
    if (activeTooltipItem) return;
    if (pauseReason === 'click') return;

    clearHoverResumeTimer();

    if (hoverPausedItem && hoverPausedItem !== item) {
      hoverPausedItem._tbcResumeHover?.();
    }
    hoverPausedItem = item;

    if (!item.classList.contains('tbc-paused')) {
      pauseReason = 'hover';
      item.classList.add('tbc-paused');
      onPause?.();
    } else if (pauseReason !== 'hover') {
      pauseReason = 'hover';
    }

    armMaxPauseTimer();
  };

  const pauseForClick = () => {
    clearHoverResumeTimer();

    if (hoverPausedItem && hoverPausedItem !== item) {
      hoverPausedItem._tbcResumeHover?.();
    }
    hoverPausedItem = null;

    pauseReason = 'click';
    item.classList.add('tbc-click-locked');
    if (!item.classList.contains('tbc-paused')) {
      item.classList.add('tbc-paused');
      onPause?.();
    }

    armMaxPauseTimer();
  };

  const showTooltip = () => {
    const messageText = originalMessage || item.textContent;
    const showOriginal = translated && originalMessage && originalMessage !== item.textContent;
    if (!username && !showOriginal && !messageText) return;

    ensureTooltipDismissListener();
    hideDanmakuTooltip();
    pauseForClick();

    item.dataset.tbcId = item.dataset.tbcId || String(Date.now() + Math.random());

    const mount = getDanmakuMount(item);
    if (!mount) {
      doResume();
      return;
    }

    showClickLockBackdrop(mount);

    const tooltip = document.createElement('div');
    tooltip.className = 'tbc-danmaku-tooltip tbc-danmaku-tooltip--above';
    tooltip.dataset.itemId = item.dataset.tbcId;

    const bubble = document.createElement('div');
    bubble.className = 'tbc-danmaku-tooltip-bubble';

    const header = document.createElement('div');
    header.className = 'tbc-danmaku-tooltip-header';

    if (username) {
      const nameRow = document.createElement('div');
      nameRow.className = 'tbc-danmaku-tooltip-name';
      nameRow.style.color = usernameColor || '#a970ff';
      nameRow.textContent = username;
      header.appendChild(nameRow);
    } else {
      header.classList.add('tbc-danmaku-tooltip-header--solo');
    }

    if (messageText) {
      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'tbc-danmaku-tooltip-copy';
      copyBtn.setAttribute('aria-label', t('tooltipCopy'));
      copyBtn.innerHTML = ICON_COPY;
      copyBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await setChatInputText(messageText);
        hideDanmakuTooltip();
      });
      header.appendChild(copyBtn);
    }

    bubble.appendChild(header);

    if (showOriginal) {
      const originalRow = document.createElement('div');
      originalRow.className = 'tbc-danmaku-tooltip-original';
      originalRow.textContent = truncateText(originalMessage);
      bubble.appendChild(originalRow);
    }

    const tail = document.createElement('div');
    tail.className = 'tbc-danmaku-tooltip-tail';

    tooltip.append(bubble, tail);
    tooltip.addEventListener('click', (e) => e.stopPropagation());

    mount.appendChild(tooltip);
    positionDanmakuTooltip(item, tooltip, mount);
    bindTooltipReposition(item, tooltip, mount);
    activeTooltip = tooltip;
    activeTooltipItem = item;

    requestAnimationFrame(() => {
      if (activeTooltip === tooltip) positionDanmakuTooltip(item, tooltip, mount);
    });
  };

  item.addEventListener('mouseenter', () => {
    pauseForHover();
  });

  item.addEventListener('mouseleave', () => {
    if (pauseReason === 'click') return;
    scheduleHoverResume();
  });

  item.addEventListener('click', (e) => {
    e.stopPropagation();
    showTooltip();
  });

  item.addEventListener('animationend', () => {
    clearHoverResumeTimer();
    clearMaxPauseTimer();
    if (activeTooltipItem === item) hideDanmakuTooltip();
  }, { once: true });
}
