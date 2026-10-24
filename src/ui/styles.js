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

    .tbc-superchat-layer {
      pointer-events: none;
      display: none;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      gap: 6px;
      overflow: visible;
      padding: 4px 0;
      box-sizing: border-box;
    }

    .tbc-superchat-layer.tbc-sc-bottom {
      justify-content: flex-end;
    }

    .tbc-superchat-item {
      position: relative;
      display: flex;
      align-items: center;
      gap: 10px;
      max-width: min(720px, calc(100% - 24px));
      min-width: min(280px, calc(100% - 24px));
      padding: 8px 14px 8px 8px;
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

    .tbc-sc-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
      background: rgba(0, 0, 0, 0.25);
      border: 2px solid rgba(255, 255, 255, 0.35);
    }

    .tbc-sc-main {
      min-width: 0;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .tbc-sc-head {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }

    .tbc-sc-name {
      font-size: 0.85em;
      font-weight: 800;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 10em;
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

    .tbc-sc-body {
      min-width: 0;
      overflow: hidden;
      max-width: 100%;
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
  `);
}
