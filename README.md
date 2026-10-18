# Twitch Danmaku

[English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md)

A Tampermonkey userscript that turns Twitch live chat into scrolling video danmaku — with interactive pause, optional real-time translation, and zero external dependencies.

## Features

- **Live danmaku** — New chat messages scroll across the video player
- **Sender colors** — Content only; each chatter gets a unique color
- **Interactive pause** — Hover or click to pause; click to reveal sender (and original text when translated)
- **Copy to chat** — Click a danmaku, then use the copy button in the tooltip to paste the message into the live chat input
- **Customization** — Speed, font, opacity, and scroll area (full / top half / top quarter)
- **Read aloud** — Optional speech for each danmaku, with voice, rate, and a pace mode that speeds up long lines
- **Super Chat pin** — Bits cheers, highlighted paid messages, and pinned chat stay on screen with fade, slide, pop, or shine. Hover pauses them
- **Chat history download** — On a VOD page, export archived chat as JSON, CSV, or TXT, with keyword, username, Super Chat, and time-range filters
- **Fullscreen-aware** — Adapts to resize and fullscreen automatically
- **Translation** — Microsoft, Google, Volcengine, Caiyun, and Tencent Transmart; batches requests during busy chat and switches engines when one is rate-limited. Skips numbers and symbols
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

1. Open any Twitch live stream
2. New chat messages appear as danmaku on the video
3. Use the buttons in the player control bar:
   - **Danmaku button** — Toggle on/off
   - **Read button** — Open speech settings
   - **Download button** — Export archived VOD chat
   - **Settings button** — Open the options panel
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
| Scroll area | Full / top half / top quarter |
| Translation | Replaces original text on screen |
| Translation engine | Auto / Microsoft / Google / Volcengine / Caiyun / Tencent Transmart |
| Target language | Source auto-detected |
| Translation speed | 1–10 messages/sec. Busy chat is batched into fewer requests so one engine is not flooded |
| Block keywords | Hides a danmaku when the original or the translation contains a keyword |
| Read aloud | Speaks each danmaku. With translation on, the translated text is read |
| Super Chat pin | Pins cheers, highlighted paid messages, and pinned chat. Hover pauses the animation |

Settings are saved locally and persist across sessions.

## Chat history

On a replay page (`/videos/…`), use the download button in the player bar.

- Filter by message keyword or username. Leave a field empty to skip that filter
- Choose whether Bits cheers (Super Chat) are included
- Drag the time range, then export JSON, CSV, or TXT
- After download starts, use Pause, Resume, or Cancel
- Live pages have no archived chat. If Twitch no longer keeps that replay's chat, the panel says so

Demo (no Tampermonkey): [GitHub Pages preview](https://saka1zum1.github.io/twitch-danmaku/)

## Development

```bash
npm run build
npm run watch
```

## Notes

- Translation uses Microsoft, Google, Volcengine, Caiyun, or Tencent; a proxy may be needed in some regions
- Busy chat is translated in batches, and a rate-limited engine is paused in favor of the others
- Twitch DOM changes may affect compatibility — please report issues

## License

[MIT](LICENSE)
