# Twitch Danmaku

[English](README.md) | [简体中文](README.zh-CN.md)

A Tampermonkey userscript that turns Twitch live chat into scrolling video danmaku — with interactive pause, optional real-time translation, and zero external dependencies.

## Features

- **Live danmaku** — New chat messages scroll across the video player
- **Sender colors** — Content only; each chatter gets a unique color
- **Interactive pause** — Hover or click to pause; click to reveal sender (and original text when translated)
- **Customization** — Speed, font, scroll area (full / top half / top quarter)
- **Fullscreen-aware** — Adapts to resize and fullscreen automatically
- **Translation** — Google Translate with phrase mapping; skips numbers and symbols
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
git clone https://github.com/your-username/twitch-danmaku.git
cd twitch-danmaku
npm run build
```

## Usage

1. Open any Twitch live stream
2. New chat messages appear as danmaku on the video
3. Use the two buttons in the player control bar:
   - **Danmaku button** — Toggle on/off
   - **Settings button** — Open options panel
4. Hover a danmaku to pause; click to see sender info
5. Scrolling resumes 0.5 s after the mouse leaves

## Settings

| Option | Description |
|--------|-------------|
| Scroll speed | 1–10, higher = faster |
| Font size | 14–40 px |
| Font | 18 system fonts |
| Scroll area | Full / top half / top quarter |
| Translation | Replaces original text on screen |
| Target language | Source auto-detected |
| Translation speed | 1–10 messages/sec |

Settings are saved locally and persist across sessions.

## Development

```bash
npm run build
npm run watch
```

## Notes

- Translation requires Google Translate; a proxy may be needed in some regions
- Lower translation speed on busy chats to avoid queue buildup
- Twitch DOM changes may affect compatibility — please report issues

## License

[MIT](LICENSE)
