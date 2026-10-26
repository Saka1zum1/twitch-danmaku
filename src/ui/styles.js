function injectStyles() {
  GM_addStyle(`
    .tbc-danmaku-layer {
      pointer-events: none;
      overflow: hidden;
    }

    .tbc-danmaku-item {
      position: absolute;
      left: 100%;
      white-space: nowrap;
      opacity: var(--tbc-opacity, 1);
      font-weight: 600;
      pointer-events: auto;
      cursor: default;
      text-shadow:
        1px 1px 2px rgba(0, 0, 0, 0.9),
        -1px -1px 2px rgba(0, 0, 0, 0.9),
        0 0 4px rgba(0, 0, 0, 0.8);
      animation: tbc-scroll var(--tbc-duration, 8s) linear forwards;
      will-change: transform;
    }

    .tbc-danmaku-item img.tbc-emote {
      display: inline-block !important;
      height: 1.2em !important;
      width: auto !important;
      min-height: 1.5em !important;
      max-height: 1.5em !important;
      max-width: 6em !important;
      object-fit: contain !important;
      object-position: center !important;
      vertical-align: -0.22em !important;
      margin: 0 0.1em !important;
      pointer-events: none !important;
      user-select: none !important;
    }

    .tbc-danmaku-item.tbc-paused {
      animation-play-state: paused;
      z-index: 20;
      cursor: pointer;
      pointer-events: auto;
    }

    .tbc-danmaku-item.tbc-paused.tbc-click-locked {
      z-index: 100002;
    }

    .tbc-click-lock-backdrop {
      position: absolute;
      inset: 0;
      z-index: 100000;
      pointer-events: auto;
      background: transparent;
    }

    .tbc-danmaku-tooltip {
      display: flex;
      flex-direction: column;
      align-items: center;
      pointer-events: auto;
      filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.4));
      max-width: calc(100% - 16px);
    }

    .tbc-danmaku-tooltip-bubble {
      background: rgba(24, 24, 27, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      padding: 6px 8px;
      max-width: min(280px, 100%);
      max-height: min(40vh, 240px);
      overflow-y: auto;
    }

    .tbc-danmaku-tooltip-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 6px;
    }

    .tbc-danmaku-tooltip-header--solo {
      justify-content: flex-end;
    }

    .tbc-danmaku-tooltip-name {
      flex: 1;
      min-width: 0;
      font-size: 12px;
      font-weight: 600;
      line-height: 1.3;
      word-break: break-word;
      text-decoration: none;
      cursor: pointer;
    }

    .tbc-danmaku-tooltip-name:hover {
      text-decoration: underline;
    }

    .tbc-danmaku-tooltip-copy {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: clamp(24px, 6vw, 28px);
      height: clamp(24px, 6vw, 28px);
      padding: 0;
      border: none;
      border-radius: 4px;
      background: transparent;
      color: #adadb8;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }

    .tbc-danmaku-tooltip-copy:hover {
      background: rgba(255, 255, 255, 0.12);
      color: #efeff1;
    }

    .tbc-danmaku-tooltip-copy svg {
      width: clamp(14px, 3.5vw, 16px);
      height: clamp(14px, 3.5vw, 16px);
      fill: currentColor;
      display: block;
    }

    .tbc-danmaku-tooltip-original {
      margin-top: 4px;
      color: #adadb8;
      font-size: 11px;
      line-height: 1.3;
      word-break: break-word;
    }

    .tbc-danmaku-tooltip-tail {
      width: 6px;
      height: 6px;
      flex-shrink: 0;
      background: rgba(24, 24, 27, 0.95);
      transform: rotate(45deg);
    }

    .tbc-danmaku-tooltip--above .tbc-danmaku-tooltip-tail {
      margin: -3px auto 0;
      border-right: 1px solid rgba(255, 255, 255, 0.1);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .tbc-danmaku-tooltip--below .tbc-danmaku-tooltip-bubble {
      order: 2;
    }

    .tbc-danmaku-tooltip--below .tbc-danmaku-tooltip-tail {
      order: 1;
      margin: 0 auto -3px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      border-left: 1px solid rgba(255, 255, 255, 0.1);
    }

    @keyframes tbc-scroll {
      from { transform: translateX(var(--tbc-start, 0)); }
      to { transform: translateX(calc(-1 * var(--tbc-travel, 100vw))); }
    }

    .tbc-controls-wrap {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      margin-left: 2px;
    }

    .tbc-control-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      padding: 0;
      border: none;
      border-radius: 4px;
      background: transparent;
      color: #efeff1;
      cursor: pointer;
      transition: background 0.15s, opacity 0.15s;
      flex-shrink: 0;
    }

    .tbc-control-btn:hover,
    .tbc-control-btn.tbc-active {
      background: rgba(255, 255, 255, 0.15);
    }

    .tbc-control-btn svg {
      width: 20px;
      height: 20px;
      fill: currentColor;
      display: block;
    }

    .tbc-danmaku-btn .tbc-icon {
      display: none;
      line-height: 0;
    }

    .tbc-danmaku-btn.tbc-danmaku-enabled .tbc-icon-on,
    .tbc-danmaku-btn.tbc-danmaku-disabled .tbc-icon-off {
      display: block;
    }

    .tbc-danmaku-btn.tbc-danmaku-disabled {
      opacity: 0.55;
    }

    .tbc-speech-btn .tbc-icon {
      display: none;
      line-height: 0;
    }

    .tbc-speech-btn.tbc-speech-on .tbc-icon-on,
    .tbc-speech-btn.tbc-speech-mute .tbc-icon-mute,
    .tbc-speech-btn.tbc-speech-off .tbc-icon-off {
      display: block;
    }

    .tbc-speech-btn.tbc-speech-mute,
    .tbc-speech-btn.tbc-speech-off {
      opacity: 0.55;
    }

    .tbc-translate-btn .tbc-icon {
      display: none;
      line-height: 0;
    }

    .tbc-translate-btn.tbc-translate-on .tbc-icon-on,
    .tbc-translate-btn.tbc-translate-off .tbc-icon-off {
      display: block;
    }

    .tbc-translate-btn.tbc-translate-off {
      opacity: 0.55;
    }

    /* Cloned InjectLayout keeps Twitch button chrome; fallback is for demo / missing shell. */
    .tbc-chat-clear-wrap {
      flex-shrink: 0;
    }

    .tbc-chat-clear-btn svg {
      pointer-events: none;
    }

    .tbc-chat-clear-btn--fallback {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-sizing: border-box;
      width: 32px;
      height: 32px;
      margin: 0;
      padding: 0;
      border: none;
      border-radius: 0.4rem;
      background: transparent;
      color: var(--color-fill-button-icon, var(--color-text-base, #efeff1));
      cursor: pointer;
      transition: background-color 0.1s ease, color 0.1s ease;
    }

    .tbc-chat-clear-btn--fallback:hover {
      background-color: var(--color-background-interactable-hover, rgba(83, 83, 95, 0.48));
      color: var(--color-fill-button-icon-hover, var(--color-text-base, #efeff1));
    }

    .tbc-chat-clear-btn--fallback:active {
      background-color: var(--color-background-interactable-active, rgba(83, 83, 95, 0.7));
    }

    .tbc-chat-clear-btn--fallback svg {
      width: 20px;
      height: 20px;
      fill: currentColor;
      display: block;
      pointer-events: none;
    }

    .tbc-fav-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-sizing: border-box;
      width: 32px;
      height: 32px;
      margin: 0;
      padding: 0;
      border: none;
      border-radius: 0.4rem;
      background: transparent;
      color: var(--color-fill-button-icon, var(--color-text-base, #efeff1));
      cursor: pointer;
      transition: background-color 0.1s ease, color 0.1s ease;
    }

    .tbc-fav-btn:hover {
      background-color: var(--color-background-interactable-hover, rgba(83, 83, 95, 0.48));
      color: #ffca5f;
    }

    .tbc-fav-btn:active {
      background-color: var(--color-background-interactable-active, rgba(83, 83, 95, 0.7));
    }

    .tbc-fav-btn svg {
      width: 20px;
      height: 20px;
      fill: currentColor;
      display: block;
      pointer-events: none;
    }

    .tbc-fav-panel {
      max-height: min(80vh, 580px);
      display: flex;
      flex-direction: column;
    }

    .tbc-fav-add-row {
      display: flex;
      gap: 8px;
      padding: 10px 12px 0;
    }

    .tbc-fav-add-input {
      flex: 1;
      min-width: 0;
      height: 32px;
      box-sizing: border-box;
      border-radius: 4px;
      border: 1px solid rgba(255, 255, 255, 0.16);
      background: #18181b;
      color: #efeff1;
      padding: 0 10px;
      font-size: 13px;
    }

    .tbc-fav-add-btn,
    .tbc-fav-item-send,
    .tbc-fav-wheel-toggle {
      border: none;
      border-radius: 4px;
      background: #9147ff;
      color: #fff;
      font-size: 12px;
      font-weight: 600;
      padding: 0 10px;
      height: 32px;
      cursor: pointer;
      white-space: nowrap;
    }

    .tbc-fav-add-btn:hover,
    .tbc-fav-item-send:hover,
    .tbc-fav-wheel-toggle:hover {
      background: #772ce8;
    }

    .tbc-fav-wheel-toggle.is-running {
      background: #eb0400;
    }

    .tbc-fav-wheel-toggle.is-running:hover {
      background: #c50300;
    }

    .tbc-fav-list {
      margin-top: 10px;
      padding: 0 12px;
      overflow: auto;
      max-height: 240px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .tbc-fav-empty {
      color: #adadb8;
      font-size: 12px;
      padding: 12px 0;
      text-align: center;
    }

    .tbc-fav-wrap {
      flex-shrink: 0;
    }

    .tbc-fav-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 8px;
      border-radius: 6px;
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .tbc-fav-item.is-global {
      border-color: rgba(145, 71, 255, 0.45);
    }

    .tbc-fav-item-meta {
      font-size: 11px;
      font-weight: 600;
      color: #adadb8;
    }

    .tbc-fav-item.is-global .tbc-fav-item-meta {
      color: #bf94ff;
    }

    .tbc-fav-item-text {
      width: 100%;
      box-sizing: border-box;
      resize: vertical;
      min-height: 32px;
      height: 32px;
      border-radius: 4px;
      border: 1px solid rgba(255, 255, 255, 0.14);
      background: #18181b;
      color: #efeff1;
      padding: 6px 8px;
      font: inherit;
      font-size: 13px;
    }

    .tbc-fav-item-tools {
      display: flex;
      gap: 6px;
      align-items: center;
    }

    .tbc-fav-item-shortcut {
      height: 28px;
      border-radius: 4px;
      border: 1px solid rgba(255, 255, 255, 0.14);
      background: #18181b;
      color: #efeff1;
      font-size: 12px;
    }

    .tbc-fav-item-scope {
      height: 28px;
      border: none;
      border-radius: 4px;
      background: #3a3a3d;
      color: #efeff1;
      font-size: 12px;
      font-weight: 600;
      padding: 0 10px;
      cursor: pointer;
    }

    .tbc-fav-item-scope:hover {
      background: #9147ff;
    }

    .tbc-fav-item-remove {
      margin-left: auto;
      height: 28px;
      border: none;
      border-radius: 4px;
      background: #3a3a3d;
      color: #efeff1;
      font-size: 12px;
      font-weight: 600;
      padding: 0 10px;
      cursor: pointer;
    }

    .tbc-fav-item-remove:hover {
      background: #ad1c1c;
    }

    .tbc-fav-status {
      min-height: 16px;
      margin: 6px 12px 0;
      color: #ff8280;
      font-size: 12px;
    }

    .tbc-fav-status.is-ok {
      color: #00f593;
    }

    .tbc-fav-wheel {
      margin-top: 10px;
      padding: 10px 12px 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .tbc-fav-wheel-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .tbc-fav-wheel-title {
      font-size: 13px;
      font-weight: 700;
    }

    .tbc-fav-wheel-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 6px;
    }

    .tbc-fav-wheel-field {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      color: #adadb8;
      font-size: 12px;
    }

    .tbc-fav-wheel-field input {
      width: 88px;
      height: 28px;
      box-sizing: border-box;
      border-radius: 4px;
      border: 1px solid rgba(255, 255, 255, 0.14);
      background: #18181b;
      color: #efeff1;
      padding: 0 8px;
      font-size: 12px;
    }

    .tbc-fav-wheel-status {
      color: #adadb8;
      font-size: 12px;
    }

    .tbc-superchat-layer {
      pointer-events: none;
      display: none;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      align-content: flex-start;
      gap: 6px;
      overflow: visible;
      padding: 6px 0 4px;
      box-sizing: border-box;
      min-height: 0;
    }

    .tbc-superchat-layer.tbc-sc-scrollable {
      overflow-x: hidden;
      overflow-y: auto;
      overscroll-behavior: contain;
      pointer-events: auto;
      scrollbar-width: thin;
    }

    .tbc-superchat-layer.tbc-sc-bottom {
      justify-content: flex-end;
    }

    .tbc-superchat-layer.tbc-sc-align-left {
      align-items: flex-start;
      padding-left: 8px;
    }

    .tbc-superchat-layer.tbc-sc-align-right {
      align-items: flex-end;
      padding-right: 8px;
    }

    .tbc-superchat-item {
      position: relative;
      display: flex;
      align-items: flex-start;
      gap: 10px;
      flex-shrink: 0;
      min-width: min(280px, calc(100% - 24px));
      padding: 7px 28px 7px 8px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.18);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
      font-weight: 700;
      line-height: 1.25;
      overflow: hidden;
      pointer-events: auto;
      cursor: pointer;
      animation-duration: var(--tbc-sc-duration, 6s);
      animation-timing-function: ease;
      animation-fill-mode: forwards;
    }

    .tbc-sc-close {
      position: absolute;
      top: 2px;
      right: 2px;
      z-index: 3;
      width: 24px;
      height: 24px;
      margin: 0;
      padding: 0;
      border: none;
      border-radius: 9000px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      color: #ffffff;
      cursor: pointer;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.15s ease, background-color 0.1s ease, color 0.1s ease;
    }

    .tbc-superchat-item:hover .tbc-sc-close,
    .tbc-superchat-item.tbc-paused .tbc-sc-close,
    .tbc-superchat-item:focus-within .tbc-sc-close {
      opacity: 1;
      pointer-events: auto;
    }

    .tbc-sc-close:hover {
      background: rgba(255, 255, 255, 0.2);
      color: #ffffff;
    }

    .tbc-sc-close:active {
      background: rgba(255, 255, 255, 0.28);
    }

    .tbc-sc-close svg {
      width: 16px;
      height: 16px;
      display: block;
      pointer-events: none;
      fill: currentColor;
    }

    .tbc-sc-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
      background: rgba(0, 0, 0, 0.25);
      border: 2px solid rgba(255, 255, 255, 0.35);
      margin-top: 1px;
    }

    .tbc-sc-main {
      min-width: 0;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .tbc-sc-head {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      flex-wrap: nowrap;
    }

    .tbc-sc-meta {
      display: inline-flex;
      align-items: center;
      flex-wrap: nowrap;
      gap: 6px;
      flex-shrink: 0;
      margin-left: auto;
    }

    .tbc-sc-amount {
      flex-shrink: 0;
      padding: 1px 7px;
      border-radius: 999px;
      background: rgba(0, 0, 0, 0.28);
      border: 1px solid rgba(255, 255, 255, 0.35);
      font-size: 0.72em;
      font-weight: 800;
      letter-spacing: 0.02em;
      line-height: 1.4;
      white-space: nowrap;
    }

    .tbc-sc-tier {
      min-width: 2.2em;
      text-align: center;
    }

    .tbc-superchat-item.tbc-sc-compact {
      min-width: unset;
      max-width: min(360px, calc(100% - 24px));
      padding: 4px 34px 4px 5px;
      gap: 6px;
      line-height: 1.2;
      border-radius: 10px;
      cursor: pointer;
      flex-shrink: 0;
      align-items: center;
    }

    .tbc-superchat-item.tbc-sc-compact .tbc-sc-avatar {
      width: 24px;
      height: 24px;
      border-width: 1px;
      margin-top: 0;
    }

    .tbc-sc-compact-main {
      min-width: 0;
      flex: 1;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .tbc-sc-compact-name {
      min-width: 0;
      flex: 0 1 auto;
      max-width: 6.5em;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 0.88em;
      font-weight: 800;
      opacity: 0.96;
    }

    .tbc-superchat-item.tbc-sc-compact .tbc-sc-meta {
      margin-left: 0;
      flex-shrink: 0;
      gap: 4px;
    }

    .tbc-superchat-item.tbc-sc-compact .tbc-sc-badge,
    .tbc-superchat-item.tbc-sc-compact .tbc-sc-amount {
      padding: 0 5px;
      font-size: 0.68em;
      line-height: 1.35;
    }

    .tbc-superchat-item.tbc-sc-compact .tbc-sc-badge.tbc-sc-tier {
      padding: 0;
      min-width: 0;
    }

    .tbc-superchat-item.tbc-sc-compact .tbc-sc-tier-img {
      height: 1.1em;
      max-width: 2.35em;
    }

    .tbc-superchat-item.tbc-sc-compact .tbc-sc-close {
      top: 50%;
      right: 3px;
      width: 22px;
      height: 22px;
      transform: translateY(-50%);
    }

    .tbc-superchat-item.tbc-sc-compact .tbc-sc-close svg {
      width: 14px;
      height: 14px;
    }

    .tbc-sc-name {
      font-size: 0.85em;
      font-weight: 800;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;
      flex: 1 1 auto;
      opacity: 0.95;
    }

    .tbc-sc-badge {
      flex-shrink: 0;
      padding: 1px 7px;
      border-radius: 999px;
      background: rgba(0, 0, 0, 0.28);
      border: 1px solid rgba(255, 255, 255, 0.35);
      color: inherit;
      font-size: 0.72em;
      font-weight: 800;
      letter-spacing: 0.02em;
      line-height: 1.4;
    }

    .tbc-sc-badge.tbc-sc-tier {
      padding: 0;
      background: transparent;
      border: none;
      line-height: 0;
    }

    .tbc-sc-tier-img {
      display: block;
      height: 1.45em;
      width: auto;
      max-width: 2.85em;
      object-fit: contain;
    }

    .tbc-sc-body {
      min-width: 0;
      overflow: hidden;
      max-width: 100%;
      line-height: 1.3;
      min-height: 1.3em;
    }

    .tbc-sc-body-track {
      display: inline-flex;
      align-items: center;
      white-space: nowrap;
      will-change: transform;
    }

    .tbc-sc-body-track.tbc-sc-marquee {
      animation: tbc-sc-marquee var(--tbc-sc-marquee-duration, 8s) linear infinite;
    }

    .tbc-superchat-item.tbc-paused .tbc-sc-body-track.tbc-sc-marquee {
      animation-play-state: paused;
    }

    @keyframes tbc-sc-marquee {
      0%, 12% { transform: translateX(0); }
      88%, 100% { transform: translateX(calc(-1 * var(--tbc-sc-marquee-distance, 0px))); }
    }

    .tbc-chat-menu {
      position: fixed;
      z-index: 100050;
      min-width: 168px;
      padding: 6px;
      border-radius: 8px;
      background: #18181b;
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.45);
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .tbc-chat-menu-item {
      appearance: none;
      border: none;
      background: transparent;
      color: #efeff1;
      text-align: left;
      padding: 8px 10px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }

    .tbc-chat-menu-item:hover {
      background: rgba(145, 71, 255, 0.7);
    }

    .tbc-superchat-item.tbc-sc-fade,
    .tbc-superchat-item.tbc-sc-shine {
      animation-name: tbc-sc-fade;
    }

    .tbc-superchat-item.tbc-sc-slide {
      animation-name: tbc-sc-slide;
    }

    .tbc-superchat-layer.tbc-sc-bottom .tbc-superchat-item.tbc-sc-slide {
      animation-name: tbc-sc-slide-up;
    }

    .tbc-superchat-item .tbc-emote {
      height: 1.5em !important;
      max-height: 1.5em !important;
      vertical-align: -0.2em !important;
    }

    .tbc-superchat-item.tbc-sc-pop {
      animation-name: tbc-sc-pop;
    }

    .tbc-superchat-item.tbc-sc-shine::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(110deg, transparent 28%, rgba(255, 255, 255, 0.55) 50%, transparent 72%);
      transform: translateX(-130%);
      animation: tbc-sc-shine-sweep 1.15s ease 0.25s;
      pointer-events: none;
    }

    .tbc-superchat-item.tbc-paused,
    .tbc-superchat-item.tbc-paused.tbc-click-locked,
    .tbc-superchat-item.tbc-paused::after {
      animation-play-state: paused;
    }

    .tbc-superchat-item.tbc-paused,
    .tbc-superchat-item.tbc-paused.tbc-click-locked {
      z-index: 20;
    }

    .tbc-sc-card-root {
      position: absolute;
      inset: 0;
      z-index: 10020;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      box-sizing: border-box;
      pointer-events: auto;
    }

    .tbc-sc-card-backdrop {
      position: absolute;
      inset: 0;
      margin: 0;
      padding: 0;
      border: none;
      background: rgba(0, 0, 0, 0.55);
      cursor: pointer;
    }

    .tbc-sc-card {
      position: relative;
      z-index: 1;
      width: min(520px, calc(100% - 24px));
      max-height: min(70vh, 420px);
      overflow: auto;
      border-radius: 14px;
      border: 1px solid rgba(255, 255, 255, 0.22);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
      padding: 14px 14px 12px;
      box-sizing: border-box;
    }

    .tbc-sc-card-header {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 10px;
    }

    .tbc-sc-card-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
      border: 2px solid rgba(255, 255, 255, 0.35);
    }

    .tbc-sc-card-headtext {
      min-width: 0;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .tbc-sc-card-name {
      font-size: 15px;
      font-weight: 800;
      line-height: 1.25;
      word-break: break-word;
    }

    .tbc-sc-card-meta {
      align-self: flex-start;
    }

    .tbc-sc-card-close {
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      margin: 0;
      padding: 0;
      border: none;
      border-radius: 999px;
      background: rgba(0, 0, 0, 0.25);
      color: inherit;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .tbc-sc-card-close:hover {
      background: rgba(255, 255, 255, 0.18);
    }

    .tbc-sc-card-close svg {
      width: 18px;
      height: 18px;
      fill: currentColor;
    }

    .tbc-sc-card-body {
      font-size: 15px;
      font-weight: 600;
      line-height: 1.45;
      word-break: break-word;
      white-space: pre-wrap;
    }

    .tbc-sc-card-translation {
      margin-top: 10px;
      padding: 8px 10px;
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.22);
      border: 1px solid rgba(255, 255, 255, 0.15);
      font-size: 14px;
      line-height: 1.45;
      white-space: pre-wrap;
    }

    .tbc-sc-card-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;
    }

    .tbc-sc-card-action {
      appearance: none;
      border: 1px solid rgba(255, 255, 255, 0.28);
      background: rgba(0, 0, 0, 0.22);
      color: inherit;
      border-radius: 8px;
      padding: 7px 12px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
    }

    .tbc-sc-card-action:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.16);
    }

    .tbc-sc-card-action:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    @keyframes tbc-sc-fade {
      0% { opacity: 0; }
      12% { opacity: 1; }
      88% { opacity: 1; }
      100% { opacity: 0; }
    }

    @keyframes tbc-sc-slide {
      0% { opacity: 0; transform: translateY(-14px); }
      14% { opacity: 1; transform: translateY(0); }
      86% { opacity: 1; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(10px); }
    }

    @keyframes tbc-sc-slide-up {
      0% { opacity: 0; transform: translateY(14px); }
      14% { opacity: 1; transform: translateY(0); }
      86% { opacity: 1; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(-10px); }
    }

    @keyframes tbc-sc-pop {
      0% { opacity: 0; transform: scale(0.7); }
      16% { opacity: 1; transform: scale(1); }
      86% { opacity: 1; transform: scale(1); }
      100% { opacity: 0; transform: scale(0.92); }
    }

    @keyframes tbc-sc-shine-sweep {
      from { transform: translateX(-130%); }
      to { transform: translateX(130%); }
    }

    .tbc-balloon-body--speech {
      max-height: min(70vh, 520px);
    }

    .tbc-speech-test {
      display: flex;
      gap: 6px;
    }

    .tbc-balloon-input {
      flex: 1;
      min-width: 0;
      padding: 6px 8px;
      border: 1px solid #3a3a3d;
      border-radius: 4px;
      background: #0e0e10;
      color: #efeff1;
      font-size: 13px;
    }

    .tbc-speech-play {
      flex-shrink: 0;
      min-width: 36px;
      border: none;
      border-radius: 4px;
      background: #3a3a3d;
      color: #efeff1;
      cursor: pointer;
      font-size: 12px;
    }

    .tbc-speech-note {
      margin: 0;
      padding: 0 12px 8px;
      color: #adadb8;
      font-size: 12px;
      line-height: 1.4;
    }

    .tbc-balloon {
      background: #26262c;
      color: #efeff1;
      border-radius: 6px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
      font-family: "Inter", "Segoe UI", system-ui, sans-serif;
      font-size: 14px;
      overflow: hidden;
    }

    .tbc-balloon-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 12px 8px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .tbc-balloon-title {
      font-size: 14px;
      font-weight: 600;
      line-height: 1.4;
    }

    .tbc-balloon-close {
      background: none;
      border: none;
      color: #9147ff;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      padding: 4px 6px;
      border-radius: 4px;
    }

    .tbc-balloon-close:hover {
      background: rgba(145, 71, 255, 0.12);
    }

    .tbc-balloon-body {
      padding: 4px 0 8px;
      max-height: min(60vh, 420px);
      overflow-y: auto;
    }

    .tbc-balloon-row {
      padding: 8px 12px;
    }

    .tbc-balloon-row--toggle {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .tbc-balloon-row--field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .tbc-balloon-field-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .tbc-balloon-label {
      color: #efeff1;
      font-size: 13px;
      line-height: 1.4;
    }

    .tbc-balloon-value {
      color: #adadb8;
      font-size: 12px;
    }

    .tbc-balloon-range {
      width: 100%;
      accent-color: #9147ff;
      height: 4px;
    }

    .tbc-balloon-select {
      width: 100%;
      padding: 6px 8px;
      border: 1px solid #3a3a3d;
      border-radius: 4px;
      background: #0e0e10;
      color: #efeff1;
      font-size: 13px;
    }

    .tbc-balloon-divider {
      height: 1px;
      margin: 4px 12px;
      background: rgba(255, 255, 255, 0.08);
    }

    .tbc-chat-translation {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin-top: 5px;
      padding: 6px 10px 6px 8px;
      border: 1px solid rgba(145, 71, 255, 0.55);
      border-left: 3px solid #9147ff;
      border-radius: 4px;
      background:rgba(27, 16, 48, 0.8);
      font-size: 13px;
      line-height: 1.45;
      max-width: 100%;
      box-sizing: border-box;
    }

    .tbc-chat-translation-badge {
      flex-shrink: 0;
      margin-top: 1px;
      padding: 1px 6px;
      border-radius: 3px;
      background: #9147ff;
      color: #ffffff;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.04em;
      line-height: 1.45;
      user-select: none;
    }

    .tbc-chat-translation-text {
      color: #f3eeff;
      font-weight: 600;
      word-break: break-word;
    }

    .tbc-keyword-hint,
    .tbc-keyword-empty {
      color: #adadb8;
      font-size: 12px;
      line-height: 1.4;
    }

    .tbc-setting-hint {
      margin: -2px 0 0;
      padding: 0 12px 6px;
      color: #adadb8;
      font-size: 12px;
      line-height: 1.4;
    }

    .tbc-keyword-form {
      display: flex;
      gap: 6px;
    }

    .tbc-keyword-input {
      flex: 1;
      min-width: 0;
      padding: 6px 8px;
      border: 1px solid #3a3a3d;
      border-radius: 4px;
      background: #0e0e10;
      color: #efeff1;
      font-size: 13px;
    }

    .tbc-block-users-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .tbc-block-users-header .tbc-balloon-label {
      margin: 0;
    }

    .tbc-block-users-refresh {
      flex-shrink: 0;
      border: none;
      border-radius: 4px;
      background: #3a3a3d;
      color: #efeff1;
      padding: 4px 8px;
      font-size: 12px;
      cursor: pointer;
    }

    .tbc-block-users-refresh:hover {
      background: #4a4a4d;
    }

    .tbc-block-users-refresh:disabled,
    .tbc-block-user-remove:disabled {
      opacity: 0.55;
      cursor: default;
    }

    .tbc-block-users-status {
      color: #adadb8;
      font-size: 12px;
      line-height: 1.4;
    }

    .tbc-block-users-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      max-height: 180px;
      overflow-y: auto;
    }

    .tbc-block-user {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.04);
    }

    .tbc-block-user-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      object-fit: cover;
      background: #3a3a3d;
      flex-shrink: 0;
    }

    .tbc-block-user-meta {
      flex: 1;
      min-width: 0;
    }

    .tbc-block-user-name {
      font-size: 13px;
      font-weight: 600;
      color: #efeff1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .tbc-block-user-date {
      margin-top: 2px;
      font-size: 11px;
      color: #adadb8;
    }

    .tbc-block-user-remove {
      flex-shrink: 0;
      border: none;
      border-radius: 4px;
      background: transparent;
      color: #bf94ff;
      padding: 4px 6px;
      font-size: 12px;
      cursor: pointer;
    }

    .tbc-block-user-remove:hover {
      background: rgba(145, 71, 255, 0.2);
    }

    .tbc-keyword-add {
      flex-shrink: 0;
      border: none;
      border-radius: 4px;
      background: #9147ff;
      color: #fff;
      padding: 6px 10px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }

    .tbc-keyword-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      max-height: 96px;
      overflow-y: auto;
    }

    .tbc-keyword {
      display: inline-flex;
      align-items: center;
      max-width: 100%;
      padding: 2px 2px 2px 8px;
      border-radius: 999px;
      background: rgba(145, 71, 255, 0.16);
      color: #efeff1;
      font-size: 12px;
    }

    .tbc-keyword-text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 180px;
    }

    .tbc-keyword-remove {
      border: none;
      background: transparent;
      color: #adadb8;
      cursor: pointer;
      font-size: 14px;
      line-height: 1;
      padding: 0 6px;
    }

    .tbc-switch {
      position: relative;
      width: 40px;
      height: 22px;
      flex-shrink: 0;
    }

    .tbc-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .tbc-switch-slider {
      position: absolute;
      inset: 0;
      background: #3a3a3d;
      border-radius: 11px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .tbc-switch-slider::before {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      left: 3px;
      bottom: 3px;
      background: #fff;
      border-radius: 50%;
      transition: transform 0.2s;
    }

    .tbc-switch input:checked + .tbc-switch-slider {
      background: #9147ff;
    }

    .tbc-switch input:checked + .tbc-switch-slider::before {
      transform: translateX(18px);
    }

    .tbc-balloon-body--history {
      max-height: min(70vh, 560px);
    }

    .tbc-history-meta,
    .tbc-history-hint,
    .tbc-history-status {
      margin: 0;
      color: #adadb8;
      font-size: 12px;
      line-height: 1.4;
    }

    .tbc-history-meta {
      padding: 8px 12px 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .tbc-history-status {
      min-height: 1.4em;
      padding-top: 8px;
    }

    .tbc-history-status--error {
      color: #ff8280;
    }

    .tbc-history-status--ok {
      color: #00f593;
    }

    .tbc-history-range {
      position: relative;
      height: 28px;
    }

    .tbc-history-track,
    .tbc-history-fill {
      position: absolute;
      top: 12px;
      height: 4px;
      border-radius: 2px;
    }

    .tbc-history-track {
      left: 0;
      right: 0;
      background: #3a3a3d;
    }

    .tbc-history-fill {
      background: #9147ff;
    }

    .tbc-history-range input[type="range"] {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 28px;
      margin: 0;
      background: none;
      pointer-events: none;
      appearance: none;
      -webkit-appearance: none;
    }

    .tbc-history-range input[type="range"]::-webkit-slider-runnable-track {
      height: 4px;
      background: transparent;
    }

    .tbc-history-range input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      pointer-events: auto;
      width: 14px;
      height: 14px;
      margin-top: -5px;
      border: 2px solid #9147ff;
      border-radius: 50%;
      background: #fff;
      cursor: pointer;
    }

    .tbc-history-range input[type="range"]::-moz-range-track {
      height: 4px;
      background: transparent;
      border: none;
    }

    .tbc-history-range input[type="range"]::-moz-range-thumb {
      pointer-events: auto;
      width: 14px;
      height: 14px;
      border: 2px solid #9147ff;
      border-radius: 50%;
      background: #fff;
      cursor: pointer;
    }

    .tbc-history-actions {
      padding: 4px 12px 8px;
    }

    .tbc-history-buttons {
      display: flex;
      gap: 8px;
    }

    .tbc-history-download,
    .tbc-history-pause,
    .tbc-history-resume,
    .tbc-history-cancel {
      flex: 1;
      border: none;
      border-radius: 4px;
      font-size: 13px;
      font-weight: 600;
      padding: 8px 12px;
      cursor: pointer;
      color: #fff;
    }

    .tbc-history-download,
    .tbc-history-resume {
      background: #9147ff;
    }

    .tbc-history-pause {
      background: #3a3a3d;
    }

    .tbc-history-cancel {
      background: #ad1c1c;
    }

    .tbc-history-download:disabled {
      opacity: 0.45;
      cursor: default;
    }

    .tbc-fs-chat {
      position: absolute;
      left: 50%;
      bottom: max(72px, 10%);
      transform: translateX(-50%);
      z-index: 100020;
      width: min(560px, calc(100% - 48px));
      display: flex;
      flex-direction: column;
      gap: 6px;
      pointer-events: auto;
      font-family: Roobert, Inter, "Helvetica Neue", Helvetica, Arial, sans-serif;
    }

    .tbc-fs-chat-row {
      display: flex;
      align-items: stretch;
      gap: 8px;
      padding: 8px;
      border-radius: 8px;
      background: rgba(14, 14, 16, 0.92);
      border: 1px solid rgba(255, 255, 255, 0.14);
      box-shadow: 0 10px 36px rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(10px);
    }

    .tbc-fs-chat-input {
      flex: 1;
      min-width: 0;
      box-sizing: border-box;
      height: 40px;
      padding: 0 12px;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.16);
      background: #18181b;
      color: #efeff1;
      font-size: 14px;
      line-height: 40px;
      outline: none;
      caret-color: #bf94ff;
    }

    .tbc-fs-chat-input::placeholder {
      color: #adadb8;
    }

    .tbc-fs-chat-input:focus {
      border-color: #9147ff;
      box-shadow: 0 0 0 1px #9147ff;
    }

    .tbc-fs-chat-fav-wrap {
      position: relative;
      flex-shrink: 0;
    }

    .tbc-fs-chat-fav,
    .tbc-fs-chat-send {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      min-width: 72px;
      height: 40px;
      padding: 0 14px;
      border: none;
      border-radius: 6px;
      color: #ffffff;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .tbc-fs-chat-fav {
      background: #3a3a3d;
    }

    .tbc-fs-chat-fav:hover,
    .tbc-fs-chat-fav.is-open {
      background: #53535f;
    }

    .tbc-fs-chat-fav:active {
      background: #2e2e33;
    }

    .tbc-fs-chat-fav svg,
    .tbc-fs-chat-send svg {
      width: 16px;
      height: 16px;
      display: block;
      flex-shrink: 0;
    }

    .tbc-fs-chat-send {
      background: #9147ff;
    }

    .tbc-fs-chat-send:hover:not(:disabled) {
      background: #772ce8;
    }

    .tbc-fs-chat-send:active:not(:disabled) {
      background: #5c16c5;
    }

    .tbc-fs-chat-send:disabled {
      opacity: 0.45;
      cursor: default;
    }

    .tbc-fs-chat-fav-list {
      position: absolute;
      left: 0;
      bottom: calc(100% + 6px);
      z-index: 2;
      box-sizing: border-box;
      width: max(220px, 100%);
      max-width: min(360px, 70vw);
      max-height: 220px;
      overflow-x: hidden;
      overflow-y: auto;
      padding: 6px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.14);
      background: rgba(14, 14, 16, 0.96);
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.55);
      backdrop-filter: blur(10px);
    }

    .tbc-fs-chat-fav-empty {
      padding: 10px 8px;
      color: #adadb8;
      font-size: 12px;
      line-height: 1.4;
      text-align: center;
    }

    .tbc-fs-chat-fav-item {
      display: block;
      width: 100%;
      box-sizing: border-box;
      margin: 0;
      padding: 8px 10px;
      border: none;
      border-radius: 6px;
      background: transparent;
      color: #efeff1;
      font-size: 13px;
      line-height: 1.35;
      text-align: left;
      cursor: pointer;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      max-width: 100%;
    }

    .tbc-fs-chat-fav-item:hover {
      background: rgba(145, 71, 255, 0.28);
    }

    .tbc-fs-chat-fav-item:active {
      background: rgba(145, 71, 255, 0.4);
    }

    .tbc-fs-chat-close {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      min-width: 72px;
      padding: 0 14px;
      border: none;
      border-radius: 6px;
      background: #eb0400;
      color: #ffffff;
      cursor: pointer;
      transition: background 0.15s ease, filter 0.15s ease;
    }

    .tbc-fs-chat-close:hover {
      background: #c50300;
      filter: brightness(1.05);
    }

    .tbc-fs-chat-close:active {
      background: #a80300;
    }

    .tbc-fs-chat-close svg {
      width: 16px;
      height: 16px;
      display: block;
      pointer-events: none;
    }

    .tbc-fs-chat-meta {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      padding: 0 4px;
      min-height: 16px;
    }

    .tbc-fs-chat-status {
      flex: 1;
      min-width: 0;
      max-width: 60%;
      color: #ff8280;
      font-size: 12px;
      line-height: 1.35;
      text-align: left;
      word-break: break-word;
    }

    .tbc-fs-chat-status:empty {
      display: none;
    }

    .tbc-fs-chat-status.is-ok {
      color: #00f593;
    }

    .tbc-pip-page-toast {
      position: fixed;
      left: 50%;
      bottom: 24px;
      transform: translateX(-50%);
      z-index: 100000;
      max-width: min(420px, calc(100% - 24px));
      padding: 10px 14px;
      border-radius: 8px;
      background: rgba(14, 14, 16, 0.94);
      color: #efeff1;
      border: 1px solid rgba(255, 255, 255, 0.14);
      font-size: 13px;
      line-height: 1.4;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.15s ease;
    }

    .tbc-pip-page-toast.is-show {
      opacity: 1;
    }
  `);
}
