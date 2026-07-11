// ==UserScript==
// @name         Twitch Danmaku - Bullet Chat
// @name:zh-CN   Twitch 弹幕
// @name:zh-TW   Twitch 弹幕
// @namespace    https://github.com/saka1zum1/twitch-danmaku
// @version      1.2.0
// @description  Convert Twitch live chat to video danmaku with real-time translation
// @description:zh-CN  将 Twitch 直播评论转换为视频弹幕，支持实时翻译
// @description:zh-TW  將聊天室中的新訊息轉換成影片上的滾動彈幕，支持即時翻譯
// @author       KaKa
// @license      MIT
// @match        https://www.twitch.tv/*
// @match        https://m.twitch.tv/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @connect      translate.googleapis.com
// @connect      edge.microsoft.com
// @connect      api-edge.cognitive.microsofttranslator.com
// @run-at       document-idle
// @icon         https://www.google.com/s2/favicons?sz=64&domain=twitch.com
// ==/UserScript==
