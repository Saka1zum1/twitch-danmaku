// ==UserScript==
// @name         Twitch Danmaku - Bullet Chat
// @name:zh-CN   Twitch 弹幕姬 | 实时翻译
// @name:zh-TW   Twitch 彈幕 | 即時翻譯
// @name:ja      Twitch 弾幕 | リアルタイム翻訳
// @namespace    https://github.com/saka1zum1/twitch-danmaku
// @version      2.0.0
// @description  Convert Twitch live chat to video danmaku with real-time translation
// @description:zh-CN  将 Twitch 直播评论转换为视频弹幕，支持实时翻译
// @description:zh-TW  將聊天室中的新訊息轉換成影片上的滾動彈幕，支援即時翻譯
// @description:ja      Twitch のチャットをリアルタイム翻訳付きで動画の弾幕に変換します
// @author       KaKa
// @license      MIT
// @match        https://www.twitch.tv/*
// @match        https://m.twitch.tv/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// @connect      translate.googleapis.com
// @connect      edge.microsoft.com
// @connect      api-edge.cognitive.microsofttranslator.com
// @connect      transmart.qq.com
// @connect      translate.volcengine.com
// @connect      api.interpreter.caiyunai.com
// @connect      gql.twitch.tv
// @connect      irc-ws.chat.twitch.tv
// @run-at       document-idle
// @icon         https://www.google.com/s2/favicons?sz=64&domain=twitch.com
// ==/UserScript==
