# Twitch Danmaku

[English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md)

A Tampermonkey userscript that turns Twitch live chat into scrolling video danmaku — with interactive pause, optional real-time translation, and zero external dependencies.

## Features

- **Live danmaku** — New chat messages scroll across the video player (live streams and VOD video chat)
- **Sender colors** — Content only; each chatter gets a unique color
- **Interactive pause** — Hover or click to pause; click to reveal sender (and original text when translated)
- **Copy to chat** — Click a danmaku, then use the copy button in the tooltip to paste the message into the live chat input
- **Customization** — Speed, font, opacity, and scroll area (full / top half / bottom half / top quarter)
- **Read aloud** — Optional speech for each danmaku, with voice, rate, and a pace mode that speeds up long lines
- **Super Chat pin** — Bits cheers, Prime / tier subscriptions (including resub messages), highlighted paid messages, and pinned chat stay on screen. Position: top/bottom center or corners; optional overlay on scrolling danmaku. Real avatars, badges, cheer-tier colors, adjustable width. Compact mode shows avatar, name, and amount — click for a detail card (translate, speak, favorite, profile, block). Hide subscription pins, and let pin time grow with the amount. Hover pauses; dismiss closes early
- **Enhanced picture-in-picture** — Resizable mini window from the player bar with stretch or locked aspect ratio, synced danmaku, quick controls, and chat input with favorites. Opening it helps keep the page active in the background
- **Favorites & wheel mode** — Star button beside chat input to save lines, send with one click or number shortcuts (channel-only or site-wide). Wheel mode randomly sends favorites on a timer. Failed sends show a clear reason instead of a false success
- **Chat context menu** — Right-click a live chat line to translate / re-translate, read aloud, resend as danmaku, add to favorites, or block the user
- **Clear live chat** — Clear button in the live chat header empties the panel
- **Fullscreen chat input** — In live fullscreen, press Enter to open a composer; favorites button fills saved lines quickly. Restricted sends show the reason under the bar. Click outside when empty or use the red close button to dismiss (does not exit fullscreen)
- **Noise filter** — Skips common bots, dividers, link-only lines, and system notices without real user chat (watch streaks, channel-point redemptions, etc.). Only real chat and Bits/sub Super Chats enter danmaku, translation, and speech
- **Blocked users** — Manage Twitch’s native block list in the settings panel (view, add, unblock)
- **Chat history download** — On live pages, export messages currently in the chat panel; on VOD pages, export archived chat via Twitch. JSON, CSV, or TXT, with keyword, username, Super Chat, and (VOD) time-range filters
- **Fullscreen-aware** — Adapts to resize and fullscreen automatically
- **Translation** — Microsoft, Google, Volcengine, Caiyun, and Tencent Transmart; batches requests during busy chat and switches engines when one is rate-limited. Skips numbers and symbols. Optionally shows a Twitch-purple translation under each live chat line
- **Anti-flood** — No burst when joining a stream or returning to the tab
- **Bilingual UI** — Auto-detects browser language (Chinese / English)

## Install

1. Install [Tampermonkey](https://www.tampermonkey.net/)
2. Choose one of the following:
   - **Greasy Fork (recommended)** — Visit [Twitch Danmaku on Greasy Fork](https://greasyfork.org/en/scripts/586579-twitch-danmaku) and click Install
   - **Manual** — Copy the code from [`dist/twitch-danmaku.user.js`](dist/twitch-danmaku.user.js), create a new script in Tampermonkey, paste the code, and save
3. Make sure enable developer mode in browser settings

Or build from source:

```bash
git clone https://github.com/saka1zum1/twitch-danmaku.git
cd twitch-danmaku
npm run build
```

## Usage

1. Open any Twitch live stream or VOD (`/videos/…`)
2. New chat messages appear as danmaku on the video (VOD uses the synced video chat panel)
3. Use the buttons in the player control bar:
   - **Danmaku button** — Toggle on/off
   - **Translation button** — Toggle live translation (stays in sync with settings)
   - **Read button** — Open speech settings
   - **Download button** — Export live chat buffer or archived VOD chat
   - **Settings button** — Open the options panel
   - **Enhanced PiP** — Open the resizable mini window (Chrome / Edge 116+)
4. Hover a danmaku to pause; click to see sender info
5. Click the copy icon in the tooltip to paste the danmaku text into the live chat input
6. Scrolling resumes 0.3 s after the mouse leaves (hover), or click outside the tooltip and danmaku to resume after a click

## Settings

| Option | Description |
|--------|-------------|
| Scroll speed | 1–10, higher = faster |
| Font size | 14–40 px |
| Danmaku opacity | 10–100% |
| Font | 18 system fonts |
| Scroll area | Full / top half / bottom half / top quarter |
| Translation | Replaces original text on danmaku |
| Show translation in chat | Under each chat line, with a Twitch-purple TL marker so it is distinct from the original |
| Translation engine | Auto / Microsoft / Google / Volcengine / Caiyun / Tencent Transmart |
| Target language | Source auto-detected |
| Translation speed | 1–10 messages/sec. Busy chat is batched into fewer requests so one engine is not flooded |
| Block keywords | Hides a danmaku when the original or the translation contains a keyword |
| Blocked users | Twitch native block list: view, add, or unblock in the panel |
| Read aloud | Speaks each danmaku. With translation on, the translated text is read |
| Super Chat pin | Pins cheers, Prime / tier subs, highlighted paid messages, and pinned chat. Compact layout with a detail card, hide subscription pins, max width, overlay toggle, and duration that scales with amount |
| Enhanced PiP | Stretch to fill or lock aspect ratio |

Settings are saved locally and persist across sessions.

## Chat history

Use the download button in the player bar on a live channel or a replay (`/videos/…`).

- **Live** — Collects messages currently loaded in the chat panel, or from an IRC buffer when FrankerFaceZ is detected (not the full stream history). No time range.
- **FrankerFaceZ** — When FFZ is present on a live channel, danmaku reads chat over Twitch IRC instead of the chat DOM so both can run together
- **VOD** — Downloads archived chat from Twitch, with an optional time range
- Filter by message keyword or username. Leave a field empty to skip that filter
- Choose whether Bits cheers (Super Chat) are included
- Export JSON, CSV, or TXT. On VOD downloads, use Pause, Resume, or Cancel
- If Twitch no longer keeps that replay's chat, or the live panel is empty, the panel says so

## Development

```bash
npm run build
npm run watch
```

The public demo needs no build step: [Twitch Danmaku demo](https://saka1zum1.github.io/twitch-danmaku/). It stands in for a watch page (player, control bar, and chat list). Lines already in the list stay put; lines added after the short warm-up scroll across the video. The demo header toggles translation and speech in sync with the player bar. Try scroll area, Super Chat (compact card included), favorites, enhanced PiP, and the chat context menu. With translation on, preview translations and optional TL lines in chat appear. The preview keeps running when its browser tab is in the background.

## Notes

- Translation uses Microsoft, Google, Volcengine, Caiyun, or Tencent; a proxy may be needed in some regions
- Busy chat is translated in batches, and a rate-limited engine is paused in favor of the others
- Twitch DOM changes may affect compatibility — please report issues

## License

[MIT](LICENSE)
