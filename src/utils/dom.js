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

function getDanmakuMount(item) {
  return item.closest('.tbc-danmaku-layer')?.parentElement || null;
}

function getTwitchProfileUrl(usernameEl, displayName) {
  const link = usernameEl?.closest('a') || (usernameEl?.tagName === 'A' ? usernameEl : null);
  const href = link?.getAttribute('href');
  if (href) {
    try {
      const url = new URL(href, 'https://www.twitch.tv');
      const path = url.pathname.replace(/\/+$/, '');
      if (path.length > 1) return `https://www.twitch.tv${path}`;
    } catch (_) {
      /* ignore */
    }
  }

  const login = displayName?.trim();
  if (!login) return null;
  return `https://www.twitch.tv/${encodeURIComponent(login.toLowerCase())}`;
}

function getEditorPlainText(editor) {
  return (editor.innerText || editor.textContent || '')
    .replace(/\u200B/g, '')
    .replace(/\uFEFF/g, '')
    .trim();
}

function selectAllInEditor(editor) {
  editor.focus();
  const range = document.createRange();
  range.selectNodeContents(editor);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

function dispatchEditorBeforeInput(editor, inputType, data) {
  editor.dispatchEvent(new InputEvent('beforeinput', {
    bubbles: true,
    cancelable: true,
    inputType,
    data: data ?? null,
  }));
}

function tryPasteIntoEditor(editor, text) {
  selectAllInEditor(editor);

  try {
    const dataTransfer = new DataTransfer();
    dataTransfer.setData('text/plain', text);
    editor.dispatchEvent(new ClipboardEvent('paste', {
      bubbles: true,
      cancelable: true,
      clipboardData: dataTransfer,
    }));
    if (getEditorPlainText(editor) === text) return true;
  } catch (_) {
    /* ignore */
  }

  selectAllInEditor(editor);
  dispatchEditorBeforeInput(editor, 'insertReplacementText', text);
  if (getEditorPlainText(editor) === text) return true;

  selectAllInEditor(editor);
  document.execCommand('delete', false, null);
  dispatchEditorBeforeInput(editor, 'insertText', text);
  if (getEditorPlainText(editor) === text) return true;

  selectAllInEditor(editor);
  document.execCommand('insertText', false, text);
  return getEditorPlainText(editor) === text;
}

function findSlateChatEditor() {
  return document.querySelector(SELECTORS.chatInputSlate);
}

function findLegacyChatInput() {
  const direct = document.querySelector(SELECTORS.chatInput);
  if (direct) return direct;

  const host = document.querySelector('[data-a-target="chat-input"]');
  if (!host) return null;
  if (host.tagName === 'TEXTAREA' || host.tagName === 'INPUT') return host;
  return host.querySelector('textarea, input[type="text"]');
}

function dispatchReactInput(element, value) {
  const tracker = element._valueTracker;
  if (tracker) {
    tracker.setValue(element.value);
  }

  const prototype = element instanceof HTMLTextAreaElement
    ? HTMLTextAreaElement.prototype
    : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
  if (setter) {
    setter.call(element, value);
  } else {
    element.value = value;
  }

  element.dispatchEvent(new InputEvent('input', {
    bubbles: true,
    cancelable: true,
    inputType: 'insertText',
    data: value,
  }));
}

function setLegacyChatInputText(textarea, text) {
  textarea.focus();
  textarea.setSelectionRange(0, textarea.value.length);

  if (document.execCommand('insertText', false, text)) {
    textarea.setSelectionRange(text.length, text.length);
  } else {
    dispatchReactInput(textarea, text);
    textarea.setSelectionRange(text.length, text.length);
  }

  textarea.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
}

async function setChatInputText(text) {
  if (!text) return false;

  const slateEditor = findSlateChatEditor();
  if (slateEditor) {
    slateEditor.focus();
    selectAllInEditor(slateEditor);

    try {
      if (typeof GM_setClipboard === 'function') {
        GM_setClipboard(text, 'text');
      } else {
        await navigator.clipboard.writeText(text);
      }
      document.execCommand('paste', false, null);
      if (getEditorPlainText(slateEditor) === text) return true;
    } catch (_) {
      /* clipboard API unavailable */
    }

    if (tryPasteIntoEditor(slateEditor, text)) return true;
    return getEditorPlainText(slateEditor).length > 0;
  }

  const textarea = findLegacyChatInput();
  if (textarea) {
    return setLegacyChatInputText(textarea, text);
  }

  return false;
}
