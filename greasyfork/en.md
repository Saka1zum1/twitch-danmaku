**English** · [简体中文](https://greasyfork.org/zh-CN/scripts/586579-twitch-danmaku-bullet-chat) · [繁體中文](https://greasyfork.org/zh-TW/scripts/586579-twitch-danmaku-bullet-chat) · [日本語](https://greasyfork.org/ja/scripts/586579-twitch-danmaku-bullet-chat)

[Twitch Danmaku demo](https://saka1zum1.github.io/twitch-danmaku/)

## Introduction

**Twitch Danmaku** turns live Twitch chat messages into scrolling danmaku over the video player — just like on Bilibili.

No more constantly glancing at the chat panel. Messages flow across the screen so you never miss the action.

---

## How to Use

1. Install the [Tampermonkey](https://www.tampermonkey.net/) extension
2. Install this script, then open any Twitch live stream or VOD
3. New buttons appear in the player control bar:
   - **Danmaku button** — Toggle danmaku on/off
   - **Read button** — Open speech settings
   - **Download button** — Export the live chat buffer or archived VOD chat
   - **Settings button** — Open the options panel
4. Customize appearance, opacity, keyword blocking, or enable translation in the settings panel

**Tip:** Hover over a danmaku to pause and read it. Click to see who sent it.

---

## Key Features

### Live Danmaku
- Automatically captures new chat messages and displays them on the video
- Works on live streams and VOD pages (synced video chat / `.vod-message`)
- Shows message content only — each sender gets a unique color
- Hover or click any danmaku to pause it
- Click to reveal a bubble shows sender, use the copy button in the bubble to paste the message into the live chat input

### Customization
- Adjust scroll speed, font size, and choose from 18 system fonts
- **Danmaku opacity** — 10–100% (default 100%). Changes apply to danmaku already on screen
- Scroll area: full screen / top half / top quarter
- Auto-adapts to fullscreen and window resize

### Read Aloud
- Optional speech for each danmaku, from the player control bar
- Choose voice, volume, pitch, and speed. Pace mode speeds up lines that would run too long
- With translation on, the translated text is read. Symbols, emotes, and numbers alone are skipped

### Super Chat Pin
- Recognizes Bits cheers, Prime / tier subscriptions (including resub messages), highlighted paid messages, and pinned chat
- Shows real avatars, truncated usernames, amount / Prime / Tier badges, and Twitch cheer-tier colors
- Multiple pins can show at once without covering each other; long text marquees inside the bubble
- Animations: fade, slide, pop, or shine. Hover pauses the animation and shows the sender; a corner dismiss button closes a pin early

### Favorites & Wheel Mode
- Star button next to the chat input opens favorites: save frequent lines and send them with one click
- Optional number shortcuts; favorites can be channel-only or site-wide
- Right-click a chat line to add it to favorites
- **Wheel mode** randomly sends favorites on a timer (with count and duration limits)
- Failed sends show a clear reason (follow required, verification, subscribers-only, etc.) instead of a false “sent” status

### Chat Context Menu
- Right-click a live chat line to translate / re-translate, read aloud, resend as danmaku, add to favorites, or block the user
- Translation follows the settings engine; speech follows the speech panel

### Clear Live Chat & Fullscreen Composer
- Clear button in the live chat header empties the panel
- In live fullscreen, press Enter to open a composer; use the favorites button to fill saved lines quickly
- Click outside when empty or use the red close button to dismiss without exiting fullscreen
- Restricted sends show the failure reason under the composer

### Blocked Users
- View, add, or unblock Twitch’s native block list in the settings panel

### Chat History Download
- **Live** — Export messages currently loaded in the chat panel, or from the IRC buffer when FrankerFaceZ is detected (not the full stream history)
- Compatible with FrankerFaceZ on live pages: danmaku uses Twitch IRC instead of the chat DOM
- **VOD** (`/videos/…`) — Download archived chat from Twitch, with an optional time range
- Filter by keyword and username. Leave a field empty to skip that filter
- Choose whether to include Bits cheers (Super Chat)
- Export JSON, CSV, or TXT. On VOD jobs, pause, resume, or cancel after download starts
- If the live panel is empty, or the replay has no chat left, the panel says so

### Keyword Block
- Add or remove blocked keywords in the settings panel (up to 50, case-insensitive substring match)
- Hides a danmaku when the **original text** or the **translation** contains any keyword
- Messages blocked by the original text are not sent for translation
- Separately, manage Twitch **user** blocks in settings (independent of keyword block)

### Real-Time Translation (Optional)
- Multiple translation engines (Microsoft, Google, Volcengine, Caiyun, Tencent Transmart, and auto-failover)
- Source language auto-detected; translation replaces the original text on danmaku
- Optional: show a Twitch-purple translation under each live chat line (toggle in settings)
- Choose target language and translation speed

### Quality of Life
- No flood of historical messages when joining a stream
- No burst of queued messages when returning to the tab
- Skips bot spam, dividers, and link-only messages
- UI auto-detects browser language (Chinese / English)
- Zero external dependencies — lightweight and fast

### Demo
Open the demo in your browser. No install or build step is required. Try favorites, Super Chat (Bits / subs), clear chat, the context menu, speech, and in-chat translations:

[Twitch Danmaku demo](https://saka1zum1.github.io/twitch-danmaku/)

---

## FAQ

**Q: Translation doesn't work?**
A: Translation uses Microsoft, Google, or other configured services. A network proxy may be required in some regions.

**Q: Too many danmaku on screen?**
A: Slow down the speed, reduce the scroll area, lower opacity, or turn danmaku off entirely.

**Q: How does keyword blocking work?**
A: If a keyword appears in the original message or in the translated result, that danmaku is not shown.

**Q: Which browsers are supported?**
A: Any browser with Tampermonkey — Chrome, Edge, Firefox, Safari, and more.

---

## Privacy

- This script only runs on Twitch pages
- Translation requests are sent to the translation service you select
- Settings (including your keyword list) are stored locally in your browser — no data is uploaded

---

## Feedback

Found a bug or have a feature request? Open an issue on the [GitHub repository](https://github.com/saka1zum1/twitch-danmaku).

**Enjoy the stream!**
