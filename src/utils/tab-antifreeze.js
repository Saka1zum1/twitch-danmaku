const TabAntiFreeze = {
  active: false,
  captureHandler: null,
  saved: null,
};

function tabAntiFreezeBlockVisibilityEvent(event) {
  event.stopImmediatePropagation();
}

function tabAntiFreezeSaveDescriptor(object, key) {
  const descriptor = Object.getOwnPropertyDescriptor(object, key);
  if (descriptor) TabAntiFreeze.saved[key] = descriptor;
}

function tabAntiFreezeEnable() {
  if (TabAntiFreeze.active) return;
  TabAntiFreeze.saved = {};
  tabAntiFreezeSaveDescriptor(document, 'hidden');
  tabAntiFreezeSaveDescriptor(document, 'visibilityState');
  tabAntiFreezeSaveDescriptor(document, 'webkitVisibilityState');

  try {
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      enumerable: true,
      get() { return false; },
    });
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      enumerable: true,
      get() { return 'visible'; },
    });
    Object.defineProperty(document, 'webkitVisibilityState', {
      configurable: true,
      enumerable: true,
      get() { return 'visible'; },
    });
  } catch (error) {
    console.warn('[TBC] Tab anti-freeze: could not patch visibility', error);
    TabAntiFreeze.saved = null;
    return;
  }

  TabAntiFreeze.saved.hasFocus = document.hasFocus;
  document.hasFocus = () => true;

  TabAntiFreeze.captureHandler = tabAntiFreezeBlockVisibilityEvent;
  document.addEventListener('visibilitychange', TabAntiFreeze.captureHandler, true);

  TabAntiFreeze.active = true;
  try {
    document.dispatchEvent(new Event('visibilitychange'));
  } catch {
    /* ignore */
  }
}

function tabAntiFreezeRestoreProperty(object, key) {
  const saved = TabAntiFreeze.saved?.[key];
  if (!saved) return;
  try {
    Object.defineProperty(object, key, saved);
  } catch {
    try {
      delete object[key];
    } catch {
      /* ignore */
    }
  }
}

function tabAntiFreezeDisable() {
  if (!TabAntiFreeze.active) return;

  if (TabAntiFreeze.captureHandler) {
    document.removeEventListener('visibilitychange', TabAntiFreeze.captureHandler, true);
    TabAntiFreeze.captureHandler = null;
  }

  if (TabAntiFreeze.saved) {
    tabAntiFreezeRestoreProperty(document, 'hidden');
    tabAntiFreezeRestoreProperty(document, 'visibilityState');
    tabAntiFreezeRestoreProperty(document, 'webkitVisibilityState');
    if (TabAntiFreeze.saved.hasFocus) {
      document.hasFocus = TabAntiFreeze.saved.hasFocus;
    }
  }

  TabAntiFreeze.saved = null;
  TabAntiFreeze.active = false;
}

function tabAntiFreezeIsEnabled() {
  return TabAntiFreeze.active;
}

function syncTabAntiFreeze(isPipOpen) {
  if (isPipOpen?.()) tabAntiFreezeEnable();
  else tabAntiFreezeDisable();
}
