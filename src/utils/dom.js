function waitForElement(selector, root = document, timeout = 30000) {
  return new Promise((resolve) => {
    const existing = root.querySelector(selector);
    if (existing) {
      resolve(existing);
      return;
    }

    const observer = new MutationObserver(() => {
      const el = root.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(root, { childList: true, subtree: true });

    if (timeout > 0) {
      setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeout);
    }
  });
}

function getUsernameColor(element) {
  const colorEl = element.querySelector('[style*="color"]') ||
    element.querySelector('.chat-author__display-name') ||
    element.querySelector('[data-a-target="chat-message-username"]');
  if (!colorEl) return '#ffffff';
  const style = getComputedStyle(colorEl);
  return style.color && style.color !== 'rgba(0, 0, 0, 0)' ? style.color : '#ffffff';
}

function getFullscreenElement() {
  return document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement;
}
