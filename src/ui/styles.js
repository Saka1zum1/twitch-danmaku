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
  `);
}
