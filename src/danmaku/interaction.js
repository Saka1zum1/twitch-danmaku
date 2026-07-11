let activeTooltip = null;

function hideDanmakuTooltip() {
  activeTooltip?.remove();
  activeTooltip = null;
}

function positionDanmakuTooltip(item, tooltip) {
  const rect = item.getBoundingClientRect();
  const tipRect = tooltip.getBoundingClientRect();
  const left = clamp(rect.left + rect.width / 2 - tipRect.width / 2, 8, window.innerWidth - tipRect.width - 8);
  const top = rect.top - tipRect.height - 6;

  Object.assign(tooltip.style, {
    position: 'fixed',
    left: `${left}px`,
    top: `${Math.max(8, top)}px`,
    zIndex: '100001',
  });
}

function attachDanmakuInteraction(item, { username, usernameColor, originalMessage, translated, onPause, onResume }) {
  let resumeTimer = null;

  const pause = () => {
    clearTimeout(resumeTimer);
    item.classList.add('tbc-paused');
    onPause?.();
  };

  const resume = () => {
    item.classList.remove('tbc-paused');
    if (activeTooltip?.dataset.itemId === item.dataset.tbcId) {
      hideDanmakuTooltip();
    }
    onResume?.();
  };

  const scheduleResume = () => {
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(resume, 500);
  };

  const showTooltip = () => {
    const showOriginal = translated && originalMessage && originalMessage !== item.textContent;
    if (!username && !showOriginal) return;

    hideDanmakuTooltip();
    item.dataset.tbcId = item.dataset.tbcId || String(Date.now() + Math.random());

    const tooltip = document.createElement('div');
    tooltip.className = 'tbc-danmaku-tooltip';
    tooltip.dataset.itemId = item.dataset.tbcId;

    const bubble = document.createElement('div');
    bubble.className = 'tbc-danmaku-tooltip-bubble';

    if (username) {
      const nameRow = document.createElement('div');
      nameRow.className = 'tbc-danmaku-tooltip-name';
      nameRow.style.color = usernameColor || '#a970ff';
      nameRow.textContent = username;
      bubble.appendChild(nameRow);
    }

    if (showOriginal) {
      const originalRow = document.createElement('div');
      originalRow.className = 'tbc-danmaku-tooltip-original';
      originalRow.textContent = truncateText(originalMessage);
      bubble.appendChild(originalRow);
    }

    const tail = document.createElement('div');
    tail.className = 'tbc-danmaku-tooltip-tail';

    tooltip.append(bubble, tail);

    const mountTarget = getFullscreenElement() || document.body;
    mountTarget.appendChild(tooltip);
    positionDanmakuTooltip(item, tooltip);
    activeTooltip = tooltip;
  };

  item.addEventListener('mouseenter', pause);
  item.addEventListener('mouseleave', scheduleResume);
  item.addEventListener('click', (e) => {
    e.stopPropagation();
    pause();
    showTooltip();
    requestAnimationFrame(() => {
      if (activeTooltip) positionDanmakuTooltip(item, activeTooltip);
    });
  });

  item.addEventListener('animationend', () => {
    clearTimeout(resumeTimer);
    if (activeTooltip?.dataset.itemId === item.dataset.tbcId) {
      hideDanmakuTooltip();
    }
  }, { once: true });
}
