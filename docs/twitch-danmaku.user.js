// ==UserScript==
// @name         Twitch Danmaku - Bullet Chat
// @name:zh-CN   Twitch 弹幕姬 | 实时翻译
// @name:zh-TW   Twitch 彈幕 | 即時翻譯
// @name:ja      Twitch 弾幕 | リアルタイム翻訳
// @namespace    https://github.com/saka1zum1/twitch-danmaku
// @version      2.0.1
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

(function () {
  'use strict';
const LOCALES = {
  zh: {
    danmakuToggle: '弹幕开关',
    danmakuOn: '关闭弹幕',
    danmakuOff: '开启弹幕',
    settingsToggle: '弹幕设置',
    panelTitle: '弹幕设置',
    panelClose: '关闭',
    scrollSpeed: '滚动速度',
    fontSize: '字体大小',
    danmakuOpacity: '弹幕透明度',
    fontFamily: '字体',
    scrollArea: '滚动区域',
    translateEnable: '启用翻译',
    translateToggle: '实时翻译',
    translateOn: '翻译已开启',
    translateOff: '翻译已关闭',
    translateInChat: '聊天室显示译文',
    translateBadge: '译',
    translateProvider: '翻译引擎',
    translateProviderAuto: '自动切换',
    translateProviderMicrosoft: 'Microsoft 翻译',
    translateProviderGoogle: 'Google 翻译',
    translateProviderVolcengine: '火山翻译',
    translateProviderCaiyun: '彩云小译',
    translateProviderTencent: '腾讯交互翻译',
    translateTarget: '目标语言',
    translateSpeed: '翻译速度',
    translateSpeedUnit: '条/秒',
    blockKeywords: '关键词屏蔽',
    blockKeywordsHint: '原文或译文包含关键词时不显示',
    blockKeywordsPlaceholder: '输入关键词',
    blockKeywordsAdd: '添加',
    blockKeywordsRemove: '移除',
    blockKeywordsEmpty: '暂无关键词',
    blockUsers: '屏蔽用户列表',
    blockUsersHint: '使用 Twitch 原生屏蔽。可在此查看、添加或取消屏蔽。',
    blockUsersPlaceholder: '用户名',
    blockUsersAdd: '添加',
    blockUsersRemove: '取消屏蔽',
    blockUsersEmpty: '暂无屏蔽用户',
    blockUsersLoading: '正在加载屏蔽列表…',
    blockUsersRefresh: '刷新',
    blockUsersNeedLogin: '请先登录 Twitch',
    blockUsersLoadFailed: '无法加载屏蔽列表',
    blockUsersAddFailed: '添加屏蔽失败',
    blockUsersRemoveFailed: '取消屏蔽失败',
    chatMenuBlockNeedLogin: '请先登录 Twitch',
    chatMenuBlockDone: '已通过 Twitch 屏蔽该用户',
    chatMenuBlockFailed: 'Twitch 屏蔽失败，请稍后重试',
    chatMenuBlockNotFound: '找不到该用户',
    speechToggle: '弹幕朗读',
    speechPanelTitle: '弹幕朗读',
    speechEnable: '启用朗读',
    speechOn: '朗读已开启',
    speechMute: '朗读已静音',
    speechOff: '朗读已关闭',
    speechTest: '试读',
    speechTestText: '这是一条测试弹幕 ABC',
    speechPlay: '按设定速度试读',
    speechPlayFast: '按变速模式试读',
    speechVolume: '音量',
    speechPitch: '音高',
    speechVoice: '声音',
    speechVoiceLang: '语言',
    speechVoiceDefault: '默认',
    speechRate: '朗读速度',
    speechPace: '变速模式',
    speechMaxSeconds: '单条最长',
    speechSeconds: '秒',
    speechPaceHint: '超出最长朗读时间时自动加快。开启翻译后按译文朗读。重复内容最多读 3 遍，纯符号、纯表情和纯数字不朗读。',
    speechBuffer: '保留条数',
    speechBufferHint: '超过这个数量时丢掉更早的弹幕，避免朗读一直追不上',
    speechUnsupported: '当前浏览器不支持语音朗读',
    historyToggle: '下载聊天记录',
    historyPanelTitle: '下载聊天记录',
    historyKeyword: '内容关键词',
    historyKeywordPlaceholder: '关键词，逗号分隔',
    historyKeywordHint: '只导出包含这些词的消息。留空表示不过滤。',
    historyUsername: '用户名',
    historyUsernamePlaceholder: '用户名，逗号分隔',
    historyUsernameHint: '匹配登录名或显示名。留空表示不过滤。',
    historyIncludeSuperchat: '包含 Super Chat',
    historyIncludeSuperchatHint: 'Super Chat 指 Bits Cheers。关闭后不导出这些消息。',
    historyRange: '时间范围',
    historyRangeUnknown: '未能读取时长，将下载整段聊天。',
    historyLiveHint: '直播页会导出当前聊天面板或 IRC 缓冲中的消息，不是完整历史。检测到 FrankerFaceZ 时自动改用 IRC。',
    historyLiveReady: '已就绪：可导出当前聊天面板或 IRC 缓冲中的消息。',
    historyFormat: '导出格式',
    historyFormatJson: 'JSON',
    historyFormatCsv: 'CSV',
    historyFormatTxt: 'TXT',
    historyDownload: '下载',
    historyPause: '暂停',
    historyResume: '继续',
    historyCancel: '取消',
    historyLoading: '正在读取回放…',
    historyNeedSource: '请打开直播页，或打开回放页（网址中包含 /videos/）。',
    historyMissing: '找不到这个回放，或聊天记录已不可用。',
    historyFailed: '下载失败，请稍后再试。',
    historyEmpty: '没有可导出的聊天记录。',
    historyNoMatch: '没有符合筛选条件的聊天记录。',
    historyProgress: '已获取 {count} 条',
    historyPaused: '已暂停，已获取 {count} 条',
    historyDone: '已导出 {count} 条',
    historyCancelled: '已取消',
    chatMenuTranslate: '翻译',
    chatMenuRetranslate: '重新翻译',
    chatMenuSpeak: '朗读',
    chatMenuResend: '重新发送弹幕',
    chatMenuBlockUser: '屏蔽该用户',
    chatMenuFavorite: '收藏',
    favoritesTitle: '收藏弹幕',
    favoritesAdd: '添加',
    favoritesAddPlaceholder: '输入要收藏的消息…',
    favoritesEmpty: '暂无收藏',
    favoritesEmptyText: '请输入内容',
    favoritesAdded: '已加入收藏',
    favoritesExists: '已在收藏中',
    favoritesFull: '收藏已满（最多 40 条）',
    favoritesSend: '发送',
    favoritesRemove: '移除',
    favoritesSent: '已发送',
    favoritesShortcutNone: '无快捷键',
    favoritesScopeGlobal: '全站可用',
    favoritesScopeChannel: '本直播间 · {channel}',
    favoritesMakeGlobal: '全站',
    favoritesMakeChannel: '本房',
    favoritesMakeGlobalHint: '设为所有直播间可用',
    favoritesMakeChannelHint: '仅当前直播间可用',
    favoritesScopedGlobal: '已设为全站可用',
    favoritesScopedChannel: '已设为仅本直播间',
    favoritesNeedChannel: '无法识别当前直播间',
    favoritesWheel: '独轮车模式',
    favoritesWheelStart: '开始',
    favoritesWheelStop: '停止',
    favoritesWheelIdle: '未运行',
    favoritesWheelRunning: '已发送 {sent}/{max} · 剩余 {left}s',
    favoritesWheelStopped: '独轮车已停止',
    favoritesWheelMinInterval: '最短间隔（秒）',
    favoritesWheelMaxInterval: '最长间隔（秒）',
    favoritesWheelMaxCount: '最多条数',
    favoritesWheelMaxDuration: '最长持续（秒）',
    fsChatFavorites: '收藏',
    fsChatFavoritesEmpty: '暂无收藏',
    superchatPinned: 'Super Chat 悬停',
    superchatPosition: '悬停位置',
    superchatDuration: '悬停时间',
    superchatAnimation: '悬停动画',
    superchatTop: '顶部居中',
    superchatBottom: '底部居中',
    superchatTopLeft: '左上角',
    superchatTopRight: '右上角',
    superchatBottomLeft: '左下角',
    superchatBottomRight: '右下角',
    superchatFade: '淡入淡出',
    superchatSlide: '滑入',
    superchatPop: '弹出',
    superchatShine: '闪光',
    superchatClose: '关闭悬停弹幕',
    superchatHideSubscribe: '屏蔽订阅悬停',
    superchatCompact: '精简悬停显示',
    superchatMaxWidth: '悬停最大宽度',
    superchatCardClose: '关闭 Super Chat 卡片',
    superchatOverlayDanmaku: '悬停遮挡滚动弹幕',
    superchatDurationByAmount: '悬停时长随金额调整',
    fsChatPlaceholder: '发送聊天消息…',
    fsChatSend: '发送',
    fsChatClose: '关闭',
    fsChatNeedLogin: '请先登录 Twitch',
    fsChatNeedFollow: '需要先关注主播才能发言',
    fsChatNeedFollowTime: '关注时长不足，暂时无法发言',
    fsChatNeedSub: '仅订阅者可发言',
    fsChatNeedVerified: '需要验证账号才能发言',
    fsChatNeedPhone: '需要验证手机号才能发言',
    fsChatSlowMode: '慢速模式，请稍后再试',
    fsChatEmoteOnly: '当前为仅表情模式',
    fsChatUniqueMode: '消息需保持唯一',
    fsChatAutomod: '消息被 Automod 拦截审核',
    fsChatTimedOut: '你当前处于禁言状态',
    fsChatBanned: '你已被此直播间封禁',
    fsChatDuplicate: '不能发送重复消息',
    fsChatRateLimit: '发送过于频繁，请稍后再试',
    fsChatFailed: '发送失败，请稍后重试',
    fsChatSent: '已发送',
    scrollAreaFull: '全屏',
    scrollAreaTopHalf: '上半屏',
    scrollAreaBottomHalf: '下半屏',
    scrollAreaTopQuarter: '顶部 1/4',
    fontSystem: '系统默认',
    fontYaHei: '微软雅黑',
    fontSimSun: '宋体',
    fontSimHei: '黑体',
    fontArial: 'Arial',
    fontRoboto: 'Roboto',
    fontImpact: 'Impact',
    fontGeorgia: 'Georgia',
    fontTimes: 'Times New Roman',
    fontVerdana: 'Verdana',
    fontTahoma: 'Tahoma',
    fontTrebuchet: 'Trebuchet MS',
    fontCourier: 'Courier New',
    fontConsolas: 'Consolas',
    fontComicSans: 'Comic Sans MS',
    fontSerif: 'Serif 衬线',
    fontSansSerif: 'Sans-serif 无衬线',
    fontMonospace: 'Monospace 等宽',
    langZhCN: '简体中文',
    langZhTW: '繁体中文',
    langEn: 'English',
    langJa: '日本語',
    langKo: '한국어',
    langEs: 'Español',
    langFr: 'Français',
    langDe: 'Deutsch',
    langRu: 'Русский',
    langPt: 'Português',
    tooltipCopy: '复制到聊天框',
    tooltipOpenProfile: '打开发送者主页',
    chatClear: '清空聊天',
    pipOpen: '增强画中画',
    pipClose: '关闭增强画中画',
    pipTitle: '增强画中画',
    pipNeedBrowser: '增强画中画需要 Chrome 或 Edge 116 及以上',
    pipNoVideo: '没有可用的播放器画面',
    pipCaptureFailed: '无法捕获画面',
    pipOpenFailed: '无法打开画中画窗口',
    pipReload: '刷新画面',
    pipReloaded: '画面已刷新',
    pipReloadFailed: '刷新失败，请检查直播页视频',
    pipDanmaku: '弹幕开关',
    pipSettings: '弹幕设置',
    pipSettingsHint: '已在直播页打开设置',
    pipSend: '发送消息',
    pipBack: '回到直播页',
    pipVodNoSend: '回放页不能发送聊天',
    pipAspectLock: '锁定纵横比',
    pipAspectUnlock: '拉伸铺满',
  },
  en: {
    danmakuToggle: 'Danmaku toggle',
    danmakuOn: 'Turn off danmaku',
    danmakuOff: 'Turn on danmaku',
    settingsToggle: 'Danmaku settings',
    panelTitle: 'Danmaku Settings',
    panelClose: 'Close',
    scrollSpeed: 'Scroll speed',
    fontSize: 'Font size',
    danmakuOpacity: 'Danmaku opacity',
    fontFamily: 'Font',
    scrollArea: 'Scroll area',
    translateEnable: 'Enable translation',
    translateToggle: 'Live translation',
    translateOn: 'Translation on',
    translateOff: 'Translation off',
    translateInChat: 'Show translation in chat',
    translateBadge: 'TL',
    translateProvider: 'Translation engine',
    translateProviderAuto: 'Auto',
    translateProviderMicrosoft: 'Microsoft Translator',
    translateProviderGoogle: 'Google Translate',
    translateProviderVolcengine: 'Volcengine',
    translateProviderCaiyun: 'Caiyun',
    translateProviderTencent: 'Tencent Transmart',
    translateTarget: 'Target language',
    translateSpeed: 'Translation speed',
    translateSpeedUnit: '/sec',
    blockKeywords: 'Block keywords',
    blockKeywordsHint: 'Hidden when the original or translation contains a keyword',
    blockKeywordsPlaceholder: 'Keyword',
    blockKeywordsAdd: 'Add',
    blockKeywordsRemove: 'Remove',
    blockKeywordsEmpty: 'No keywords',
    blockUsers: 'Blocked users',
    blockUsersHint: 'Uses Twitch’s native block. View, add, or remove blocked users here.',
    blockUsersPlaceholder: 'Username',
    blockUsersAdd: 'Add',
    blockUsersRemove: 'Unblock',
    blockUsersEmpty: 'No blocked users',
    blockUsersLoading: 'Loading blocked users…',
    blockUsersRefresh: 'Refresh',
    blockUsersNeedLogin: 'Log in to Twitch first',
    blockUsersLoadFailed: 'Could not load blocked users',
    blockUsersAddFailed: 'Failed to block user',
    blockUsersRemoveFailed: 'Failed to unblock user',
    chatMenuBlockNeedLogin: 'Log in to Twitch first',
    chatMenuBlockDone: 'User blocked on Twitch',
    chatMenuBlockFailed: 'Twitch block failed. Try again later',
    chatMenuBlockNotFound: 'User not found',
    speechToggle: 'Read danmaku',
    speechPanelTitle: 'Read danmaku',
    speechEnable: 'Read danmaku aloud',
    speechOn: 'Reading is on',
    speechMute: 'Reading is muted',
    speechOff: 'Reading is off',
    speechTest: 'Trial',
    speechTestText: 'This is a test ABC',
    speechPlay: 'Play at set speed',
    speechPlayFast: 'Play with pace mode',
    speechVolume: 'Volume',
    speechPitch: 'Pitch',
    speechVoice: 'Voice',
    speechVoiceLang: 'Language',
    speechVoiceDefault: 'Default',
    speechRate: 'Reading speed',
    speechPace: 'Pace mode',
    speechMaxSeconds: 'Max per line',
    speechSeconds: 'sec',
    speechPaceHint: 'Speed up when a line would exceed the max time. With translation on, the translated text is read. Repeated phrases are read at most 3 times. Symbols, emotes, and numbers alone are skipped.',
    speechBuffer: 'Keep latest',
    speechBufferHint: 'Older lines beyond this count are dropped so reading can catch up',
    speechUnsupported: 'Speech synthesis is not available in this browser',
    historyToggle: 'Download chat history',
    historyPanelTitle: 'Download chat history',
    historyKeyword: 'Keyword',
    historyKeywordPlaceholder: 'Keywords, comma separated',
    historyKeywordHint: 'Export only messages that contain one of these words. Leave empty to keep all.',
    historyUsername: 'Username',
    historyUsernamePlaceholder: 'Usernames, comma separated',
    historyUsernameHint: 'Matches login or display name. Leave empty to keep all.',
    historyIncludeSuperchat: 'Include Super Chats',
    historyIncludeSuperchatHint: 'Super Chat means Bits cheers. Turn this off to leave them out.',
    historyRange: 'Time range',
    historyRangeUnknown: 'Duration is unavailable, so the full chat will be downloaded.',
    historyLiveHint: 'On a live page, export collects messages from the chat panel or the IRC buffer — not the full stream history. FrankerFaceZ triggers the IRC path automatically.',
    historyLiveReady: 'Ready to export messages from the chat panel or IRC buffer.',
    historyFormat: 'Format',
    historyFormatJson: 'JSON',
    historyFormatCsv: 'CSV',
    historyFormatTxt: 'TXT',
    historyDownload: 'Download',
    historyPause: 'Pause',
    historyResume: 'Resume',
    historyCancel: 'Cancel',
    historyLoading: 'Loading VOD…',
    historyNeedSource: 'Open a live channel page, or a VOD page (the URL contains /videos/).',
    historyMissing: 'This VOD was not found, or its chat is no longer available.',
    historyFailed: 'Download failed. Try again later.',
    historyEmpty: 'No chat available to export.',
    historyNoMatch: 'No messages match these filters.',
    historyProgress: 'Collected {count}',
    historyPaused: 'Paused, collected {count}',
    historyDone: 'Exported {count}',
    historyCancelled: 'Cancelled',
    chatMenuTranslate: 'Translate',
    chatMenuRetranslate: 'Re-translate',
    chatMenuSpeak: 'Read aloud',
    chatMenuResend: 'Send as danmaku',
    chatMenuBlockUser: 'Block this user',
    chatMenuFavorite: 'Favorite',
    favoritesTitle: 'Favorite chats',
    favoritesAdd: 'Add',
    favoritesAddPlaceholder: 'Type a message to save…',
    favoritesEmpty: 'No favorites yet',
    favoritesEmptyText: 'Enter some text',
    favoritesAdded: 'Added to favorites',
    favoritesExists: 'Already in favorites',
    favoritesFull: 'Favorites full (max 40)',
    favoritesSend: 'Send',
    favoritesRemove: 'Remove',
    favoritesSent: 'Sent',
    favoritesShortcutNone: 'No key',
    favoritesScopeGlobal: 'Site-wide',
    favoritesScopeChannel: 'This channel · {channel}',
    favoritesMakeGlobal: 'Global',
    favoritesMakeChannel: 'Channel',
    favoritesMakeGlobalHint: 'Available in every channel',
    favoritesMakeChannelHint: 'Only this channel',
    favoritesScopedGlobal: 'Now site-wide',
    favoritesScopedChannel: 'Now channel-only',
    favoritesNeedChannel: 'Could not detect the current channel',
    favoritesWheel: 'Wheel mode',
    favoritesWheelStart: 'Start',
    favoritesWheelStop: 'Stop',
    favoritesWheelIdle: 'Idle',
    favoritesWheelRunning: 'Sent {sent}/{max} · {left}s left',
    favoritesWheelStopped: 'Wheel stopped',
    favoritesWheelMinInterval: 'Min interval (s)',
    favoritesWheelMaxInterval: 'Max interval (s)',
    favoritesWheelMaxCount: 'Max messages',
    favoritesWheelMaxDuration: 'Max duration (s)',
    fsChatFavorites: 'Favorites',
    fsChatFavoritesEmpty: 'No favorites',
    superchatPinned: 'Pin Super Chats',
    superchatPosition: 'Pin position',
    superchatDuration: 'Pin time',
    superchatAnimation: 'Pin animation',
    superchatTop: 'Top center',
    superchatBottom: 'Bottom center',
    superchatTopLeft: 'Top left',
    superchatTopRight: 'Top right',
    superchatBottomLeft: 'Bottom left',
    superchatBottomRight: 'Bottom right',
    superchatFade: 'Fade',
    superchatSlide: 'Slide',
    superchatPop: 'Pop',
    superchatShine: 'Shine',
    superchatClose: 'Dismiss Super Chat',
    superchatHideSubscribe: 'Hide subscription pins',
    superchatCompact: 'Compact pin layout',
    superchatMaxWidth: 'Pin max width',
    superchatCardClose: 'Close Super Chat card',
    superchatOverlayDanmaku: 'Pin over scrolling danmaku',
    superchatDurationByAmount: 'Pin time scales with amount',
    fsChatPlaceholder: 'Send a message…',
    fsChatSend: 'Chat',
    fsChatClose: 'Close',
    fsChatNeedLogin: 'Log in to Twitch first',
    fsChatNeedFollow: 'Follow the channel to chat',
    fsChatNeedFollowTime: 'Follow longer before you can chat',
    fsChatNeedSub: 'Subscribers only',
    fsChatNeedVerified: 'Verify your account to chat',
    fsChatNeedPhone: 'Verify a phone number to chat',
    fsChatSlowMode: 'Slow mode — try again shortly',
    fsChatEmoteOnly: 'Emote-only mode',
    fsChatUniqueMode: 'Message must be unique',
    fsChatAutomod: 'Held by AutoMod for review',
    fsChatTimedOut: 'You are timed out',
    fsChatBanned: 'You are banned from this chat',
    fsChatDuplicate: 'Duplicate message blocked',
    fsChatRateLimit: 'Sending too fast — slow down',
    fsChatFailed: 'Failed to send. Try again.',
    fsChatSent: 'Sent',
    scrollAreaFull: 'Full screen',
    scrollAreaTopHalf: 'Top half',
    scrollAreaBottomHalf: 'Bottom half',
    scrollAreaTopQuarter: 'Top quarter',
    fontSystem: 'System default',
    fontYaHei: 'Microsoft YaHei',
    fontSimSun: 'SimSun',
    fontSimHei: 'SimHei',
    fontArial: 'Arial',
    fontRoboto: 'Roboto',
    fontImpact: 'Impact',
    fontGeorgia: 'Georgia',
    fontTimes: 'Times New Roman',
    fontVerdana: 'Verdana',
    fontTahoma: 'Tahoma',
    fontTrebuchet: 'Trebuchet MS',
    fontCourier: 'Courier New',
    fontConsolas: 'Consolas',
    fontComicSans: 'Comic Sans MS',
    fontSerif: 'Serif',
    fontSansSerif: 'Sans-serif',
    fontMonospace: 'Monospace',
    langZhCN: 'Chinese (Simplified)',
    langZhTW: 'Chinese (Traditional)',
    langEn: 'English',
    langJa: 'Japanese',
    langKo: 'Korean',
    langEs: 'Spanish',
    langFr: 'French',
    langDe: 'German',
    langRu: 'Russian',
    langPt: 'Portuguese',
    tooltipCopy: 'Copy to chat',
    tooltipOpenProfile: 'Open sender profile',
    chatClear: 'Clear chat',
    pipOpen: 'Enhanced picture-in-picture',
    pipClose: 'Close enhanced picture-in-picture',
    pipTitle: 'Enhanced PiP',
    pipNeedBrowser: 'Enhanced picture-in-picture needs Chrome or Edge 116 or newer',
    pipNoVideo: 'No player video is available',
    pipCaptureFailed: 'Could not capture the video',
    pipOpenFailed: 'Could not open the picture-in-picture window',
    pipReload: 'Refresh video',
    pipReloaded: 'Video refreshed',
    pipReloadFailed: 'Refresh failed. Check the video on the live page',
    pipDanmaku: 'Danmaku',
    pipSettings: 'Danmaku settings',
    pipSettingsHint: 'Settings opened on the Twitch page',
    pipSend: 'Send a message',
    pipBack: 'Back to stream',
    pipVodNoSend: 'Chat cannot be sent on a VOD page',
    pipAspectLock: 'Lock aspect ratio',
    pipAspectUnlock: 'Stretch to fill',
  },
};

function detectLocale() {
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const lang of langs) {
    if (lang && /^zh(-|$)/i.test(lang)) return 'zh';
  }
  return 'en';
}

const LOCALE = detectLocale();
const STRINGS = LOCALES[LOCALE];

function t(key) {
  return STRINGS[key] || LOCALES.en[key] || key;
}

function fill(key, vars) {
  let text = t(key);
  for (const [name, value] of Object.entries(vars || {})) {
    text = text.replaceAll(`{${name}}`, String(value));
  }
  return text;
}

function getFontOptions() {
  return [
    { label: t('fontSystem'), value: 'system-ui, sans-serif' },
    { label: t('fontYaHei'), value: '"Microsoft YaHei", sans-serif' },
    { label: t('fontSimSun'), value: 'SimSun, serif' },
    { label: t('fontSimHei'), value: 'SimHei, sans-serif' },
    { label: t('fontArial'), value: 'Arial, Helvetica, sans-serif' },
    { label: t('fontRoboto'), value: 'Roboto, sans-serif' },
    { label: t('fontVerdana'), value: 'Verdana, Geneva, sans-serif' },
    { label: t('fontTahoma'), value: 'Tahoma, Geneva, sans-serif' },
    { label: t('fontTrebuchet'), value: '"Trebuchet MS", sans-serif' },
    { label: t('fontGeorgia'), value: 'Georgia, serif' },
    { label: t('fontTimes'), value: '"Times New Roman", Times, serif' },
    { label: t('fontCourier'), value: '"Courier New", Courier, monospace' },
    { label: t('fontConsolas'), value: 'Consolas, monospace' },
    { label: t('fontImpact'), value: 'Impact, Haettenschweiler, sans-serif' },
    { label: t('fontComicSans'), value: '"Comic Sans MS", cursive, sans-serif' },
    { label: t('fontSerif'), value: 'serif' },
    { label: t('fontSansSerif'), value: 'sans-serif' },
    { label: t('fontMonospace'), value: 'monospace' },
  ];
}

function getScrollAreaOptions() {
  return [
    { label: t('scrollAreaFull'), value: 'full' },
    { label: t('scrollAreaTopHalf'), value: 'top-half' },
    { label: t('scrollAreaBottomHalf'), value: 'bottom-half' },
    { label: t('scrollAreaTopQuarter'), value: 'top-quarter' },
  ];
}

function getSuperchatPositionOptions() {
  return [
    { label: t('superchatTop'), value: 'top' },
    { label: t('superchatTopLeft'), value: 'top-left' },
    { label: t('superchatTopRight'), value: 'top-right' },
    { label: t('superchatBottom'), value: 'bottom' },
    { label: t('superchatBottomLeft'), value: 'bottom-left' },
    { label: t('superchatBottomRight'), value: 'bottom-right' },
  ];
}

function getSuperchatAnimationOptions() {
  return [
    { label: t('superchatFade'), value: 'fade' },
    { label: t('superchatSlide'), value: 'slide' },
    { label: t('superchatPop'), value: 'pop' },
    { label: t('superchatShine'), value: 'shine' },
  ];
}

function getTranslateProviderOptions() {
  return [
    { label: t('translateProviderAuto'), value: 'auto' },
    { label: t('translateProviderMicrosoft'), value: 'microsoft' },
    { label: t('translateProviderGoogle'), value: 'google' },
    { label: t('translateProviderVolcengine'), value: 'volcengine' },
    { label: t('translateProviderCaiyun'), value: 'caiyun' },
    { label: t('translateProviderTencent'), value: 'tencent' },
  ];
}

function getTranslateLangOptions() {
  return [
    { label: t('langZhCN'), value: 'zh-CN' },
    { label: t('langZhTW'), value: 'zh-TW' },
    { label: t('langEn'), value: 'en' },
    { label: t('langJa'), value: 'ja' },
    { label: t('langKo'), value: 'ko' },
    { label: t('langEs'), value: 'es' },
    { label: t('langFr'), value: 'fr' },
    { label: t('langDe'), value: 'de' },
    { label: t('langRu'), value: 'ru' },
    { label: t('langPt'), value: 'pt' },
  ];
}

function getDefaultTranslateTargetLang() {
  return LOCALE === 'zh' ? 'zh-CN' : 'en';
}

const SCROLL_AREA_BOTTOM_RESERVE = 56;

const DEFAULT_SETTINGS = {
  enabled: true,
  speed: 5,
  fontSize: 22,
  danmakuOpacity: 100,
  fontFamily: 'system-ui, sans-serif',
  scrollArea: 'full',
  translateEnabled: false,
  translateInChat: true,
  translateProvider: 'microsoft',
  translateTargetLang: getDefaultTranslateTargetLang(),
  translateSpeed: 3,
  blockedKeywords: [],
  speechEnabled: false,
  speechVolume: 80,
  speechPitch: 100,
  speechVoice: '',
  speechLang: '',
  speechRate: 100,
  speechPace: true,
  speechMaxSeconds: 4,
  speechBuffer: 5,
  superchatPinned: false,
  superchatPosition: 'top',
  superchatDuration: 15,
  superchatAnimation: 'slide',
  superchatHideSubscribe: false,
  superchatCompact: false,
  superchatMaxWidth: 420,
  superchatOverlayDanmaku: true,
  superchatDurationByAmount: false,
};

const SELECTORS = {
  chatScroller: '[data-a-target="chat-scroller"], .video-chat__message-list-wrapper',
  chatMessage: '[data-a-target="chat-message-container"], [data-a-target="chat-line-message"], .chat-line__message, [data-test-selector="chat-message"], [data-test-selector="user-notice-line"], .vod-message',
  chatText: 'span[data-a-target="chat-message-text"], span.text-fragment',
  chatUsername: '[data-a-target="chat-message-username"], .chat-author__display-name, .chat-line__username, .chatter-name',
  chatMessageBody: '[data-a-target="chat-line-message-body"], .chat-line__message-body, .video-chat__message, [data-test-selector="user-notice-line"]',
  videoPlayer: '.video-player__container',
  videoOverlay: '.video-player__overlay',
  playerControlsRoot: '[data-a-target="player-controls"], .player-controls',
  playerControls: '.video-player__default-player .player-controls__right-control-group, .player-controls__right-control-group',
  chatInput: 'textarea[data-a-target="chat-input"]',
  chatInputSlate: '[data-a-target="chat-input"][contenteditable="true"], .chat-wysiwyg-input__editor[contenteditable="true"]',
  chatInputEditable: '[data-a-target="chat-input"][contenteditable="true"], [data-a-target="chat-input-text"]',
  chatHeader: '.stream-chat-header, [class*="stream-chat-header"]',
  chatViewerListBtn: '[data-test-selector="chat-viewer-list"]',
  chatMessageContainer: '[data-test-selector="chat-scrollable-area__message-container"], .chat-scrollable-area__message-container',
  chatInputActions: '[data-tbc-chat-input-actions]',
  bitsButton: '[data-a-target="bits-button"]',
  emotePickerButton: '[data-a-target="emote-picker-button"]',
  chatScrollableArea: '.chat-list--default .scrollable-area, .scrollable-area',
};

const TRANSLATE_PROVIDERS = ['auto', 'microsoft', 'google', 'volcengine', 'caiyun', 'tencent'];

// Global Twitch cheermote prefixes + partner custom "*Cheer" suffixes.
const CHEER_EMOTE_PREFIXES = [
  '4Head', 'Anon', 'BibleThumb', 'BitBoss', 'bday', 'Cheer', 'Charity', 'Corgo', 'cheerwal',
  'DansGame', 'DoodleCheer', 'EleGiggle', 'FrankerZ', 'FailFish', 'Goal', 'HeyGuys',
  'HolidayCheer', 'Kappa', 'Kreygasm', 'MrDestructoid', 'Muxy', 'NotLikeThis', 'Party',
  'Pride', 'PJSalt', 'RIPCheer', 'Scoops', 'ShowLove', 'Shamrock', 'SeemsGood', 'SwiftRage',
  'Streamlabs', 'TriHard', 'uni', 'VoHiYo',
];
const CHEER_PREFIX_PATTERN = CHEER_EMOTE_PREFIXES.map((prefix) => prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
const BITS_TOKEN_PATTERN = `(?:^|\\s)(?:[A-Za-z][\\w]*?(?:Cheer|cheer)|(?:${CHEER_PREFIX_PATTERN}))([1-9]\\d{0,6})(?=\\s|$)`;

const SCROLL_AREAS = ['full', 'top-half', 'bottom-half', 'top-quarter'];
const SUPERCHAT_POSITIONS = ['top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right'];

function resolveSuperchatPlacement(value) {
  const key = String(value || 'top').toLowerCase().replace(/_/g, '-');
  const map = {
    top: { vertical: 'top', horizontal: 'center' },
    bottom: { vertical: 'bottom', horizontal: 'center' },
    'top-left': { vertical: 'top', horizontal: 'left' },
    topleft: { vertical: 'top', horizontal: 'left' },
    'top-right': { vertical: 'top', horizontal: 'right' },
    topright: { vertical: 'top', horizontal: 'right' },
    'bottom-left': { vertical: 'bottom', horizontal: 'left' },
    bottomleft: { vertical: 'bottom', horizontal: 'left' },
    'bottom-right': { vertical: 'bottom', horizontal: 'right' },
    bottomright: { vertical: 'bottom', horizontal: 'right' },
  };
  return map[key] || map.top;
}

function resolveSuperchatDuration(settings, meta) {
  const base = clamp(finiteNumber(settings?.superchatDuration, DEFAULT_SETTINGS.superchatDuration), 2, 300);
  if (!settings?.superchatDurationByAmount || !meta) return base;

  let bonus = 0;
  if (meta.kind === 'cheer' && meta.bits) {
    const bits = Math.max(1, Number(meta.bits) || 1);
    bonus = Math.log10(bits) * 6;
  } else if (meta.kind === 'sub') {
    bonus = 8;
  } else if (meta.kind === 'pin') {
    bonus = 5;
  }
  return clamp(Math.round(base + bonus), 2, 300);
}

const SUPERCHAT_MAX_PINS = 10;

const STORAGE_KEY = 'tbc_settings_v1';

const LIVE_MESSAGE_TAIL = 8;
const WARMUP_MS = 2500;
const MAX_DANMAKU_QUEUE = 24;
const MAX_TRANSLATE_QUEUE = 32;

function loadSettings() {
  try {
    const saved = GM_getValue(STORAGE_KEY, null);
    if (saved && typeof saved === 'object') {
      const merged = { ...DEFAULT_SETTINGS, ...saved };
      if (merged.scrollArea === 'half') {
        merged.scrollArea = 'top-half';
      }
      if (!SCROLL_AREAS.includes(merged.scrollArea)) {
        merged.scrollArea = DEFAULT_SETTINGS.scrollArea;
      }
      if (!TRANSLATE_PROVIDERS.includes(merged.translateProvider)) {
        merged.translateProvider = DEFAULT_SETTINGS.translateProvider;
      }
      merged.blockedKeywords = sanitizeBlockedKeywords(merged.blockedKeywords);
      delete merged.blockedUsers;
      merged.translateEnabled = !!merged.translateEnabled;
      merged.translateInChat = merged.translateInChat !== false;
      merged.danmakuOpacity = clamp(Number(merged.danmakuOpacity) || DEFAULT_SETTINGS.danmakuOpacity, 10, 100);
      merged.speechEnabled = !!merged.speechEnabled;
      merged.speechVolume = clamp(finiteNumber(merged.speechVolume, DEFAULT_SETTINGS.speechVolume), 0, 100);
      merged.speechPitch = clamp(finiteNumber(merged.speechPitch, DEFAULT_SETTINGS.speechPitch), 0, 200);
      merged.speechRate = clamp(finiteNumber(merged.speechRate, DEFAULT_SETTINGS.speechRate), 50, 200);
      merged.speechPace = merged.speechPace !== false;
      merged.speechMaxSeconds = clamp(finiteNumber(merged.speechMaxSeconds, DEFAULT_SETTINGS.speechMaxSeconds), 1, 15);
      merged.speechBuffer = clamp(finiteNumber(merged.speechBuffer, DEFAULT_SETTINGS.speechBuffer), 1, 25);
      merged.speechVoice = typeof merged.speechVoice === 'string' ? merged.speechVoice : '';
      merged.speechLang = typeof merged.speechLang === 'string' ? merged.speechLang : '';
      merged.superchatPinned = !!merged.superchatPinned;
      const scPos = String(merged.superchatPosition || 'top').toLowerCase().replace(/_/g, '-');
      merged.superchatPosition = SUPERCHAT_POSITIONS.includes(scPos) ? scPos : 'top';
      if (!['fade', 'slide', 'pop', 'shine'].includes(merged.superchatAnimation)) merged.superchatAnimation = 'slide';
      merged.superchatDuration = clamp(finiteNumber(merged.superchatDuration, DEFAULT_SETTINGS.superchatDuration), 2, 300);
      merged.superchatHideSubscribe = !!merged.superchatHideSubscribe;
      merged.superchatCompact = !!merged.superchatCompact;
      merged.superchatMaxWidth = clamp(
        finiteNumber(merged.superchatMaxWidth, DEFAULT_SETTINGS.superchatMaxWidth),
        240,
        720,
      );
      merged.superchatOverlayDanmaku = merged.superchatOverlayDanmaku !== false;
      merged.superchatDurationByAmount = !!merged.superchatDurationByAmount;
      return merged;
    }
  } catch (_) {
    /* ignore */
  }
  return { ...DEFAULT_SETTINGS };
}

function saveSettings(settings) {
  GM_setValue(STORAGE_KEY, settings);
}

function finiteNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

const BLOCKED_KEYWORD_LIMIT = 50;
const BLOCKED_KEYWORD_LENGTH = 40;

function sanitizeBlockedKeywords(value) {
  if (!Array.isArray(value)) return [];

  const seen = new Set();
  const keywords = [];
  for (const item of value) {
    const keyword = String(item || '').trim().slice(0, BLOCKED_KEYWORD_LENGTH);
    const key = keyword.toLowerCase();
    if (!keyword || seen.has(key)) continue;
    seen.add(key);
    keywords.push(keyword);
    if (keywords.length >= BLOCKED_KEYWORD_LIMIT) break;
  }
  return keywords;
}

function isKeywordBlocked(text, keywords) {
  const haystack = String(text || '').toLowerCase();
  if (!haystack || !keywords?.length) return false;
  return keywords.some((keyword) => {
    const needle = String(keyword || '').trim().toLowerCase();
    return needle && haystack.includes(needle);
  });
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function isPageActive() {
  return !document.hidden && document.visibilityState === 'visible';
}

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
  return item.closest('.tbc-danmaku-layer, .tbc-superchat-layer')?.parentElement || null;
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

const TabAntiFreeze = {
  active: false,
  captureHandler: null,
  saved: null,
};

function tabAntiFreezeBlockVisibilityEvent(event) {
  event.stopImmediatePropagation();
}

function tabAntiFreezeSaveDescriptor(object, key) {
  const descriptor = Object.getOwnPropertyDescriptor(object, key);
  if (descriptor) TabAntiFreeze.saved[key] = descriptor;
}

function tabAntiFreezeEnable() {
  if (TabAntiFreeze.active) return;
  TabAntiFreeze.saved = {};
  tabAntiFreezeSaveDescriptor(document, 'hidden');
  tabAntiFreezeSaveDescriptor(document, 'visibilityState');
  tabAntiFreezeSaveDescriptor(document, 'webkitVisibilityState');

  try {
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      enumerable: true,
      get() { return false; },
    });
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      enumerable: true,
      get() { return 'visible'; },
    });
    Object.defineProperty(document, 'webkitVisibilityState', {
      configurable: true,
      enumerable: true,
      get() { return 'visible'; },
    });
  } catch (error) {
    console.warn('[TBC] Tab anti-freeze: could not patch visibility', error);
    TabAntiFreeze.saved = null;
    return;
  }

  TabAntiFreeze.saved.hasFocus = document.hasFocus;
  document.hasFocus = () => true;

  TabAntiFreeze.captureHandler = tabAntiFreezeBlockVisibilityEvent;
  document.addEventListener('visibilitychange', TabAntiFreeze.captureHandler, true);

  TabAntiFreeze.active = true;
  try {
    document.dispatchEvent(new Event('visibilitychange'));
  } catch {
    /* ignore */
  }
}

function tabAntiFreezeRestoreProperty(object, key) {
  const saved = TabAntiFreeze.saved?.[key];
  if (!saved) return;
  try {
    Object.defineProperty(object, key, saved);
  } catch {
    try {
      delete object[key];
    } catch {
      /* ignore */
    }
  }
}

function tabAntiFreezeDisable() {
  if (!TabAntiFreeze.active) return;

  if (TabAntiFreeze.captureHandler) {
    document.removeEventListener('visibilitychange', TabAntiFreeze.captureHandler, true);
    TabAntiFreeze.captureHandler = null;
  }

  if (TabAntiFreeze.saved) {
    tabAntiFreezeRestoreProperty(document, 'hidden');
    tabAntiFreezeRestoreProperty(document, 'visibilityState');
    tabAntiFreezeRestoreProperty(document, 'webkitVisibilityState');
    if (TabAntiFreeze.saved.hasFocus) {
      document.hasFocus = TabAntiFreeze.saved.hasFocus;
    }
  }

  TabAntiFreeze.saved = null;
  TabAntiFreeze.active = false;
}

function tabAntiFreezeIsEnabled() {
  return TabAntiFreeze.active;
}

function syncTabAntiFreeze(isPipOpen) {
  if (isPipOpen?.()) tabAntiFreezeEnable();
  else tabAntiFreezeDisable();
}

const SPEECH_GAP_MS = 250;

let speechSpeaker = null;

class DanmakuSpeaker {
  constructor(getSettings) {
    this.getSettings = getSettings;
    this.queue = [];
    this.token = 0;
    this.busy = false;
    this.timer = null;
    this.supported = typeof window.speechSynthesis !== 'undefined';
    this.keepAlive = null;
    if (!this.supported) return;
    this.keepAlive = setInterval(() => {
      const synth = window.speechSynthesis;
      if (!synth?.speaking || synth.paused) return;
      synth.pause();
      synth.resume();
    }, 10000);
  }

  destroy() {
    clearInterval(this.keepAlive);
    this.keepAlive = null;
    this.cancel();
  }

  canAutoSpeak() {
    const settings = this.getSettings();
    return !!settings.speechEnabled && Number(settings.speechVolume) > 0;
  }

  rateFor(text, paced) {
    const settings = this.getSettings();
    const base = clamp(Number(settings.speechRate) || 100, 50, 200) / 100;
    const usePace = paced ?? !!settings.speechPace;
    if (!usePace) return base;
    const maxSeconds = clamp(Number(settings.speechMaxSeconds) || 4, 1, 15);
    const estimate = estimateSpeechSeconds(text, base);
    if (estimate <= maxSeconds) return base;
    return clamp(base * (estimate / maxSeconds), base, 10);
  }

  listVoices() {
    if (!this.supported) return [];
    return window.speechSynthesis.getVoices();
  }

  findVoice() {
    const voices = this.listVoices();
    if (!voices.length) return null;
    const settings = this.getSettings();
    if (settings.speechVoice) {
      const picked = voices.find((voice) => voice.voiceURI === settings.speechVoice || voice.name === settings.speechVoice);
      if (picked) return picked;
    }
    const lang = String(settings.speechLang || navigator.language || '').toLowerCase();
    const prefix = lang.slice(0, 2);
    return voices.find((voice) => voice.default && voice.lang.toLowerCase().startsWith(prefix))
      || voices.find((voice) => prefix && voice.lang.toLowerCase().startsWith(prefix))
      || voices.find((voice) => voice.default)
      || voices[0];
  }

  request(text) {
    if (!this.supported || document.hidden || !this.canAutoSpeak()) return;
    const spoken = prepareSpeechText(text);
    if (!spoken) return;
    this.queue.push(spoken);
    if (!this.busy) this.pump();
  }

  speakNow(text) {
    const spoken = prepareSpeechText(text);
    if (!spoken || !this.supported) return;
    if (this.busy && this.queue.length) this.queue.shift();
    this.token += 1;
    const token = this.token;
    clearTimeout(this.timer);
    this.busy = true;
    window.speechSynthesis.cancel();
    this.timer = setTimeout(() => {
      if (token !== this.token) return;
      this.play(spoken, this.rateFor(spoken), token, () => this.pump());
    }, 60);
  }

  preview(text, paced) {
    const spoken = limitSpeechRepeats(normalizeSpeechText(text));
    if (!spoken || !this.supported) return;
    this.token += 1;
    const token = this.token;
    clearTimeout(this.timer);
    this.busy = true;
    window.speechSynthesis.cancel();
    this.timer = setTimeout(() => {
      if (token !== this.token) return;
      this.play(spoken, this.rateFor(spoken, paced), token, () => this.pump());
    }, 60);
  }

  pump() {
    if (!this.supported || !this.canAutoSpeak()) {
      this.queue = [];
      this.busy = false;
      return;
    }
    const buffer = clamp(Number(this.getSettings().speechBuffer) || 5, 1, 25);
    if (this.queue.length > buffer) this.queue = this.queue.slice(-buffer);
    if (!this.queue.length) {
      this.busy = false;
      return;
    }
    const text = this.queue[0];
    const rate = this.rateFor(text);
    this.busy = true;
    this.token += 1;
    const token = this.token;
    this.play(text, rate, token, () => {
      if (this.queue[0] === text) this.queue.shift();
      this.timer = setTimeout(() => this.pump(), SPEECH_GAP_MS);
    });
  }

  play(text, rate, token, onDone) {
    if (token !== this.token || !this.supported) return;
    const settings = this.getSettings();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = clamp(Number(settings.speechVolume), 0, 100) / 100;
    utterance.pitch = clamp(Number(settings.speechPitch), 0, 200) / 100;
    utterance.rate = clamp(rate, 0.1, 10);
    const voice = this.findVoice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }
    let settled = false;
    const finish = (event) => {
      if (settled || token !== this.token) return;
      if (event?.type === 'error' && (event.error === 'interrupted' || event.error === 'canceled')) return;
      settled = true;
      onDone?.();
    };
    utterance.addEventListener('end', finish);
    utterance.addEventListener('error', finish);
    window.speechSynthesis.resume();
    window.speechSynthesis.speak(utterance);
  }

  cancel() {
    this.token += 1;
    this.queue = [];
    this.busy = false;
    clearTimeout(this.timer);
    this.timer = null;
    if (this.supported) window.speechSynthesis.cancel();
  }
}

function normalizeSpeechText(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function speechSourceText(message, parts) {
  if (Array.isArray(parts) && parts.length) {
    return parts.map((part) => {
      if (part?.type === 'text') return part.value || part.text || '';
      if (part?.type === 'emote' && /cheer/i.test(part.name || part.alt || '')) return part.name || part.alt || '';
      return '';
    }).filter(Boolean).join(' ');
  }
  return message || '';
}

function limitSpeechRepeats(text, maxRepeats = 3) {
  let out = String(text || '');
  const maxUnit = Math.floor(out.length / (maxRepeats + 1));
  for (let len = maxUnit; len >= 1; len -= 1) {
    const pattern = new RegExp(`([\\s\\S]{${len}})\\1{${maxRepeats},}`, 'g');
    out = out.replace(pattern, (_match, unit) => unit.repeat(maxRepeats));
  }
  return out.replace(/(\S+)(?:\s+\1){3,}/g, (_match, token) => Array(maxRepeats).fill(token).join(' '));
}

function hasReadableSpeech(text) {
  const stripped = String(text || '')
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/\p{N}/gu, '')
    .replace(/\p{P}/gu, '')
    .replace(/\p{S}/gu, '')
    .replace(/\s+/g, '');
  return stripped.length > 0;
}

function prepareSpeechText(text) {
  const spoken = limitSpeechRepeats(normalizeSpeechText(text));
  return hasReadableSpeech(spoken) ? spoken : '';
}

function estimateSpeechSeconds(text, rate) {
  let units = 0;
  for (const ch of String(text || '')) {
    if (/\s/.test(ch)) continue;
    units += /[\u3040-\u30ff\u3400-\u9fff\uf900-\ufaff\uac00-\ud7af]/.test(ch) ? 1 : 0.45;
  }
  return (units * 0.24) / (rate || 1);
}

function ensureSpeechSpeaker(getSettings) {
  if (!speechSpeaker) speechSpeaker = new DanmakuSpeaker(getSettings);
  return speechSpeaker;
}

function requestSpeech(text) {
  speechSpeaker?.request(text);
}

function speakTextNow(text) {
  speechSpeaker?.speakNow(text);
}

function previewSpeech(text, fast) {
  speechSpeaker?.preview(text, fast);
}

function cancelSpeech() {
  speechSpeaker?.cancel();
}

function listSpeechVoices() {
  return speechSpeaker?.listVoices() || [];
}

function speechSupported() {
  return !!speechSpeaker?.supported;
}

class LaneManager {
  constructor() {
    this.lanes = [];
    this.laneHeight = 28;
  }

  reset(laneCount, laneHeight) {
    this.laneHeight = laneHeight;
    this.lanes = Array.from({ length: Math.max(1, laneCount) }, () => 0);
  }

  acquire(durationMs) {
    const now = Date.now();
    let bestLane = 0;
    let bestTime = Infinity;

    for (let i = 0; i < this.lanes.length; i++) {
      if (this.lanes[i] <= now) {
        this.lanes[i] = now + durationMs * 0.6;
        return i;
      }
      if (this.lanes[i] < bestTime) {
        bestTime = this.lanes[i];
        bestLane = i;
      }
    }

    this.lanes[bestLane] = now + durationMs * 0.6;
    return bestLane;
  }
}

let activeSuperchatCard = null;

function appendSuperchatCardParts(container, parts) {
  for (const part of parts) {
    if (part.type === 'emote' && part.src) {
      const img = document.createElement('img');
      img.className = 'tbc-emote';
      img.src = part.src;
      img.alt = part.name || '';
      img.title = part.name || '';
      img.draggable = false;
      container.appendChild(img);
      continue;
    }
    const text = part.type === 'emote' ? (part.name || '') : (part.value || '');
    if (text) container.appendChild(document.createTextNode(text));
  }
}

function closeSuperchatDetailCard() {
  const card = activeSuperchatCard;
  activeSuperchatCard = null;
  if (!card) return;
  card.onDismiss?.();
  card.root?.remove();
}

function openSuperchatDetailCard(mount, payload, helpers = {}) {
  if (!mount || !payload) return;
  closeSuperchatDetailCard();

  const {
    getSettings,
    favoritesPanel,
    chatContextMenu,
    onDismiss,
  } = helpers;

  const settings = getSettings?.() || {};
  const {
    username,
    message,
    parts,
    usernameColor,
    originalMessage,
    superchatMeta,
    avatarUrl,
    login,
    profileUrl,
  } = payload;
  const meta = superchatMeta || null;
  const style = meta?.style || payload.superchatStyle || {
    background: 'linear-gradient(135deg, #9147ff 0%, #772ce8 100%)',
    color: '#ffffff',
    accent: '#bf94ff',
  };
  const displayParts = parts?.length ? parts : (message ? [{ type: 'text', value: message }] : []);

  if (getComputedStyle(mount).position === 'static') {
    mount.style.position = 'relative';
  }

  const root = document.createElement('div');
  root.className = 'tbc-sc-card-root';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');

  const backdrop = document.createElement('button');
  backdrop.type = 'button';
  backdrop.className = 'tbc-sc-card-backdrop';
  backdrop.setAttribute('aria-label', t('superchatCardClose'));

  const card = document.createElement('div');
  card.className = 'tbc-sc-card';
  card.style.background = style.background || '#9147ff';
  card.style.color = safeCssColor(style.color, '#ffffff');
  card.style.setProperty('--tbc-sc-accent', safeCssColor(style.accent, '#bf94ff'));
  card.style.fontFamily = settings.fontFamily || 'system-ui, sans-serif';

  const header = document.createElement('div');
  header.className = 'tbc-sc-card-header';

  const avatar = document.createElement('img');
  avatar.className = 'tbc-sc-card-avatar';
  avatar.alt = '';
  avatar.draggable = false;
  avatar.src = avatarUrl || cachedAvatar(login || username, username, usernameColor);

  const headText = document.createElement('div');
  headText.className = 'tbc-sc-card-headtext';
  const nameEl = document.createElement('div');
  nameEl.className = 'tbc-sc-card-name';
  nameEl.textContent = username || login || 'User';
  headText.appendChild(nameEl);

  if (meta) {
    const metaRow = document.createElement('div');
    metaRow.className = 'tbc-sc-meta tbc-sc-card-meta';
    if (meta.kind === 'cheer' && meta.bits) {
      const amount = document.createElement('span');
      amount.className = 'tbc-sc-amount';
      amount.textContent = meta.amountLabel || `${meta.bits} Bits`;
      const tierText = meta.tierLabel || cheerTierBadgeLabel(meta.bits);
      if (tierText) {
        const tier = document.createElement('span');
        tier.className = 'tbc-sc-badge tbc-sc-tier';
        tier.textContent = tierText;
        metaRow.append(tier, amount);
      } else {
        metaRow.appendChild(amount);
      }
    } else if (meta.amountLabel) {
      const badge = document.createElement('span');
      badge.className = 'tbc-sc-badge';
      badge.textContent = meta.amountLabel;
      metaRow.appendChild(badge);
    }
    headText.appendChild(metaRow);
  }

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'tbc-sc-card-close';
  closeBtn.setAttribute('aria-label', t('superchatCardClose'));
  closeBtn.innerHTML = typeof ICON_CLOSE === 'string' ? ICON_CLOSE : '×';

  header.append(avatar, headText, closeBtn);

  const body = document.createElement('div');
  body.className = 'tbc-sc-card-body';
  appendSuperchatCardParts(body, displayParts);

  const translation = document.createElement('div');
  translation.className = 'tbc-sc-card-translation';
  translation.hidden = true;

  const actions = document.createElement('div');
  actions.className = 'tbc-sc-card-actions';

  const translateBtn = document.createElement('button');
  translateBtn.type = 'button';
  translateBtn.className = 'tbc-sc-card-action';
  translateBtn.textContent = t('chatMenuTranslate');

  const speakBtn = document.createElement('button');
  speakBtn.type = 'button';
  speakBtn.className = 'tbc-sc-card-action';
  speakBtn.textContent = t('chatMenuSpeak');
  if (!speechSupported()) speakBtn.disabled = true;

  const favoriteBtn = document.createElement('button');
  favoriteBtn.type = 'button';
  favoriteBtn.className = 'tbc-sc-card-action';
  favoriteBtn.textContent = t('chatMenuFavorite');

  const profileBtn = document.createElement('button');
  profileBtn.type = 'button';
  profileBtn.className = 'tbc-sc-card-action';
  profileBtn.textContent = t('tooltipOpenProfile');

  const blockBtn = document.createElement('button');
  blockBtn.type = 'button';
  blockBtn.className = 'tbc-sc-card-action';
  blockBtn.textContent = t('chatMenuBlockUser');
  const blockLogin = String(login || username || '').trim().replace(/^@+/, '').toLowerCase();
  if (!blockLogin) blockBtn.disabled = true;

  actions.append(profileBtn, blockBtn, translateBtn, speakBtn, favoriteBtn);
  card.append(header, body, translation, actions);
  root.append(backdrop, card);
  mount.appendChild(root);

  const loginKey = String(login || username || '').toLowerCase().replace(/^@+/, '');
  if (loginKey && (!avatarUrl || String(avatarUrl).startsWith('data:'))) {
    fetchTwitchAvatar(loginKey).then((url) => {
      if (!url || !root.isConnected) return;
      avatar.src = url;
    });
  }

  const snapshot = {
    message: originalMessage || message,
    parts: displayParts.map((part) => ({ ...part })),
    username,
    login,
  };

  let translatedOnce = false;

  translateBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!chatContextMenu?.translateParts) return;
    translateBtn.disabled = true;
    const result = await chatContextMenu.translateParts(snapshot, translatedOnce);
    translateBtn.disabled = false;
    if (result.failed) return;
    translatedOnce = true;
    translateBtn.textContent = t('chatMenuRetranslate');
    if (result.translated) {
      translation.hidden = false;
      translation.textContent = result.message;
      snapshot.message = result.message;
      snapshot.parts = result.parts;
    }
  });

  speakBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!speechSupported() || Number(settings.speechVolume) <= 0) return;
    const source = translation.hidden
      ? speechSourceText(snapshot.message, snapshot.parts)
      : (translation.textContent || snapshot.message);
    speakTextNow(source);
  });

  profileBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = profileUrl || (blockLogin ? `https://www.twitch.tv/${encodeURIComponent(blockLogin)}` : '');
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  });

  blockBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!blockLogin || !chatContextMenu?.runBlockUser) return;
    await chatContextMenu.runBlockUser(blockLogin);
  });

  favoriteBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const text = String(originalMessage || message || '').trim();
    if (!text) return;
    if (favoritesPanel?.addFromText) {
      favoritesPanel.addFromText(text);
      if (!favoritesPanel.isOpen && favoritesPanel.btn) {
        favoritesPanel.open(favoritesPanel.btn);
      }
      return;
    }
    const result = addFavoriteText(text);
    if (result.full) console.warn(`[TBC] ${t('favoritesFull')}`);
    else if (result.added) console.info(`[TBC] ${t('favoritesAdded')}`);
  });

  const dismiss = () => closeSuperchatDetailCard();
  backdrop.addEventListener('click', dismiss);
  closeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dismiss();
  });
  card.addEventListener('click', (e) => e.stopPropagation());

  activeSuperchatCard = {
    root,
    onDismiss: typeof onDismiss === 'function' ? onDismiss : null,
  };
}

function safeCssColor(value, fallback) {
  const color = String(value || '').trim();
  if (!color || /[;{}]|url\s*\(/i.test(color)) return fallback;
  return color;
}

class DanmakuEngine {
  constructor(getSettings) {
    this.getSettings = getSettings;
    this._superchatHelpers = () => ({ getSettings: this.getSettings });
    this.laneManager = new LaneManager();
    this.layer = null;
    this.superchatLayer = null;
    this.pinnedItems = [];
    this.superchatQueue = [];
    this.maxPinned = SUPERCHAT_MAX_PINS;
    this.playerEl = null;
    this.overlayEl = null;
    this.controlsObserver = null;
    this.resizeObserver = null;
    this.boundUpdate = () => this.updateLayout();
  }

  setSuperchatHelpers(factory) {
    if (typeof factory === 'function') this._superchatHelpers = factory;
  }

  async mount() {
    this.playerEl = await waitForElement(SELECTORS.videoPlayer);
    this.overlayEl = this.playerEl.querySelector(SELECTORS.videoOverlay) || this.playerEl;

    this.layer = document.createElement('div');
    this.layer.className = 'tbc-danmaku-layer';
    this.layer.setAttribute('aria-hidden', 'true');
    this.superchatLayer = document.createElement('div');
    this.superchatLayer.className = 'tbc-superchat-layer';
    this.superchatLayer.setAttribute('aria-hidden', 'true');
    this.overlayEl.append(this.layer, this.superchatLayer);

    if (getComputedStyle(this.overlayEl).position === 'static') {
      this.overlayEl.style.position = 'relative';
    }

    this.resizeObserver = new ResizeObserver(this.boundUpdate);
    this.resizeObserver.observe(this.playerEl);

    const controlsEl = this.playerEl.querySelector(SELECTORS.playerControlsRoot);
    if (controlsEl) {
      this.controlsObserver = new ResizeObserver(this.boundUpdate);
      this.controlsObserver.observe(controlsEl);
    }

    window.addEventListener('resize', this.boundUpdate);
    document.addEventListener('fullscreenchange', this.boundUpdate);
    document.addEventListener('webkitfullscreenchange', this.boundUpdate);

    this.updateLayout();
  }

  destroy() {
    window.removeEventListener('resize', this.boundUpdate);
    document.removeEventListener('fullscreenchange', this.boundUpdate);
    document.removeEventListener('webkitfullscreenchange', this.boundUpdate);
    this.resizeObserver?.disconnect();
    this.controlsObserver?.disconnect();
    hideDanmakuTooltip();
    closeSuperchatDetailCard();
    this.layer?.remove();
    this.superchatLayer?.remove();
    this.layer = null;
    this.superchatLayer = null;
    this.pinnedItems = [];
    this.superchatQueue = [];
  }

  getBottomReserve() {
    const controls = this.playerEl?.querySelector(SELECTORS.playerControlsRoot);
    if (controls) {
      const height = controls.getBoundingClientRect().height;
      if (height > 0) return Math.ceil(height) + 8;
    }
    return SCROLL_AREA_BOTTOM_RESERVE;
  }

  estimatePinnedItemHeight() {
    const settings = this.getSettings();
    if (settings.superchatCompact) {
      return Math.max(32, settings.fontSize + 10);
    }
    return Math.max(48, settings.fontSize + 20);
  }

  getPinnedBandHeight() {
    const live = this.pinnedItems.filter((item) => item?.isConnected);
    const gap = 6;
    const layerPad = 10;
    if (!live.length) {
      return this.estimatePinnedItemHeight() + layerPad;
    }
    let total = layerPad;
    live.forEach((item, index) => {
      const h = item.offsetHeight || this.estimatePinnedItemHeight();
      total += h + (index > 0 ? gap : 0);
    });
    return total;
  }

  getPinnedBandRect(playerHeight) {
    const live = this.pinnedItems.filter((item) => item?.isConnected);
    this.pinnedItems = live;
    if (!live.length || !this.getSettings().superchatPinned || !this.getSettings().enabled) return null;
    const placement = resolveSuperchatPlacement(this.getSettings().superchatPosition);
    const bottomReserve = this.getBottomReserve();
    const contentHeight = this.getPinnedBandHeight();
    let bandHeight = contentHeight;
    const maxBand = Math.max(this.estimatePinnedItemHeight(), playerHeight - bottomReserve - 12);
    bandHeight = Math.min(bandHeight, maxBand);

    let top;
    if (placement.vertical === 'bottom') {
      top = Math.max(0, playerHeight - bottomReserve - bandHeight);
    } else {
      top = 4;
      const maxTopBand = playerHeight - bottomReserve - top - 4;
      bandHeight = Math.min(bandHeight, maxTopBand);
    }
    return { ...placement, top, height: bandHeight, contentHeight, maxBand };
  }

  getScrollAreaRect(playerRect) {
    const settings = this.getSettings();
    const h = playerRect.height;
    const laneHeight = settings.fontSize + 6;
    const bottomReserve = this.getBottomReserve();
    let area;

    switch (settings.scrollArea) {
      case 'top-half':
        area = { top: 0, height: Math.max(laneHeight, h * 0.5) };
        break;
      case 'bottom-half':
        area = {
          top: h * 0.5,
          height: Math.max(laneHeight, h * 0.5 - bottomReserve),
        };
        break;
      case 'top-quarter':
        area = { top: 0, height: Math.max(laneHeight, h * 0.25) };
        break;
      default:
        area = { top: 0, height: Math.max(laneHeight, h - bottomReserve) };
        break;
    }

    if (settings.superchatOverlayDanmaku === false && settings.superchatPinned && settings.enabled) {
      const band = this.getPinnedBandRect(h);
      if (band?.height) {
        if (band.vertical === 'top') {
          area.top += band.height;
          area.height = Math.max(laneHeight, area.height - band.height);
        } else if (band.vertical === 'bottom') {
          area.height = Math.max(laneHeight, area.height - band.height);
        }
      }
    }

    return area;
  }

  migrateDanmakuItems(items, oldRect, newWidth, newHeight) {
    const oldWidth = oldRect.width || 1;
    const oldHeight = oldRect.height || 1;

    for (const item of items) {
      if (!item.isConnected) continue;

      const top = parseFloat(item.style.top) || 0;
      item.style.top = `${(top / oldHeight) * newHeight}px`;

      const oldTravel = parseFloat(item.style.getPropertyValue('--tbc-travel')) || oldWidth;
      const oldDuration = parseFloat(item.style.getPropertyValue('--tbc-duration')) || 8000;
      const matrix = new DOMMatrixReadOnly(getComputedStyle(item).transform);
      const progress = oldTravel > 0 ? clamp(-matrix.m41 / oldTravel, 0, 1) : 0;

      const itemWidth = item.offsetWidth;
      const newTravel = newWidth + itemWidth;
      const newDuration = (newTravel / oldTravel) * oldDuration;
      const remaining = Math.max(0, newDuration * (1 - progress));

      item._tbcClearRemoveTimer?.();

      const wasPaused = item.classList.contains('tbc-paused');
      if (wasPaused) {
        item.classList.remove('tbc-paused');
      }

      item.style.setProperty('--tbc-travel', `${newTravel}px`);
      item.style.setProperty('--tbc-start', `${-progress * newTravel}px`);
      item.style.setProperty('--tbc-duration', `${remaining}ms`);
      item.style.animation = 'none';
      void item.offsetWidth;
      item.style.animation = '';

      if (wasPaused) {
        item.classList.add('tbc-paused');
      }

      item._tbcScheduleRemove?.(remaining);
    }
  }

  updateLayout() {
    if (!this.layer || !this.playerEl) return;

    const settings = this.getSettings();
    if (!settings.superchatPinned || !settings.enabled) {
      this.superchatQueue = [];
      this.pinnedItems.forEach((item) => item.remove());
      this.pinnedItems = [];
    }
    const fsEl = getFullscreenElement();
    const anchor = fsEl || this.playerEl;
    const rect = anchor.getBoundingClientRect();
    const area = this.getScrollAreaRect(rect);

    const oldParent = this.layer.parentElement;
    const oldRect = this.layer.getBoundingClientRect();
    const items = [...this.layer.querySelectorAll('.tbc-danmaku-item')];
    const shouldMigrate = items.length > 0;

    if (shouldMigrate) {
      hideDanmakuTooltip();
    }

    if (fsEl && fsEl.contains(this.playerEl)) {
      if (this.layer.parentElement !== fsEl) {
        fsEl.appendChild(this.layer);
      }
      Object.assign(this.layer.style, {
        position: 'fixed',
        top: `${rect.top + area.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${area.height}px`,
        zIndex: '9999',
      });
    } else {
      if (this.layer.parentElement !== this.overlayEl) {
        this.overlayEl.appendChild(this.layer);
      }
      Object.assign(this.layer.style, {
        position: 'absolute',
        top: `${area.top}px`,
        left: '0',
        width: '100%',
        height: `${area.height}px`,
        zIndex: '4',
      });
    }

    const newWidth = this.layer.clientWidth;
    const newHeight = this.layer.clientHeight;

    if (shouldMigrate && (
      oldParent !== this.layer.parentElement
      || Math.abs(oldRect.width - newWidth) > 1
      || Math.abs(oldRect.height - newHeight) > 1
    )) {
      this.migrateDanmakuItems(items, oldRect, newWidth, newHeight);
    }

    const laneHeight = settings.fontSize + 6;
    const laneCount = Math.floor(newHeight / laneHeight);
    this.laneManager.reset(laneCount, laneHeight);
    this.layer.style.display = settings.enabled ? 'block' : 'none';
    this.layer.style.setProperty(
      '--tbc-opacity',
      String(clamp(Number(settings.danmakuOpacity) || 100, 10, 100) / 100),
    );
    this.layoutSuperchat(rect, !!(fsEl && fsEl.contains(this.playerEl)));
  }

  layoutSuperchat(playerRect, fullscreen) {
    if (!this.superchatLayer) return;
    const settings = this.getSettings();
    const parent = fullscreen ? (getFullscreenElement() || this.overlayEl) : this.overlayEl;
    if (parent && this.superchatLayer.parentElement !== parent) parent.appendChild(this.superchatLayer);
    const band = this.getPinnedBandRect(playerRect.height);
    if (!band) {
      this.superchatLayer.style.display = 'none';
      return;
    }
    this.superchatLayer.classList.toggle('tbc-sc-bottom', band.vertical === 'bottom');
    this.superchatLayer.classList.toggle('tbc-sc-align-left', band.horizontal === 'left');
    this.superchatLayer.classList.toggle('tbc-sc-align-right', band.horizontal === 'right');
    const needsPinScroll = band.contentHeight > band.height + 2;
    this.superchatLayer.classList.toggle('tbc-sc-scrollable', needsPinScroll);
    const layerSize = needsPinScroll
      ? { height: `${band.height}px`, maxHeight: '' }
      : { height: 'auto', maxHeight: `${band.maxBand}px` };
    Object.assign(this.superchatLayer.style, fullscreen ? {
      display: 'flex',
      position: 'fixed',
      top: `${playerRect.top + band.top}px`,
      left: `${playerRect.left}px`,
      width: `${playerRect.width}px`,
      ...layerSize,
      zIndex: '10000',
    } : {
      display: 'flex',
      position: 'absolute',
      top: `${band.top}px`,
      left: '0',
      width: '100%',
      ...layerSize,
      zIndex: settings.superchatOverlayDanmaku === false ? '4' : '5',
    });
  }

  render(payload) {
    const settings = this.getSettings();
    if (payload.superchat && shouldSuppressSubscribeSuperchat(settings, payload)) return;
    if (payload.superchat && settings.superchatPinned) {
      this.queueSuperchat(payload);
      return;
    }
    this.renderScrolling(payload);
  }

  buildSuperchatMetaRow(meta, options = {}) {
    const badgeBeforeAmount = !!options.badgeBeforeAmount;
    const metaRow = document.createElement('div');
    metaRow.className = 'tbc-sc-meta';
    if (!meta) return metaRow;

    if (meta.kind === 'cheer' && meta.bits) {
      const amount = document.createElement('span');
      amount.className = 'tbc-sc-amount';
      amount.textContent = meta.amountLabel || `${meta.bits} Bits`;
      const tierText = meta.tierLabel || cheerTierBadgeLabel(meta.bits);
      const tier = tierText ? document.createElement('span') : null;
      if (tier) {
        tier.className = 'tbc-sc-badge tbc-sc-tier';
        tier.textContent = tierText;
      }
      if (badgeBeforeAmount && tier) {
        metaRow.append(tier, amount);
      } else if (tier) {
        metaRow.append(amount, tier);
      } else {
        metaRow.appendChild(amount);
      }
    } else if (meta.amountLabel) {
      const badge = document.createElement('span');
      badge.className = 'tbc-sc-badge';
      badge.textContent = meta.amountLabel;
      metaRow.appendChild(badge);
    }
    return metaRow;
  }

  queueSuperchat(payload) {
    if (!this.superchatLayer || !this.getSettings().enabled) return;
    this.pinnedItems = this.pinnedItems.filter((item) => item?.isConnected);
    if (this.pinnedItems.length >= this.maxPinned) {
      this.superchatQueue.push(payload);
      if (this.superchatQueue.length > this.maxPinned * 2) this.superchatQueue.shift();
      return;
    }
    this.mountSuperchat(payload);
  }

  truncateName(name, max = 12) {
    const text = String(name || '').trim();
    if (text.length <= max) return text;
    return `${text.slice(0, Math.max(1, max - 1))}…`;
  }

  mountSuperchat(payload) {
    const {
      username,
      message,
      parts,
      usernameColor,
      profileUrl,
      originalMessage,
      translated,
      superchatStyle,
      superchatMeta,
      avatarUrl,
      login,
    } = payload;
    const settings = this.getSettings();
    const hasEmote = Array.isArray(parts) && parts.some((part) => part.type === 'emote' && part.src);
    if (!this.superchatLayer || (!message && !hasEmote)) return;

    const animation = ['fade', 'slide', 'pop', 'shine'].includes(settings.superchatAnimation)
      ? settings.superchatAnimation
      : 'slide';
    const meta = superchatMeta || null;
    const duration = resolveSuperchatDuration(settings, meta);
    const compact = !!settings.superchatCompact;
    const maxWidth = clamp(Number(settings.superchatMaxWidth) || 420, 240, 720);
    const style = meta?.style || superchatStyle || {
      background: 'linear-gradient(135deg, #9147ff 0%, #772ce8 100%)',
      color: '#ffffff',
      accent: '#bf94ff',
    };
    const item = document.createElement('div');
    item.className = `tbc-superchat-item tbc-sc-${animation}${compact ? ' tbc-sc-compact' : ''}`;
    item.style.setProperty('--tbc-sc-duration', `${duration}s`);
    item.style.maxWidth = `min(${maxWidth}px, calc(100% - 24px))`;
    if (compact) item.style.minWidth = 'unset';
    item.style.setProperty('--tbc-sc-accent', safeCssColor(style.accent, '#bf94ff'));
    item.style.background = style.background || safeCssColor(style.background, '#9147ff');
    item.style.color = safeCssColor(style.color, '#ffffff');
    const baseFont = Math.max(14, settings.fontSize - 2);
    item.style.fontSize = compact
      ? `${Math.max(12, settings.fontSize - 5)}px`
      : `${baseFont}px`;
    item.style.fontFamily = settings.fontFamily;

    const avatar = document.createElement('img');
    avatar.className = 'tbc-sc-avatar';
    avatar.alt = '';
    avatar.draggable = false;
    avatar.src = avatarUrl || cachedAvatar(login || username, username, usernameColor);

    let main = null;
    let body = null;
    let track = null;

    if (compact) {
      const compactMain = document.createElement('div');
      compactMain.className = 'tbc-sc-compact-main';
      const nameEl = document.createElement('span');
      nameEl.className = 'tbc-sc-compact-name';
      const displayName = username || login || 'User';
      nameEl.textContent = this.truncateName(displayName, 10);
      nameEl.title = displayName;
      const metaRow = this.buildSuperchatMetaRow(meta, { badgeBeforeAmount: true });
      compactMain.append(nameEl, metaRow);
      item.append(avatar, compactMain);
    } else {
      const metaRow = this.buildSuperchatMetaRow(meta);
      main = document.createElement('div');
      main.className = 'tbc-sc-main';

      const head = document.createElement('div');
      head.className = 'tbc-sc-head';
      const nameEl = document.createElement('span');
      nameEl.className = 'tbc-sc-name';
      const displayName = username || login || 'User';
      nameEl.textContent = this.truncateName(displayName, 18);
      nameEl.title = displayName;
      head.appendChild(nameEl);
      if (metaRow.childElementCount) head.appendChild(metaRow);

      body = document.createElement('div');
      body.className = 'tbc-sc-body';
      track = document.createElement('div');
      track.className = 'tbc-sc-body-track';
      this.appendParts(track, parts?.length ? parts : [{ type: 'text', value: message }]);
      body.appendChild(track);
      main.append(head, body);
      item.append(avatar, main);
    }

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'tbc-sc-close';
    closeBtn.setAttribute('aria-label', t('superchatClose'));
    closeBtn.innerHTML = ICON_CLOSE;

    item.appendChild(closeBtn);
    item._tbcPayload = payload;
    this.superchatLayer.appendChild(item);
    this.pinnedItems.push(item);
    this.updateLayout();
    requestAnimationFrame(() => this.updateLayout());
    if (!compact && body && track) {
      requestAnimationFrame(() => this.armSuperchatMarquee(body, track));
    }
    if (!compact) requestSpeech(speechSourceText(message, parts));

    const loginKey = String(login || username || '').toLowerCase().replace(/^@+/, '');
    // Always resolve a real profile image via ViewerCard when possible (letter avatars are fallback only).
    if (loginKey && (!avatarUrl || String(avatarUrl).startsWith('data:'))) {
      fetchTwitchAvatar(loginKey).then((url) => {
        if (!url || !item.isConnected) return;
        avatar.src = url;
      });
    }

    let fallback = null;
    const armFallback = (ms) => {
      clearTimeout(fallback);
      fallback = setTimeout(() => this.finishSuperchat(item), ms);
    };
    armFallback((duration + 2) * 1000);
    item.addEventListener('animationend', (event) => {
      if (event.target !== item) return;
      if (/shine-sweep|marquee/i.test(event.animationName || '')) return;
      clearTimeout(fallback);
      this.finishSuperchat(item);
    });

    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      clearTimeout(fallback);
      if (typeof hideDanmakuTooltip === 'function' && activeTooltipItem === item) {
        hideDanmakuTooltip();
      }
      this.finishSuperchat(item);
    });

    const pausePin = () => clearTimeout(fallback);
    const resumePin = () => armFallback(20000);

    if (compact) {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.tbc-sc-close')) return;
        e.preventDefault();
        e.stopPropagation();
        pausePin();
        item.classList.add('tbc-paused');
        const mount = getDanmakuMount(item) || this.overlayEl || this.playerEl;
        openSuperchatDetailCard(mount, payload, {
          ...this._superchatHelpers(),
          onDismiss: () => {
            item.classList.remove('tbc-paused');
            resumePin();
          },
        });
      });
    } else {
      attachDanmakuInteraction(item, {
        username,
        usernameColor,
        profileUrl,
        originalMessage,
        translated,
        onPause: pausePin,
        onResume: resumePin,
      });
    }
  }

  armSuperchatMarquee(body, track) {
    if (!body || !track) return;
    const overflow = track.scrollWidth - body.clientWidth;
    if (overflow <= 8) return;
    track.classList.add('tbc-sc-marquee');
    track.style.setProperty('--tbc-sc-marquee-distance', `${overflow + 16}px`);
    track.style.setProperty('--tbc-sc-marquee-duration', `${Math.max(4, overflow / 28)}s`);
  }

  finishSuperchat(item) {
    if (!item) return;
    const index = this.pinnedItems.indexOf(item);
    if (index >= 0) this.pinnedItems.splice(index, 1);
    item.remove();
    while (this.pinnedItems.length < this.maxPinned) {
      const next = this.superchatQueue.shift();
      if (!next || !this.getSettings().superchatPinned || !this.getSettings().enabled) break;
      this.mountSuperchat(next);
    }
    this.updateLayout();
  }

  appendParts(item, parts) {
    for (const part of parts) {
      if (part.type === 'emote' && part.src) {
        const img = document.createElement('img');
        img.className = 'tbc-emote';
        img.src = part.src;
        img.alt = part.name || '';
        img.title = part.name || '';
        img.draggable = false;
        item.appendChild(img);
        continue;
      }

      const text = part.type === 'emote' ? (part.name || '') : (part.value || '');
      if (text) item.appendChild(document.createTextNode(text));
    }
  }

  renderScrolling(payload) {
    const {
      username,
      message,
      parts,
      usernameColor,
      profileUrl,
      originalMessage,
      translated,
    } = payload || {};
    const settings = this.getSettings();
    const displayParts = parts?.length
      ? parts
      : (message ? [{ type: 'text', value: message }] : []);
    if (!settings.enabled || !displayParts.length) return;

    if (typeof this.onComment === 'function') {
      try {
        this.onComment(payload);
      } catch (error) {
        console.error('[TBC] PiP danmaku failed:', error);
      }
    }

    if (!this.layer) return;

    const layerWidth = this.layer.clientWidth || 800;
    const speed = clamp(settings.speed, 1, 10);
    const baseDuration = 30000;
    const laneHeight = settings.fontSize + 6;

    const item = document.createElement('div');
    item.className = 'tbc-danmaku-item';
    this.appendParts(item, displayParts);
    item.style.cssText = `
      top: 0;
      color: ${usernameColor || '#efeff1'};
      font-size: ${settings.fontSize}px;
      font-family: ${settings.fontFamily};
      visibility: hidden;
      animation: none;
    `;

    this.layer.appendChild(item);
    const itemWidth = item.offsetWidth;
    const travel = layerWidth + itemWidth;
    const durationMs = Math.round((travel / layerWidth) * (baseDuration / speed));
    const lane = this.laneManager.acquire(durationMs);
    const top = lane * laneHeight;

    item.style.top = `${top}px`;
    item.style.visibility = '';
    item.style.setProperty('--tbc-travel', `${travel}px`);
    item.style.setProperty('--tbc-start', '0px');
    item.style.setProperty('--tbc-duration', `${durationMs}ms`);
    void item.offsetWidth;
    item.style.animation = '';

    const startAt = Date.now();
    let pausedAt = 0;
    let totalPaused = 0;
    let removeTimer = null;

    const scheduleRemove = (remainingMs = durationMs) => {
      const elapsed = Date.now() - startAt - totalPaused;
      const remaining = remainingMs ?? Math.max(0, durationMs - elapsed);
      clearTimeout(removeTimer);
      removeTimer = setTimeout(() => item.remove(), remaining + 500);
    };

    item._tbcClearRemoveTimer = () => clearTimeout(removeTimer);
    item._tbcScheduleRemove = scheduleRemove;

    const onPause = () => {
      pausedAt = Date.now();
      clearTimeout(removeTimer);
    };

    const onResume = () => {
      if (pausedAt) {
        totalPaused += Date.now() - pausedAt;
        pausedAt = 0;
      }
      scheduleRemove();
    };

    attachDanmakuInteraction(item, {
      username,
      usernameColor,
      profileUrl,
      originalMessage,
      translated,
      onPause,
      onResume,
    });
    requestSpeech(speechSourceText(message, parts));
    scheduleRemove();

    item.addEventListener('animationend', () => {
      clearTimeout(removeTimer);
      item.remove();
    }, { once: true });
  }
}

const MAX_DANMAKU_PAUSE_MS = 15000;
const RESUME_DELAY_MS = 300;

let activeTooltip = null;
let activeTooltipItem = null;
let hoverPausedItem = null;
let clickLockBackdrop = null;
let tooltipRepositionHandler = null;
let tooltipDismissBound = false;

function removeClickLockBackdrop() {
  clickLockBackdrop?.remove();
  clickLockBackdrop = null;
}

function showClickLockBackdrop(mount) {
  removeClickLockBackdrop();
  if (!mount) return;

  if (getComputedStyle(mount).position === 'static') {
    mount.style.position = 'relative';
  }

  clickLockBackdrop = document.createElement('div');
  clickLockBackdrop.className = 'tbc-click-lock-backdrop';
  clickLockBackdrop.addEventListener('pointerdown', (e) => {
    const otherDanmaku = document.elementsFromPoint(e.clientX, e.clientY)
      .find((el) => (el.classList?.contains('tbc-danmaku-item') || el.classList?.contains('tbc-superchat-item')) && el !== activeTooltipItem);

    hideDanmakuTooltip();

    if (otherDanmaku) {
      requestAnimationFrame(() => {
        otherDanmaku.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      });
    }
  }, true);

  mount.appendChild(clickLockBackdrop);
}

function hideDanmakuTooltip() {
  if (tooltipRepositionHandler) {
    window.removeEventListener('resize', tooltipRepositionHandler);
    document.removeEventListener('fullscreenchange', tooltipRepositionHandler);
    document.removeEventListener('webkitfullscreenchange', tooltipRepositionHandler);
    tooltipRepositionHandler = null;
  }

  removeClickLockBackdrop();

  const resumeFn = activeTooltipItem?._tbcResume;
  activeTooltipItem?.classList.remove('tbc-click-locked');
  activeTooltip?.remove();
  activeTooltip = null;
  activeTooltipItem = null;
  resumeFn?.();
}

function ensureTooltipDismissListener() {
  if (tooltipDismissBound) return;
  tooltipDismissBound = true;
  document.addEventListener('pointerdown', (e) => {
    if (!activeTooltip) return;
    if (activeTooltip.contains(e.target)) return;
    if (e.target.closest('.tbc-danmaku-item, .tbc-superchat-item') === activeTooltipItem) return;
    if (clickLockBackdrop?.contains(e.target)) return;
    hideDanmakuTooltip();
  }, true);
}

function positionDanmakuTooltip(item, tooltip, mount) {
  if (!mount) return;

  const margin = 8;
  const gap = 6;
  const bounds = mount.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();
  const tipRect = tooltip.getBoundingClientRect();
  const tipHeight = tipRect.height;
  const tipWidth = tipRect.width;

  const spaceAbove = itemRect.top - bounds.top - margin;
  const spaceBelow = bounds.bottom - itemRect.bottom - margin;
  const needed = tipHeight + gap;

  let placement = 'above';
  if (spaceAbove < needed && spaceBelow >= needed) {
    placement = 'below';
  } else if (spaceAbove < needed && spaceBelow < needed) {
    placement = spaceBelow > spaceAbove ? 'below' : 'above';
  }

  tooltip.classList.toggle('tbc-danmaku-tooltip--above', placement === 'above');
  tooltip.classList.toggle('tbc-danmaku-tooltip--below', placement === 'below');

  let left = itemRect.left - bounds.left + itemRect.width / 2 - tipWidth / 2;
  left = clamp(left, margin, Math.max(margin, bounds.width - tipRect.width - margin));

  let top;
  if (placement === 'below') {
    top = itemRect.bottom - bounds.top + gap;
  } else {
    top = itemRect.top - bounds.top - tipHeight - gap;
  }

  Object.assign(tooltip.style, {
    position: 'absolute',
    left: `${left}px`,
    top: `${top}px`,
    zIndex: '100001',
  });
}

function bindTooltipReposition(item, tooltip, mount) {
  tooltipRepositionHandler = () => positionDanmakuTooltip(item, tooltip, mount);
  window.addEventListener('resize', tooltipRepositionHandler);
  document.addEventListener('fullscreenchange', tooltipRepositionHandler);
  document.addEventListener('webkitfullscreenchange', tooltipRepositionHandler);
}

function attachDanmakuInteraction(item, {
  username, usernameColor, profileUrl, originalMessage, translated, onPause, onResume,
}) {
  let hoverResumeTimer = null;
  let maxPauseTimer = null;
  let pauseReason = null;

  const clearHoverResumeTimer = () => {
    clearTimeout(hoverResumeTimer);
    hoverResumeTimer = null;
  };

  const clearMaxPauseTimer = () => {
    clearTimeout(maxPauseTimer);
    maxPauseTimer = null;
  };

  const armMaxPauseTimer = () => {
    clearMaxPauseTimer();
    maxPauseTimer = setTimeout(() => {
      if (item.classList.contains('tbc-paused')) doResume();
    }, MAX_DANMAKU_PAUSE_MS);
  };

  const doResume = () => {
    clearHoverResumeTimer();
    clearMaxPauseTimer();
    if (!item.classList.contains('tbc-paused')) {
      pauseReason = null;
      item.classList.remove('tbc-click-locked');
      return;
    }

    pauseReason = null;
    item.classList.remove('tbc-paused', 'tbc-click-locked');
    if (hoverPausedItem === item) hoverPausedItem = null;
    if (activeTooltipItem === item) {
      removeClickLockBackdrop();
      activeTooltip?.remove();
      activeTooltip = null;
      activeTooltipItem = null;
    }
    onResume?.();
  };

  item._tbcResume = () => doResume();

  item._tbcResumeHover = () => {
    if (pauseReason !== 'hover') return;
    doResume();
  };

  const scheduleHoverResume = () => {
    if (pauseReason === 'click') return;
    clearHoverResumeTimer();
    hoverResumeTimer = setTimeout(() => {
      if (pauseReason === 'hover') doResume();
    }, RESUME_DELAY_MS);
  };

  const pauseForHover = () => {
    if (activeTooltipItem) return;
    if (pauseReason === 'click') return;

    clearHoverResumeTimer();

    if (hoverPausedItem && hoverPausedItem !== item) {
      hoverPausedItem._tbcResumeHover?.();
    }
    hoverPausedItem = item;

    if (!item.classList.contains('tbc-paused')) {
      pauseReason = 'hover';
      item.classList.add('tbc-paused');
      onPause?.();
    } else if (pauseReason !== 'hover') {
      pauseReason = 'hover';
    }

    armMaxPauseTimer();
  };

  const pauseForClick = () => {
    clearHoverResumeTimer();

    if (hoverPausedItem && hoverPausedItem !== item) {
      hoverPausedItem._tbcResumeHover?.();
    }
    hoverPausedItem = null;

    pauseReason = 'click';
    item.classList.add('tbc-click-locked');
    if (!item.classList.contains('tbc-paused')) {
      item.classList.add('tbc-paused');
      onPause?.();
    }

    armMaxPauseTimer();
  };

  const showTooltip = () => {
    const messageText = originalMessage || item.textContent;
    const showOriginal = translated && originalMessage && originalMessage !== item.textContent;
    if (!username && !showOriginal && !messageText) return;

    ensureTooltipDismissListener();
    hideDanmakuTooltip();
    pauseForClick();

    item.dataset.tbcId = item.dataset.tbcId || String(Date.now() + Math.random());

    const mount = getDanmakuMount(item);
    if (!mount) {
      doResume();
      return;
    }

    showClickLockBackdrop(mount);

    const tooltip = document.createElement('div');
    tooltip.className = 'tbc-danmaku-tooltip tbc-danmaku-tooltip--above';
    tooltip.dataset.itemId = item.dataset.tbcId;

    const bubble = document.createElement('div');
    bubble.className = 'tbc-danmaku-tooltip-bubble';

    const header = document.createElement('div');
    header.className = 'tbc-danmaku-tooltip-header';

    if (username) {
      const nameRow = document.createElement('a');
      nameRow.className = 'tbc-danmaku-tooltip-name';
      nameRow.href = profileUrl || `https://www.twitch.tv/${encodeURIComponent(username.toLowerCase())}`;
      nameRow.target = '_blank';
      nameRow.rel = 'noopener noreferrer';
      nameRow.setAttribute('aria-label', t('tooltipOpenProfile'));
      nameRow.style.color = usernameColor || '#a970ff';
      nameRow.textContent = username;
      nameRow.addEventListener('click', (e) => e.stopPropagation());
      header.appendChild(nameRow);
    } else {
      header.classList.add('tbc-danmaku-tooltip-header--solo');
    }

    if (messageText) {
      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'tbc-danmaku-tooltip-copy';
      copyBtn.setAttribute('aria-label', t('tooltipCopy'));
      copyBtn.innerHTML = ICON_COPY;
      copyBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await setChatInputText(messageText);
        hideDanmakuTooltip();
      });
      header.appendChild(copyBtn);
    }

    bubble.appendChild(header);

    if (showOriginal) {
      const originalRow = document.createElement('div');
      originalRow.className = 'tbc-danmaku-tooltip-original';
      originalRow.textContent = truncateText(originalMessage);
      bubble.appendChild(originalRow);
    }

    const tail = document.createElement('div');
    tail.className = 'tbc-danmaku-tooltip-tail';

    tooltip.append(bubble, tail);
    tooltip.addEventListener('click', (e) => e.stopPropagation());

    mount.appendChild(tooltip);
    positionDanmakuTooltip(item, tooltip, mount);
    bindTooltipReposition(item, tooltip, mount);
    activeTooltip = tooltip;
    activeTooltipItem = item;

    requestAnimationFrame(() => {
      if (activeTooltip === tooltip) positionDanmakuTooltip(item, tooltip, mount);
    });
  };

  item.addEventListener('mouseenter', () => {
    pauseForHover();
  });

  item.addEventListener('mouseleave', () => {
    if (pauseReason === 'click') return;
    scheduleHoverResume();
  });

  item.addEventListener('click', (e) => {
    e.stopPropagation();
    showTooltip();
  });

  item.addEventListener('animationend', () => {
    clearHoverResumeTimer();
    clearMaxPauseTimer();
    if (activeTooltipItem === item) hideDanmakuTooltip();
  }, { once: true });
}

class DanmakuEmitter {
  constructor(engine, getSettings, isActive) {
    this.engine = engine;
    this.getSettings = getSettings;
    this.isActive = isActive;
    this.queue = [];
    this.timer = null;
  }

  enqueue(payload) {
    if (!this.isActive()) return;

    if (this.queue.length >= MAX_DANMAKU_QUEUE) {
      this.queue.shift();
    }
    this.queue.push(payload);
    this.schedule();
  }

  clear() {
    this.queue = [];
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  schedule() {
    if (this.timer || !this.isActive()) return;

    const speed = clamp(this.getSettings().speed, 1, 10);
    const intervalMs = Math.max(120, Math.round(550 / speed));

    this.timer = setTimeout(() => {
      this.timer = null;
      const item = this.queue.shift();
      if (item) this.engine.render(item);
      if (this.queue.length && this.isActive()) this.schedule();
    }, intervalMs);
  }
}

function dictEntry(zhCN, zhTW, en) {
  return { 'zh-CN': zhCN, 'zh-TW': zhTW, en };
}

// Case-sensitive keys — emotes and slang must match exact casing.
const TWITCH_DICTIONARY = {
  PogChamp: dictEntry('（神操作）', '（神操作）', 'PogChamp'),
  PepeHands: dictEntry('（哭哭）', '（哭哭）', 'PepeHands'),
  OMEGALUL: dictEntry('（笑死）', '（笑死）', 'OMEGALUL'),
  PepeLaugh: dictEntry('（大笑）', '（大笑）', 'PepeLaugh'),
  PauseChamp: dictEntry('（等等）', '（等等）', 'PauseChamp'),
  monkaS: dictEntry('（紧张）', '（緊張）', 'monkaS'),
  monkaW: dictEntry('（紧张）', '（緊張）', 'monkaW'),
  KEKW: dictEntry('（爆笑）', '（爆笑）', 'KEKW'),
  LULW: dictEntry('（笑）', '（笑）', 'LULW'),
  LUL: dictEntry('（笑）', '（笑）', 'LUL'),
  Sadge: dictEntry('（难受）', '（難受）', 'Sadge'),
  Pepega: dictEntry('（有点蠢）', '（有點蠢）', 'Pepega'),
  Kappa: dictEntry('（反讽）', '（反諷）', 'Kappa'),
  Copium: dictEntry('自我安慰', '自我安慰', 'Copium'),
  Hopium: dictEntry('抱有幻想', '抱有幻想', 'Hopium'),
  Based: dictEntry('真敢说', '真敢說', 'Based'),
  Cringe: dictEntry('尴尬', '尷尬', 'Cringe'),
  PogU: dictEntry('（太神了）', '（太神了）', 'PogU'),
  Pog: dictEntry('（太神了）', '（太神了）', 'Pog'),
  EZ: dictEntry('轻松', '輕鬆', 'EZ'),
  Clap: dictEntry('（鼓掌）', '（鼓掌）', 'Clap'),
  NPC: dictEntry('工具人', '工具人', 'NPC'),
  ICANT: dictEntry('笑不活了', '笑翻了', 'ICANT'),
  W: dictEntry('神', '神', 'W'),
  L: dictEntry('拉胯', '拉胯', 'L'),
  F: dictEntry('F', 'F', 'F'),
  o7: dictEntry('o7', 'o7', 'o7'),
  lol: dictEntry('哈哈', '哈哈', 'lol'),
  LMFAO: dictEntry('笑死我了', '笑死我了', 'LMFAO'),
  lmao: dictEntry('笑死我了', '笑死我了', 'lmao'),
  lmfao: dictEntry('笑死我了', '笑死我了', 'lmfao'),
  rofl: dictEntry('笑翻', '笑翻', 'rofl'),
  kek: dictEntry('笑', '笑', 'kek'),
  gg: dictEntry('GG', 'GG', 'gg'),
  ggs: dictEntry('GG', 'GG', 'ggs'),
  wp: dictEntry('打得不错', '打得不错', 'wp'),
  gl: dictEntry('祝好运', '祝好運', 'gl'),
  hf: dictEntry('玩得开心', '玩得開心', 'hf'),
  nt: dictEntry('好尝试', '好嘗試', 'nt'),
  ns: dictEntry('好枪', '好槍', 'ns'),
  brb: dictEntry('马上回来', '馬上回來', 'brb'),
  afk: dictEntry('离开了', '離開了', 'afk'),
  bbl: dictEntry('待会儿回来', '待會兒回來', 'bbl'),
  gtg: dictEntry('得走了', '得走了', 'gtg'),
  ty: dictEntry('谢谢', '謝謝', 'ty'),
  thx: dictEntry('谢谢', '謝謝', 'thx'),
  np: dictEntry('不客气', '不客氣', 'np'),
  nw: dictEntry('不客气', '不客氣', 'nw'),
  imo: dictEntry('我觉得', '我覺得', 'imo'),
  imho: dictEntry('依我看', '依我看', 'imho'),
  tbh: dictEntry('老实说', '老實說', 'tbh'),
  ngl: dictEntry('说实话', '說實話', 'ngl'),
  rn: dictEntry('现在', '現在', 'rn'),
  idk: dictEntry('不知道', '不知道', 'idk'),
  ikr: dictEntry('确实', '確實', 'ikr'),
  smh: dictEntry('无语', '無語', 'smh'),
  omg: dictEntry('天呐', '天呐', 'omg'),
  omfg: dictEntry('我的天', '我的天', 'omfg'),
  wtf: dictEntry('什么鬼', '什麼鬼', 'wtf'),
  rip: dictEntry('RIP', 'RIP', 'rip'),
  ez: dictEntry('轻松', '輕鬆', 'ez'),
  diff: dictEntry('差距', '差距', 'diff'),
  www: dictEntry('笑死', '笑死', 'www'),
  stream: dictEntry('直播', '直播', 'stream'),
};

const PLACEHOLDER_PREFIX = '⟦T';
const PLACEHOLDER_SUFFIX = '⟧';

let dictionaryPattern = null;

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getDictionaryPattern() {
  if (dictionaryPattern) return dictionaryPattern;

  const keys = Object.keys(TWITCH_DICTIONARY).sort((a, b) => b.length - a.length);
  const body = keys.map(escapeRegExp).join('|');
  dictionaryPattern = new RegExp(`(?<![\\w])(${body})(?![\\w])`, 'g');
  return dictionaryPattern;
}

function lookupDictionary(term, targetLang) {
  const entry = TWITCH_DICTIONARY[term];
  if (!entry) return null;
  return entry[targetLang] || entry.en || term;
}

function collectDictionaryMatches(text) {
  const pattern = getDictionaryPattern();
  const matches = [];
  let match;

  pattern.lastIndex = 0;
  while ((match = pattern.exec(text)) !== null) {
    matches.push({
      start: match.index,
      end: match.index + match[0].length,
      term: match[1],
    });
  }

  if (matches.length === 0) return [];

  matches.sort((a, b) => a.start - b.start || b.end - a.end);

  const selected = [];
  let cursor = 0;
  for (const item of matches) {
    if (item.start < cursor) continue;
    selected.push(item);
    cursor = item.end;
  }
  return selected;
}

function prepareDictionaryText(text, targetLang) {
  const matches = collectDictionaryMatches(text);
  if (matches.length === 0) {
    return { preparedText: text, placeholders: [], fullyMapped: false };
  }

  const placeholders = [];
  let preparedText = '';
  let cursor = 0;

  for (let i = 0; i < matches.length; i += 1) {
    const { start, end, term } = matches[i];
    preparedText += text.slice(cursor, start);

    const token = `${PLACEHOLDER_PREFIX}${i}${PLACEHOLDER_SUFFIX}`;
    const replacement = lookupDictionary(term, targetLang) || term;
    placeholders.push({ token, replacement });
    preparedText += token;
    cursor = end;
  }

  preparedText += text.slice(cursor);

  const withoutPlaceholders = preparedText.replace(
    new RegExp(`${escapeRegExp(PLACEHOLDER_PREFIX)}\\d+${escapeRegExp(PLACEHOLDER_SUFFIX)}`, 'g'),
    '',
  );

  const fullyMapped = matches.length > 0 && !withoutPlaceholders.trim();

  return { preparedText, placeholders, fullyMapped };
}

function restoreDictionaryText(text, placeholders) {
  if (!text || placeholders.length === 0) return text;

  let restored = text;
  for (const { token, replacement } of placeholders) {
    restored = restored.split(token).join(replacement);
  }
  return restored;
}

const MS_LANG_MAP = {
  'zh-CN': 'zh-Hans',
  'zh-TW': 'zh-Hant',
  en: 'en',
  ja: 'ja',
  ko: 'ko',
  es: 'es',
  fr: 'fr',
  de: 'de',
  ru: 'ru',
  pt: 'pt',
};

const TENCENT_LANG_MAP = {
  'zh-CN': 'zh',
  'zh-TW': 'zh-TW',
  en: 'en',
  ja: 'ja',
  ko: 'ko',
  es: 'es',
  fr: 'fr',
  de: 'de',
  ru: 'ru',
  pt: 'pt',
};

const TRANSLATE_TIMEOUT_MS = 8000;
const TRANSLATE_MAX_BATCH = 10;
const TRANSLATE_MAX_BATCH_CHARS = 1600;
const PROVIDER_GAP_MS = 1000;
const PRIMARY_PROVIDERS = ['microsoft', 'google'];
const ALL_PROVIDERS = ['microsoft', 'google', 'volcengine', 'caiyun', 'tencent'];
const MAX_PROVIDER_ATTEMPTS = 2;
const HARD_COOLDOWNS_MS = [5000, 15000, 40000, 60000];
const SOFT_COOLDOWNS_MS = [2000, 5000, 15000, 30000];
const TRANSLATION_CACHE_LIMIT = 200;
const TRANSLATION_CACHE_TTL_MS = 10 * 60 * 1000;

const VOLC_LANG_MAP = {
  'zh-CN': 'zh',
  'zh-TW': 'zh-Hant',
  en: 'en',
  ja: 'ja',
  ko: 'ko',
  es: 'es',
  fr: 'fr',
  de: 'de',
  ru: 'ru',
  pt: 'pt',
};

const CAIYUN_LANG_MAP = {
  'zh-CN': 'auto2zh',
  'zh-TW': 'auto2zh-Hant',
  en: 'auto2en',
  ja: 'auto2ja',
  ko: 'auto2ko',
  es: 'auto2es',
  fr: 'auto2fr',
  de: 'auto2de',
  ru: 'auto2ru',
  pt: 'auto2pt',
};

const CAIYUN_TOKEN = '3975l6lr5pcbvidl6jl2';

const translationCache = new Map();
const providerState = {};
const unsupportedTargets = new Set();
const disabledProviders = new Set();

let msAuthCache = { token: '', expiresAt: 0, inflight: null };
let tencentClientKey = '';
let primaryCursor = 0;

for (const id of ALL_PROVIDERS) {
  providerState[id] = { nextAt: 0, cooldownUntil: 0, failures: 0 };
}

function translationCacheKey(text, targetLang) {
  return `${targetLang}\n${text}`;
}

function getCachedTranslation(text, targetLang) {
  const key = translationCacheKey(text, targetLang);
  const hit = translationCache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > TRANSLATION_CACHE_TTL_MS) {
    translationCache.delete(key);
    return null;
  }
  translationCache.delete(key);
  translationCache.set(key, hit);
  return hit.value;
}

function setCachedTranslation(text, targetLang, value) {
  if (!value) return;
  const key = translationCacheKey(text, targetLang);
  if (translationCache.has(key)) translationCache.delete(key);
  translationCache.set(key, { value, at: Date.now() });
  while (translationCache.size > TRANSLATION_CACHE_LIMIT) {
    const oldest = translationCache.keys().next().value;
    translationCache.delete(oldest);
  }
}

function forgetCachedTranslation(text, targetLang) {
  translationCache.delete(translationCacheKey(text, targetLang));
}

function gmRequest(options) {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      timeout: TRANSLATE_TIMEOUT_MS,
      ...options,
      onload: (res) => resolve(res),
      onerror: () => reject(new Error('network error')),
      ontimeout: () => reject(new Error('timeout')),
    });
  });
}

function isRateLimited(res) {
  const status = Number(res?.status) || 0;
  if (status === 429 || status === 403 || status === 503) return true;
  const body = String(res?.responseText || '');
  return /<\s*html/i.test(body) && /sorry|too many|rate limit|quota/i.test(body);
}

function parseJwtExp(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.exp * 1000;
  } catch {
    return Date.now() + 9 * 60 * 1000;
  }
}

function toMicrosoftLang(code) {
  return MS_LANG_MAP[code] || code;
}

function getTencentClientKey() {
  if (!tencentClientKey) {
    const uuid = crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    tencentClientKey = `browser-chrome-122.0.0-Windows_10-${uuid}`;
  }
  return tencentClientKey;
}

function detectScript(text) {
  if (/\p{Script=Hangul}/u.test(text)) return 'ko';
  if (/[\u3040-\u30ff]/.test(text)) return 'ja';
  if (/\p{Script=Cyrillic}/u.test(text)) return 'ru';
  if (/\p{Script=Han}/u.test(text)) return 'zh';
  if (/\p{Script=Arabic}/u.test(text)) return 'ar';
  return 'latin';
}

async function getMicrosoftAuthToken() {
  const now = Date.now();
  if (msAuthCache.token && msAuthCache.expiresAt > now + 30000) {
    return msAuthCache.token;
  }

  if (msAuthCache.inflight) return msAuthCache.inflight;

  msAuthCache.inflight = (async () => {
    try {
      const res = await gmRequest({
        method: 'GET',
        url: 'https://edge.microsoft.com/translate/auth',
      });
      if (isRateLimited(res)) {
        const error = new Error('auth rate limited');
        error.rateLimited = true;
        throw error;
      }
      const token = res.responseText?.trim();
      if (!res.status || res.status >= 400 || !token) throw new Error('empty auth token');
      msAuthCache.token = token;
      msAuthCache.expiresAt = parseJwtExp(token);
      return token;
    } finally {
      msAuthCache.inflight = null;
    }
  })();

  return msAuthCache.inflight;
}

async function microsoftRequest(texts, targetLang) {
  const token = await getMicrosoftAuthToken();
  const url = `https://api-edge.cognitive.microsofttranslator.com/translate?api-version=3.0&to=${encodeURIComponent(targetLang)}`;
  const res = await gmRequest({
    method: 'POST',
    url,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: JSON.stringify(texts.map((text) => ({ Text: text }))),
  });

  if (res?.status === 401) return { ok: false, unauthorized: true, rateLimited: false };
  if (isRateLimited(res)) return { ok: false, rateLimited: true };
  if (!res || res.status !== 200) return { ok: false, rateLimited: false };

  const json = JSON.parse(res.responseText);
  if (!Array.isArray(json) || json.length !== texts.length) {
    return { ok: false, rateLimited: false };
  }

  return {
    ok: true,
    texts: json.map((item) => item?.translations?.[0]?.text || ''),
  };
}

async function microsoftTranslate(texts, targetLang) {
  const to = toMicrosoftLang(targetLang);
  let result = await microsoftRequest(texts, to);
  if (result.unauthorized) {
    msAuthCache.token = '';
    msAuthCache.expiresAt = 0;
    result = await microsoftRequest(texts, to);
  }
  if (result.unauthorized) return { ok: false, rateLimited: false };
  return result;
}

function parseGoogleBatch(json, count) {
  if (!Array.isArray(json) || json.length !== count) return null;
  const texts = [];
  for (const item of json) {
    if (typeof item === 'string') {
      texts.push(item);
      continue;
    }
    if (Array.isArray(item) && typeof item[0] === 'string') {
      texts.push(item[0]);
      continue;
    }
    return null;
  }
  return texts;
}

async function googleTranslate(texts, targetLang) {
  const query = texts.map((text) => `q=${encodeURIComponent(text)}`).join('&');
  const url = `https://translate.googleapis.com/translate_a/t?client=dict-chrome-ex&sl=auto&tl=${encodeURIComponent(targetLang)}&${query}`;
  const res = await gmRequest({ method: 'GET', url });

  if (isRateLimited(res)) return { ok: false, rateLimited: true };
  if (!res || res.status !== 200) return { ok: false, rateLimited: false };

  const json = JSON.parse(res.responseText);
  const parsed = parseGoogleBatch(json, texts.length);
  if (!parsed) return { ok: false, rateLimited: false };
  return { ok: true, texts: parsed };
}

async function tencentRequest(texts, targetLang) {
  const res = await gmRequest({
    method: 'POST',
    url: 'https://transmart.qq.com/api/imt',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://transmart.qq.com',
      Referer: 'https://transmart.qq.com/',
    },
    data: JSON.stringify({
      header: {
        fn: 'auto_translation',
        client_key: getTencentClientKey(),
      },
      type: 'plain',
      model_category: 'normal',
      source: {
        lang: 'auto',
        text_list: texts,
      },
      target: { lang: targetLang },
    }),
  });

  if (isRateLimited(res)) return { ok: false, rateLimited: true };
  if (!res || res.status !== 200) return { ok: false, rateLimited: false };

  const json = JSON.parse(res.responseText);
  const code = json?.header?.ret_code;
  if (code === 'succ' && Array.isArray(json.auto_translation) && json.auto_translation.length === texts.length) {
    return {
      ok: true,
      texts: json.auto_translation.map((item) => (item == null ? '' : String(item))),
    };
  }

  const message = String(json?.message || '');
  if (/unrecognized target language/i.test(message)) {
    return { ok: false, rateLimited: false, unsupported: true };
  }
  const rateLimited = code === 'Auth-Failed' || /frequent|limit|quota/i.test(message);
  return { ok: false, rateLimited };
}

async function tencentTranslate(texts, targetLang) {
  const to = TENCENT_LANG_MAP[targetLang];
  if (!to) return { ok: false, rateLimited: false, unsupported: true };
  if (unsupportedTargets.has(`tencent:${targetLang}`)) {
    return { ok: false, rateLimited: false, unsupported: true };
  }

  const buckets = new Map();
  texts.forEach((text, index) => {
    const script = detectScript(text);
    if (!buckets.has(script)) buckets.set(script, []);
    buckets.get(script).push({ text, index });
  });

  const output = texts.map(() => '');
  let translated = 0;

  for (const items of buckets.values()) {
    const result = await tencentRequest(items.map((item) => item.text), to);
    if (result.unsupported) unsupportedTargets.add(`tencent:${targetLang}`);
    if (!result.ok) {
      if (!translated) return result;
      break;
    }
    result.texts.forEach((value, index) => {
      output[items[index].index] = value;
      if (value && value.trim()) translated += 1;
    });
  }

  if (!translated) return { ok: false, rateLimited: false };
  return { ok: true, texts: output };
}

async function volcengineRequest(texts, targetLang) {
  const res = await gmRequest({
    method: 'POST',
    url: 'https://translate.volcengine.com/crx/translate/v1/',
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify({
      target_language: targetLang,
      text: texts.map((text) => text.replace(/\r?\n/g, ' ')).join('\n'),
    }),
  });

  if (isRateLimited(res)) return { ok: false, rateLimited: true };
  if (!res || res.status !== 200) return { ok: false, rateLimited: false };

  const json = JSON.parse(res.responseText);
  if (json?.base_resp && Number(json.base_resp.status_code) !== 0) {
    const detail = `${json.base_resp.status_message || ''}`;
    return { ok: false, rateLimited: /limit|quota|frequent/i.test(detail) };
  }

  const parts = String(json?.translation ?? '').split('\n');
  if (parts.length !== texts.length) return { ok: false, rateLimited: false };
  return { ok: true, texts: parts };
}

async function volcengineTranslate(texts, targetLang) {
  const to = VOLC_LANG_MAP[targetLang];
  if (!to) return { ok: false, rateLimited: false, unsupported: true };

  const buckets = new Map();
  texts.forEach((text, index) => {
    const script = detectScript(text);
    if (!buckets.has(script)) buckets.set(script, []);
    buckets.get(script).push({ text, index });
  });

  const output = texts.map(() => '');
  let translated = 0;

  for (const items of buckets.values()) {
    const result = await volcengineRequest(items.map((item) => item.text), to);
    if (!result.ok) {
      if (!translated) return result;
      break;
    }
    result.texts.forEach((value, index) => {
      output[items[index].index] = value;
      if (value && value.trim()) translated += 1;
    });
  }

  if (!translated) return { ok: false, rateLimited: false };
  return { ok: true, texts: output };
}

async function caiyunTranslate(texts, targetLang) {
  const transType = CAIYUN_LANG_MAP[targetLang];
  if (!transType) return { ok: false, rateLimited: false, unsupported: true };

  const res = await gmRequest({
    method: 'POST',
    url: 'https://api.interpreter.caiyunai.com/v1/translator',
    headers: {
      'Content-Type': 'application/json',
      'X-Authorization': `token:${CAIYUN_TOKEN}`,
    },
    data: JSON.stringify({
      source: texts,
      trans_type: transType,
      request_id: 'twitch-danmaku',
      detect: true,
    }),
  });

  if (res?.status === 401) return { ok: false, rateLimited: false, disabled: true };
  if (res?.status === 409) return { ok: false, rateLimited: false, unsupported: true };
  if (isRateLimited(res)) return { ok: false, rateLimited: true };
  if (!res || res.status !== 200) return { ok: false, rateLimited: false };

  const json = JSON.parse(res.responseText);
  if (!Array.isArray(json?.target) || json.target.length !== texts.length) {
    return { ok: false, rateLimited: false };
  }
  return {
    ok: true,
    texts: json.target.map((item) => (item == null ? '' : String(item))),
  };
}

const PROVIDER_CALLS = {
  microsoft: microsoftTranslate,
  google: googleTranslate,
  volcengine: volcengineTranslate,
  caiyun: caiyunTranslate,
  tencent: tencentTranslate,
};

function noteProviderFailure(id, rateLimited) {
  const state = providerState[id];
  state.failures += 1;
  const table = rateLimited ? HARD_COOLDOWNS_MS : SOFT_COOLDOWNS_MS;
  const delay = table[Math.min(state.failures - 1, table.length - 1)];
  state.cooldownUntil = Date.now() + delay;
  if (rateLimited) {
    console.warn('[TBC] translation provider cooling down:', id);
  }
}

function providerReadyAt(id) {
  const state = providerState[id];
  return Math.max(state.nextAt, state.cooldownUntil);
}

function waitForProviders(ids, failed) {
  const now = Date.now();
  const wait = ids.reduce((soonest, id) => Math.min(soonest, providerReadyAt(id) - now), Infinity);
  return {
    retryAfter: Math.max(50, Math.min(Number.isFinite(wait) ? wait : 1000, 60000)),
    failed,
  };
}

function autoSequence(ready) {
  const primaryReady = PRIMARY_PROVIDERS.filter((id) => ready.includes(id));
  if (!primaryReady.length) return ready.slice();

  const id = primaryReady[primaryCursor % primaryReady.length];
  primaryCursor = (primaryCursor + 1) % primaryReady.length;
  return [id, ...ready.filter((candidate) => candidate !== id)];
}

function markProviderUsed(id, startedAt) {
  const elapsed = Date.now() - startedAt;
  providerState[id].nextAt = Date.now() + Math.max(0, PROVIDER_GAP_MS - elapsed);
}

function isPreviewPage() {
  return typeof document !== 'undefined'
    && document.documentElement?.dataset?.tbcPreview === 'true';
}

function previewTranslateText(text, targetLang) {
  const source = String(text || '').trim();
  if (!source) return source;
  const toZh = /^zh/i.test(String(targetLang || ''));
  const hasHan = /[\u4e00-\u9fff]/.test(source);
  if (toZh) {
    if (hasHan) return source;
    return `〔演示译文〕${source}`;
  }
  if (hasHan) return `[Demo TL] ${source}`;
  return source;
}

async function translateBatch(texts, targetLang, preferred) {
  if (!texts.length) return { texts: [] };

  // Demo pages cannot call real translation APIs; return marked text so UI can be verified.
  if (isPreviewPage()) {
    return { texts: texts.map((text) => previewTranslateText(text, targetLang)) };
  }

  const order = preferred && preferred !== 'auto'
    ? [preferred, ...ALL_PROVIDERS.filter((id) => id !== preferred)]
    : ALL_PROVIDERS.slice();
  const supported = order.filter((id) => (
    !disabledProviders.has(id) && !unsupportedTargets.has(`${id}:${targetLang}`)
  ));
  const candidates = supported.length ? supported : order;
  const now = Date.now();

  if (preferred && preferred !== 'auto' && candidates[0] === preferred) {
    const pinned = providerState[preferred];
    if (pinned.cooldownUntil <= now && pinned.nextAt > now) {
      return waitForProviders([preferred], false);
    }
  }

  const usable = candidates.filter((id) => providerState[id].cooldownUntil <= now);
  if (!usable.length) return waitForProviders(candidates, true);

  const ready = usable.filter((id) => providerState[id].nextAt <= now);
  if (!ready.length) return waitForProviders(usable, false);

  const sequence = !preferred || preferred === 'auto'
    ? autoSequence(ready)
    : [preferred, ...ready.filter((id) => id !== preferred)].filter((id) => ready.includes(id));

  const flushStarted = Date.now();
  const attemptLimit = Math.min(MAX_PROVIDER_ATTEMPTS, sequence.length);
  for (let attempt = 0; attempt < attemptLimit; attempt += 1) {
    if (attempt > 0 && Date.now() - flushStarted > TRANSLATE_TIMEOUT_MS) break;
    const id = sequence[attempt];
    const startedAt = Date.now();
    let result;
    try {
      result = await PROVIDER_CALLS[id](texts, targetLang);
    } catch (err) {
      result = { ok: false, rateLimited: !!err?.rateLimited };
    }
    markProviderUsed(id, startedAt);

    if (result?.disabled) {
      disabledProviders.add(id);
      continue;
    }
    if (result?.unsupported) unsupportedTargets.add(`${id}:${targetLang}`);
    if (result?.ok && Array.isArray(result.texts) && result.texts.length === texts.length) {
      providerState[id].failures = 0;
      return { texts: result.texts };
    }
    noteProviderFailure(id, !!result?.rateLimited);
  }

  return { retryAfter: 800, failed: true };
}

const TOOLTIP_ORIGINAL_MAX = 64;

function shouldSkipTranslation(text) {
  const trimmed = text.trim();
  if (!trimmed) return true;
  if (/^[\d\s+\-*/%=^#@&|<>[\]{}\\]+$/u.test(trimmed)) return true;
  if (/^[\p{P}\p{S}\s\d]+$/u.test(trimmed)) return true;
  return false;
}

function translatableCore(text) {
  if (!text) return '';
  const core = String(text).trim();
  if (!core || core.length > 500 || shouldSkipTranslation(core)) return '';
  return core;
}

function needsMachineTranslation(text) {
  const stripped = text.replace(/⟦T\d+⟧/g, '').trim();
  return !!stripped;
}

function truncateText(text, max = TOOLTIP_ORIGINAL_MAX) {
  if (!text || text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

function preparedGroupKey(preparedText, placeholders) {
  return `${preparedText}\0${placeholders.map((item) => item.replacement).join('\0')}`;
}

async function translateMessages(texts, targetLang, provider = 'microsoft') {
  const results = new Array(texts.length);
  const pending = [];

  texts.forEach((text, index) => {
    const cached = getCachedTranslation(text, targetLang);
    if (cached != null) {
      results[index] = cached;
      return;
    }

    if (shouldSkipTranslation(text) || text.length > 500) {
      results[index] = text;
      return;
    }

    const prepared = prepareDictionaryText(text, targetLang);
    if (prepared.fullyMapped || !needsMachineTranslation(prepared.preparedText)) {
      results[index] = restoreDictionaryText(prepared.preparedText, prepared.placeholders);
      return;
    }

    pending.push({
      index,
      original: text,
      preparedText: prepared.preparedText,
      placeholders: prepared.placeholders,
    });
  });

  if (!pending.length) return { texts: results };

  const groups = new Map();
  for (const item of pending) {
    const key = preparedGroupKey(item.preparedText, item.placeholders);
    if (!groups.has(key)) {
      groups.set(key, { preparedText: item.preparedText, items: [] });
    }
    groups.get(key).items.push(item);
  }

  const unique = [...groups.values()];
  const outcome = await translateBatch(
    unique.map((group) => group.preparedText),
    targetLang,
    provider,
  );
  if (outcome.retryAfter) return outcome;

  unique.forEach((group, groupIndex) => {
    const machine = outcome.texts[groupIndex]?.trim()
      ? outcome.texts[groupIndex]
      : group.preparedText;
    const cacheable = !!outcome.texts[groupIndex]?.trim();

    for (const item of group.items) {
      const restored = restoreDictionaryText(machine, item.placeholders)?.trim() || item.original;
      results[item.index] = restored;
      if (cacheable) setCachedTranslation(item.original, targetLang, restored);
    }
  });

  return { texts: results };
}

const TRANSLATE_SINGLE_GRACE_MS = 220;
const TRANSLATE_BURST_WINDOW_MS = 1000;
const TRANSLATE_GIVE_UP_ATTEMPTS = 2;

class TranslateQueue {
  constructor(getSettings, isActive) {
    this.getSettings = getSettings;
    this.isActive = isActive;
    this.queue = [];
    this.inflight = false;
    this.timer = null;
    this.timerDelay = null;
    this.epoch = 0;
    this.nextSlotAt = 0;
    this.collectStartedAt = 0;
  }

  currentSpeed() {
    return clamp(Number(this.getSettings().translateSpeed) || 1, 1, 10);
  }

  enqueue(text, parts, callback) {
    if (!this.isActive()) return;
    const settings = this.getSettings();
    if (!settings.translateEnabled) return;

    while (this.queue.length >= MAX_TRANSLATE_QUEUE) {
      this.queue.shift();
    }
    if (!this.collectStartedAt) this.collectStartedAt = Date.now();
    this.queue.push({
      text,
      parts: parts?.length ? parts : [{ type: 'text', value: text }],
      callback,
      attempts: 0,
    });
    this.schedule();
  }

  clearTimer() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.timerDelay = null;
  }

  armTimer(delay) {
    this.clearTimer();
    this.timerDelay = delay;
    this.timer = setTimeout(() => {
      this.timer = null;
      this.timerDelay = null;
      this.flush();
    }, delay);
  }

  schedule() {
    if (this.inflight || !this.isActive()) return;
    if (!this.getSettings().translateEnabled) return;

    if (this.queue.length === 0) {
      this.collectStartedAt = 0;
      this.clearTimer();
      return;
    }

    const delay = this.computeDelay();
    if (delay === 0 && this.timer && this.timerDelay === 0) return;
    this.armTimer(delay);
  }

  computeDelay() {
    const now = Date.now();
    const speed = this.currentSpeed();
    const slotWait = Math.max(0, this.nextSlotAt - now);
    const started = this.collectStartedAt || now;

    if (this.queue.length >= speed) return slotWait;

    const grace = speed <= 1 || this.queue.length < 2
      ? (speed <= 1 ? 0 : TRANSLATE_SINGLE_GRACE_MS)
      : TRANSLATE_BURST_WINDOW_MS;
    const collectWait = Math.max(0, started + grace - now);
    return Math.max(slotWait, collectWait);
  }

  pieceCount(parts) {
    return parts.reduce((count, part) => (
      part.type === 'text' && translatableCore(part.value) ? count + 1 : count
    ), 0);
  }

  takeJobs(speed) {
    const jobs = [];
    let chars = 0;
    let pieces = 0;

    while (this.queue.length && jobs.length < Math.min(speed, TRANSLATE_MAX_BATCH)) {
      const next = this.queue[0];
      const nextPieces = this.pieceCount(next.parts);
      if (jobs.length > 0 && (
        chars + next.text.length > TRANSLATE_MAX_BATCH_CHARS
        || pieces + nextPieces > TRANSLATE_MAX_BATCH
      )) break;
      chars += next.text.length;
      pieces += nextPieces;
      jobs.push(this.queue.shift());
    }

    return jobs;
  }

  deliver(jobs, partLists) {
    if (!this.isActive()) return;
    jobs.forEach((job, index) => {
      const parts = partLists[index] || job.parts;
      try {
        job.callback(parts, job.text);
      } catch {
        /* ignore */
      }
    });
  }

  stitch(jobs, translations, refs) {
    const outputs = jobs.map((job) => job.parts.map((part) => ({ ...part })));
    refs.forEach((ref, index) => {
      const part = outputs[ref.jobIndex][ref.partIndex];
      const match = String(part.value).match(/^(\s*)([\s\S]*?)(\s*)$/);
      const translated = translations[index] || match[2];
      outputs[ref.jobIndex][ref.partIndex] = {
        type: 'text',
        value: `${match[1]}${translated}${match[3]}`,
      };
    });
    return outputs;
  }

  pace(count, speed, startedAt) {
    const spent = Date.now() - startedAt;
    const budget = Math.round(count * (1000 / speed));
    const nextAt = Date.now() + Math.max(0, budget - spent);
    this.nextSlotAt = Math.max(this.nextSlotAt, nextAt);
  }

  async flush() {
    if (this.inflight || this.queue.length === 0 || !this.isActive()) {
      this.schedule();
      return;
    }

    const settings = this.getSettings();
    if (!settings.translateEnabled) return;

    const epoch = this.epoch;
    const speed = this.currentSpeed();
    const jobs = this.takeJobs(speed);
    if (!jobs.length) return;

    this.collectStartedAt = this.queue.length ? Date.now() : 0;
    this.inflight = true;
    const startedAt = Date.now();

    const refs = [];
    const pieces = [];
    jobs.forEach((job, jobIndex) => {
      job.parts.forEach((part, partIndex) => {
        const core = part.type === 'text' ? translatableCore(part.value) : '';
        if (!core) return;
        refs.push({ jobIndex, partIndex });
        pieces.push(core);
      });
    });

    try {
      if (!pieces.length) {
        this.deliver(jobs, jobs.map((job) => job.parts));
        this.pace(jobs.length, speed, startedAt);
        return;
      }

      const outcome = await translateMessages(
        pieces,
        settings.translateTargetLang,
        settings.translateProvider,
      );

      if (epoch !== this.epoch || !this.isActive()) return;

      if (outcome.retryAfter) {
        const failed = !!outcome.failed;
        if (failed) {
          for (const job of jobs) job.attempts += 1;
        }
        const exhausted = failed && jobs.every((job) => job.attempts >= TRANSLATE_GIVE_UP_ATTEMPTS);
        const blocked = failed && outcome.retryAfter > 1500;
        if (exhausted || blocked) {
          this.deliver(jobs, jobs.map((job) => job.parts));
          this.pace(jobs.length, speed, startedAt);
        } else {
          this.queue = jobs.concat(this.queue);
          while (this.queue.length > MAX_TRANSLATE_QUEUE) this.queue.pop();
          this.collectStartedAt = Date.now() - TRANSLATE_BURST_WINDOW_MS;
          this.nextSlotAt = Math.max(this.nextSlotAt, Date.now() + outcome.retryAfter);
        }
        return;
      }

      this.deliver(jobs, this.stitch(jobs, outcome.texts || [], refs));
      this.pace(jobs.length, speed, startedAt);
    } catch {
      if (epoch !== this.epoch || !this.isActive()) return;
      this.deliver(jobs, jobs.map((job) => job.parts));
      this.pace(jobs.length, speed, startedAt);
    } finally {
      if (epoch === this.epoch) this.inflight = false;
      if (this.queue.length && epoch === this.epoch) this.schedule();
    }
  }

  clear() {
    this.epoch += 1;
    this.queue = [];
    this.collectStartedAt = 0;
    this.nextSlotAt = 0;
    this.clearTimer();
    this.inflight = false;
  }
}

const MAX_REPEAT_SEGMENTS = 3;

function dedupeRepeatedMessage(text) {
  const trimmed = text.trim();
  if (!trimmed) return text;

  const tokens = trimmed.split(/\s+/);
  if (tokens.length <= MAX_REPEAT_SEGMENTS) return text;

  const maxUnitLen = Math.floor(tokens.length / (MAX_REPEAT_SEGMENTS + 1));

  for (let unitLen = 1; unitLen <= maxUnitLen; unitLen += 1) {
    if (tokens.length % unitLen !== 0) continue;

    const repeatCount = tokens.length / unitLen;
    if (repeatCount <= MAX_REPEAT_SEGMENTS) continue;

    const unit = tokens.slice(0, unitLen);
    let matched = true;

    for (let i = 1; i < repeatCount; i += 1) {
      for (let j = 0; j < unitLen; j += 1) {
        if (tokens[i * unitLen + j] !== unit[j]) {
          matched = false;
          break;
        }
      }
      if (!matched) break;
    }

    if (matched) {
      const kept = [];
      for (let i = 0; i < MAX_REPEAT_SEGMENTS; i += 1) {
        kept.push(...unit);
      }
      return kept.join(' ');
    }
  }

  return text;
}

function extractEmoteName(node) {
  if (!node) return '';
  return node.getAttribute?.('data-emote-name')
    || node.alt
    || node.getAttribute?.('title')
    || node.dataset?.alt
    || '';
}

function pickEmoteSrc(img) {
  const srcset = img.getAttribute('srcset') || '';
  const candidates = srcset.split(',')
    .map((item) => item.trim().split(/\s+/)[0])
    .filter(Boolean);
  const preferred = candidates.find((url) => /\/2\.0(?:$|[?#])/.test(url))
    || candidates[candidates.length - 1]
    || img.getAttribute('src')
    || '';

  try {
    const url = new URL(preferred, location.href);
    if (url.protocol !== 'https:') return '';
    url.hash = '';
    return url.href;
  } catch {
    return '';
  }
}

function partsToPlain(parts) {
  let out = '';
  for (const part of parts) {
    if (part.type === 'emote') {
      if (out && !/\s$/.test(out)) out += ' ';
      out += part.name || '';
      continue;
    }
    out += part.value || '';
  }
  return out.trim();
}

function mergeTextParts(parts) {
  const merged = [];
  for (const part of parts) {
    if (part.type === 'text') {
      if (!part.value) continue;
      const last = merged[merged.length - 1];
      if (last?.type === 'text') last.value += part.value;
      else merged.push({ type: 'text', value: part.value });
      continue;
    }
    if (part.name || part.src) merged.push(part);
  }
  return merged;
}

function dedupeParts(parts) {
  const units = [];
  for (const part of parts) {
    if (part.type === 'emote') {
      units.push(part.name || '');
      continue;
    }
    const words = String(part.value || '').trim().split(/\s+/).filter(Boolean);
    units.push(...words);
  }

  const original = units.join(' ');
  const deduped = dedupeRepeatedMessage(original);
  if (!original || deduped === original) return mergeTextParts(parts);

  const kept = deduped.split(/\s+/).filter(Boolean);
  const rebuilt = [];
  let cursor = 0;

  const visit = (part) => {
    if (cursor >= kept.length) return;
    if (part.type === 'emote') {
      if ((part.name || '') === kept[cursor]) {
        if (rebuilt.length) rebuilt.push({ type: 'text', value: ' ' });
        rebuilt.push(part);
        cursor += 1;
      }
      return;
    }
    const words = String(part.value || '').trim().split(/\s+/).filter(Boolean);
    words.forEach((word) => {
      if (cursor >= kept.length || word !== kept[cursor]) return;
      if (rebuilt.length) rebuilt.push({ type: 'text', value: ' ' });
      rebuilt.push({ type: 'text', value: word });
      cursor += 1;
    });
  };

  parts.forEach(visit);
  return cursor === kept.length ? mergeTextParts(rebuilt) : mergeTextParts(parts);
}

function extractMessageParts(msgEl) {
  const root = msgEl.querySelector(SELECTORS.chatMessageBody);
  if (!root) return [];

  const parts = [];

  const pushText = (text) => {
    if (!text) return;
    const last = parts[parts.length - 1];
    if (last?.type === 'text') last.value += text;
    else parts.push({ type: 'text', value: text });
  };

  const pushEmote = (img) => {
    const name = extractEmoteName(img).trim();
    const src = pickEmoteSrc(img);
    if (!name && !src) return;
    parts.push({ type: 'emote', name, src });
  };

  const walk = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      pushText(node.textContent);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    if (node.matches('.chat-badge, [data-a-target="chat-badge"], .chat-line__icons, .chat-line__username, [data-a-target="chat-message-username"], .video-chat__message-author, .vod-message__header, .video-chat__message-menu')) {
      return;
    }

    // VOD chat puts a lone ":" separator before the message body text.
    if (!node.querySelector('img, [data-a-target="emote-name"], [data-a-target="chat-message-text"]')
      && node.textContent?.trim() === ':') {
      return;
    }

    if (node.tagName === 'IMG') {
      if (node.classList.contains('chat-badge') || node.closest('[data-a-target="chat-badge"]')) return;
      pushEmote(node);
      return;
    }

    if (node.matches('.chat-line__message--emote-button, [data-a-target="emote-name"]')) {
      const img = node.querySelector('img');
      if (img) pushEmote(img);
      return;
    }

    for (const child of node.childNodes) walk(child);
  };

  for (const child of root.childNodes) walk(child);
  return dedupeParts(parts);
}

function usableCssColor(value) {
  if (!value || value === 'transparent' || value === 'rgba(0, 0, 0, 0)') return '';
  return value;
}

function isChatBadgeImage(img) {
  return !!img?.closest?.('.chat-badge, [data-a-target="chat-badge"], .chat-line__icons');
}

function bitsFromText(text) {
  const source = String(text || '');
  if (!source) return 0;
  const matcher = new RegExp(BITS_TOKEN_PATTERN, 'gi');
  let total = 0;
  let match = matcher.exec(source);
  while (match) {
    total += Number(match[1]) || 0;
    match = matcher.exec(source);
  }
  return total;
}

function bitsFromImageAsset(img) {
  if (!img || isChatBadgeImage(img)) return 0;
  const alt = img.getAttribute('alt') || '';
  const emoteName = img.getAttribute('data-emote-name') || img.getAttribute('title') || '';
  const labeled = `${alt} ${emoteName}`.trim();
  const fromLabel = bitsFromText(labeled) || bitsFromText(` ${labeled}`);
  if (fromLabel > 0) return fromLabel;

  const src = img.getAttribute('src') || img.getAttribute('srcset') || '';
  // cloudfront actions/.../tier/scale  |  static-cdn bits/{theme}/{type}/{prefix}/{tier}
  const fromSrc = src.match(/\/actions\/[^/\s]+\/(?:dark|light)\/(?:animated|static)\/(\d+)\//i)
    || src.match(/\/bits\/(?:dark|light)\/(?:animated|static)\/[^/\s]+\/(\d+)(?:\/|[.?#]|$)/i)
    || src.match(/\/bits\/[^/\s]+\/[^/\s]+\/(?:dark|light)\/(?:animated|static)\/(\d+)\//i);
  return fromSrc ? (Number(fromSrc[1]) || 0) : 0;
}

function hasCheer(msgEl) {
  if (!msgEl) return false;
  const root = msgEl.querySelector(SELECTORS.chatMessageBody) || msgEl;
  if (bitsFromText(root.textContent || '') > 0) return true;
  return [...root.querySelectorAll('img')].some((img) => bitsFromImageAsset(img) > 0);
}

function paidBackground(msgEl) {
  const nodes = [msgEl, msgEl.querySelector('.chat-line__message-container')].filter(Boolean);
  for (const node of nodes) {
    const color = usableCssColor(node.style?.backgroundColor);
    if (color) return color;
    const styled = node.querySelector?.('[style*="background"]');
    const nested = usableCssColor(styled?.style?.backgroundColor);
    if (nested) return nested;
  }
  return '';
}

function cheerTierStyle(bits) {
  // Twitch cheermote tiers: 1 gray, 100 purple, 1000 teal, 5000 blue, 10000 red, 100000 gold.
  // Bits card presets like 300/1000/5000/10000 are amounts, not separate color thresholds.
  const amount = Math.max(0, Number(bits) || 0);
  if (amount >= 100000) {
    return { background: 'linear-gradient(135deg, #ffb400 0%, #ff7300 100%)', color: '#1a1200', accent: '#ffb400' };
  }
  if (amount >= 10000) {
    return { background: 'linear-gradient(135deg, #f43021 0%, #ff6b6b 100%)', color: '#ffffff', accent: '#f43021' };
  }
  if (amount >= 5000) {
    return { background: 'linear-gradient(135deg, #0099fe 0%, #00d4ff 100%)', color: '#ffffff', accent: '#0099fe' };
  }
  if (amount >= 1000) {
    return { background: 'linear-gradient(135deg, #1db2a5 0%, #24dbcc 100%)', color: '#ffffff', accent: '#1db2a5' };
  }
  if (amount >= 100) {
    return { background: 'linear-gradient(135deg, #9c3ee8 0%, #bf94ff 100%)', color: '#ffffff', accent: '#9c3ee8' };
  }
  return { background: 'linear-gradient(135deg, #7a7a7a 0%, #9b9b9b 100%)', color: '#ffffff', accent: '#c5c5c5' };
}

function subscribeStyle() {
  return { background: 'linear-gradient(135deg, #8205b4 0%, #c13cff 100%)', color: '#ffffff', accent: '#bf94ff' };
}

// Sub / resub / gift / Prime — not watch-streak / raid / follow notices.
// Allow markup splits like: 已通过 <a>Prime</a> <span>订阅</span>
const SUBSCRIBE_NOTICE_RE = /(?:已通过[\s\S]{0,24}Prime[\s\S]{0,12}订阅|已订阅第\s*\d+\s*层级|订阅了|续订了|已經訂閱|續訂|已訂閱|訂閱了|subscribed(?:\s+with\s+Prime)?|resubscribed|gifted\s+\d+|is gifting|gift\s*sub|prime\s+gaming|サブスク|ギフト)/i;

function subscribeAmountLabel(text) {
  const raw = String(text || '');
  if (/prime/i.test(raw)) return 'Prime';
  const tier = raw.match(/(?:第\s*(\d+)\s*层级|tier\s*(\d+)|subscribed at Tier\s*(\d+))/i);
  if (tier) return `Tier ${tier[1] || tier[2] || tier[3]}`;
  if (/gift|赠送|ギフト|gifting/i.test(raw)) return 'Gift';
  return 'Sub';
}

function cheerTierBadgeLabel(bits) {
  const amount = Math.max(0, Number(bits) || 0);
  if (amount >= 100000) return '100K';
  if (amount >= 10000) return '10K';
  if (amount >= 5000) return '5K';
  if (amount >= 1000) return '1K';
  if (amount >= 100) return '100';
  return '1';
}

function readUserNoticeSystemText(msgEl) {
  if (!msgEl) return '';
  const clone = msgEl.cloneNode(true);
  clone.querySelectorAll(
    '[data-a-target="chat-resubscription-message__custom-message"], .chat-line__message, [data-a-target="chat-line-message"]',
  ).forEach((node) => node.remove());
  return (clone.textContent || '').replace(/\s+/g, ' ').trim();
}

function readUserNoticeCustomParts(msgEl) {
  const customRoot = msgEl?.querySelector?.(
    '[data-a-target="chat-resubscription-message__custom-message"]',
  );
  if (!customRoot) return [];
  const line = customRoot.querySelector('[data-a-target="chat-line-message"], .chat-line__message') || customRoot;
  return extractMessageParts(line);
}

function extractBitsAmount(msgEl, message = '', parts = []) {
  let total = bitsFromText(message);
  if (total > 0) return total;

  // Emote names in parsed parts (Cheer300 / Kappa100 / partnerFooCheer1000).
  total = bitsFromText(
    (Array.isArray(parts) ? parts : [])
      .map((part) => (part?.type === 'emote' ? part.name : part?.value) || '')
      .join(' '),
  );
  if (total > 0) return total;

  if (!msgEl) return 0;
  const root = msgEl.querySelector(SELECTORS.chatMessageBody) || msgEl;
  for (const img of root.querySelectorAll('img')) {
    total += bitsFromImageAsset(img);
  }
  return total;
}

function isSubscribeNotice(msgEl, textHint = '') {
  if (!msgEl && !textHint) return false;
  // Always prefer full notice textContent — custom resub body ("Hii") must not veto detection.
  const systemText = readUserNoticeSystemText(msgEl);
  const fullText = String(msgEl?.textContent || '').replace(/\s+/g, ' ').trim();
  const text = systemText || fullText || String(textHint || '').replace(/\s+/g, ' ').trim();
  return !!text && SUBSCRIBE_NOTICE_RE.test(text);
}

function readNoticeActor(msgEl, message = '') {
  const usernameEl = msgEl?.querySelector?.(SELECTORS.chatUsername);
  let username = usernameEl?.textContent?.trim() || '';
  let login = (
    msgEl?.getAttribute?.('data-a-user')
    || usernameEl?.getAttribute?.('data-a-user')
    || ''
  ).trim().toLowerCase();

  if (!username) {
    const text = String(message || msgEl?.textContent || '').replace(/\s+/g, ' ').trim();
    const match = text.match(/^@?([A-Za-z0-9_]{3,25})\s+(?:已通过|已订阅|订阅了|续订|subscribed|resubscribed|is gifting)/i);
    if (match) username = match[1];
  }
  if (!login && username) login = username.toLowerCase();
  return { username, login, usernameEl };
}

function readChatAvatarUrl(msgEl) {
  const img = msgEl.querySelector(
    'img.chat-line__message--avatar, img.chatter-avatar, .chat-author__image img, img[src*="jtv_user_pictures"], img[src*="user-default-pictures"]',
  );
  if (!img) return '';
  try {
    const url = new URL(img.getAttribute('src') || '', location.href);
    if (url.protocol !== 'https:') return '';
    url.hash = '';
    return url.href;
  } catch {
    return '';
  }
}

function readSuperchatMeta(msgEl, message = '', parts = []) {
  const pinned = !!msgEl.closest('[data-test-selector="pinned-chat"], [data-test-selector="pinned-message"], [class*="pinned-chat"], [class*="paid-pinned"]');
  const bits = extractBitsAmount(msgEl, message, parts);
  const cheer = bits > 0 || hasCheer(msgEl);
  const subscribe = isSubscribeNotice(msgEl, message);
  const background = paidBackground(msgEl);
  if (!cheer && !pinned && !background && !subscribe && bits <= 0) return null;

  let kind = 'pin';
  let style;
  let amountLabel = '';
  if (bits > 0 || cheer) {
    kind = 'cheer';
    style = cheerTierStyle(bits || 1);
    amountLabel = `${bits || 1} Bits`;
  } else if (subscribe) {
    kind = 'sub';
    style = subscribeStyle();
    amountLabel = subscribeAmountLabel(message || msgEl?.textContent || '');
  } else {
    style = {
      background: background || '#9147ff',
      color: '#ffffff',
      accent: '#bf94ff',
    };
  }

  if (background && kind === 'pin') {
    style = { ...style, background };
  }

  const textNode = msgEl.querySelector('[data-a-target="chat-message-text"], .text-fragment');
  const color = usableCssColor(textNode && getComputedStyle(textNode).color) || style.color;
  const tierLabel = kind === 'cheer'
    ? cheerTierBadgeLabel(bits || 1)
    : (kind === 'sub' ? amountLabel : '');

  return {
    kind,
    bits: bits || 0,
    amountLabel,
    tierLabel,
    avatarUrl: readChatAvatarUrl(msgEl),
    style: {
      background: style.background,
      color: color || style.color,
      accent: style.accent || '#bf94ff',
    },
  };
}

function readSuperchatStyle(msgEl) {
  return readSuperchatMeta(msgEl)?.style || null;
}

function snapshotChatMessage(msgEl) {
  if (!msgEl) return null;

  const systemText = readUserNoticeSystemText(msgEl);
  const subscribe = isSubscribeNotice(msgEl, systemText);
  const customParts = subscribe ? readUserNoticeCustomParts(msgEl) : [];
  const parts = customParts.length ? customParts : extractMessageParts(msgEl);
  let message = partsToPlain(parts);

  // System / notice lines may put text outside the normal body selector.
  if (!message) {
    if (subscribe && systemText) {
      message = systemText;
    } else {
      const notice = msgEl.querySelector(
        '[data-a-target="chat-line-message-body"], .chat-line__message-body, [data-test-selector="user-notice-line"], .user-notice-line',
      );
      message = (notice?.textContent || msgEl.textContent || '').replace(/\s+/g, ' ').trim();
    }
  }

  const actor = readNoticeActor(msgEl, systemText || message);
  let { username, login, usernameEl } = actor;

  // Nested resub chat-line may carry a better login/color than the notice header.
  if (subscribe) {
    const nestedUser = msgEl.querySelector(
      '[data-a-target="chat-resubscription-message__custom-message"] [data-a-target="chat-message-username"]',
    );
    if (nestedUser) {
      username = nestedUser.textContent?.trim() || username;
      login = (nestedUser.getAttribute('data-a-user') || username || login).trim().toLowerCase();
      usernameEl = nestedUser;
    }
  }

  if (!message && !subscribe) return null;

  // Avoid duplicating the name in the Super Chat body for "user 已订阅…" notices.
  if (username && message && !customParts.length) {
    const escaped = username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const stripped = message.replace(new RegExp(`^@?${escaped}\\s+`, 'i'), '').trim();
    if (stripped) message = stripped;
  }

  // Resub with empty custom body: still show the system notice text.
  if (subscribe && !message && systemText) {
    let noticeBody = systemText;
    if (username) {
      const escaped = username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      noticeBody = noticeBody.replace(new RegExp(`^@?${escaped}\\s+`, 'i'), '').trim() || noticeBody;
    }
    message = noticeBody;
  }

  const finalParts = parts.length ? parts : (message ? [{ type: 'text', value: message }] : []);
  const meta = readSuperchatMeta(msgEl, systemText || message, finalParts);
  return {
    message,
    parts: finalParts.length ? finalParts : (message ? [{ type: 'text', value: message }] : []),
    username: username || login,
    login,
    usernameColor: getUsernameColor(msgEl) || (usernameEl ? getComputedStyle(usernameEl).color : ''),
    profileUrl: getTwitchProfileUrl(usernameEl, username || login),
    avatarUrl: meta?.avatarUrl || readChatAvatarUrl(msgEl),
    superchat: !!meta,
    superchatStyle: meta?.style || null,
    superchatMeta: meta,
  };
}

function parseChatMessage(msgEl) {
  if (msgEl.classList.contains('tbc-processed')) return null;
  if (msgEl.closest('.tbc-processed')) return null;

  // Nested resub/chat body is owned by the parent user-notice-line Super Chat path.
  const isNotice = msgEl.matches?.('[data-test-selector="user-notice-line"], .user-notice-line');
  if (
    !isNotice
    && msgEl.closest?.('[data-test-selector="user-notice-line"], .user-notice-line, [data-a-target="chat-resubscription-message__custom-message"]')
  ) {
    msgEl.classList.add('tbc-processed');
    return null;
  }

  const snapshot = snapshotChatMessage(msgEl);
  if (!snapshot) return null;
  msgEl.classList.add('tbc-processed');
  return snapshot;
}

function markExistingMessages(chatRoot) {
  chatRoot.querySelectorAll(SELECTORS.chatMessage).forEach((el) => {
    el.classList.add('tbc-processed');
  });
}

function isLiveMessage(msgEl, chatRoot) {
  const messages = chatRoot.querySelectorAll(SELECTORS.chatMessage);
  if (!messages.length) return true;

  const tailStart = Math.max(0, messages.length - LIVE_MESSAGE_TAIL);
  for (let i = tailStart; i < messages.length; i++) {
    const node = messages[i];
    if (node === msgEl || node.contains(msgEl) || msgEl.contains(node)) {
      return true;
    }
  }
  return false;
}

function clearChatTranslations(root = document, { force = false } = {}) {
  root.querySelectorAll?.('.tbc-chat-translation').forEach((node) => {
    if (!force && node.getAttribute('data-tbc-manual-tl') === 'true') return;
    node.remove();
  });
}

function removeChatTranslation(msgEl, { force = false } = {}) {
  msgEl?.querySelectorAll?.('.tbc-chat-translation').forEach((node) => {
    if (!force && node.getAttribute('data-tbc-manual-tl') === 'true') return;
    node.remove();
  });
}

function hasManualChatTranslation(msgEl) {
  return !!msgEl?.querySelector?.('.tbc-chat-translation[data-tbc-manual-tl="true"]');
}

function readChatTranslationText(msgEl) {
  return String(msgEl?.querySelector?.('.tbc-chat-translation-text')?.textContent || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeCompareText(text) {
  return String(text || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function applyChatTranslation(msgEl, translatedText, originalText, options = {}) {
  if (!msgEl?.isConnected) return false;
  const manual = !!options.manual;
  const translated = String(translatedText || '').replace(/\s+/g, ' ').trim();
  if (!translated) {
    removeChatTranslation(msgEl, { force: manual });
    return false;
  }
  if (normalizeCompareText(translated) === normalizeCompareText(originalText)) {
    removeChatTranslation(msgEl, { force: manual });
    return false;
  }

  // Auto pipeline must not overwrite a context-menu translation.
  if (!manual && hasManualChatTranslation(msgEl)) return true;

  let row = msgEl.querySelector(':scope > .tbc-chat-translation');
  if (!row) {
    row = msgEl.querySelector('.tbc-chat-translation');
  }
  if (!row) {
    row = document.createElement('div');
    row.className = 'tbc-chat-translation';
    row.setAttribute('data-a-target', 'tbc-chat-translation');

    const badge = document.createElement('span');
    badge.className = 'tbc-chat-translation-badge';
    badge.textContent = t('translateBadge');

    const text = document.createElement('span');
    text.className = 'tbc-chat-translation-text';

    row.append(badge, text);

    const body = msgEl.querySelector(SELECTORS.chatMessageBody);
    if (body?.parentElement) {
      body.insertAdjacentElement('afterend', row);
    } else {
      msgEl.appendChild(row);
    }
  }

  if (manual) row.setAttribute('data-tbc-manual-tl', 'true');
  else row.removeAttribute('data-tbc-manual-tl');

  const textEl = row.querySelector('.tbc-chat-translation-text');
  if (textEl) textEl.textContent = translated;
  const badgeEl = row.querySelector('.tbc-chat-translation-badge');
  if (badgeEl) badgeEl.textContent = t('translateBadge');
  return true;
}

const TWITCH_GQL_URL = 'https://gql.twitch.tv/gql';
const TWITCH_GQL_CLIENT_ID = 'kd1unb4b3q4t58fwlpcbzcbnm76a8fp';
const VOD_COMMENTS_HASH = 'b70a3591ff0f4e0313d126c6a1502d79a1c02baebb288227c582044aa76adf6a';
const LIVE_CHAT_CONTAINER = '[data-test-selector="chat-scrollable-area__message-container"], .chat-scrollable-area__message-container';
const LIVE_CHAT_MESSAGE = '.chat-line__message, [data-a-target="chat-line-message"], [data-a-target="chat-message-container"]';
const CHANNEL_PATH_BLOCKLIST = /^(videos?|directory|settings|subscriptions|inventory|wallet|downloads|search|prime|popout|turbo|products|drops|u|p)$/i;

function historyError(code, message) {
  const error = new Error(message || code);
  error.code = code;
  return error;
}

function currentVodId() {
  const demoId = typeof window !== 'undefined' ? window.__TBC_DEMO_VOD_ID__ : '';
  if (demoId) return String(demoId).replace(/\D/g, '');
  const match = location.pathname.match(/\/(?:videos|video)\/(\d+)/i);
  return match ? match[1] : '';
}

function currentChannelLogin() {
  const demoLogin = typeof window !== 'undefined' ? window.__TBC_DEMO_CHANNEL__ : '';
  if (demoLogin) return String(demoLogin).trim().toLowerCase();
  const parts = location.pathname.split('/').filter(Boolean);
  if (!parts.length) return '';
  const first = parts[0].toLowerCase();
  if (CHANNEL_PATH_BLOCKLIST.test(first)) return '';
  if (first === 'moderator' || first === 'embed') return (parts[1] || '').toLowerCase();
  return first;
}

function findLiveChatContainer() {
  return document.querySelector(LIVE_CHAT_CONTAINER);
}

function readLiveChannelInfo() {
  const login = currentChannelLogin();
  if (!login || currentVodId()) return null;
  const hasDomChat = !!findLiveChatContainer();
  const ffz = typeof detectFrankerFaceZ === 'function' && detectFrankerFaceZ();
  if (!hasDomChat && !ffz) return null;
  const titleEl = document.querySelector('[data-a-target="stream-title"], h2[data-a-target="stream-title"]');
  const nameEl = document.querySelector('[data-a-target="user-channel-header-name"]');
  const title = titleEl?.textContent?.trim()
    || document.title.replace(/\s*[-–|]\s*Twitch\s*$/i, '').trim();
  return {
    id: `live-${login}`,
    title: title || login,
    createdAt: '',
    lengthSeconds: 0,
    channel: nameEl?.textContent?.trim() || login,
    login,
    live: true,
    source: ffz && !hasDomChat ? 'live-irc' : 'live-dom',
  };
}

function playerDurationSeconds() {
  const video = document.querySelector('video');
  const duration = Number(video?.duration);
  if (!Number.isFinite(duration) || duration <= 0 || duration === Infinity) return 0;
  return Math.floor(duration);
}

function formatChatClock(seconds) {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const pad = (value) => String(value).padStart(2, '0');
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(secs)}` : `${minutes}:${pad(secs)}`;
}

function fileClock(seconds) {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const pad = (value) => String(value).padStart(2, '0');
  return `${pad(hours)}h${pad(minutes)}m${pad(secs)}s`;
}

function splitFilterTerms(text) {
  return String(text || '')
    .split(/[,，]/)
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
}

function twitchGql(body) {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: 'POST',
      url: TWITCH_GQL_URL,
      headers: {
        'Client-ID': TWITCH_GQL_CLIENT_ID,
        'Content-Type': 'application/json',
      },
      data: JSON.stringify(body),
      timeout: 20000,
      onload: (res) => {
        const status = Number(res?.status) || 0;
        if (status < 200 || status >= 300) {
          reject(historyError('failed', `HTTP ${status}`));
          return;
        }
        try {
          resolve(JSON.parse(res.responseText));
        } catch {
          reject(historyError('failed', 'invalid json'));
        }
      },
      onerror: () => reject(historyError('failed', 'network')),
      ontimeout: () => reject(historyError('failed', 'timeout')),
    });
  });
}

function waitMs(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitWhilePaused(shouldPause, shouldCancel) {
  while (shouldPause?.()) {
    if (shouldCancel?.()) throw historyError('cancel');
    await waitMs(120);
  }
  if (shouldCancel?.()) throw historyError('cancel');
}

async function fetchVodInfo(videoId) {
  const id = String(videoId || '').replace(/\D/g, '');
  if (!id) return null;
  const payload = await twitchGql({
    query: `query{video(id:"${id}"){title,createdAt,lengthSeconds,owner{displayName,login}}}`,
  });
  const video = payload?.data?.video;
  if (!video) return null;
  return {
    id,
    title: video.title || '',
    createdAt: video.createdAt || '',
    lengthSeconds: Number(video.lengthSeconds) || 0,
    channel: video.owner?.displayName || video.owner?.login || '',
    login: video.owner?.login || '',
  };
}

function commentText(node) {
  const fragments = node?.message?.fragments;
  if (!Array.isArray(fragments)) return '';
  return fragments.map((fragment) => fragment?.text || '').join('');
}

function commentBits(node, text) {
  const spent = Number(node?.message?.bitsSpent);
  if (Number.isFinite(spent) && spent > 0) return spent;
  return bitsFromText(text);
}

function normalizeVodComment(node) {
  const message = commentText(node).replace(/\s+/g, ' ').trim();
  const bits = commentBits(node, message);
  return {
    id: node.id,
    offsetSeconds: Number(node.contentOffsetSeconds) || 0,
    createdAt: node.createdAt || '',
    userId: node.commenter?.id || '',
    login: node.commenter?.login || '',
    displayName: (node.commenter?.displayName || node.commenter?.login || '').trim(),
    message,
    color: node.message?.userColor || '',
    bits,
    superchat: bits > 0,
  };
}

function commentMatchesFilters(comment, keywords, usernames, includeSuperchat) {
  if (!includeSuperchat && comment.superchat) return false;
  if (keywords.length) {
    const haystack = comment.message.toLowerCase();
    if (!keywords.some((keyword) => haystack.includes(keyword))) return false;
  }
  if (usernames.length) {
    const login = comment.login.toLowerCase();
    const displayName = comment.displayName.toLowerCase();
    if (!usernames.some((name) => login.includes(name) || displayName.includes(name))) return false;
  }
  return true;
}

function normalizeDomComment(msgEl, index) {
  const parts = extractMessageParts(msgEl);
  const message = partsToPlain(parts).replace(/\s+/g, ' ').trim();
  if (!message) return null;

  const usernameEl = msgEl.querySelector(SELECTORS.chatUsername);
  const displayName = usernameEl?.textContent?.trim() || '';
  const login = (
    msgEl.getAttribute('data-a-user')
    || usernameEl?.getAttribute('data-a-user')
    || displayName
  ).trim().toLowerCase();
  if (!login && !displayName) return null;

  const bits = extractBitsAmount(msgEl, message, parts);
  const superchatStyle = readSuperchatStyle(msgEl);
  const superchat = bits > 0 || !!superchatStyle;
  const id = msgEl.id || `live-${index}-${login}-${message.slice(0, 32)}`;

  return {
    id,
    offsetSeconds: index,
    createdAt: '',
    userId: '',
    login,
    displayName: displayName || login,
    message,
    color: getUsernameColor(msgEl),
    bits,
    superchat,
  };
}

async function collectLiveIrcChat({
  comments: sourceComments = [],
  keywords = '',
  usernames = '',
  includeSuperchat = true,
  onProgress,
  shouldCancel,
  shouldPause,
}) {
  const keywordTerms = splitFilterTerms(keywords);
  const usernameTerms = splitFilterTerms(usernames);
  const comments = [];
  let scanned = 0;

  for (let i = 0; i < sourceComments.length; i++) {
    if (i % 40 === 0) {
      await waitWhilePaused(shouldPause, shouldCancel);
    }
    const comment = sourceComments[i];
    if (!comment?.message) continue;
    scanned += 1;
    if (!commentMatchesFilters(comment, keywordTerms, usernameTerms, includeSuperchat)) continue;
    comments.push(comment);
    if (comments.length % 20 === 0) {
      onProgress?.({ count: comments.length, scanned, offset: i, start: 0, end: sourceComments.length });
    }
  }

  onProgress?.({
    count: comments.length,
    scanned,
    offset: sourceComments.length,
    start: 0,
    end: sourceComments.length,
  });
  return { comments, scanned, start: 0, end: comments.length ? comments.length - 1 : 0, source: 'live-irc' };
}

async function collectLiveDomChat({
  keywords = '',
  usernames = '',
  includeSuperchat = true,
  onProgress,
  shouldCancel,
  shouldPause,
  ircComments = null,
}) {
  if (Array.isArray(ircComments)) {
    return collectLiveIrcChat({
      comments: ircComments,
      keywords,
      usernames,
      includeSuperchat,
      onProgress,
      shouldCancel,
      shouldPause,
    });
  }

  const container = findLiveChatContainer();
  if (!container) throw historyError('missing');

  const keywordTerms = splitFilterTerms(keywords);
  const usernameTerms = splitFilterTerms(usernames);
  const nodes = [...container.querySelectorAll(LIVE_CHAT_MESSAGE)];
  const comments = [];
  const seen = new Set();
  let scanned = 0;

  for (let i = 0; i < nodes.length; i++) {
    if (i % 40 === 0) {
      await waitWhilePaused(shouldPause, shouldCancel);
    }
    const comment = normalizeDomComment(nodes[i], i);
    if (!comment) continue;
    scanned += 1;
    if (seen.has(comment.id)) continue;
    seen.add(comment.id);
    if (!commentMatchesFilters(comment, keywordTerms, usernameTerms, includeSuperchat)) continue;
    comments.push(comment);
    if (comments.length % 20 === 0) {
      onProgress?.({ count: comments.length, scanned, offset: i, start: 0, end: nodes.length });
    }
  }

  onProgress?.({ count: comments.length, scanned, offset: nodes.length, start: 0, end: nodes.length });
  return { comments, scanned, start: 0, end: comments.length ? comments.length - 1 : 0, source: 'live-dom' };
}

async function downloadVodChat({
  videoId,
  start = 0,
  end = Infinity,
  keywords = '',
  usernames = '',
  includeSuperchat = true,
  onProgress,
  shouldCancel,
  shouldPause,
}) {
  const id = String(videoId || '').replace(/\D/g, '');
  if (!id) throw historyError('missing');

  const rangeStart = Math.max(0, Number(start) || 0);
  const selectedEnd = Number.isFinite(Number(end)) ? Math.max(rangeStart, Number(end)) : Infinity;
  const rangeEnd = Number.isFinite(selectedEnd) ? selectedEnd + 1 : Infinity;
  const keywordTerms = splitFilterTerms(keywords);
  const usernameTerms = splitFilterTerms(usernames);
  const comments = [];
  const seen = new Set();
  let cursor = '';
  let first = true;
  let latest = rangeStart - 1;
  let scanned = 0;
  let errorCount = 0;
  let nullCount = 0;
  let pages = 0;

  while (latest < rangeEnd) {
    await waitWhilePaused(shouldPause, shouldCancel);
    if (++pages > 8000) throw historyError('failed', 'too many pages');

    let payload;
    try {
      payload = await twitchGql({
        operationName: 'VideoCommentsByOffsetOrCursor',
        variables: first
          ? { videoID: id, contentOffsetSeconds: Math.floor(rangeStart) }
          : { videoID: id, cursor },
        extensions: { persistedQuery: { version: 1, sha256Hash: VOD_COMMENTS_HASH } },
      });
      errorCount = Math.max(0, errorCount - 0.1);
    } catch (error) {
      if (++errorCount > 8) throw historyError('failed', error.message);
      await waitMs(1000 * errorCount);
      continue;
    }

    const video = payload?.data?.video;
    const edges = video?.comments?.edges;
    if (!video || !edges) {
      if (++nullCount > 8) throw historyError(video ? 'failed' : 'missing');
      await waitMs(150 * nullCount);
      continue;
    }
    nullCount = Math.max(0, nullCount - 0.1);
    if (!edges.length) break;

    for (const edge of edges) {
      const node = edge?.node;
      const offset = Number(node?.contentOffsetSeconds);
      if (Number.isFinite(offset) && offset > latest) latest = offset;
      if (!node?.id || !node.commenter || seen.has(node.id)) continue;
      if (!Number.isFinite(offset) || offset < rangeStart || offset >= rangeEnd) continue;
      seen.add(node.id);
      scanned += 1;
      const comment = normalizeVodComment(node);
      if (!comment.message && !comment.superchat) continue;
      if (!commentMatchesFilters(comment, keywordTerms, usernameTerms, includeSuperchat)) continue;
      comments.push(comment);
    }

    onProgress?.({
      count: comments.length,
      scanned,
      offset: Math.max(rangeStart, latest),
      start: rangeStart,
      end: rangeEnd,
    });

    if (!video.comments.pageInfo?.hasNextPage) break;
    const nextCursor = edges[edges.length - 1]?.cursor;
    if (!nextCursor || nextCursor === cursor) break;
    cursor = nextCursor;
    first = false;
  }

  comments.sort((a, b) => a.offsetSeconds - b.offsetSeconds || String(a.createdAt).localeCompare(String(b.createdAt)));
  return { comments, scanned, start: rangeStart, end: selectedEnd };
}

function csvCell(value) {
  const text = String(value ?? '');
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function buildChatExport(format, video, result) {
  const comments = result.comments || [];
  const start = result.start || 0;
  const isLive = video?.source === 'live-dom' || video?.live || result?.source === 'live-dom';
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const endLabel = Number.isFinite(result.end) ? fileClock(result.end) : 'end';
  const base = isLive
    ? `twitch-chat-live-${video.login || video.id}-${stamp}`
    : `twitch-chat-${video.id}-${fileClock(start)}-${endLabel}`;
  const kind = ['csv', 'txt', 'json'].includes(format) ? format : 'json';

  if (kind === 'csv') {
    const header = ['offset_seconds', 'timestamp', 'created_at', 'login', 'display_name', 'user_id', 'message', 'bits', 'superchat'];
    const lines = comments.map((comment, index) => [
      isLive ? index : comment.offsetSeconds,
      isLive ? '' : formatChatClock(comment.offsetSeconds),
      comment.createdAt,
      comment.login,
      comment.displayName,
      comment.userId,
      comment.message,
      comment.bits,
      comment.superchat ? '1' : '0',
    ].map(csvCell).join(','));
    return {
      filename: `${base}.csv`,
      mime: 'text/csv;charset=utf-8',
      text: `\uFEFF${header.join(',')}\n${lines.join('\n')}\n`,
    };
  }

  if (kind === 'txt') {
    const lines = comments.map((comment, index) => {
      const bits = comment.superchat ? ` [Bits ${comment.bits}]` : '';
      const prefix = isLive ? `#${index + 1}` : `[${formatChatClock(comment.offsetSeconds)}]`;
      return `${prefix} ${comment.displayName}${bits}: ${comment.message}`;
    });
    return {
      filename: `${base}.txt`,
      mime: 'text/plain;charset=utf-8',
      text: `${lines.join('\n')}\n`,
    };
  }

  return {
    filename: `${base}.json`,
    mime: 'application/json;charset=utf-8',
    text: `${JSON.stringify({
      video: {
        id: video.id,
        title: video.title,
        channel: video.channel,
        login: video.login,
        createdAt: video.createdAt,
        lengthSeconds: video.lengthSeconds,
        source: video.source || (isLive ? 'live-dom' : 'vod-gql'),
      },
      range: isLive ? null : {
        start,
        end: Number.isFinite(result.end) ? result.end : null,
      },
      count: comments.length,
      comments,
    }, null, 2)}\n`,
  };
}

function saveChatFile(filename, text, mime) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function detectFrankerFaceZ() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  if (window.FrankerFaceZ || window.ffz || window.ffz_from_cdn) return true;
  if (document.documentElement?.classList?.contains('ffz')) return true;
  if (document.getElementById('ffz-script') || document.querySelector('script[src*="frankerfacez"]')) return true;
  if (document.querySelector('.ffz-topbar, #ffz-menu-button, [class*="ffz--"], [data-a-target="ffz-control"]')) return true;
  return false;
}

function waitForFrankerFaceZ(timeoutMs = 1500) {
  if (detectFrankerFaceZ()) return Promise.resolve(true);
  return new Promise((resolve) => {
    const started = Date.now();
    const timer = setInterval(() => {
      if (detectFrankerFaceZ()) {
        clearInterval(timer);
        resolve(true);
        return;
      }
      if (Date.now() - started >= timeoutMs) {
        clearInterval(timer);
        resolve(false);
      }
    }, 120);
  });
}

const TWITCH_IRC_URL = 'wss://irc-ws.chat.twitch.tv:443';
const IRC_RECONNECT_BASE_MS = 1200;
const IRC_RECONNECT_MAX_MS = 15000;

function randomJustinFanNick() {
  return `justinfan${Math.floor(80000 + Math.random() * 10000)}`;
}

function parseIrcTags(raw) {
  const tags = {};
  if (!raw) return tags;
  for (const part of raw.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) {
      tags[part] = true;
      continue;
    }
    tags[part.slice(0, eq)] = part.slice(eq + 1);
  }
  return tags;
}

function unescapeIrcTag(value) {
  return String(value || '')
    .replace(/\\:/g, ';')
    .replace(/\\s/g, ' ')
    .replace(/\\\\/g, '\\')
    .replace(/\\r/g, '\r')
    .replace(/\\n/g, '\n');
}

function parseIrcEmoteParts(message, emotesTag) {
  if (!emotesTag || !message) return [{ type: 'text', value: message }];

  const ranges = [];
  for (const entry of emotesTag.split('/')) {
    if (!entry) continue;
    const [id, positions] = entry.split(':');
    if (!id || !positions) continue;
    for (const span of positions.split(',')) {
      const [startRaw, endRaw] = span.split('-');
      const start = Number(startRaw);
      const end = Number(endRaw);
      if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) continue;
      ranges.push({ id, start, end });
    }
  }
  if (!ranges.length) return [{ type: 'text', value: message }];

  ranges.sort((a, b) => a.start - b.start);
  const parts = [];
  let cursor = 0;
  for (const range of ranges) {
    if (range.start > cursor) {
      parts.push({ type: 'text', value: message.slice(cursor, range.start) });
    }
    const name = message.slice(range.start, range.end + 1);
    parts.push({
      type: 'emote',
      name,
      src: `https://static-cdn.jtvnw.net/emoticons/v2/${encodeURIComponent(range.id)}/default/dark/1.0`,
    });
    cursor = range.end + 1;
  }
  if (cursor < message.length) {
    parts.push({ type: 'text', value: message.slice(cursor) });
  }
  return parts.length ? parts : [{ type: 'text', value: message }];
}

function bitsFromIrcTags(tags, message) {
  const spent = Number(tags.bits);
  if (Number.isFinite(spent) && spent > 0) return spent;
  return bitsFromText(message);
}

const IRC_SUB_MSG_IDS = new Set([
  'sub', 'resub', 'subgift', 'anonsubgift', 'submysterygift',
  'giftpaidupgrade', 'anongiftpaidupgrade', 'primepaidupgrade',
]);

function buildIrcPayload({ channel, login, displayName, color, message, tags, bits = 0, subscribe = false }) {
  const parts = parseIrcEmoteParts(message, tags.emotes);
  let meta = null;
  if (bits > 0) {
    const style = cheerTierStyle(bits);
    meta = {
      kind: 'cheer',
      bits,
      amountLabel: `${bits} Bits`,
      avatarUrl: '',
      style,
    };
  } else if (subscribe) {
    const style = subscribeStyle();
    const plan = String(tags['msg-param-sub-plan'] || '').toLowerCase();
    let amountLabel = 'Sub';
    if (plan === 'prime') amountLabel = 'Prime';
    else if (plan === '2000') amountLabel = 'Tier 2';
    else if (plan === '3000') amountLabel = 'Tier 3';
    else if (plan === '1000') amountLabel = 'Tier 1';
    else if (/gift/i.test(String(tags['msg-id'] || ''))) amountLabel = 'Gift';
    meta = {
      kind: 'sub',
      bits: 0,
      amountLabel,
      avatarUrl: '',
      style,
    };
  }

  return {
    channel,
    login,
    username: displayName,
    usernameColor: color,
    profileUrl: login ? `https://www.twitch.tv/${encodeURIComponent(login)}` : null,
    avatarUrl: '',
    message,
    parts,
    originalMessage: message,
    superchat: !!meta,
    superchatStyle: meta?.style || null,
    superchatMeta: meta,
    bits,
  };
}

function normalizeIrcPrivmsg(line) {
  // @tags :nick!user@host PRIVMSG #channel :message
  const match = line.match(/^(?:@(\S+)\s+)?:(\S+?)(?:!(\S+?))?(?:@\S+)?\s+PRIVMSG\s+#(\S+)\s+:([\s\S]*)$/i);
  if (!match) return null;

  const tags = parseIrcTags(match[1] || '');
  const login = (match[3] || match[2] || tags.login || '').toLowerCase();
  const channel = String(match[4] || '').toLowerCase();
  const message = match[5] || '';
  if (!message.trim()) return null;

  const displayName = unescapeIrcTag(tags['display-name']) || login;
  const color = unescapeIrcTag(tags.color) || '#ffffff';
  const bits = bitsFromIrcTags(tags, message);
  return buildIrcPayload({
    channel,
    login,
    displayName,
    color,
    message,
    tags,
    bits,
  });
}

function normalizeIrcUsernotice(line) {
  const match = line.match(/^(?:@(\S+)\s+)?:tmi\.twitch\.tv\s+USERNOTICE\s+#(\S+)(?:\s+:([\s\S]*))?$/i);
  if (!match) return null;
  const tags = parseIrcTags(match[1] || '');
  const msgId = String(tags['msg-id'] || '').toLowerCase();
  if (!IRC_SUB_MSG_IDS.has(msgId)) return null;

  const channel = String(match[2] || '').toLowerCase();
  const login = String(tags.login || '').toLowerCase();
  const displayName = unescapeIrcTag(tags['display-name']) || login;
  const color = unescapeIrcTag(tags.color) || '#ffffff';
  const system = unescapeIrcTag(tags['system-msg'] || '');
  const body = (match[3] || '').trim();
  const message = [system, body].filter(Boolean).join(' — ') || system || 'Subscribed';
  return buildIrcPayload({
    channel,
    login,
    displayName,
    color,
    message,
    tags,
    subscribe: true,
  });
}

function normalizeIrcLine(line) {
  if (/\sPRIVMSG\s/i.test(line)) return normalizeIrcPrivmsg(line);
  if (/\sUSERNOTICE\s/i.test(line)) return normalizeIrcUsernotice(line);
  return null;
}

class TwitchIrcChatSource {
  constructor({ getChannel, onMessage, isActive }) {
    this.getChannel = getChannel;
    this.onMessage = onMessage;
    this.isActive = isActive;
    this.socket = null;
    this.channel = '';
    this.nick = '';
    this.wanted = false;
    this.reconnectAttempt = 0;
    this.reconnectTimer = null;
    this.pingTimer = null;
  }

  start() {
    this.wanted = true;
    this.connect();
  }

  stop() {
    this.wanted = false;
    this.clearReconnect();
    this.clearPing();
    try {
      this.socket?.close();
    } catch {
      /* ignore */
    }
    this.socket = null;
    this.channel = '';
  }

  clearReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
  }

  clearPing() {
    if (this.pingTimer) clearInterval(this.pingTimer);
    this.pingTimer = null;
  }

  scheduleReconnect() {
    if (!this.wanted) return;
    this.clearReconnect();
    const delay = Math.min(
      IRC_RECONNECT_MAX_MS,
      IRC_RECONNECT_BASE_MS * (2 ** Math.min(this.reconnectAttempt, 4)),
    );
    this.reconnectAttempt += 1;
    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  connect() {
    if (!this.wanted) return;
    const channel = String(this.getChannel?.() || '').trim().toLowerCase().replace(/^#/, '');
    if (!channel) {
      this.scheduleReconnect();
      return;
    }

    this.clearReconnect();
    this.clearPing();
    try {
      this.socket?.close();
    } catch {
      /* ignore */
    }

    this.channel = channel;
    this.nick = randomJustinFanNick();
    let socket;
    try {
      socket = new WebSocket(TWITCH_IRC_URL);
    } catch (error) {
      console.warn('[TBC] IRC WebSocket unavailable:', error);
      this.scheduleReconnect();
      return;
    }
    this.socket = socket;

    socket.addEventListener('open', () => {
      if (this.socket !== socket || !this.wanted) return;
      this.reconnectAttempt = 0;
      socket.send('CAP REQ :twitch.tv/tags twitch.tv/commands');
      socket.send('PASS SCHMOOPIIE');
      socket.send(`NICK ${this.nick}`);
      socket.send(`JOIN #${this.channel}`);
      this.pingTimer = setInterval(() => {
        if (this.socket === socket && socket.readyState === WebSocket.OPEN) {
          socket.send('PING :tmi.twitch.tv');
        }
      }, 4 * 60 * 1000);
      console.log(`[TBC] IRC connected (#${this.channel})`);
    });

    socket.addEventListener('message', (event) => {
      if (this.socket !== socket) return;
      this.handlePayload(String(event.data || ''));
    });

    socket.addEventListener('close', () => {
      if (this.socket !== socket) return;
      this.socket = null;
      this.clearPing();
      if (this.wanted) this.scheduleReconnect();
    });

    socket.addEventListener('error', () => {
      try {
        socket.close();
      } catch {
        /* ignore */
      }
    });
  }

  handlePayload(payload) {
    const lines = payload.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    for (const line of lines) {
      if (line.startsWith('PING ')) {
        this.socket?.send(`PONG ${line.slice(5)}`);
        continue;
      }
      if (!/\sPRIVMSG\s/i.test(line) && !/\sUSERNOTICE\s/i.test(line)) continue;
      if (this.isActive && !this.isActive()) continue;
      const parsed = normalizeIrcLine(line);
      if (!parsed) continue;
      if (parsed.channel && this.channel && parsed.channel !== this.channel) continue;
      try {
        this.onMessage?.(parsed);
      } catch (error) {
        console.warn('[TBC] IRC message handler failed:', error);
      }
    }
  }
}

const TWITCH_WEB_CLIENT_ID = 'kimne78kx3ncx6brgo4mv6wki5h1ko';
const TWITCH_GQL_ENDPOINT = 'https://gql.twitch.tv/gql';

const TWITCH_GQL_HASH = {
  blockedUsersWithDetails: '031dd899a18968df9fe917bfb1293508f0c106c385283792c4620f8c994e95a7',
  blockedUserDetail: 'f1e276239a93802a4c533616dcb9f79d5e9b439e8b3cafb782be297b99d2d413',
  blockUser: 'c58b580efdc4187fa30c144c57425d7051602c848069be705f07e8d590a12515',
  unblockUser: 'f1b612a6df709cfa5fea630b20c78c9ba7f4c0be386bfd51486eaf02afbfbf92',
  // Captured from twitch.tv ViewerCard open (profileImageURL on targetUser).
  viewerCard: '2c6cc05878bf2f007613fe807512546000401362a2d7d87ab20ebf259960a29e',
};

function getCookieValue(name) {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : '';
}

function getTwitchAuthToken() {
  return getCookieValue('auth-token') || '';
}

function getTwitchDeviceId() {
  return getCookieValue('unique_id')
    || getCookieValue('unique_id_durable')
    || localStorage.getItem('twilight.device_id')
    || '';
}

function normalizeTwitchLogin(value) {
  return String(value || '').trim().replace(/^@+/, '').toLowerCase();
}

function formatTwitchBlockedAt(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return String(iso);
  try {
    return date.toLocaleString();
  } catch {
    return date.toISOString();
  }
}

function twitchGqlRequest(payload) {
  const token = getTwitchAuthToken();
  if (!token) {
    return Promise.reject(Object.assign(new Error('not_logged_in'), { code: 'not_logged_in' }));
  }

  const headers = {
    Accept: '*/*',
    'Client-ID': TWITCH_WEB_CLIENT_ID,
    Authorization: `OAuth ${token}`,
    'Content-Type': 'text/plain;charset=UTF-8',
  };
  const deviceId = getTwitchDeviceId();
  if (deviceId) headers['X-Device-Id'] = deviceId;

  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: 'POST',
      url: TWITCH_GQL_ENDPOINT,
      headers,
      data: JSON.stringify(payload),
      timeout: 15000,
      onload: (res) => {
        if (res.status < 200 || res.status >= 300) {
          reject(Object.assign(new Error(`http_${res.status}`), {
            code: 'http_error',
            status: res.status,
            body: res.responseText,
          }));
          return;
        }
        try {
          resolve(JSON.parse(res.responseText));
        } catch (error) {
          reject(Object.assign(error || new Error('bad_json'), { code: 'bad_json' }));
        }
      },
      onerror: () => reject(Object.assign(new Error('network'), { code: 'network' })),
      ontimeout: () => reject(Object.assign(new Error('timeout'), { code: 'timeout' })),
    });
  });
}

function gqlPersisted(operationName, variables, sha256Hash) {
  return {
    operationName,
    variables,
    extensions: {
      persistedQuery: {
        version: 1,
        sha256Hash,
      },
    },
  };
}

function unwrapGqlPayload(data) {
  return Array.isArray(data) ? data[0] : data;
}

function assertNoGqlErrors(payload, fallbackCode = 'gql_error') {
  if (payload?.errors?.length) {
    const error = new Error(payload.errors[0]?.message || fallbackCode);
    error.code = 'gql_error';
    error.details = payload.errors;
    throw error;
  }
}

async function fetchTwitchBlockedUsers() {
  const data = await twitchGqlRequest(
    gqlPersisted('CommonHooks_BlockedUsersWithDetails', {}, TWITCH_GQL_HASH.blockedUsersWithDetails),
  );
  const payload = unwrapGqlPayload(data);
  assertNoGqlErrors(payload, 'list_failed');

  const edges = payload?.data?.currentUser?.blockedUsersWithMetadata?.edges;
  if (!Array.isArray(edges)) return [];

  return edges.map((edge) => {
    const node = edge?.node || {};
    return {
      id: node.id ? String(node.id) : '',
      login: normalizeTwitchLogin(node.login),
      displayName: String(node.displayName || node.login || '').trim(),
      profileImageURL: String(node.profileImageURL || '').trim(),
      blockedAt: edge?.blockedAt || '',
      blockedAtLabel: formatTwitchBlockedAt(edge?.blockedAt),
    };
  }).filter((user) => user.id || user.login);
}

async function resolveTwitchUserId(login) {
  const normalized = normalizeTwitchLogin(login);
  if (!normalized) return '';

  const data = await twitchGqlRequest([
    gqlPersisted('BlockedUserDetail', { login: normalized }, TWITCH_GQL_HASH.blockedUserDetail),
  ]);
  const payload = unwrapGqlPayload(data);
  assertNoGqlErrors(payload, 'lookup_failed');
  const user = payload?.data?.user;
  return user?.id ? String(user.id) : '';
}

async function blockTwitchUser(login, { sourceContext = 'CHAT' } = {}) {
  const targetUserID = await resolveTwitchUserId(login);
  if (!targetUserID) {
    const error = new Error('user_not_found');
    error.code = 'user_not_found';
    throw error;
  }

  const data = await twitchGqlRequest([
    gqlPersisted(
      'CommonHooks_BlockUser',
      { input: { targetUserID, sourceContext } },
      TWITCH_GQL_HASH.blockUser,
    ),
  ]);
  const payload = unwrapGqlPayload(data);
  assertNoGqlErrors(payload, 'block_failed');
  return { targetUserID, login: normalizeTwitchLogin(login) };
}

async function unblockTwitchUserById(targetUserID) {
  const id = String(targetUserID || '').trim();
  if (!id) {
    const error = new Error('user_not_found');
    error.code = 'user_not_found';
    throw error;
  }

  const data = await twitchGqlRequest([
    gqlPersisted(
      'CommonHooks_UnblockUser',
      { input: { targetUserID: id } },
      TWITCH_GQL_HASH.unblockUser,
    ),
  ]);
  const payload = unwrapGqlPayload(data);
  assertNoGqlErrors(payload, 'unblock_failed');
  return { targetUserID: id };
}

async function unblockTwitchUser(login) {
  const targetUserID = await resolveTwitchUserId(login);
  if (!targetUserID) {
    const error = new Error('user_not_found');
    error.code = 'user_not_found';
    throw error;
  }
  await unblockTwitchUserById(targetUserID);
  return { targetUserID, login: normalizeTwitchLogin(login) };
}

const avatarCache = new Map();
let cachedViewerChannel = { login: '', id: '' };

function letterAvatarDataUri(name, color) {
  const letter = String(name || '?').trim().charAt(0).toUpperCase() || '?';
  const fill = String(color || '#9147ff').replace(/[<>&"']/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" rx="32" fill="${fill}"/><text x="32" y="40" text-anchor="middle" font-size="30" font-family="Arial,sans-serif" fill="#fff">${letter}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function cachedAvatar(login, displayName, color) {
  const key = String(login || displayName || '').toLowerCase();
  if (key && avatarCache.has(key)) return avatarCache.get(key);
  return letterAvatarDataUri(displayName || login, color);
}

function rememberAvatar(login, url) {
  const key = String(login || '').toLowerCase();
  if (!key || !url) return;
  avatarCache.set(key, url);
}

async function resolveViewerChannelContext() {
  const login = normalizeTwitchLogin(currentChannelLogin?.() || '');
  if (!login) return { login: '', id: '' };
  if (cachedViewerChannel.login === login && cachedViewerChannel.id) {
    return cachedViewerChannel;
  }
  try {
    const id = await resolveTwitchUserId(login);
    if (id) {
      cachedViewerChannel = { login, id: String(id) };
      return cachedViewerChannel;
    }
  } catch (_) {
    /* ignore */
  }
  return { login, id: '' };
}

function fetchTwitchAvatarViaUserQuery(login) {
  const key = String(login || '').trim().toLowerCase();
  if (!key) return Promise.resolve('');

  return new Promise((resolve) => {
    GM_xmlhttpRequest({
      method: 'POST',
      url: 'https://gql.twitch.tv/gql',
      headers: {
        'Client-ID': typeof TWITCH_WEB_CLIENT_ID !== 'undefined'
          ? TWITCH_WEB_CLIENT_ID
          : 'kimne78kx3ncx6brgo4mv6wki5h1ko',
        'Content-Type': 'application/json',
      },
      data: JSON.stringify({
        query: `query{user(login:${JSON.stringify(key)}){profileImageURL(width:70)}}`,
      }),
      timeout: 8000,
      onload: (res) => {
        try {
          const url = JSON.parse(res.responseText)?.data?.user?.profileImageURL || '';
          if (url) {
            rememberAvatar(key, url);
            resolve(url);
            return;
          }
        } catch {
          /* ignore */
        }
        resolve('');
      },
      onerror: () => resolve(''),
      ontimeout: () => resolve(''),
    });
  });
}

async function fetchTwitchAvatarViaViewerCard(login) {
  const key = normalizeTwitchLogin(login);
  if (!key) return '';
  if (typeof twitchGqlRequest !== 'function' || typeof gqlPersisted !== 'function') return '';

  const channel = await resolveViewerChannelContext();
  if (!channel.login) return '';

  try {
    const data = await twitchGqlRequest([
      gqlPersisted(
        'ViewerCard',
        {
          channelID: channel.id || '',
          channelLogin: channel.login,
          hasChannelID: !!channel.id,
          giftRecipientLogin: key,
          withStandardGifting: true,
          badgeSourceChannelID: channel.id || '',
          badgeSourceChannelLogin: channel.login,
        },
        TWITCH_GQL_HASH.viewerCard,
      ),
    ]);
    const payload = unwrapGqlPayload(data);
    const url = payload?.data?.targetUser?.profileImageURL || '';
    if (url) {
      rememberAvatar(key, url);
      return url;
    }
  } catch (_) {
    /* fall through */
  }
  return '';
}

function fetchTwitchAvatar(login) {
  const key = String(login || '').trim().toLowerCase();
  if (!key) return Promise.resolve('');
  if (avatarCache.has(key) && !String(avatarCache.get(key)).startsWith('data:')) {
    return Promise.resolve(avatarCache.get(key));
  }

  return fetchTwitchAvatarViaViewerCard(key)
    .then((url) => url || fetchTwitchAvatarViaUserQuery(key))
    .catch(() => fetchTwitchAvatarViaUserQuery(key));
}

const SEND_CHAT_MESSAGE_HASH = '0435464292cf380ed4b3d905e4edcb73078362e82c06367a5b2181c76c822fa2';

let cachedChatChannel = { login: '', id: '' };

function createChatNonce() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().replace(/-/g, '');
  }
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  }
  return `${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`;
}

async function resolveLiveChannelId() {
  const login = currentChannelLogin();
  if (!login) {
    const error = new Error('no_channel');
    error.code = 'no_channel';
    throw error;
  }
  if (cachedChatChannel.login === login && cachedChatChannel.id) {
    return cachedChatChannel.id;
  }
  const id = await resolveTwitchUserId(login);
  if (!id) {
    const error = new Error('channel_not_found');
    error.code = 'channel_not_found';
    throw error;
  }
  cachedChatChannel = { login, id };
  return id;
}

/** Normalize Twitch drop / restriction codes to stable keys. */
function normalizeChatSendCode(raw) {
  const code = String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/-/g, '_')
    .replace(/\s+/g, '_');
  if (!code) return '';

  if (
    code.includes('follower')
    || code === 'followers_only'
    || code === 'followers_only_mode'
    || code === 'followers_only_zero'
    || code === 'msg_followersonly'
    || code === 'msg_followersonly_zero'
  ) {
    // Followed but not long enough — treat as follow-time gate.
    if (
      code.includes('followed')
      || code.includes('duration')
      || code.includes('minutes')
      || code === 'msg_followersonly_followed'
    ) {
      return 'followers_only_time';
    }
    return 'followers_only';
  }
  if (code.includes('sub') && (code.includes('only') || code.includes('subscriber'))) {
    return 'subscribers_only';
  }
  if (
    code.includes('verified_phone')
    || code.includes('require_verified_phone')
    || code.includes('requires_verified_phone')
    || code === 'msg_requires_verified_phone_number'
  ) {
    return 'verified_phone';
  }
  if (
    code === 'verified_only'
    || code === 'verified_account'
    || code === 'msg_verified_email'
    || (code.includes('verified') && !code.includes('phone'))
  ) {
    return 'verified_only';
  }
  if (code.includes('slow')) return 'slow_mode';
  if (code.includes('emote')) return 'emote_only';
  if (code.includes('r9k') || code.includes('unique')) return 'unique_mode';
  if (code.includes('automod')) return 'automod_held';
  if (code.includes('timed_out') || code.includes('timeout')) return 'timed_out';
  if (code.includes('banned') || code.includes('suspended')) return 'banned';
  if (code.includes('duplicate')) return 'duplicate';
  if (code.includes('ratelimit') || code.includes('rate_limit')) return 'rate_limit';
  if (code === 'not_logged_in') return 'not_logged_in';
  if (code === 'no_channel' || code === 'channel_not_found' || code === 'empty_message') return code;
  return code || 'send_failed';
}

function readDropReasonCode(drop) {
  // Twitch web GQL returns dropReason as a string enum, e.g. "REQUIRES_VERIFIED_PHONE_NUMBER".
  // Helix-style payloads may use { code, message }.
  if (!drop) return '';
  if (typeof drop === 'string') return drop;
  if (typeof drop === 'object') return drop.code || drop.errorCode || '';
  return '';
}

function readDropReasonMessage(drop) {
  if (!drop || typeof drop !== 'object') return '';
  return String(drop.message || '').trim();
}

function extractChatSendFailure(result) {
  if (!result || typeof result !== 'object') {
    return { code: 'send_failed', userMessage: '' };
  }

  const drop = result.dropReason ?? result.drop_reason ?? null;
  const errObj = result.error && typeof result.error === 'object' ? result.error : null;
  const rawCode = result.errorCode
    || readDropReasonCode(drop)
    || errObj?.code
    || (typeof result.error === 'string' ? result.error : '')
    || '';
  const userMessage = String(
    readDropReasonMessage(drop)
    || errObj?.message
    || result.errorMessage
    || (typeof result.message === 'string' ? result.message : '')
    || '',
  ).trim();

  const isSent = result.isSent ?? result.is_sent;
  const hasMessageId = !!(
    result.message?.id
    || result.messageID
    || result.message_id
  );

  // Explicit success.
  if (isSent === true || hasMessageId) {
    if (!rawCode && drop == null && !errObj) return null;
  }

  const dropped = isSent === false
    || drop != null
    || !!rawCode
    || !!errObj
    || result.message === null;

  if (!dropped) return null;

  return {
    code: normalizeChatSendCode(rawCode) || 'send_failed',
    userMessage,
  };
}

function createChatSendError(failure, details) {
  const error = new Error(failure?.code || 'send_failed');
  error.code = failure?.code || 'send_failed';
  error.userMessage = failure?.userMessage || '';
  error.details = details;
  return error;
}

/** Localized status text for chat send failures (favorites / fullscreen / etc.). */
function chatSendErrorMessage(error) {
  const code = normalizeChatSendCode(error?.code || error?.message);
  switch (code) {
    case 'not_logged_in':
      return t('fsChatNeedLogin');
    case 'no_channel':
    case 'channel_not_found':
      return t('favoritesNeedChannel');
    case 'followers_only':
      return t('fsChatNeedFollow');
    case 'followers_only_time':
      return t('fsChatNeedFollowTime');
    case 'subscribers_only':
      return t('fsChatNeedSub');
    case 'verified_only':
      return t('fsChatNeedVerified');
    case 'verified_phone':
      return t('fsChatNeedPhone');
    case 'slow_mode':
      return t('fsChatSlowMode');
    case 'emote_only':
      return t('fsChatEmoteOnly');
    case 'unique_mode':
      return t('fsChatUniqueMode');
    case 'automod_held':
      return t('fsChatAutomod');
    case 'timed_out':
      return t('fsChatTimedOut');
    case 'banned':
      return t('fsChatBanned');
    case 'duplicate':
      return t('fsChatDuplicate');
    case 'rate_limit':
      return t('fsChatRateLimit');
    case 'empty_message':
      return t('favoritesEmptyText');
    default:
      break;
  }
  const twitchMsg = String(error?.userMessage || '').trim();
  if (twitchMsg) return twitchMsg;
  return t('fsChatFailed');
}

async function sendTwitchChatMessage(message) {
  const text = String(message || '').trim();
  if (!text) {
    const error = new Error('empty_message');
    error.code = 'empty_message';
    throw error;
  }

  const channelID = await resolveLiveChannelId();
  const nonce = createChatNonce();
  const data = await twitchGqlRequest([
    gqlPersisted(
      'sendChatMessage',
      {
        input: {
          channelID,
          message: text,
          nonce,
          replyParentMessageID: null,
        },
      },
      SEND_CHAT_MESSAGE_HASH,
    ),
  ]);

  const payload = unwrapGqlPayload(data);
  assertNoGqlErrors(payload, 'send_failed');

  const result = payload?.data?.sendChatMessage;
  if (!result) {
    throw createChatSendError({ code: 'send_failed', userMessage: '' }, payload);
  }

  const failure = extractChatSendFailure(result);
  if (failure) {
    throw createChatSendError(failure, result);
  }

  return { channelID, nonce, result };
}

const IGNORED_CHAT_BOTS = new Set([
  'streamelements',
  'streamelement',
  'nightbot',
  'moobot',
  'fossabot',
  'streamlabs',
  'wizebot',
  'botrix',
  'botrixlive',
  'coeabot',
  'phantombot',
  'stay_hydrated_bot',
  'soundalerts',
  'streamholics',
  'commanderroot',
]);

const CHAT_DIVIDER_TEXT_RE = /^(全新|新消息|新訊息|消息分隔|訊息分隔|new messages?|welcome to the chat(?: room)?!?|chat cleared|room modes?)$/i;
const PURE_LINK_TOKEN_RE = /^(?:https?:\/\/|www\.)\S+$/i;

function normalizeChatActor(value) {
  return String(value || '').trim().replace(/^@+/, '').toLowerCase();
}

function isIgnoredChatBot(login, username) {
  const actors = [login, username].map(normalizeChatActor).filter(Boolean);
  return actors.some((name) => IGNORED_CHAT_BOTS.has(name));
}

function isUserNoticeLine(msgEl) {
  return !!msgEl?.matches?.('[data-test-selector="user-notice-line"], .user-notice-line');
}

function hasUserAuthoredChatBody(msgEl) {
  if (!msgEl) return false;

  const customRoot = msgEl.querySelector('[data-a-target="chat-resubscription-message__custom-message"]');
  const chatRoot = customRoot || msgEl;
  const body = chatRoot.querySelector(
    '[data-a-target="chat-line-message-body"], .chat-line__message-body, [data-a-target="chat-message-container"]',
  ) || chatRoot;

  if (body.querySelector('[data-a-target="chat-message-text"], .text-fragment')?.textContent?.trim()) {
    return true;
  }
  if (body.querySelector('img[data-emote-name], img.chat-line__message--emote, .chat-line__message--emote')) {
    return true;
  }
  return false;
}

function isPaidSuperChatNotice(snapshot) {
  const meta = snapshot?.superchatMeta;
  return !!snapshot?.superchat && !!meta && (meta.kind === 'cheer' || meta.kind === 'sub');
}

function lacksUserLiveChatContent(snapshot, msgEl = null) {
  if (!snapshot) return true;

  if (isPaidSuperChatNotice(snapshot)) return false;

  if (msgEl && hasUserAuthoredChatBody(msgEl)) return false;

  const plain = String(snapshot.message || '').replace(/\s+/g, ' ').trim();
  const hasRenderableParts = Array.isArray(snapshot.parts) && snapshot.parts.some((part) => (
    (part.type === 'text' && String(part.value || '').trim())
    || (part.type === 'emote' && (part.name || part.src))
  ));
  if (hasRenderableParts && !isUserNoticeLine(msgEl)) return false;

  if (msgEl && isUserNoticeLine(msgEl)) return true;

  if (!msgEl) return !plain;

  return !plain && !hasRenderableParts;
}

function isPureLinkMessage(text) {
  const cleaned = String(text || '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim();
  if (!cleaned) return false;
  const tokens = cleaned.split(/\s+/).filter(Boolean);
  if (!tokens.length) return false;
  return tokens.every((token) => PURE_LINK_TOKEN_RE.test(token));
}

function isChatDividerMessage(msgEl, snapshot = null) {
  if (msgEl) {
    if (msgEl.matches?.('.chat-line__status, [data-a-target="chat-welcome-message"], [data-test-selector="chat-line-status"]')) {
      return true;
    }
    if (msgEl.closest?.('.chat-line__status, [data-a-target="chat-welcome-message"], [class*="chat-line-status"]')) {
      return true;
    }
    if (msgEl.querySelector?.('.chat-line__status, [data-a-target="chat-welcome-message"]')) {
      return true;
    }
    if (msgEl.matches?.('[class*="separator"], [class*="divider"], [data-test-selector*="separator"]')
      || msgEl.querySelector?.('[class*="chat-separator"], [class*="message-separator"]')) {
      return true;
    }

    const hasUsername = !!msgEl.querySelector?.(SELECTORS.chatUsername);
    const login = normalizeChatActor(snapshot?.login || msgEl.getAttribute?.('data-a-user'));
    if (!hasUsername && !login) return true;
  }

  const text = String(snapshot?.message || msgEl?.textContent || '')
    .replace(/\s+/g, ' ')
    .trim();
  return !!text && CHAT_DIVIDER_TEXT_RE.test(text);
}

function shouldSuppressSubscribeSuperchat(settings, snapshot) {
  if (!settings?.superchatHideSubscribe) return false;
  const meta = snapshot?.superchatMeta;
  return !!snapshot?.superchat && meta?.kind === 'sub';
}

function shouldIgnoreChatPayload(snapshot, msgEl = null, settings = null) {
  if (!snapshot) return true;
  if (shouldSuppressSubscribeSuperchat(settings, snapshot)) return true;
  if (isIgnoredChatBot(snapshot.login, snapshot.username)) return true;
  if (isPaidSuperChatNotice(snapshot)) {
    if (isPureLinkMessage(snapshot.message)) return true;
    return false;
  }
  if (lacksUserLiveChatContent(snapshot, msgEl)) return true;
  if (isChatDividerMessage(msgEl, snapshot)) return true;
  if (isPureLinkMessage(snapshot.message)) return true;
  return false;
}

const FAVORITES_STORAGE_KEY = 'tbc_favorites_v1';
const FAVORITES_LIMIT = 80;
const FAVORITE_TEXT_LIMIT = 500;

const DEFAULT_FAVORITES_STATE = {
  items: [],
  wheel: {
    minIntervalSec: 3,
    maxIntervalSec: 20,
    maxCount: 30,
    maxDurationSec: 300,
  },
};

const WHEEL_MIN_INTERVAL_FLOOR = 1.5;

function createFavoriteId() {
  return `fav-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function sanitizeFavoriteShortcut(value) {
  if (value === null || value === undefined || value === '') return null;
  const digit = String(value).trim();
  if (!/^[0-9]$/.test(digit)) return null;
  return digit;
}

function sanitizeFavoriteChannel(value) {
  const login = normalizeTwitchLogin
    ? normalizeTwitchLogin(value)
    : String(value || '').trim().replace(/^@+/, '').toLowerCase();
  return login || null;
}

function sanitizeFavoriteItem(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const text = String(raw.text || '').trim().slice(0, FAVORITE_TEXT_LIMIT);
  if (!text) return null;
  // null channel => site-wide; string => channel-scoped.
  // Legacy items without `channel` are treated as global for backward compatibility.
  let channel = null;
  if (Object.prototype.hasOwnProperty.call(raw, 'channel')) {
    channel = raw.channel == null || raw.channel === ''
      ? null
      : sanitizeFavoriteChannel(raw.channel);
  }
  return {
    id: String(raw.id || createFavoriteId()),
    text,
    shortcut: sanitizeFavoriteShortcut(raw.shortcut),
    channel,
  };
}

function sanitizeFavoritesState(raw) {
  const base = {
    items: [],
    wheel: { ...DEFAULT_FAVORITES_STATE.wheel },
  };
  if (!raw || typeof raw !== 'object') return base;

  const seen = new Set();
  const items = [];
  for (const entry of Array.isArray(raw.items) ? raw.items : []) {
    const item = sanitizeFavoriteItem(entry);
    if (!item || seen.has(item.id)) continue;
    seen.add(item.id);
    items.push(item);
    if (items.length >= FAVORITES_LIMIT) break;
  }

  // Shortcuts must be unique within the same scope (global or a channel).
  const used = new Map();
  for (const item of items) {
    if (!item.shortcut) continue;
    const scope = item.channel || '__global__';
    const key = `${scope}:${item.shortcut}`;
    if (used.has(key)) item.shortcut = null;
    else used.set(key, item.id);
  }

  const wheelRaw = raw.wheel && typeof raw.wheel === 'object' ? raw.wheel : {};
  let minIntervalSec = clamp(
    finiteNumber(wheelRaw.minIntervalSec, DEFAULT_FAVORITES_STATE.wheel.minIntervalSec),
    WHEEL_MIN_INTERVAL_FLOOR,
    600,
  );
  let maxIntervalSec = clamp(
    finiteNumber(wheelRaw.maxIntervalSec, DEFAULT_FAVORITES_STATE.wheel.maxIntervalSec),
    WHEEL_MIN_INTERVAL_FLOOR,
    600,
  );
  if (minIntervalSec > maxIntervalSec) {
    const swap = minIntervalSec;
    minIntervalSec = maxIntervalSec;
    maxIntervalSec = swap;
  }
  return {
    items,
    wheel: {
      minIntervalSec,
      maxIntervalSec,
      maxCount: clamp(finiteNumber(wheelRaw.maxCount, DEFAULT_FAVORITES_STATE.wheel.maxCount), 1, 500),
      maxDurationSec: clamp(finiteNumber(wheelRaw.maxDurationSec, DEFAULT_FAVORITES_STATE.wheel.maxDurationSec), 10, 7200),
    },
  };
}

function loadFavoritesState() {
  try {
    return sanitizeFavoritesState(GM_getValue(FAVORITES_STORAGE_KEY, null));
  } catch (_) {
    return sanitizeFavoritesState(null);
  }
}

function saveFavoritesState(state) {
  const next = sanitizeFavoritesState(state);
  GM_setValue(FAVORITES_STORAGE_KEY, next);
  return next;
}

function favoriteVisibleForChannel(item, channelLogin) {
  if (!item) return false;
  if (!item.channel) return true;
  const channel = sanitizeFavoriteChannel(channelLogin);
  return !!channel && item.channel === channel;
}

function listFavoritesForChannel(state, channelLogin) {
  const items = Array.isArray(state?.items) ? state.items : [];
  return items.filter((item) => favoriteVisibleForChannel(item, channelLogin));
}

function addFavoriteText(text, { shortcut = null, channel = undefined } = {}) {
  const state = loadFavoritesState();
  const currentChannel = sanitizeFavoriteChannel(
    channel === undefined ? currentChannelLogin?.() : channel,
  );
  // Default: bind to current live channel. Fallback to global when channel unknown.
  const item = sanitizeFavoriteItem({
    text,
    shortcut,
    channel: channel === null ? null : currentChannel,
  });
  if (!item) return { state, item: null, added: false };

  if (item.shortcut) {
    state.items.forEach((entry) => {
      if (entry.shortcut !== item.shortcut) return;
      const sameScope = (entry.channel || null) === (item.channel || null);
      if (sameScope) entry.shortcut = null;
    });
  }

  const existing = state.items.find((entry) => (
    entry.text === item.text && (entry.channel || null) === (item.channel || null)
  ));
  if (existing) {
    if (item.shortcut) existing.shortcut = item.shortcut;
    return { state: saveFavoritesState(state), item: existing, added: false };
  }

  if (state.items.length >= FAVORITES_LIMIT) {
    return { state, item: null, added: false, full: true };
  }

  state.items.unshift(item);
  return { state: saveFavoritesState(state), item, added: true };
}

function setFavoriteGlobal(itemId, global = true) {
  const state = loadFavoritesState();
  const item = state.items.find((entry) => entry.id === itemId);
  if (!item) return { state, item: null };
  item.channel = global ? null : (sanitizeFavoriteChannel(currentChannelLogin?.()) || item.channel);
  if (item.shortcut) {
    state.items.forEach((entry) => {
      if (entry.id === item.id || entry.shortcut !== item.shortcut) return;
      const sameScope = (entry.channel || null) === (item.channel || null);
      if (sameScope) entry.shortcut = null;
    });
  }
  return { state: saveFavoritesState(state), item };
}

class ChatObserver {
  constructor({ getSettings, danmakuEmitter, translateQueue, isActive }) {
    this.getSettings = getSettings;
    this.danmakuEmitter = danmakuEmitter;
    this.translateQueue = translateQueue;
    this.isActive = isActive;
    this.observer = null;
    this.chatRoot = null;
    this.readyAt = 0;
    this.isVodChat = false;
    this.mode = 'dom';
    this.ffzActive = false;
    this.ircSource = null;
    this.ircBuffer = [];
    this.ircBackgroundOnly = false;
    this.recentEmitKeys = new Map();
  }

  isDuplicateEmit(login, message) {
    const text = String(message || '').trim();
    if (!text) return false;
    const key = `${String(login || '').toLowerCase()}|${text}`.slice(0, 240);
    const now = Date.now();
    const prev = this.recentEmitKeys.get(key);
    if (prev && now - prev < 3500) return true;
    this.recentEmitKeys.set(key, now);
    if (this.recentEmitKeys.size > 200) {
      for (const [k, ts] of this.recentEmitKeys) {
        if (now - ts > 4000) this.recentEmitKeys.delete(k);
      }
    }
    return false;
  }

  async start() {
    this.stop();
    this.readyAt = Date.now();
    this.ffzActive = await waitForFrankerFaceZ(1600);
    const vodId = currentVodId();
    const channel = currentChannelLogin();
    const preferIrc = !vodId && !!channel && this.ffzActive;

    if (preferIrc) {
      this.mode = 'irc';
      this.isVodChat = false;
      this.startIrc(channel);
      console.log('[TBC] Chat source: IRC (FrankerFaceZ detected)');
      return;
    }

    this.mode = 'dom';
    this.chatRoot = await waitForElement(SELECTORS.chatScroller, document, this.ffzActive ? 4000 : 30000);
    if (!this.chatRoot) {
      if (!vodId && channel) {
        this.mode = 'irc';
        this.isVodChat = false;
        this.startIrc(channel);
        console.warn('[TBC] Chat scroller missing; falling back to IRC');
        return;
      }
      console.warn('[TBC] Chat scroller not found');
      return;
    }

    markExistingMessages(this.chatRoot);
    this.isVodChat = !!this.chatRoot.closest('.video-chat')
      || this.chatRoot.classList.contains('video-chat__message-list-wrapper')
      || !!this.chatRoot.querySelector('.vod-message');

    this.observer = new MutationObserver((mutations) => {
      if (!this.isActive()) return;
      for (const mut of mutations) {
        for (const node of mut.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;
          this.handleNode(node);
        }
      }
    });

    this.observer.observe(this.chatRoot, { childList: true, subtree: true });
    console.log(`[TBC] Chat observer started (${this.isVodChat ? 'vod' : 'live'}${this.ffzActive ? ', ffz-dom' : ''})`);
  }

  startIrc(fallbackChannel, { backgroundOnly = false } = {}) {
    if (this.ircSource) return;
    this.ircBackgroundOnly = !!backgroundOnly;
    this.ircBuffer = [];
    this.ircSource = new TwitchIrcChatSource({
      getChannel: () => currentChannelLogin() || fallbackChannel || '',
      isActive: this.isActive,
      onMessage: (parsed) => this.handleIrcMessage(parsed),
    });
    this.ircSource.start();
  }

  stop() {
    this.observer?.disconnect();
    this.observer = null;
    this.chatRoot = null;
    this.isVodChat = false;
    this.mode = 'dom';
    this.ircSource?.stop();
    this.ircSource = null;
    this.ircBuffer = [];
    this.ircBackgroundOnly = false;
    this.recentEmitKeys.clear();
  }

  ensureBackgroundIrc() {
    if (currentVodId()) return;
    const channel = currentChannelLogin();
    if (!channel || this.ircSource) return;
    this.startIrc(channel, { backgroundOnly: this.mode === 'dom' });
    console.log('[TBC] IRC started for background / PiP chat');
  }

  maybeStopBackgroundIrc() {
    if (!this.ircSource || !this.ircBackgroundOnly) return;
    if (enhancedPip?.isOpen?.()) return;
    if (document.hidden) return;
    this.ircSource.stop();
    this.ircSource = null;
    this.ircBackgroundOnly = false;
  }

  shouldEmit(msgEl) {
    if (!this.isActive()) return false;

    if (Date.now() - this.readyAt < WARMUP_MS) {
      msgEl.classList.add('tbc-processed');
      return false;
    }

    if (!isLiveMessage(msgEl, this.chatRoot)) {
      msgEl.classList.add('tbc-processed');
      return false;
    }

    return true;
  }

  handleNode(node) {
    const candidates = node.matches?.(SELECTORS.chatMessage)
      ? [node]
      : Array.from(node.querySelectorAll?.(SELECTORS.chatMessage) || []);

    for (const msgEl of candidates) {
      if (!this.shouldEmit(msgEl)) continue;
      const parsed = parseChatMessage(msgEl);
      if (!parsed) continue;
      if (shouldIgnoreChatPayload(parsed, msgEl, this.getSettings())) continue;
      this.emitDanmaku(parsed, msgEl);
    }
  }

  handleIrcMessage(parsed) {
    if (!this.isActive()) return;
    if (Date.now() - this.readyAt < WARMUP_MS) return;

    this.pushIrcBuffer(parsed);
    const payload = {
      username: parsed.username,
      usernameColor: parsed.usernameColor,
      profileUrl: parsed.profileUrl,
      avatarUrl: parsed.avatarUrl || '',
      login: parsed.login || '',
      message: parsed.message,
      parts: parsed.parts,
      originalMessage: parsed.originalMessage,
      superchat: !!parsed.superchat,
      superchatStyle: parsed.superchatStyle || null,
      superchatMeta: parsed.superchatMeta || null,
    };
    if (shouldIgnoreChatPayload(payload, null, this.getSettings())) return;
    this.emitDanmaku(payload, null);
  }

  pushIrcBuffer(parsed) {
    this.ircBuffer.push({
      id: `irc-${Date.now()}-${this.ircBuffer.length}-${parsed.login}`,
      offsetSeconds: this.ircBuffer.length,
      createdAt: new Date().toISOString(),
      userId: '',
      login: parsed.login || '',
      displayName: parsed.username || parsed.login || '',
      message: parsed.message || '',
      color: parsed.usernameColor || '',
      bits: Number(parsed.bits) || 0,
      superchat: !!parsed.superchat,
    });
    while (this.ircBuffer.length > 500) this.ircBuffer.shift();
  }

  getIrcHistoryComments() {
    return this.ircBuffer.slice();
  }

  clearIrcHistory() {
    this.ircBuffer = [];
  }

  emitDanmaku(parsed, msgEl) {
    const settings = this.getSettings();
    if (!this.isActive()) return;

    if (this.isDuplicateEmit(parsed.login || parsed.username, parsed.message)) return;

    if (isKeywordBlocked(parsed.message, settings.blockedKeywords)) return;

    const base = {
      username: parsed.username,
      usernameColor: parsed.usernameColor,
      profileUrl: parsed.profileUrl,
      avatarUrl: parsed.avatarUrl || '',
      login: parsed.login || '',
      originalMessage: parsed.message,
      superchat: !!parsed.superchat,
      superchatStyle: parsed.superchatStyle || null,
      superchatMeta: parsed.superchatMeta || null,
    };

    const hasTranslatableText = parsed.parts.some((part) => (
      part.type === 'text' && translatableCore(part.value)
    ));

    // Avoid injecting translations into FFZ-managed chat DOM.
    const allowChatTranslation = !!msgEl && !this.ffzActive && this.mode === 'dom';

    if (!settings.translateEnabled || !hasTranslatableText) {
      this.danmakuEmitter.enqueue({
        ...base,
        message: parsed.message,
        parts: parsed.parts,
        translated: false,
      });
      return;
    }

    this.translateQueue.enqueue(parsed.message, parsed.parts, (parts) => {
      if (!this.isActive()) return;
      const latest = this.getSettings();
      const message = partsToPlain(parts) || parsed.message;
      if (isKeywordBlocked(parsed.message, latest.blockedKeywords)) return;
      if (isKeywordBlocked(message, latest.blockedKeywords)) return;
      const manualTl = hasManualChatTranslation(msgEl);
      if (latest.translateEnabled && latest.translateInChat && allowChatTranslation && !manualTl) {
        applyChatTranslation(msgEl, message, parsed.message);
      } else if (msgEl && !manualTl) {
        removeChatTranslation(msgEl);
      }
      this.danmakuEmitter.enqueue({
        ...base,
        message,
        parts,
        translated: message !== parsed.message,
      });
    });
  }
}

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

    .tbc-superchat-item.tbc-sc-compact .tbc-sc-tier {
      min-width: 1.8em;
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

const ICON_DANMAKU_ON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M11.989 4.828c-.47 0-.975.004-1.515.012l-1.71-2.566a1.008 1.008 0 0 0-1.678 1.118l.999 1.5c-.681.018-1.403.04-2.164.068a4.013 4.013 0 0 0-3.83 3.44c-.165 1.15-.245 2.545-.245 4.185 0 1.965.115 3.67.35 5.116a4.012 4.012 0 0 0 3.763 3.363l.906.046c1.205.063 1.808.095 3.607.095a.988.988 0 0 0 0-1.975c-1.758 0-2.339-.03-3.501-.092l-.915-.047a2.037 2.037 0 0 1-1.91-1.708c-.216-1.324-.325-2.924-.325-4.798 0-1.563.076-2.864.225-3.904.14-.977.96-1.713 1.945-1.747 2.444-.087 4.465-.13 6.063-.131 1.598 0 3.62.044 6.064.13.96.034 1.71.81 1.855 1.814.075.524.113 1.962.141 3.065v.002c.01.342.017.65.025.88a.987.987 0 1 0 1.974-.068c-.008-.226-.016-.523-.025-.856v-.027c-.03-1.118-.073-2.663-.16-3.276-.273-1.906-1.783-3.438-3.74-3.507-.9-.032-1.743-.058-2.531-.078l1.05-1.46a1.008 1.008 0 0 0-1.638-1.177l-1.862 2.59c-.38-.004-.744-.007-1.088-.007h-.13Zm.521 4.775h-1.32v4.631h2.222v.847h-2.618v1.078h2.618l.003.678c.36.026.714.163 1.01.407h.11v-1.085h2.694v-1.078h-2.695v-.847H16.8v-4.63h-1.276a8.59 8.59 0 0 0 .748-1.42L15.183 7.8a14.232 14.232 0 0 1-.814 1.804h-1.518l.693-.308a8.862 8.862 0 0 0-.814-1.408l-1.045.352c.297.396.572.847.825 1.364Zm-4.18 3.564.154-1.485h1.98V8.294h-3.2v.98H9.33v1.43H7.472l-.308 3.453h2.277c0 1.166-.044 1.925-.12 2.277-.078.352-.386.528-.936.528-.308 0-.616-.022-.902-.055l.297 1.067.062.005c.285.02.551.04.818.04 1.001-.067 1.562-.419 1.694-1.057.11-.638.176-1.903.176-3.795h-2.2Zm7.458.11v-.858h-1.254v.858h1.254Zm-2.376-.858v.858h-1.199v-.858h1.2Zm-1.199-.946h1.2v-.902h-1.2v.902Zm2.321 0v-.902h1.254v.902h-1.254Z" clip-rule="evenodd"/><path fill-rule="evenodd" d="M22.846 14.627a1 1 0 0 0-1.412.075l-5.091 5.703-2.216-2.275-.097-.086-.008-.005a1 1 0 0 0-1.322 1.493l2.963 3.041.093.083.007.005c.407.315 1 .27 1.354-.124l5.81-6.505.08-.102.005-.008a1 1 0 0 0-.166-1.295Z" clip-rule="evenodd"/></svg>`;

const ICON_DANMAKU_OFF = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="m8.085 4.891-.999-1.499a1.008 1.008 0 0 1 1.679-1.118l1.709 2.566c.54-.008 1.045-.012 1.515-.012h.13c.345 0 .707.003 1.088.007l1.862-2.59a1.008 1.008 0 0 1 1.637 1.177l-1.049 1.46c.788.02 1.631.046 2.53.078 1.958.069 3.468 1.6 3.74 3.507.088.613.13 2.158.16 3.276l.001.027c.01.333.017.63.025.856a.987.987 0 0 1-1.974.069c-.008-.23-.016-.539-.025-.881v-.002c-.028-1.103-.066-2.541-.142-3.065-.143-1.004-.895-1.78-1.854-1.813-2.444-.087-4.466-.13-6.064-.131-1.598 0-3.619.044-6.063.13a2.037 2.037 0 0 0-1.945 1.748c-.15 1.04-.225 2.341-.225 3.904 0 1.874.11 3.474.325 4.798.154.949.95 1.66 1.91 1.708a97.58 97.58 0 0 0 5.416.139.988.988 0 0 1 0 1.975c-2.196 0-3.61-.047-5.513-.141A4.012 4.012 0 0 1 2.197 17.7c-.236-1.446-.351-3.151-.351-5.116 0-1.64.08-3.035.245-4.184A4.013 4.013 0 0 1 5.92 4.96c.761-.027 1.483-.05 2.164-.069Zm4.436 4.707h-1.32v4.63h2.222v.848h-2.618v1.078h2.431a5.01 5.01 0 0 1 3.575-3.115V9.598h-1.276a8.59 8.59 0 0 0 .748-1.42l-1.089-.384a14.232 14.232 0 0 1-.814 1.804h-1.518l.693-.308a8.862 8.862 0 0 0-.814-1.408l-1.045.352c.297.396.572.847.825 1.364Zm-4.18 3.564.154-1.485h1.98V8.289h-3.2v.979h2.067v1.43H7.483l-.308 3.454h2.277c0 1.166-.044 1.925-.12 2.277-.078.352-.386.528-.936.528-.308 0-.616-.022-.902-.055l.297 1.067.062.004c.285.02.551.04.818.04 1.001-.066 1.562-.418 1.694-1.056.11-.638.176-1.903.176-3.795h-2.2Zm7.458.11v-.858h-1.254v.858H15.8Zm-2.376-.858v.858h-1.199v-.858h1.2Zm-1.199-.946h1.2v-.902h-1.2v.902Zm2.321 0v-.902H15.8v.902h-1.254Zm3.517 10.594a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-.002-1.502a2.5 2.5 0 0 1-2.217-3.657l3.326 3.398a2.49 2.49 0 0 1-1.109.259Zm2.5-2.5c0 .42-.103.815-.286 1.162l-3.328-3.401a2.5 2.5 0 0 1 3.614 2.239Z" clip-rule="evenodd"/></svg>`;

const ICON_SETTINGS = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="m15.645 4.881 1.06-1.473a.998.998 0 1 0-1.622-1.166L13.22 4.835a110.67 110.67 0 0 0-1.1-.007h-.131c-.47 0-.975.004-1.515.012L8.783 2.3A.998.998 0 0 0 7.12 3.408l.988 1.484c-.688.019-1.418.042-2.188.069a4.013 4.013 0 0 0-3.83 3.44c-.165 1.15-.245 2.545-.245 4.185 0 1.965.115 3.67.35 5.116a4.012 4.012 0 0 0 3.763 3.363c1.903.094 3.317.141 5.513.141a.988.988 0 0 0 0-1.975 97.58 97.58 0 0 1-5.416-.139 2.037 2.037 0 0 1-1.91-1.708c-.216-1.324-.325-2.924-.325-4.798 0-1.563.076-2.864.225-3.904.14-.977.96-1.713 1.945-1.747 2.444-.087 4.465-.13 6.063-.131 1.598 0 3.62.044 6.064.13.96.034 1.71.81 1.855 1.814.075.524.113 1.962.141 3.065v.002c.005.183.01.07.014-.038.004-.096.008-.189.011-.081a.987.987 0 1 0 1.974-.069c-.004-.105-.007-.009-.011.09-.002.056-.004.112-.007.135l-.002.01a.574.574 0 0 1-.005-.091v-.027c-.03-1.118-.073-2.663-.16-3.276-.273-1.906-1.783-3.438-3.74-3.507-.905-.032-1.752-.058-2.543-.079Zm-3.113 4.703h-1.307v4.643h2.2v.04l.651-1.234c.113-.215.281-.389.482-.509v-.11h.235c.137-.049.283-.074.433-.074h1.553V9.584h-1.264a8.5 8.5 0 0 0 .741-1.405l-1.078-.381c-.24.631-.501 1.23-.806 1.786h-1.503l.686-.305c-.228-.501-.5-.959-.806-1.394l-1.034.348c.294.392.566.839.817 1.35Zm-1.7 5.502h2.16l-.564 1.068h-1.595v-1.068Zm-2.498-1.863.152-1.561h1.96V8.289H7.277v.969h2.048v1.435h-1.84l-.306 3.51h2.254c0 1.155-.043 1.906-.12 2.255-.076.348-.38.523-.925.523-.305 0-.61-.022-.893-.055l.294 1.056.061.005c.282.02.546.039.81.039.991-.065 1.547-.414 1.677-1.046.11-.631.175-1.883.175-3.757H8.334Zm5.09-.8v.85h-1.188v-.85h1.187Zm-1.188-.955h1.187v-.893h-1.187v.893Zm2.322.007v-.893h1.241v.893h-1.241Zm.528 2.757a1.26 1.26 0 0 1 1.087-.627l4.003-.009a1.26 1.26 0 0 1 1.094.63l1.721 2.982c.226.39.225.872-.001 1.263l-1.743 3a1.26 1.26 0 0 1-1.086.628l-4.003.009a1.26 1.26 0 0 1-1.094-.63l-1.722-2.982a1.26 1.26 0 0 1 .002-1.263l1.742-3Zm1.967.858a1.26 1.26 0 0 0-1.08.614l-.903 1.513a1.26 1.26 0 0 0-.002 1.289l.885 1.492c.227.384.64.62 1.086.618l2.192-.005a1.26 1.26 0 0 0 1.08-.615l.904-1.518a1.26 1.26 0 0 0 .001-1.288l-.884-1.489a1.26 1.26 0 0 0-1.086-.616l-2.193.005Zm2.517 2.76a1.4 1.4 0 1 1-2.8 0 1.4 1.4 0 0 1 2.8 0Z" clip-rule="evenodd"/></svg>`;

const ICON_COPY = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`;

const ICON_SPEECH_ON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4.03v8.05A4.5 4.5 0 0 0 16.5 12zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;

const ICON_SPEECH_MUTE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.8 8.8 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z"/></svg>`;

const ICON_SPEECH_OFF = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3z"/></svg>`;

const ICON_TRANSLATE_ON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0 0 14.07 6H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/></svg>`;

const ICON_TRANSLATE_OFF = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0 0 14.07 6H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/><path d="M3.4 2.8 2 4.2l18 18 1.4-1.4-18-18z" opacity="0.95"/></svg>`;

const ICON_DOWNLOAD = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a1 1 0 0 1 1 1v8.59l2.3-2.3a1 1 0 0 1 1.4 1.42l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.42l2.3 2.3V4a1 1 0 0 1 1-1zM5 19a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1z"/></svg>`;

const ICON_CHAT_CLEAR_PATH = 'M360 184h-8c4.4 0 8-3.6 8-8v8h304v-8c0 4.4 3.6 8 8 8h-8v72h72v-80c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v80h72v-72zm504 72H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60.4l24.7 523c1.6 34.1 29.8 61 63.9 61h454c34.2 0 62.3-26.8 63.9-61l24.7-523H888c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zM731.3 840H292.7l-24.2-512h487l-24.2 512z';
const ICON_CHAT_CLEAR = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 1024 1024" fill="currentColor" aria-hidden="true"><path d="${ICON_CHAT_CLEAR_PATH}"></path></svg>`;

const ICON_CHAT_SEND = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3.4 20.6 21 12 3.4 3.4l-.1 6.8L15 12 3.3 13.8z"/></svg>`;

const ICON_CLOSE = `<svg width="24" height="24" viewBox="0 0 24 24" focusable="false" aria-hidden="true" role="presentation"><path fill="currentColor" d="M6.414 5 5 6.414l5.588 5.588L5 17.59l1.414 1.414 5.588-5.588 5.588 5.588 1.414-1.414-5.588-5.588 5.588-5.588L17.59 5l-5.588 5.588L6.414 5Z"></path></svg>`;

const ICON_FAVORITE = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`;

const ICON_PIP = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 5.5A2.5 2.5 0 0 1 5.5 3h13A2.5 2.5 0 0 1 21 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 18.5v-13Zm2.5-.5a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 .5.5H11V13.5A1.5 1.5 0 0 1 12.5 12H19V5.5a.5.5 0 0 0-.5-.5h-13ZM19 14h-6.5a.5.5 0 0 0-.5.5V19H19v-5Z"/></svg>`;

const ICON_PIP_ASPECT_UNLOCK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v1h2V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z"/></svg>`;

const ICON_PIP_ASPECT_LOCK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"/></svg>`;

class SettingsPanel {
  constructor({ settings, onChange, onClose }) {
    this.settings = settings;
    this.onChange = onChange;
    this.onClose = onClose;
    this.balloon = null;
    this.anchor = null;
    this.isOpen = false;
    this.boundReposition = () => this.reposition();
    this.boundOutsideClick = (e) => this.handleOutsideClick(e);
    this.uiBindings = {};
  }

  syncFromSettings() {
    if (!this.isOpen || !this.balloon) return;
    for (const [key, binding] of Object.entries(this.uiBindings)) {
      const value = this.settings[key];
      if (binding.type === 'checkbox') {
        binding.el.checked = !!value;
      } else if (binding.type === 'range') {
        binding.el.value = String(value);
        if (binding.format) binding.valueEl.textContent = binding.format(value);
      } else if (binding.type === 'select') {
        binding.el.value = String(value);
      }
    }
    this.syncTranslateDependentRows();
  }

  toggle(anchor) {
    if (this.isOpen && this.anchor === anchor) {
      this.close();
    } else {
      this.open(anchor);
    }
  }

  open(anchor) {
    this.close();
    this.anchor = anchor;
    this.isOpen = true;
    this.render();
    this.reposition();
    requestAnimationFrame(() => this.reposition());

    window.addEventListener('resize', this.boundReposition);
    document.addEventListener('fullscreenchange', this.boundReposition);
    document.addEventListener('webkitfullscreenchange', this.boundReposition);
    document.addEventListener('scroll', this.boundReposition, true);
    setTimeout(() => document.addEventListener('click', this.boundOutsideClick, true), 0);
  }

  close() {
    this.isOpen = false;
    this.anchor = null;
    this.balloon?.remove();
    this.balloon = null;
    this.twitchBlockInput = null;
    this.twitchBlockAddBtn = null;
    this.twitchBlockStatus = null;
    this.twitchBlockList = null;
    this.twitchBlockRefreshBtn = null;
    this.twitchBlockBusy = false;

    window.removeEventListener('resize', this.boundReposition);
    document.removeEventListener('fullscreenchange', this.boundReposition);
    document.removeEventListener('webkitfullscreenchange', this.boundReposition);
    document.removeEventListener('scroll', this.boundReposition, true);
    document.removeEventListener('click', this.boundOutsideClick, true);
    this.onClose?.();
  }

  handleOutsideClick(e) {
    if (!this.balloon || !this.isOpen) return;
    if (this.balloon.contains(e.target)) return;
    if (this.anchor?.contains(e.target)) return;
    this.close();
  }

  reposition() {
    if (!this.balloon || !this.anchor) return;

    const mountTarget = getFullscreenElement() || document.body;
    if (this.balloon.parentElement !== mountTarget) {
      mountTarget.appendChild(this.balloon);
    }

    const rect = this.anchor.getBoundingClientRect();
    const width = 300;
    const gap = 8;
    const height = this.balloon.offsetHeight;

    let left = rect.right - width;
    let top = rect.top - height - gap;

    left = clamp(left, 8, window.innerWidth - width - 8);
    if (top < 8) {
      top = rect.bottom + gap;
    }

    Object.assign(this.balloon.style, {
      position: 'fixed',
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      zIndex: '100000',
    });
  }

  updateSetting(key, value) {
    this.settings[key] = value;
    saveSettings(this.settings);
    this.onChange(this.settings);
  }

  createToggle(label, key, options = {}) {
    const row = document.createElement('div');
    row.className = 'tbc-balloon-row tbc-balloon-row--toggle';

    const labelEl = document.createElement('span');
    labelEl.className = 'tbc-balloon-label';
    labelEl.textContent = label;

    const switchWrap = document.createElement('label');
    switchWrap.className = 'tbc-switch';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = !!this.settings[key];

    const slider = document.createElement('span');
    slider.className = 'tbc-switch-slider';

    input.addEventListener('change', () => {
      this.updateSetting(key, input.checked);
      options.onChange?.(input.checked);
    });

    this.uiBindings[key] = { type: 'checkbox', el: input };
    switchWrap.append(input, slider);
    row.append(labelEl, switchWrap);
    return row;
  }

  createHint(text) {
    const hint = document.createElement('p');
    hint.className = 'tbc-setting-hint';
    hint.textContent = text;
    return hint;
  }

  syncTranslateDependentRows() {
    const enabled = !!this.settings.translateEnabled;
    if (this.translateInChatRow) this.translateInChatRow.hidden = !enabled;
  }

  createRange(label, key, min, max, step, format) {
    const row = document.createElement('div');
    row.className = 'tbc-balloon-row tbc-balloon-row--field';

    const header = document.createElement('div');
    header.className = 'tbc-balloon-field-header';

    const labelEl = document.createElement('span');
    labelEl.className = 'tbc-balloon-label';
    labelEl.textContent = label;

    const valueSpan = document.createElement('span');
    valueSpan.className = 'tbc-balloon-value';
    valueSpan.textContent = format(this.settings[key]);

    header.append(labelEl, valueSpan);

    const input = document.createElement('input');
    input.type = 'range';
    input.className = 'tbc-balloon-range';
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.value = String(this.settings[key]);

    input.addEventListener('input', () => {
      const val = Number(input.value);
      valueSpan.textContent = format(val);
      this.updateSetting(key, val);
    });

    this.uiBindings[key] = { type: 'range', el: input, valueEl: valueSpan, format };
    row.append(header, input);
    return row;
  }

  createSelect(label, key, options) {
    const row = document.createElement('div');
    row.className = 'tbc-balloon-row tbc-balloon-row--field';

    const labelEl = document.createElement('div');
    labelEl.className = 'tbc-balloon-label';
    labelEl.textContent = label;

    const select = document.createElement('select');
    select.className = 'tbc-balloon-select';
    for (const opt of options) {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.label;
      if (opt.value === this.settings[key]) option.selected = true;
      select.appendChild(option);
    }

    select.addEventListener('change', () => {
      this.updateSetting(key, select.value);
    });

    this.uiBindings[key] = { type: 'select', el: select };
    row.append(labelEl, select);
    return row;
  }

  createTwitchBlockUsersRow() {
    const row = document.createElement('div');
    row.className = 'tbc-balloon-row tbc-balloon-row--field';

    const header = document.createElement('div');
    header.className = 'tbc-block-users-header';

    const labelEl = document.createElement('div');
    labelEl.className = 'tbc-balloon-label';
    labelEl.textContent = t('blockUsers');

    const refreshBtn = document.createElement('button');
    refreshBtn.type = 'button';
    refreshBtn.className = 'tbc-block-users-refresh';
    refreshBtn.textContent = t('blockUsersRefresh');
    refreshBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.loadTwitchBlockedUsers();
    });
    header.append(labelEl, refreshBtn);

    const hint = document.createElement('div');
    hint.className = 'tbc-keyword-hint';
    hint.textContent = t('blockUsersHint');

    const form = document.createElement('div');
    form.className = 'tbc-keyword-form';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'tbc-keyword-input';
    input.maxLength = 25;
    input.placeholder = t('blockUsersPlaceholder');
    input.setAttribute('aria-label', t('blockUsers'));

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'tbc-keyword-add';
    addBtn.textContent = t('blockUsersAdd');

    const status = document.createElement('div');
    status.className = 'tbc-block-users-status';

    const list = document.createElement('div');
    list.className = 'tbc-block-users-list';

    this.twitchBlockInput = input;
    this.twitchBlockAddBtn = addBtn;
    this.twitchBlockStatus = status;
    this.twitchBlockList = list;
    this.twitchBlockRefreshBtn = refreshBtn;

    const commit = async () => {
      const login = normalizeTwitchLogin(input.value);
      if (!login || this.twitchBlockBusy) return;
      this.setTwitchBlockBusy(true);
      this.setTwitchBlockStatus('');
      try {
        await blockTwitchUser(login, { sourceContext: 'SETTINGS' });
        input.value = '';
        await this.loadTwitchBlockedUsers({ silent: true });
      } catch (error) {
        const code = error?.code || '';
        if (code === 'not_logged_in') this.setTwitchBlockStatus(t('blockUsersNeedLogin'));
        else if (code === 'user_not_found') this.setTwitchBlockStatus(t('chatMenuBlockNotFound'));
        else this.setTwitchBlockStatus(t('blockUsersAddFailed'));
      } finally {
        this.setTwitchBlockBusy(false);
      }
    };

    addBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      commit();
    });
    input.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') {
        e.preventDefault();
        commit();
      }
    });

    form.append(input, addBtn);
    row.append(header, hint, form, status, list);
    this.loadTwitchBlockedUsers();
    return row;
  }

  setTwitchBlockStatus(text) {
    if (!this.twitchBlockStatus) return;
    this.twitchBlockStatus.textContent = text || '';
    this.twitchBlockStatus.hidden = !text;
  }

  setTwitchBlockBusy(busy) {
    this.twitchBlockBusy = !!busy;
    if (this.twitchBlockInput) this.twitchBlockInput.disabled = !!busy;
    if (this.twitchBlockAddBtn) this.twitchBlockAddBtn.disabled = !!busy;
    if (this.twitchBlockRefreshBtn) this.twitchBlockRefreshBtn.disabled = !!busy;
    this.twitchBlockList?.querySelectorAll('button').forEach((btn) => {
      btn.disabled = !!busy;
    });
  }

  async loadTwitchBlockedUsers({ silent = false } = {}) {
    if (!this.twitchBlockList) return;
    if (!silent) {
      this.twitchBlockList.replaceChildren();
      this.setTwitchBlockStatus(t('blockUsersLoading'));
    }
    this.setTwitchBlockBusy(true);
    try {
      const users = await fetchTwitchBlockedUsers();
      this.renderTwitchBlockedUsers(users);
      if (!silent) this.setTwitchBlockStatus('');
    } catch (error) {
      this.twitchBlockList.replaceChildren();
      const code = error?.code || '';
      this.setTwitchBlockStatus(
        code === 'not_logged_in' ? t('blockUsersNeedLogin') : t('blockUsersLoadFailed'),
      );
    } finally {
      this.setTwitchBlockBusy(false);
    }
  }

  renderTwitchBlockedUsers(users) {
    if (!this.twitchBlockList) return;
    this.twitchBlockList.replaceChildren();
    if (!users.length) {
      const empty = document.createElement('div');
      empty.className = 'tbc-keyword-empty';
      empty.textContent = t('blockUsersEmpty');
      this.twitchBlockList.appendChild(empty);
      return;
    }

    users.forEach((user) => {
      const item = document.createElement('div');
      item.className = 'tbc-block-user';

      const avatar = document.createElement('img');
      avatar.className = 'tbc-block-user-avatar';
      avatar.alt = '';
      avatar.width = 28;
      avatar.height = 28;
      avatar.loading = 'lazy';
      avatar.referrerPolicy = 'no-referrer';
      avatar.src = user.profileImageURL || '';

      const meta = document.createElement('div');
      meta.className = 'tbc-block-user-meta';

      const name = document.createElement('div');
      name.className = 'tbc-block-user-name';
      name.textContent = user.displayName || user.login;
      name.title = user.login ? `${user.displayName || user.login} (@${user.login})` : (user.displayName || '');

      const date = document.createElement('div');
      date.className = 'tbc-block-user-date';
      date.textContent = user.blockedAtLabel || '';

      meta.append(name, date);

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'tbc-block-user-remove';
      removeBtn.textContent = t('blockUsersRemove');
      removeBtn.setAttribute(
        'aria-label',
        `${t('blockUsersRemove')} ${user.displayName || user.login}`,
      );
      removeBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (this.twitchBlockBusy) return;
        this.setTwitchBlockBusy(true);
        this.setTwitchBlockStatus('');
        try {
          if (user.id) await unblockTwitchUserById(user.id);
          else await unblockTwitchUser(user.login);
          await this.loadTwitchBlockedUsers({ silent: true });
        } catch (error) {
          const code = error?.code || '';
          this.setTwitchBlockStatus(
            code === 'not_logged_in' ? t('blockUsersNeedLogin') : t('blockUsersRemoveFailed'),
          );
        } finally {
          this.setTwitchBlockBusy(false);
        }
      });

      item.append(avatar, meta, removeBtn);
      this.twitchBlockList.appendChild(item);
    });
  }

  createKeywordBlock() {
    const row = document.createElement('div');
    row.className = 'tbc-balloon-row tbc-balloon-row--field';

    const labelEl = document.createElement('div');
    labelEl.className = 'tbc-balloon-label';
    labelEl.textContent = t('blockKeywords');

    const hint = document.createElement('div');
    hint.className = 'tbc-keyword-hint';
    hint.textContent = t('blockKeywordsHint');

    const form = document.createElement('div');
    form.className = 'tbc-keyword-form';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'tbc-keyword-input';
    input.maxLength = 40;
    input.placeholder = t('blockKeywordsPlaceholder');
    input.setAttribute('aria-label', t('blockKeywords'));

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'tbc-keyword-add';
    addBtn.textContent = t('blockKeywordsAdd');

    const list = document.createElement('div');
    list.className = 'tbc-keyword-list';

    const commit = () => {
      const incoming = input.value.split(/[,，]/).map((item) => item.trim()).filter(Boolean);
      if (!incoming.length) return;
      const next = sanitizeBlockedKeywords([...(this.settings.blockedKeywords || []), ...incoming]);
      input.value = '';
      this.updateSetting('blockedKeywords', next);
      this.renderKeywordList(list);
    };

    addBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      commit();
    });
    input.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') {
        e.preventDefault();
        commit();
      }
    });

    form.append(input, addBtn);
    row.append(labelEl, hint, form, list);
    this.renderKeywordList(list);
    return row;
  }

  renderKeywordList(list) {
    list.replaceChildren();
    const keywords = this.settings.blockedKeywords || [];
    if (!keywords.length) {
      const empty = document.createElement('div');
      empty.className = 'tbc-keyword-empty';
      empty.textContent = t('blockKeywordsEmpty');
      list.appendChild(empty);
      return;
    }

    keywords.forEach((keyword, index) => {
      const chip = document.createElement('span');
      chip.className = 'tbc-keyword';

      const text = document.createElement('span');
      text.className = 'tbc-keyword-text';
      text.textContent = keyword;
      text.title = keyword;

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'tbc-keyword-remove';
      removeBtn.setAttribute('aria-label', `${t('blockKeywordsRemove')} ${keyword}`);
      removeBtn.textContent = '×';
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const next = (this.settings.blockedKeywords || []).filter((_, itemIndex) => itemIndex !== index);
        this.updateSetting('blockedKeywords', next);
        this.renderKeywordList(list);
      });

      chip.append(text, removeBtn);
      list.appendChild(chip);
    });
  }

  createDivider() {
    const div = document.createElement('div');
    div.className = 'tbc-balloon-divider';
    return div;
  }

  render() {
    this.uiBindings = {};
    this.balloon = document.createElement('div');
    this.balloon.className = 'tbc-balloon';
    this.balloon.setAttribute('role', 'dialog');
    this.balloon.setAttribute('aria-label', t('panelTitle'));

    const header = document.createElement('div');
    header.className = 'tbc-balloon-header';

    const title = document.createElement('div');
    title.className = 'tbc-balloon-title';
    title.textContent = t('panelTitle');

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'tbc-balloon-close';
    closeBtn.setAttribute('aria-label', t('panelClose'));
    closeBtn.textContent = t('panelClose');
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.close();
    });

    header.append(title, closeBtn);

    const body = document.createElement('div');
    body.className = 'tbc-balloon-body';

    body.append(
      this.createRange(t('scrollSpeed'), 'speed', 1, 10, 1, (v) => String(v)),
      this.createRange(t('fontSize'), 'fontSize', 14, 40, 1, (v) => `${v}px`),
      this.createRange(t('danmakuOpacity'), 'danmakuOpacity', 10, 100, 5, (v) => `${v}%`),
      this.createSelect(t('fontFamily'), 'fontFamily', getFontOptions()),
      this.createSelect(t('scrollArea'), 'scrollArea', getScrollAreaOptions()),
      this.createDivider(),
      this.createToggle(t('superchatPinned'), 'superchatPinned'),
      this.createToggle(t('superchatOverlayDanmaku'), 'superchatOverlayDanmaku'),
      this.createToggle(t('superchatHideSubscribe'), 'superchatHideSubscribe'),
      this.createToggle(t('superchatCompact'), 'superchatCompact'),
      this.createRange(t('superchatMaxWidth'), 'superchatMaxWidth', 240, 720, 10, (v) => `${v}px`),
      this.createSelect(t('superchatPosition'), 'superchatPosition', getSuperchatPositionOptions()),
      this.createRange(t('superchatDuration'), 'superchatDuration', 2, 300, 1, (v) => `${v} ${t('speechSeconds')}`),
      this.createToggle(t('superchatDurationByAmount'), 'superchatDurationByAmount'),
      this.createSelect(t('superchatAnimation'), 'superchatAnimation', getSuperchatAnimationOptions()),
      this.createDivider(),
      this.createToggle(t('translateEnable'), 'translateEnabled', {
        onChange: () => this.syncTranslateDependentRows(),
      }),
      this.createSelect(t('translateProvider'), 'translateProvider', getTranslateProviderOptions()),
      this.createSelect(t('translateTarget'), 'translateTargetLang', getTranslateLangOptions()),
      this.createRange(t('translateSpeed'), 'translateSpeed', 1, 10, 1, (v) => `${v} ${t('translateSpeedUnit')}`),
    );

    this.translateInChatRow = this.createToggle(t('translateInChat'), 'translateInChat');
    body.append(
      this.translateInChatRow,
      this.createDivider(),
      this.createKeywordBlock(),
      this.createDivider(),
      this.createTwitchBlockUsersRow(),
    );
    this.syncTranslateDependentRows();

    this.balloon.append(header, body);
    this.balloon.addEventListener('click', (e) => e.stopPropagation());

    const mountTarget = getFullscreenElement() || document.body;
    mountTarget.appendChild(this.balloon);
  }
}

class SpeechPanel {
  constructor({ settings, onChange, onClose }) {
    this.settings = settings;
    this.onChange = onChange;
    this.onClose = onClose;
    this.balloon = null;
    this.anchor = null;
    this.isOpen = false;
    this.langSelect = null;
    this.voiceSelect = null;
    this.boundReposition = () => this.reposition();
    this.boundOutsideClick = (e) => this.handleOutsideClick(e);
    this.boundVoices = () => this.fillVoices();
    this.uiBindings = {};
  }

  syncFromSettings() {
    if (!this.isOpen || !this.balloon) return;
    for (const [key, binding] of Object.entries(this.uiBindings)) {
      const value = this.settings[key];
      if (binding.type === 'checkbox') {
        binding.el.checked = !!value;
      } else if (binding.type === 'range') {
        binding.el.value = String(value);
        if (binding.format) binding.valueEl.textContent = binding.format(value);
      }
    }
    this.fillVoices();
  }

  toggle(anchor) {
    if (this.isOpen && this.anchor === anchor) this.close();
    else this.open(anchor);
  }

  open(anchor) {
    this.close();
    this.anchor = anchor;
    this.isOpen = true;
    this.render();
    this.reposition();
    requestAnimationFrame(() => this.reposition());
    window.speechSynthesis?.addEventListener('voiceschanged', this.boundVoices);

    window.addEventListener('resize', this.boundReposition);
    document.addEventListener('fullscreenchange', this.boundReposition);
    document.addEventListener('webkitfullscreenchange', this.boundReposition);
    document.addEventListener('scroll', this.boundReposition, true);
    setTimeout(() => document.addEventListener('click', this.boundOutsideClick, true), 0);
  }

  close() {
    const wasOpen = this.isOpen;
    this.isOpen = false;
    this.anchor = null;
    this.balloon?.remove();
    this.balloon = null;
    this.langSelect = null;
    this.voiceSelect = null;
    window.speechSynthesis?.removeEventListener('voiceschanged', this.boundVoices);
    window.removeEventListener('resize', this.boundReposition);
    document.removeEventListener('fullscreenchange', this.boundReposition);
    document.removeEventListener('webkitfullscreenchange', this.boundReposition);
    document.removeEventListener('scroll', this.boundReposition, true);
    document.removeEventListener('click', this.boundOutsideClick, true);
    if (wasOpen) this.onClose?.();
  }

  handleOutsideClick(e) {
    if (!this.balloon || !this.isOpen) return;
    if (this.balloon.contains(e.target)) return;
    if (this.anchor?.contains(e.target)) return;
    this.close();
  }

  reposition() {
    if (!this.balloon || !this.anchor) return;

    const mountTarget = getFullscreenElement() || document.body;
    if (this.balloon.parentElement !== mountTarget) {
      mountTarget.appendChild(this.balloon);
    }

    const rect = this.anchor.getBoundingClientRect();
    const width = 320;
    const gap = 8;
    const height = this.balloon.offsetHeight;
    let left = rect.right - width;
    let top = rect.top - height - gap;

    left = clamp(left, 8, window.innerWidth - width - 8);
    if (top < 8) top = rect.bottom + gap;

    Object.assign(this.balloon.style, {
      position: 'fixed',
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      zIndex: '100000',
    });
  }

  updateSetting(key, value) {
    this.settings[key] = value;
    saveSettings(this.settings);
    this.onChange(this.settings);
    if ((key === 'speechEnabled' && !value) || (key === 'speechVolume' && Number(value) <= 0)) {
      cancelSpeech();
    }
  }

  createToggle(label, key) {
    const row = document.createElement('div');
    row.className = 'tbc-balloon-row tbc-balloon-row--toggle';

    const labelEl = document.createElement('span');
    labelEl.className = 'tbc-balloon-label';
    labelEl.textContent = label;

    const switchWrap = document.createElement('label');
    switchWrap.className = 'tbc-switch';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = !!this.settings[key];

    const slider = document.createElement('span');
    slider.className = 'tbc-switch-slider';

    input.addEventListener('change', () => {
      this.updateSetting(key, input.checked);
    });

    this.uiBindings[key] = { type: 'checkbox', el: input };
    switchWrap.append(input, slider);
    row.append(labelEl, switchWrap);
    return row;
  }

  render() {
    this.uiBindings = {};
    this.balloon = document.createElement('div');
    this.balloon.className = 'tbc-balloon tbc-speech-panel';

    const header = document.createElement('div');
    header.className = 'tbc-balloon-header';

    const title = document.createElement('div');
    title.className = 'tbc-balloon-title';
    title.textContent = t('speechPanelTitle');

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'tbc-balloon-close';
    closeBtn.textContent = t('panelClose');
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.close();
    });
    header.append(title, closeBtn);

    const body = document.createElement('div');
    body.className = 'tbc-balloon-body tbc-balloon-body--speech';

    if (!speechSupported()) {
      const note = document.createElement('p');
      note.className = 'tbc-speech-note';
      note.textContent = t('speechUnsupported');
      body.appendChild(note);
      this.balloon.append(header, body);
      (getFullscreenElement() || document.body).appendChild(this.balloon);
      return;
    }

    body.append(
      this.createToggle(t('speechEnable'), 'speechEnabled'),
      this.createTest(),
      this.createDivider(),
      this.createRange(t('speechVolume'), 'speechVolume', 0, 100, 5, (v) => `${v}%`),
      this.createRange(t('speechPitch'), 'speechPitch', 0, 200, 10, (v) => `${v}%`),
      this.createVoices(),
      this.createDivider(),
      this.createRange(t('speechRate'), 'speechRate', 50, 200, 10, (v) => `${v}%`),
      this.createToggle(t('speechPace'), 'speechPace'),
      this.createRange(t('speechMaxSeconds'), 'speechMaxSeconds', 1, 15, 1, (v) => `${v} ${t('speechSeconds')}`),
      this.createHint(t('speechPaceHint')),
      this.createDivider(),
      this.createRange(t('speechBuffer'), 'speechBuffer', 1, 25, 1, (v) => String(v)),
      this.createHint(t('speechBufferHint')),
    );

    this.balloon.append(header, body);
    this.balloon.addEventListener('click', (e) => e.stopPropagation());
    this.balloon.addEventListener('pointerdown', (e) => e.stopPropagation());
    (getFullscreenElement() || document.body).appendChild(this.balloon);
    this.fillVoices();
  }

  createTest() {
    const row = document.createElement('div');
    row.className = 'tbc-balloon-row tbc-balloon-row--field';

    const label = document.createElement('span');
    label.className = 'tbc-balloon-label';
    label.textContent = t('speechTest');

    const controls = document.createElement('div');
    controls.className = 'tbc-speech-test';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'tbc-balloon-input';
    input.value = t('speechTestText');

    const play = document.createElement('button');
    play.type = 'button';
    play.className = 'tbc-speech-play';
    play.textContent = '\u25B6';
    play.setAttribute('aria-label', t('speechPlay'));
    play.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      previewSpeech(input.value, false);
    });

    const fast = document.createElement('button');
    fast.type = 'button';
    fast.className = 'tbc-speech-play';
    fast.textContent = '▶▶';
    fast.setAttribute('aria-label', t('speechPlayFast'));
    fast.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      previewSpeech(input.value, true);
    });

    controls.append(input, play, fast);
    row.append(label, controls);
    return row;
  }

  createVoices() {
    const row = document.createElement('div');
    row.className = 'tbc-balloon-row tbc-balloon-row--field';

    const langLabel = document.createElement('span');
    langLabel.className = 'tbc-balloon-label';
    langLabel.textContent = t('speechVoiceLang');

    this.langSelect = document.createElement('select');
    this.langSelect.className = 'tbc-balloon-select';
    this.langSelect.addEventListener('change', () => {
      const lang = this.langSelect.value;
      this.updateSetting('speechLang', lang);
      const voices = this.voicesForLang(lang);
      const next = voices[0]?.voiceURI || '';
      this.updateSetting('speechVoice', next);
      this.fillVoices();
    });

    const voiceLabel = document.createElement('span');
    voiceLabel.className = 'tbc-balloon-label';
    voiceLabel.textContent = t('speechVoice');

    this.voiceSelect = document.createElement('select');
    this.voiceSelect.className = 'tbc-balloon-select';
    this.voiceSelect.addEventListener('change', () => {
      this.updateSetting('speechVoice', this.voiceSelect.value);
    });

    row.append(langLabel, this.langSelect, voiceLabel, this.voiceSelect);
    return row;
  }

  voicesForLang(lang) {
    const voices = listSpeechVoices();
    if (!lang) return voices;
    const wanted = lang.toLowerCase();
    return voices.filter((voice) => voice.lang.toLowerCase() === wanted);
  }

  fillVoices() {
    if (!this.langSelect || !this.voiceSelect) return;
    const voices = listSpeechVoices();
    const langs = [];
    for (const voice of voices) {
      if (voice.lang && !langs.includes(voice.lang)) langs.push(voice.lang);
    }
    langs.sort();

    const lang = this.settings.speechLang || '';
    this.langSelect.replaceChildren();
    this.langSelect.appendChild(new Option(t('speechVoiceDefault'), ''));
    for (const code of langs) {
      this.langSelect.appendChild(new Option(code, code));
    }
    this.langSelect.value = langs.includes(lang) ? lang : '';

    const visible = this.voicesForLang(this.langSelect.value);
    this.voiceSelect.replaceChildren();
    this.voiceSelect.appendChild(new Option(t('speechVoiceDefault'), ''));
    for (const voice of visible) {
      const option = new Option(`${voice.name} (${voice.lang})`, voice.voiceURI);
      this.voiceSelect.appendChild(option);
    }
    const selected = this.settings.speechVoice || '';
    this.voiceSelect.value = [...this.voiceSelect.options].some((option) => option.value === selected) ? selected : '';
  }

  createRange(label, key, min, max, step, format) {
    const row = document.createElement('div');
    row.className = 'tbc-balloon-row tbc-balloon-row--field';

    const header = document.createElement('div');
    header.className = 'tbc-balloon-field-header';
    const labelEl = document.createElement('span');
    labelEl.className = 'tbc-balloon-label';
    labelEl.textContent = label;
    const valueSpan = document.createElement('span');
    valueSpan.className = 'tbc-balloon-value';
    valueSpan.textContent = format(this.settings[key]);
    header.append(labelEl, valueSpan);

    const input = document.createElement('input');
    input.type = 'range';
    input.className = 'tbc-balloon-range';
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.value = String(this.settings[key]);
    input.addEventListener('input', () => {
      const val = Number(input.value);
      valueSpan.textContent = format(val);
      this.updateSetting(key, val);
    });

    this.uiBindings[key] = { type: 'range', el: input, valueEl: valueSpan, format };
    row.append(header, input);
    return row;
  }

  createSection(text) {
    const el = document.createElement('div');
    el.className = 'tbc-balloon-section';
    el.textContent = text;
    return el;
  }

  createHint(text) {
    const el = document.createElement('p');
    el.className = 'tbc-speech-note';
    el.textContent = text;
    return el;
  }

  createDivider() {
    const el = document.createElement('div');
    el.className = 'tbc-balloon-divider';
    return el;
  }
}

class HistoryPanel {
  constructor({ onClose, getIrcComments }) {
    this.onClose = onClose;
    this.getIrcComments = getIrcComments;
    this.balloon = null;
    this.anchor = null;
    this.isOpen = false;
    this.job = 0;
    this.loadToken = 0;
    this.state = 'idle';
    this.paused = false;
    this.lastCount = 0;
    this.video = null;
    this.videoId = '';
    this.mode = null;
    this.duration = 0;
    this.start = 0;
    this.end = 0;
    this.boundReposition = () => this.reposition();
    this.boundOutsideClick = (event) => this.handleOutsideClick(event);
  }

  toggle(anchor) {
    if (this.isOpen && this.anchor === anchor) this.close();
    else this.open(anchor);
  }

  open(anchor) {
    this.close();
    this.anchor = anchor;
    this.isOpen = true;
    this.render();
    this.reposition();
    requestAnimationFrame(() => this.reposition());
    window.addEventListener('resize', this.boundReposition);
    document.addEventListener('fullscreenchange', this.boundReposition);
    document.addEventListener('webkitfullscreenchange', this.boundReposition);
    document.addEventListener('scroll', this.boundReposition, true);
    setTimeout(() => document.addEventListener('click', this.boundOutsideClick, true), 0);
    this.loadVideo();
  }

  close() {
    const wasOpen = this.isOpen;
    this.job += 1;
    this.loadToken += 1;
    this.state = 'idle';
    this.paused = false;
    this.lastCount = 0;
    this.isOpen = false;
    this.anchor = null;
    this.balloon?.remove();
    this.balloon = null;
    window.removeEventListener('resize', this.boundReposition);
    document.removeEventListener('fullscreenchange', this.boundReposition);
    document.removeEventListener('webkitfullscreenchange', this.boundReposition);
    document.removeEventListener('scroll', this.boundReposition, true);
    document.removeEventListener('click', this.boundOutsideClick, true);
    if (wasOpen) this.onClose?.();
  }

  handleOutsideClick(event) {
    if (!this.balloon || !this.isOpen) return;
    if (this.balloon.contains(event.target)) return;
    if (this.anchor?.contains(event.target)) return;
    if (this.state !== 'idle') return;
    this.close();
  }

  reposition() {
    if (!this.balloon || !this.anchor) return;
    const mountTarget = getFullscreenElement() || document.body;
    if (this.balloon.parentElement !== mountTarget) mountTarget.appendChild(this.balloon);

    const rect = this.anchor.getBoundingClientRect();
    const width = 360;
    const gap = 8;
    const height = this.balloon.offsetHeight;
    let left = rect.right - width;
    let top = rect.top - height - gap;
    left = clamp(left, 8, window.innerWidth - width - 8);
    if (top < 8) top = rect.bottom + gap;
    Object.assign(this.balloon.style, {
      position: 'fixed',
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      zIndex: '100000',
    });
  }

  setStatus(text, kind) {
    if (!this.statusEl) return;
    this.statusEl.textContent = text || '';
    this.statusEl.classList.toggle('tbc-history-status--error', kind === 'error');
    this.statusEl.classList.toggle('tbc-history-status--ok', kind === 'ok');
  }

  setDownloadState(state) {
    this.state = state;
    const idle = state === 'idle';
    const running = state === 'running';
    const paused = state === 'paused';
    this.downloadBtn.hidden = !idle;
    this.pauseBtn.hidden = !running;
    this.resumeBtn.hidden = !paused;
    this.cancelBtn.hidden = idle;
    this.downloadBtn.disabled = !this.video;
    for (const input of this.balloon.querySelectorAll('input, select')) {
      if (input.closest('.tbc-history-actions')) continue;
      input.disabled = !idle || (input.type === 'range' && !this.duration);
    }
  }

  async loadVideo() {
    const token = ++this.loadToken;
    this.video = null;
    this.videoId = currentVodId();
    this.mode = null;
    this.duration = 0;
    this.metaEl.textContent = '';
    this.setDownloadState('idle');
    this.downloadBtn.disabled = true;

    if (!this.videoId) {
      const liveInfo = readLiveChannelInfo();
      if (token !== this.loadToken) return;
      if (!liveInfo) {
        this.syncRange();
        this.setStatus(t('historyNeedSource'), 'error');
        return;
      }
      this.mode = 'live';
      this.video = liveInfo;
      this.duration = 0;
      this.start = 0;
      this.end = 0;
      this.metaEl.textContent = liveInfo.channel || liveInfo.login;
      this.metaEl.title = liveInfo.title || liveInfo.login;
      this.syncRange();
      this.setDownloadState('idle');
      this.setStatus(t('historyLiveReady'), '');
      return;
    }

    this.mode = 'vod';
    this.setStatus(t('historyLoading'), '');
    try {
      const info = await fetchVodInfo(this.videoId);
      if (token !== this.loadToken) return;
      if (!info) {
        this.syncRange();
        this.setStatus(t('historyMissing'), 'error');
        return;
      }
      this.video = info;
      this.duration = info.lengthSeconds || playerDurationSeconds();
      this.start = 0;
      this.end = this.duration;
      this.metaEl.textContent = info.title || info.id;
      this.metaEl.title = info.title || '';
      this.syncRange();
      this.setDownloadState('idle');
      this.setStatus('', '');
    } catch {
      if (token !== this.loadToken) return;
      this.syncRange();
      this.setStatus(t('historyFailed'), 'error');
    }
  }

  syncRange() {
    if (this.mode === 'live') {
      this.rangeHeader.hidden = true;
      this.rangeWrap.hidden = true;
      this.rangeUnknown.hidden = true;
      this.liveHint.hidden = false;
      return;
    }
    this.rangeHeader.hidden = false;
    this.liveHint.hidden = true;
    const known = this.duration > 0;
    this.rangeWrap.hidden = !known;
    this.rangeUnknown.hidden = known || !this.video;
    if (!known) return;
    this.startInput.max = String(this.duration);
    this.endInput.max = String(this.duration);
    this.startInput.value = String(this.start);
    this.endInput.value = String(this.end);
    this.updateRange();
  }

  updateRange() {
    if (!this.duration) return;
    const startPct = (this.start / this.duration) * 100;
    const endPct = (this.end / this.duration) * 100;
    this.rangeFill.style.left = `${startPct}%`;
    this.rangeFill.style.width = `${Math.max(0, endPct - startPct)}%`;
    this.rangeLabel.textContent = `${formatChatClock(this.start)} – ${formatChatClock(this.end)}`;
  }

  selectedFilters() {
    return {
      keywords: this.keywordInput.value,
      usernames: this.usernameInput.value,
      includeSuperchat: this.superchatInput.checked,
      format: this.formatSelect.value,
    };
  }

  pauseDownload() {
    if (this.state !== 'running') return;
    this.paused = true;
    this.setDownloadState('paused');
    this.setStatus(fill('historyPaused', { count: this.lastCount }), '');
    this.reposition();
  }

  resumeDownload() {
    if (this.state !== 'paused') return;
    this.paused = false;
    this.setDownloadState('running');
    this.setStatus(fill('historyProgress', { count: this.lastCount }), '');
  }

  cancelDownload() {
    if (this.state === 'idle') return;
    this.job += 1;
    this.paused = false;
    this.setDownloadState('idle');
    this.setStatus(t('historyCancelled'), '');
  }

  async startDownload() {
    if (!this.video || this.state !== 'idle') return;
    const token = ++this.job;
    const filters = this.selectedFilters();
    this.paused = false;
    this.lastCount = 0;
    this.setDownloadState('running');
    this.setStatus(fill('historyProgress', { count: 0 }), '');

    try {
      const progress = ({ count }) => {
        if (token !== this.job) return;
        this.lastCount = count;
        if (!this.paused) {
          this.setStatus(fill('historyProgress', { count }), '');
          this.reposition();
        }
      };
      const controls = {
        keywords: filters.keywords,
        usernames: filters.usernames,
        includeSuperchat: filters.includeSuperchat,
        shouldCancel: () => token !== this.job,
        shouldPause: () => token === this.job && this.paused,
        onProgress: progress,
      };
      const ircComments = this.mode === 'live' && typeof this.getIrcComments === 'function'
        ? this.getIrcComments()
        : null;
      const result = this.mode === 'live'
        ? await collectLiveDomChat({
          ...controls,
          ircComments: Array.isArray(ircComments) ? ircComments : null,
        })
        : await downloadVodChat({
          videoId: this.video.id,
          start: this.duration ? this.start : 0,
          end: this.duration ? this.end : Infinity,
          ...controls,
        });
      if (token !== this.job) return;
      if (!result.comments.length) {
        this.setStatus(result.scanned ? t('historyNoMatch') : t('historyEmpty'), 'error');
        return;
      }
      const file = buildChatExport(filters.format, this.video, result);
      saveChatFile(file.filename, file.text, file.mime);
      this.setStatus(fill('historyDone', { count: result.comments.length }), 'ok');
    } catch (error) {
      if (token !== this.job || error?.code === 'cancel') return;
      const missingKey = this.mode === 'live' ? 'historyEmpty' : 'historyMissing';
      this.setStatus(error?.code === 'missing' ? t(missingKey) : t('historyFailed'), 'error');
    } finally {
      if (token === this.job) {
        this.paused = false;
        this.setDownloadState('idle');
      }
    }
  }

  render() {
    this.balloon = document.createElement('div');
    this.balloon.className = 'tbc-balloon tbc-history-panel';

    const header = document.createElement('div');
    header.className = 'tbc-balloon-header';
    const title = document.createElement('div');
    title.className = 'tbc-balloon-title';
    title.textContent = t('historyPanelTitle');
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'tbc-balloon-close';
    closeBtn.textContent = t('panelClose');
    closeBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      this.close();
    });
    header.append(title, closeBtn);

    const body = document.createElement('div');
    body.className = 'tbc-balloon-body tbc-balloon-body--history';
    this.metaEl = document.createElement('p');
    this.metaEl.className = 'tbc-history-meta';
    body.append(
      this.metaEl,
      this.createTextField('historyKeyword', 'keywordInput', 'historyKeywordPlaceholder', 'historyKeywordHint'),
      this.createTextField('historyUsername', 'usernameInput', 'historyUsernamePlaceholder', 'historyUsernameHint'),
      this.createSuperchatToggle(),
      this.createRangeField(),
      this.createFormatField(),
      this.createActions(),
    );

    this.balloon.append(header, body);
    this.balloon.addEventListener('click', (event) => event.stopPropagation());
    this.balloon.addEventListener('pointerdown', (event) => event.stopPropagation());
    (getFullscreenElement() || document.body).appendChild(this.balloon);
  }

  createTextField(labelKey, field, placeholderKey, hintKey) {
    const row = document.createElement('div');
    row.className = 'tbc-balloon-row tbc-balloon-row--field';
    const label = document.createElement('span');
    label.className = 'tbc-balloon-label';
    label.textContent = t(labelKey);
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'tbc-balloon-input';
    input.placeholder = t(placeholderKey);
    input.autocomplete = 'off';
    this[field] = input;
    const hint = document.createElement('p');
    hint.className = 'tbc-history-hint';
    hint.textContent = t(hintKey);
    row.append(label, input, hint);
    return row;
  }

  createSuperchatToggle() {
    const row = document.createElement('div');
    row.className = 'tbc-balloon-row tbc-balloon-row--field';
    const line = document.createElement('div');
    line.className = 'tbc-balloon-row--toggle';
    line.style.padding = '0';
    const label = document.createElement('span');
    label.className = 'tbc-balloon-label';
    label.textContent = t('historyIncludeSuperchat');
    const switchWrap = document.createElement('label');
    switchWrap.className = 'tbc-switch';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = true;
    const slider = document.createElement('span');
    slider.className = 'tbc-switch-slider';
    switchWrap.append(input, slider);
    line.append(label, switchWrap);
    const hint = document.createElement('p');
    hint.className = 'tbc-history-hint';
    hint.textContent = t('historyIncludeSuperchatHint');
    this.superchatInput = input;
    row.append(line, hint);
    return row;
  }

  createRangeField() {
    const row = document.createElement('div');
    row.className = 'tbc-balloon-row tbc-balloon-row--field';
    this.rangeHeader = document.createElement('div');
    this.rangeHeader.className = 'tbc-balloon-field-header';
    const label = document.createElement('span');
    label.className = 'tbc-balloon-label';
    label.textContent = t('historyRange');
    this.rangeLabel = document.createElement('span');
    this.rangeLabel.className = 'tbc-balloon-value';
    this.rangeHeader.append(label, this.rangeLabel);

    this.rangeWrap = document.createElement('div');
    this.rangeWrap.className = 'tbc-history-range';
    this.rangeWrap.hidden = true;
    const track = document.createElement('div');
    track.className = 'tbc-history-track';
    this.rangeFill = document.createElement('div');
    this.rangeFill.className = 'tbc-history-fill';
    track.appendChild(this.rangeFill);

    this.startInput = document.createElement('input');
    this.startInput.type = 'range';
    this.startInput.min = '0';
    this.startInput.value = '0';
    this.startInput.addEventListener('input', () => {
      this.start = Math.min(Number(this.startInput.value), this.end);
      this.startInput.value = String(this.start);
      this.updateRange();
    });
    this.endInput = document.createElement('input');
    this.endInput.type = 'range';
    this.endInput.min = '0';
    this.endInput.value = '0';
    this.endInput.addEventListener('input', () => {
      this.end = Math.max(Number(this.endInput.value), this.start);
      this.endInput.value = String(this.end);
      this.updateRange();
    });
    this.rangeWrap.append(track, this.startInput, this.endInput);

    this.rangeUnknown = document.createElement('p');
    this.rangeUnknown.className = 'tbc-history-hint';
    this.rangeUnknown.textContent = t('historyRangeUnknown');
    this.rangeUnknown.hidden = true;
    this.liveHint = document.createElement('p');
    this.liveHint.className = 'tbc-history-hint';
    this.liveHint.textContent = t('historyLiveHint');
    this.liveHint.hidden = true;
    row.append(this.rangeHeader, this.rangeWrap, this.rangeUnknown, this.liveHint);
    return row;
  }

  createFormatField() {
    const row = document.createElement('div');
    row.className = 'tbc-balloon-row tbc-balloon-row--field';
    const label = document.createElement('span');
    label.className = 'tbc-balloon-label';
    label.textContent = t('historyFormat');
    this.formatSelect = document.createElement('select');
    this.formatSelect.className = 'tbc-balloon-select';
    for (const [value, key] of [['json', 'historyFormatJson'], ['csv', 'historyFormatCsv'], ['txt', 'historyFormatTxt']]) {
      this.formatSelect.appendChild(new Option(t(key), value));
    }
    row.append(label, this.formatSelect);
    return row;
  }

  createActionButton(className, label, onClick) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = label;
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      onClick();
    });
    return button;
  }

  createActions() {
    const row = document.createElement('div');
    row.className = 'tbc-history-actions';
    const buttons = document.createElement('div');
    buttons.className = 'tbc-history-buttons';

    this.downloadBtn = this.createActionButton('tbc-history-download', t('historyDownload'), () => this.startDownload());
    this.pauseBtn = this.createActionButton('tbc-history-pause', t('historyPause'), () => this.pauseDownload());
    this.resumeBtn = this.createActionButton('tbc-history-resume', t('historyResume'), () => this.resumeDownload());
    this.cancelBtn = this.createActionButton('tbc-history-cancel', t('historyCancel'), () => this.cancelDownload());
    this.pauseBtn.hidden = true;
    this.resumeBtn.hidden = true;
    this.cancelBtn.hidden = true;
    this.downloadBtn.disabled = true;

    this.statusEl = document.createElement('p');
    this.statusEl.className = 'tbc-history-status';
    buttons.append(this.downloadBtn, this.pauseBtn, this.resumeBtn, this.cancelBtn);
    row.append(buttons, this.statusEl);
    return row;
  }
}

class FavoritesPanel {
  constructor() {
    this.state = loadFavoritesState();
    this.balloon = null;
    this.anchor = null;
    this.btn = null;
    this.wrap = null;
    this.isOpen = false;
    this.sending = false;
    this.wheel = {
      running: false,
      timer: null,
      statusTimer: null,
      sent: 0,
      startedAt: 0,
      endsAt: 0,
      lastId: '',
      failStreak: 0,
    };
    this.retryTimer = null;
    this.boundKeyDown = (e) => this.onKeyDown(e);
    this.boundReposition = () => this.reposition();
    this.boundOutsideClick = (e) => this.handleOutsideClick(e);
    this.listEl = null;
    this.statusEl = null;
    this.wheelStatusEl = null;
    this.wheelToggleBtn = null;
  }

  attach() {
    document.addEventListener('keydown', this.boundKeyDown, true);
  }

  destroy() {
    this.stopWheel(false);
    this.close();
    document.removeEventListener('keydown', this.boundKeyDown, true);
    clearTimeout(this.retryTimer);
    this.wrap?.remove();
    if (this.btn && this.btn !== this.wrap) this.btn.remove();
    this.wrap = null;
    this.btn = null;
    this.anchor = null;
  }

  remount() {
    if (this.wrap?.isConnected || this.btn?.isConnected) return;
    this.wrap?.remove();
    if (this.btn && this.btn !== this.wrap) this.btn.remove();
    this.wrap = null;
    this.btn = null;
    clearTimeout(this.retryTimer);
    this.retryTimer = setTimeout(() => this.mount(), 500);
  }

  currentChannel() {
    return normalizeTwitchLogin(currentChannelLogin?.() || '');
  }

  visibleItems() {
    return listFavoritesForChannel(this.state, this.currentChannel());
  }

  /**
   * Only accept the shared Bits + Emote toolbar host (Twitch `cedEhw`).
   * The host must contain both buttons under two distinct children.
   */
  findInputActionsHost() {
    const bitsBtn = document.querySelector(SELECTORS.bitsButton);
    const emoteBtn = document.querySelector(SELECTORS.emotePickerButton);
    if (!bitsBtn || !emoteBtn) return { host: null, bitsBtn, emoteBtn };

    const bitsPath = new Set();
    for (let node = bitsBtn; node; node = node.parentElement) bitsPath.add(node);

    let host = null;
    for (let node = emoteBtn; node; node = node.parentElement) {
      if (bitsPath.has(node)) {
        host = node;
        break;
      }
    }
    if (!host || host === document.body || host === document.documentElement) {
      return { host: null, bitsBtn, emoteBtn };
    }
    if (!host.contains(bitsBtn) || !host.contains(emoteBtn)) {
      return { host: null, bitsBtn, emoteBtn };
    }

    const children = Array.from(host.children || []);
    const bitsChild = children.find((child) => child.contains(bitsBtn));
    const emoteChild = children.find((child) => child.contains(emoteBtn));
    // Reject oversized ancestors where both controls sit under the same child.
    if (!bitsChild || !emoteChild || bitsChild === emoteChild) {
      return { host: null, bitsBtn, emoteBtn };
    }

    return { host, bitsBtn, emoteBtn };
  }

  createButton() {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tbc-fav-btn';
    btn.setAttribute('data-a-target', 'tbc-favorites-button');
    btn.setAttribute('data-tbc-favorites', 'true');
    btn.setAttribute('aria-label', t('favoritesTitle'));
    btn.setAttribute('title', t('favoritesTitle'));
    btn.innerHTML = ICON_FAVORITE;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggle(btn);
    });
    return btn;
  }

  createFromBitsShell(bitsBtn) {
    const shell = bitsBtn.closest('[class*="InjectLayout"]') || bitsBtn.parentElement;
    if (!shell?.parentElement) return null;
    const wrap = shell.cloneNode(true);
    wrap.classList.add('tbc-fav-wrap');
    wrap.setAttribute('data-tbc-favorites-wrap', 'true');
    wrap.removeAttribute('id');
    const btn = wrap.querySelector('button') || wrap.querySelector('[role="button"]');
    if (!btn) return null;
    btn.classList.add('tbc-fav-btn');
    btn.type = 'button';
    btn.setAttribute('data-a-target', 'tbc-favorites-button');
    btn.setAttribute('data-tbc-favorites', 'true');
    btn.setAttribute('aria-label', t('favoritesTitle'));
    btn.setAttribute('title', t('favoritesTitle'));
    btn.removeAttribute('data-test-selector');
    btn.removeAttribute('id');
    const svg = btn.querySelector('svg');
    if (svg) svg.outerHTML = ICON_FAVORITE;
    else btn.innerHTML = ICON_FAVORITE;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggle(btn);
    });
    return { wrap, btn, host: shell.parentElement, after: shell };
  }

  async mount() {
    if (this.wrap?.isConnected || this.btn?.isConnected) return;

    await waitForElement(
      `${SELECTORS.bitsButton}, ${SELECTORS.emotePickerButton}`,
      document,
      12000,
    );

    if (document.querySelector('[data-tbc-favorites="true"], [data-tbc-favorites-wrap="true"]')) return;

    const { host, bitsBtn, emoteBtn } = this.findInputActionsHost();
    // Refuse to mount unless Bits + Emote both live in the same toolbar host.
    if (!host || !bitsBtn || !emoteBtn) {
      clearTimeout(this.retryTimer);
      this.retryTimer = setTimeout(() => this.mount(), 1200);
      return;
    }

    const created = this.createFromBitsShell(bitsBtn);
    if (created?.wrap && created.host === host) {
      this.wrap = created.wrap;
      this.btn = created.btn;
      if (created.after?.nextSibling) {
        host.insertBefore(created.wrap, created.after.nextSibling);
      } else {
        host.appendChild(created.wrap);
      }
      return;
    }

    this.btn = this.createButton();
    this.wrap = this.btn;
    host.appendChild(this.btn);
  }

  isEditableTarget(target) {
    if (!target || target === document.body || target === document.documentElement) return false;
    const el = target.nodeType === 1 ? target : target.parentElement;
    if (!el) return false;
    const tag = el.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (el.isContentEditable) return true;
    return !!el.closest?.('input, textarea, select, [contenteditable="true"], [role="textbox"]');
  }

  onKeyDown(e) {
    if (e.isComposing || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (!/^[0-9]$/.test(e.key)) return;
    if (this.isEditableTarget(e.target)) return;
    if (this.isOpen && this.balloon?.contains(e.target)) return;

    const channel = this.currentChannel();
    const visible = listFavoritesForChannel(this.state, channel);
    // Prefer channel-scoped shortcut over a colliding global one.
    const item = visible.find((entry) => entry.shortcut === e.key && entry.channel === channel)
      || visible.find((entry) => entry.shortcut === e.key && !entry.channel);
    if (!item) return;
    e.preventDefault();
    e.stopPropagation();
    this.sendFavorite(item);
  }

  toggle(anchor) {
    if (this.isOpen && this.anchor === anchor) this.close();
    else this.open(anchor || this.btn);
  }

  open(anchor) {
    this.close();
    this.state = loadFavoritesState();
    this.anchor = anchor || this.btn;
    this.isOpen = true;
    this.render();
    this.reposition();
    requestAnimationFrame(() => this.reposition());
    window.addEventListener('resize', this.boundReposition);
    document.addEventListener('fullscreenchange', this.boundReposition);
    document.addEventListener('webkitfullscreenchange', this.boundReposition);
    document.addEventListener('scroll', this.boundReposition, true);
    setTimeout(() => document.addEventListener('click', this.boundOutsideClick, true), 0);
  }

  close() {
    const wasOpen = this.isOpen;
    this.isOpen = false;
    this.anchor = null;
    this.balloon?.remove();
    this.balloon = null;
    this.listEl = null;
    this.statusEl = null;
    this.wheelStatusEl = null;
    this.wheelToggleBtn = null;
    window.removeEventListener('resize', this.boundReposition);
    document.removeEventListener('fullscreenchange', this.boundReposition);
    document.removeEventListener('webkitfullscreenchange', this.boundReposition);
    document.removeEventListener('scroll', this.boundReposition, true);
    document.removeEventListener('click', this.boundOutsideClick, true);
    if (wasOpen) this.refreshWheelControls();
  }

  handleOutsideClick(event) {
    if (!this.balloon || !this.isOpen) return;
    if (this.balloon.contains(event.target)) return;
    if (this.anchor?.contains?.(event.target)) return;
    this.close();
  }

  reposition() {
    if (!this.balloon || !this.anchor) return;
    const mountTarget = getFullscreenElement() || document.body;
    if (this.balloon.parentElement !== mountTarget) mountTarget.appendChild(this.balloon);

    const rect = this.anchor.getBoundingClientRect();
    const width = 380;
    const gap = 8;
    const height = this.balloon.offsetHeight || 320;
    let left = rect.right - width;
    let top = rect.top - height - gap;
    left = clamp(left, 8, window.innerWidth - width - 8);
    if (top < 8) top = Math.min(window.innerHeight - height - 8, rect.bottom + gap);
    Object.assign(this.balloon.style, {
      position: 'fixed',
      left: `${left}px`,
      top: `${Math.max(8, top)}px`,
      width: `${width}px`,
      zIndex: '100040',
    });
  }

  setStatus(message, ok = false) {
    if (!this.statusEl) return;
    this.statusEl.textContent = message || '';
    this.statusEl.classList.toggle('is-ok', !!ok && !!message);
  }

  persist() {
    this.state = saveFavoritesState(this.state);
    return this.state;
  }

  addFromText(text) {
    const result = addFavoriteText(text);
    this.state = result.state;
    if (result.full) {
      this.setStatus(t('favoritesFull'));
      return false;
    }
    if (!result.item) {
      this.setStatus(t('favoritesEmptyText'));
      return false;
    }
    if (this.isOpen) this.renderList();
    this.setStatus(result.added ? t('favoritesAdded') : t('favoritesExists'), true);
    return true;
  }

  render() {
    const balloon = document.createElement('div');
    balloon.className = 'tbc-balloon tbc-fav-panel';
    balloon.addEventListener('click', (e) => e.stopPropagation());

    const header = document.createElement('div');
    header.className = 'tbc-balloon-header';
    const title = document.createElement('div');
    title.className = 'tbc-balloon-title';
    title.textContent = t('favoritesTitle');
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'tbc-balloon-close';
    closeBtn.setAttribute('aria-label', t('panelClose'));
    closeBtn.textContent = t('panelClose');
    closeBtn.addEventListener('click', () => this.close());
    header.append(title, closeBtn);

    const addRow = document.createElement('div');
    addRow.className = 'tbc-fav-add-row';
    const addInput = document.createElement('input');
    addInput.type = 'text';
    addInput.className = 'tbc-fav-add-input';
    addInput.maxLength = FAVORITE_TEXT_LIMIT;
    addInput.placeholder = t('favoritesAddPlaceholder');
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'tbc-fav-add-btn';
    addBtn.textContent = t('favoritesAdd');
    const doAdd = () => {
      const text = addInput.value.trim();
      if (!text) return;
      if (this.addFromText(text)) addInput.value = '';
    };
    addBtn.addEventListener('click', doAdd);
    addInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        doAdd();
      }
    });
    addRow.append(addInput, addBtn);

    this.listEl = document.createElement('div');
    this.listEl.className = 'tbc-fav-list';

    const status = document.createElement('div');
    status.className = 'tbc-fav-status';
    this.statusEl = status;

    const wheelBox = this.renderWheelSection();

    balloon.append(header, addRow, this.listEl, status, wheelBox);
    (getFullscreenElement() || document.body).appendChild(balloon);
    this.balloon = balloon;
    this.renderList();
    this.refreshWheelControls();
  }

  renderWheelSection() {
    const box = document.createElement('div');
    box.className = 'tbc-fav-wheel';

    const head = document.createElement('div');
    head.className = 'tbc-fav-wheel-head';
    const label = document.createElement('div');
    label.className = 'tbc-fav-wheel-title';
    label.textContent = t('favoritesWheel');
    this.wheelToggleBtn = document.createElement('button');
    this.wheelToggleBtn.type = 'button';
    this.wheelToggleBtn.className = 'tbc-fav-wheel-toggle';
    this.wheelToggleBtn.addEventListener('click', () => {
      if (this.wheel.running) this.stopWheel(true);
      else this.startWheel();
    });
    head.append(label, this.wheelToggleBtn);

    const grid = document.createElement('div');
    grid.className = 'tbc-fav-wheel-grid';

    const fields = [
      ['minIntervalSec', t('favoritesWheelMinInterval'), 1.5, 600],
      ['maxIntervalSec', t('favoritesWheelMaxInterval'), 1.5, 600],
      ['maxCount', t('favoritesWheelMaxCount'), 1, 500],
      ['maxDurationSec', t('favoritesWheelMaxDuration'), 10, 7200],
    ];

    fields.forEach(([key, name, min, max]) => {
      const field = document.createElement('label');
      field.className = 'tbc-fav-wheel-field';
      const span = document.createElement('span');
      span.textContent = name;
      const input = document.createElement('input');
      input.type = 'number';
      input.min = String(min);
      input.max = String(max);
      input.step = key.includes('Interval') ? '0.5' : '1';
      input.value = String(this.state.wheel[key]);
      input.addEventListener('change', () => {
        const value = clamp(Number(input.value) || min, min, max);
        this.state.wheel[key] = value;
        if (this.state.wheel.minIntervalSec > this.state.wheel.maxIntervalSec) {
          if (key === 'minIntervalSec') this.state.wheel.maxIntervalSec = value;
          else this.state.wheel.minIntervalSec = value;
        }
        this.persist();
        this.state = loadFavoritesState();
        Array.from(grid.querySelectorAll('.tbc-fav-wheel-field')).forEach((fieldEl, idx) => {
          const fieldInput = fieldEl.querySelector('input');
          const fieldKey = fields[idx]?.[0];
          if (fieldInput && fieldKey) fieldInput.value = String(this.state.wheel[fieldKey]);
        });
      });
      field.append(span, input);
      grid.appendChild(field);
    });

    this.wheelStatusEl = document.createElement('div');
    this.wheelStatusEl.className = 'tbc-fav-wheel-status';

    box.append(head, grid, this.wheelStatusEl);
    return box;
  }

  renderList() {
    if (!this.listEl) return;
    this.listEl.innerHTML = '';
    const items = this.visibleItems();
    if (!items.length) {
      const empty = document.createElement('div');
      empty.className = 'tbc-fav-empty';
      empty.textContent = t('favoritesEmpty');
      this.listEl.appendChild(empty);
      return;
    }

    items.forEach((item) => {
      this.listEl.appendChild(this.createItemRow(item));
    });
  }

  createItemRow(item) {
    const row = document.createElement('div');
    row.className = 'tbc-fav-item';
    row.dataset.id = item.id;
    row.classList.toggle('is-global', !item.channel);

    const meta = document.createElement('div');
    meta.className = 'tbc-fav-item-meta';
    meta.textContent = item.channel
      ? t('favoritesScopeChannel').replace('{channel}', item.channel)
      : t('favoritesScopeGlobal');

    const text = document.createElement('textarea');
    text.className = 'tbc-fav-item-text';
    text.rows = 2;
    text.maxLength = FAVORITE_TEXT_LIMIT;
    text.value = item.text;
    text.addEventListener('change', () => {
      const next = text.value.trim().slice(0, FAVORITE_TEXT_LIMIT);
      if (!next) {
        text.value = item.text;
        return;
      }
      item.text = next;
      this.persist();
    });

    const tools = document.createElement('div');
    tools.className = 'tbc-fav-item-tools';

    const shortcut = document.createElement('select');
    shortcut.className = 'tbc-fav-item-shortcut';
    const none = document.createElement('option');
    none.value = '';
    none.textContent = t('favoritesShortcutNone');
    shortcut.appendChild(none);
    for (let i = 0; i <= 9; i += 1) {
      const opt = document.createElement('option');
      opt.value = String(i);
      opt.textContent = String(i);
      shortcut.appendChild(opt);
    }
    shortcut.value = item.shortcut || '';
    shortcut.addEventListener('change', () => {
      const value = sanitizeFavoriteShortcut(shortcut.value);
      if (value) {
        this.state.items.forEach((entry) => {
          if (entry.id === item.id || entry.shortcut !== value) return;
          const sameScope = (entry.channel || null) === (item.channel || null);
          if (sameScope) entry.shortcut = null;
        });
      }
      item.shortcut = value;
      this.persist();
      this.renderList();
    });

    const scopeBtn = document.createElement('button');
    scopeBtn.type = 'button';
    scopeBtn.className = 'tbc-fav-item-scope';
    scopeBtn.textContent = item.channel ? t('favoritesMakeGlobal') : t('favoritesMakeChannel');
    scopeBtn.title = item.channel ? t('favoritesMakeGlobalHint') : t('favoritesMakeChannelHint');
    scopeBtn.addEventListener('click', () => {
      const channel = this.currentChannel();
      if (item.channel) {
        const result = setFavoriteGlobal(item.id, true);
        this.state = result.state;
        this.renderList();
        this.setStatus(t('favoritesScopedGlobal'), true);
        return;
      }
      if (!channel) {
        this.setStatus(t('favoritesNeedChannel'));
        return;
      }
      item.channel = channel;
      this.persist();
      this.renderList();
      this.setStatus(t('favoritesScopedChannel'), true);
    });

    const sendBtn = document.createElement('button');
    sendBtn.type = 'button';
    sendBtn.className = 'tbc-fav-item-send';
    sendBtn.textContent = t('favoritesSend');
    sendBtn.addEventListener('click', () => this.sendFavorite(item));

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'tbc-fav-item-remove';
    removeBtn.textContent = t('favoritesRemove');
    removeBtn.addEventListener('click', () => {
      this.state.items = this.state.items.filter((entry) => entry.id !== item.id);
      this.persist();
      this.renderList();
    });

    tools.append(shortcut, scopeBtn, sendBtn, removeBtn);
    row.append(meta, text, tools);
    return row;
  }

  async sendFavorite(item) {
    const text = String(item?.text || '').trim();
    if (!text || this.sending) return false;
    this.sending = true;
    try {
      await sendTwitchChatMessage(text);
      this.setStatus(t('favoritesSent'), true);
      return true;
    } catch (error) {
      this.setStatus(chatSendErrorMessage(error));
      return false;
    } finally {
      this.sending = false;
    }
  }

  refreshWheelControls() {
    if (this.wheelToggleBtn) {
      this.wheelToggleBtn.textContent = this.wheel.running ? t('favoritesWheelStop') : t('favoritesWheelStart');
      this.wheelToggleBtn.classList.toggle('is-running', this.wheel.running);
    }
    if (!this.wheelStatusEl) return;
    if (!this.wheel.running) {
      this.wheelStatusEl.textContent = t('favoritesWheelIdle');
      return;
    }
    const leftSec = Math.max(0, Math.ceil((this.wheel.endsAt - Date.now()) / 1000));
    this.wheelStatusEl.textContent = t('favoritesWheelRunning')
      .replace('{sent}', String(this.wheel.sent))
      .replace('{max}', String(this.state.wheel.maxCount))
      .replace('{left}', String(leftSec));
  }

  startWheel() {
    this.state = loadFavoritesState();
    if (!this.visibleItems().length) {
      this.setStatus(t('favoritesEmpty'));
      return;
    }
    this.stopWheel(false);
    this.wheel.running = true;
    this.wheel.sent = 0;
    this.wheel.lastId = '';
    this.wheel.failStreak = 0;
    this.wheel.startedAt = Date.now();
    this.wheel.endsAt = this.wheel.startedAt + this.state.wheel.maxDurationSec * 1000;
    this.refreshWheelControls();
    clearInterval(this.wheel.statusTimer);
    this.wheel.statusTimer = setInterval(() => {
      if (!this.wheel.running) return;
      this.refreshWheelControls();
    }, 1000);
    // Send first message immediately (same as 独轮车.js), then cool down.
    this.scheduleWheelTick(0);
  }

  stopWheel(showStatus) {
    clearTimeout(this.wheel.timer);
    clearInterval(this.wheel.statusTimer);
    this.wheel.timer = null;
    this.wheel.statusTimer = null;
    const wasRunning = this.wheel.running;
    this.wheel.running = false;
    this.wheel.failStreak = 0;
    this.refreshWheelControls();
    if (showStatus && wasRunning) this.setStatus(t('favoritesWheelStopped'), true);
  }

  scheduleWheelTick(delayMs) {
    clearTimeout(this.wheel.timer);
    this.wheel.timer = setTimeout(() => this.runWheelTick(), Math.max(0, delayMs));
  }

  pickWheelItem(pool) {
    if (!pool.length) return null;
    if (pool.length === 1) return pool[0];
    // Avoid sending the same favorite twice in a row when possible.
    const choices = this.wheel.lastId
      ? pool.filter((item) => item.id !== this.wheel.lastId)
      : pool;
    const list = choices.length ? choices : pool;
    return list[Math.floor(Math.random() * list.length)];
  }

  nextWheelDelay(ok) {
    const minMs = Math.max(1500, Number(this.state.wheel.minIntervalSec) * 1000);
    const maxMs = Math.max(minMs, Number(this.state.wheel.maxIntervalSec) * 1000);
    let delay = minMs + Math.random() * (maxMs - minMs);
    // Back off after failures so Twitch rate limits / network blips cool down.
    if (!ok && this.wheel.failStreak > 0) {
      delay += Math.min(15000, this.wheel.failStreak * 2000);
    }
    return delay;
  }

  async runWheelTick() {
    if (!this.wheel.running) return;
    this.state = loadFavoritesState();
    if (Date.now() >= this.wheel.endsAt || this.wheel.sent >= this.state.wheel.maxCount) {
      this.stopWheel(true);
      return;
    }
    const pool = this.visibleItems();
    if (!pool.length) {
      this.stopWheel(true);
      return;
    }

    const item = this.pickWheelItem(pool);
    const ok = await this.sendFavorite(item);
    if (ok) {
      this.wheel.sent += 1;
      this.wheel.lastId = item?.id || '';
      this.wheel.failStreak = 0;
    } else {
      this.wheel.failStreak += 1;
      if (this.wheel.failStreak >= 5) {
        this.stopWheel(true);
        return;
      }
    }
    this.refreshWheelControls();

    if (!this.wheel.running) return;
    if (Date.now() >= this.wheel.endsAt || this.wheel.sent >= this.state.wheel.maxCount) {
      this.stopWheel(true);
      return;
    }

    this.scheduleWheelTick(this.nextWheelDelay(ok));
  }
}

class ChatContextMenu {
  constructor({ getSettings, danmakuEmitter, isActive, favoritesPanel }) {
    this.getSettings = getSettings;
    this.danmakuEmitter = danmakuEmitter;
    this.isActive = isActive;
    this.favoritesPanel = favoritesPanel;
    this.menu = null;
    this.targetEl = null;
    this.boundContext = (event) => this.handleContextMenu(event);
    this.boundClose = (event) => this.handleOutside(event);
    this.boundKey = (event) => {
      if (event.key === 'Escape') this.close();
    };
    this.attachedRoot = null;
  }

  attach(root = document) {
    this.detach();
    this.attachedRoot = root;
    root.addEventListener('contextmenu', this.boundContext, true);
  }

  detach() {
    this.close();
    this.attachedRoot?.removeEventListener('contextmenu', this.boundContext, true);
    this.attachedRoot = null;
  }

  findMessageEl(node) {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) {
      node = node?.parentElement;
    }
    return node?.closest?.(SELECTORS.chatMessage) || null;
  }

  handleContextMenu(event) {
    if (!this.isActive?.()) return;
    const msgEl = this.findMessageEl(event.target);
    if (!msgEl) return;
    const snapshot = snapshotChatMessage(msgEl);
    if (!snapshot?.message) return;

    event.preventDefault();
    event.stopPropagation();
    this.open(event.clientX, event.clientY, msgEl, snapshot);
  }

  handleOutside(event) {
    if (!this.menu) return;
    if (this.menu.contains(event.target)) return;
    this.close();
  }

  close() {
    this.menu?.remove();
    this.menu = null;
    this.targetEl = null;
    document.removeEventListener('click', this.boundClose, true);
    document.removeEventListener('keydown', this.boundKey, true);
    window.removeEventListener('scroll', this.boundClose, true);
    window.removeEventListener('resize', this.boundClose, true);
  }

  open(x, y, msgEl, snapshot) {
    this.close();
    this.targetEl = msgEl;
    this.menu = document.createElement('div');
    this.menu.className = 'tbc-chat-menu';
    this.menu.setAttribute('role', 'menu');

    const hasTranslation = !!msgEl.querySelector('.tbc-chat-translation');
    const login = normalizeTwitchLogin(snapshot.login || snapshot.username);
    this.menu.append(
      this.createItem(hasTranslation ? t('chatMenuRetranslate') : t('chatMenuTranslate'), () => {
        this.runTranslate(msgEl, snapshot, true);
      }),
      this.createItem(t('chatMenuSpeak'), () => {
        this.runSpeak(msgEl, snapshot);
      }),
      this.createItem(t('chatMenuResend'), () => {
        this.runResend(msgEl, snapshot, false);
      }),
      this.createItem(t('chatMenuFavorite'), () => {
        this.runFavorite(snapshot);
      }),
    );
    if (login) {
      this.menu.append(
        this.createItem(t('chatMenuBlockUser'), () => {
          this.runBlockUser(login);
        }),
      );
    }

    const mount = getFullscreenElement() || document.body;
    mount.appendChild(this.menu);

    const rect = this.menu.getBoundingClientRect();
    const left = clamp(x, 8, window.innerWidth - rect.width - 8);
    const top = clamp(y, 8, window.innerHeight - rect.height - 8);
    Object.assign(this.menu.style, {
      left: `${left}px`,
      top: `${top}px`,
    });

    setTimeout(() => {
      document.addEventListener('click', this.boundClose, true);
      document.addEventListener('keydown', this.boundKey, true);
      window.addEventListener('scroll', this.boundClose, true);
      window.addEventListener('resize', this.boundClose, true);
    }, 0);
  }

  createItem(label, onClick) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tbc-chat-menu-item';
    button.setAttribute('role', 'menuitem');
    button.textContent = label;
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.close();
      onClick();
    });
    return button;
  }

  async translateParts(snapshot, bustCache = false) {
    const settings = this.getSettings();
    const parts = snapshot.parts?.length
      ? snapshot.parts.map((part) => ({ ...part }))
      : [{ type: 'text', value: snapshot.message }];
    const refs = [];
    const pieces = [];
    parts.forEach((part, index) => {
      const core = part.type === 'text' ? translatableCore(part.value) : '';
      if (!core) return;
      if (bustCache) forgetCachedTranslation(core, settings.translateTargetLang);
      refs.push(index);
      pieces.push(core);
    });
    if (!pieces.length) return { parts, message: snapshot.message, translated: false };

    let provider = settings.translateProvider || 'auto';
    let outcome = await translateMessages(pieces, settings.translateTargetLang, provider);
    if (outcome.retryAfter && provider !== 'auto') {
      outcome = await translateMessages(pieces, settings.translateTargetLang, 'auto');
    }
    if (outcome.retryAfter || !Array.isArray(outcome.texts)) {
      return { parts, message: snapshot.message, translated: false, failed: true };
    }

    refs.forEach((partIndex, i) => {
      const part = parts[partIndex];
      const match = String(part.value).match(/^(\s*)([\s\S]*?)(\s*)$/);
      const translated = outcome.texts[i] || match[2];
      parts[partIndex] = {
        type: 'text',
        value: `${match[1]}${translated}${match[3]}`,
      };
    });
    const message = partsToPlain(parts) || snapshot.message;
    return { parts, message, translated: message !== snapshot.message, failed: false };
  }

  async runBlockUser(login) {
    try {
      await blockTwitchUser(login, { sourceContext: 'CHAT' });
      console.info(`[TBC] ${t('chatMenuBlockDone')}: ${login}`);
    } catch (error) {
      const code = error?.code || '';
      if (code === 'not_logged_in') {
        console.warn(`[TBC] ${t('chatMenuBlockNeedLogin')}`);
        return;
      }
      if (code === 'user_not_found') {
        console.warn(`[TBC] ${t('chatMenuBlockNotFound')}: ${login}`);
        return;
      }
      console.warn(`[TBC] ${t('chatMenuBlockFailed')}`, error);
    }
  }

  runFavorite(snapshot) {
    const text = String(snapshot?.message || '').trim();
    if (!text) return;
    if (this.favoritesPanel?.addFromText) {
      this.favoritesPanel.addFromText(text);
      if (!this.favoritesPanel.isOpen && this.favoritesPanel.btn) {
        this.favoritesPanel.open(this.favoritesPanel.btn);
      }
      return;
    }
    const result = addFavoriteText(text);
    if (result.full) {
      console.warn(`[TBC] ${t('favoritesFull')}`);
      return;
    }
    if (result.added) console.info(`[TBC] ${t('favoritesAdded')}`);
    else if (result.item) console.info(`[TBC] ${t('favoritesExists')}`);
  }

  async runTranslate(msgEl, snapshot, bustCache) {
    // Context-menu translate is always available; does not require settings.translateEnabled.
    const result = await this.translateParts(snapshot, bustCache);
    if (result.failed) return;
    applyChatTranslation(msgEl, result.message, snapshot.message, { manual: true });
  }

  runSpeak(msgEl, snapshot) {
    const settings = this.getSettings();
    if (!speechSupported()) return;
    // Prefer the on-screen chat translation when the user already translated this line.
    const translated = readChatTranslationText(msgEl);
    const source = translated || speechSourceText(snapshot.message, snapshot.parts);
    // Explicit menu action: use panel voice/rate/volume, even if auto-speak is off.
    if (Number(settings.speechVolume) <= 0) return;
    speakTextNow(source);
  }

  async runResend(msgEl, snapshot, forceTranslate) {
    const settings = this.getSettings();
    let message = snapshot.message;
    let parts = snapshot.parts;
    let translated = false;

    const shouldTranslate = forceTranslate || settings.translateEnabled;
    if (shouldTranslate) {
      const result = await this.translateParts(snapshot, forceTranslate);
      if (!result.failed) {
        message = result.message;
        parts = result.parts;
        translated = result.translated;
        if (settings.translateInChat || forceTranslate) {
          applyChatTranslation(msgEl, message, snapshot.message, {
            manual: !!forceTranslate,
          });
        }
      }
    }

    this.danmakuEmitter?.enqueue({
      username: snapshot.username,
      usernameColor: snapshot.usernameColor,
      profileUrl: snapshot.profileUrl,
      avatarUrl: snapshot.avatarUrl,
      originalMessage: snapshot.message,
      message,
      parts,
      translated,
      superchat: !!snapshot.superchat,
      superchatStyle: snapshot.superchatStyle,
      superchatMeta: snapshot.superchatMeta,
    });
  }
}

const CHAT_CLEAR_MESSAGE_SELECTOR = [
  '.chat-line__message',
  '[data-a-target="chat-line-message"]',
  '[data-a-target="chat-message-container"]',
  '.user-notice-line',
  '[data-a-target="chat-welcome-message"]',
  '.chat-line__status',
].join(', ');

class ChatClearButton {
  constructor({ onClear } = {}) {
    this.onClear = onClear;
    this.wrap = null;
    this.btn = null;
    this.retryTimer = null;
  }

  findNativeInjectLayout() {
    const viewerBtn = document.querySelector(SELECTORS.chatViewerListBtn);
    if (!viewerBtn) return null;
    // Twitch wraps each header icon button in its own InjectLayout — clone that shell.
    const wrap = viewerBtn.closest('[class*="InjectLayout"]') || viewerBtn.parentElement;
    if (!wrap?.parentElement) return null;
    return { wrap, host: wrap.parentElement };
  }

  clearLiveChat() {
    const containers = document.querySelectorAll(SELECTORS.chatMessageContainer);
    let removed = 0;
    containers.forEach((container) => {
      container.querySelectorAll(CHAT_CLEAR_MESSAGE_SELECTOR).forEach((node) => {
        node.remove();
        removed += 1;
      });
    });

    if (!containers.length) {
      document.querySelectorAll('[data-a-target="chat-scroller"]').forEach((scroller) => {
        scroller.querySelectorAll(CHAT_CLEAR_MESSAGE_SELECTOR).forEach((node) => {
          node.remove();
          removed += 1;
        });
      });
    }

    this.onClear?.(removed);
    return removed;
  }

  applyClearIcon(btn) {
    const svg = btn.querySelector('svg');
    if (!svg) {
      btn.insertAdjacentHTML('beforeend', ICON_CHAT_CLEAR);
      return;
    }

    svg.setAttribute('viewBox', '0 0 1024 1024');
    svg.setAttribute('fill', 'currentColor');
    svg.removeAttribute('stroke');
    svg.removeAttribute('stroke-width');
    svg.setAttribute('aria-hidden', 'true');
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', ICON_CHAT_CLEAR_PATH);
    svg.appendChild(path);
  }

  applyLabel(btn, label = t('chatClear')) {
    btn.setAttribute('title', label);
    btn.setAttribute('data-a-target', 'tbc-chat-clear');
    btn.setAttribute('data-tbc-chat-clear', 'true');
    btn.removeAttribute('data-test-selector');
    btn.removeAttribute('id');
  }

  createFromInjectLayout(nativeWrap) {
    const wrap = nativeWrap.cloneNode(true);
    wrap.classList.add('tbc-chat-clear-wrap');
    wrap.setAttribute('data-tbc-chat-clear-wrap', 'true');
    wrap.removeAttribute('id');

    const btn = wrap.querySelector('button') || wrap.querySelector('[role="button"]');
    if (!btn) return null;

    btn.classList.add('tbc-chat-clear-btn');
    this.applyClearIcon(btn);
    this.applyLabel(btn);
    btn.type = 'button';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.clearLiveChat();
    });

    return { wrap, btn };
  }

  createFallbackButton() {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tbc-chat-clear-btn tbc-chat-clear-btn--fallback';
    btn.innerHTML = ICON_CHAT_CLEAR;
    this.applyLabel(btn);
    btn.setAttribute('title', t('chatClear'));
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.clearLiveChat();
    });
    return btn;
  }

  async mount() {
    if (this.wrap?.isConnected || this.btn?.isConnected) {
      this.refreshLabel();
      return;
    }

    const header = await waitForElement(SELECTORS.chatHeader, document, 12000);
    if (!header) return;
    if (header.querySelector('[data-tbc-chat-clear-wrap="true"], [data-tbc-chat-clear="true"]')) return;

    const native = this.findNativeInjectLayout();
    if (native?.wrap && native.host) {
      const created = this.createFromInjectLayout(native.wrap);
      if (created) {
        this.wrap = created.wrap;
        this.btn = created.btn;
        native.host.appendChild(this.wrap);
        return;
      }
    }

    // Preview / missing community button: plain styled control in the header actions row.
    const actions = header.querySelector(':scope > div:last-child') || header;
    this.btn = this.createFallbackButton();
    this.wrap = this.btn;
    actions.appendChild(this.btn);
  }

  refreshLabel() {
    if (!this.btn) return;
    this.applyLabel(this.btn);
    if (this.btn.classList.contains('tbc-chat-clear-btn--fallback')) {
      this.btn.setAttribute('title', t('chatClear'));
    }
  }

  remount() {
    if (this.wrap?.isConnected || this.btn?.isConnected) {
      this.refreshLabel();
      return;
    }
    this.wrap?.remove();
    this.btn?.remove();
    this.wrap = null;
    this.btn = null;
    clearTimeout(this.retryTimer);
    this.retryTimer = setTimeout(() => this.mount(), 500);
  }

  destroy() {
    clearTimeout(this.retryTimer);
    this.wrap?.remove();
    if (this.btn && this.btn !== this.wrap) this.btn.remove();
    this.wrap = null;
    this.btn = null;
  }
}

class FullscreenChatInput {
  constructor({ favoritesPanel } = {}) {
    this.favoritesPanel = favoritesPanel || null;
    this.root = null;
    this.input = null;
    this.sendBtn = null;
    this.closeBtn = null;
    this.favBtn = null;
    this.favList = null;
    this.statusEl = null;
    this.sending = false;
    this.favOpen = false;
    this.boundKeyDown = (e) => this.onKeyDown(e);
    this.boundFsChange = () => this.onFullscreenChange();
    this.boundPointerDown = (e) => this.onPointerDownOutside(e);
  }

  attach() {
    document.addEventListener('keydown', this.boundKeyDown, true);
    document.addEventListener('pointerdown', this.boundPointerDown, true);
    document.addEventListener('fullscreenchange', this.boundFsChange);
    document.addEventListener('webkitfullscreenchange', this.boundFsChange);
  }

  destroy() {
    this.close();
    document.removeEventListener('keydown', this.boundKeyDown, true);
    document.removeEventListener('pointerdown', this.boundPointerDown, true);
    document.removeEventListener('fullscreenchange', this.boundFsChange);
    document.removeEventListener('webkitfullscreenchange', this.boundFsChange);
  }

  isEditableTarget(target) {
    if (!target || target === document.body || target === document.documentElement) return false;
    const el = target.nodeType === 1 ? target : target.parentElement;
    if (!el) return false;
    const tag = el.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (el.isContentEditable) return true;
    return !!el.closest?.('input, textarea, select, [contenteditable="true"], [role="textbox"]');
  }

  canOpen() {
    if (!getFullscreenElement()) return false;
    if (currentVodId()) return false;
    return !!currentChannelLogin();
  }

  stopEvent(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  }

  onKeyDown(e) {
    if (e.isComposing) return;
    if (e.key === 'Escape' && this.root) {
      if (this.favOpen) {
        this.stopEvent(e);
        this.closeFavorites();
        return;
      }
    }
    if (e.key !== 'Enter') return;
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;

    if (this.root) {
      if (e.target === this.input || this.root.contains(e.target)) {
        this.stopEvent(e);
        this.submit();
      }
      return;
    }

    if (!this.canOpen()) return;
    if (this.isEditableTarget(e.target)) return;

    this.stopEvent(e);
    this.open();
  }

  onPointerDownOutside(e) {
    if (!this.root) return;
    if (this.root.contains(e.target)) return;
    if (this.input?.value.trim()) return;
    this.close();
  }

  onFullscreenChange() {
    if (!getFullscreenElement()) this.close();
  }

  setStatus(message, ok = false) {
    if (!this.statusEl) return;
    this.statusEl.textContent = message || '';
    this.statusEl.classList.toggle('is-ok', !!ok && !!message);
  }

  listFavoriteItems() {
    if (this.favoritesPanel?.visibleItems) {
      this.favoritesPanel.state = loadFavoritesState();
      return this.favoritesPanel.visibleItems();
    }
    const state = loadFavoritesState();
    return listFavoritesForChannel(state, currentChannelLogin?.() || '');
  }

  open() {
    if (this.root) {
      this.input?.focus();
      return;
    }

    const mount = getFullscreenElement();
    if (!mount) return;

    if (getComputedStyle(mount).position === 'static') {
      mount.style.position = 'relative';
    }

    const root = document.createElement('div');
    root.className = 'tbc-fs-chat';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', t('fsChatPlaceholder'));

    const row = document.createElement('div');
    row.className = 'tbc-fs-chat-row';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'tbc-fs-chat-input';
    input.maxLength = 500;
    input.autocomplete = 'off';
    input.spellcheck = true;
    input.placeholder = t('fsChatPlaceholder');

    const favWrap = document.createElement('div');
    favWrap.className = 'tbc-fs-chat-fav-wrap';

    const favBtn = document.createElement('button');
    favBtn.type = 'button';
    favBtn.className = 'tbc-fs-chat-fav';
    favBtn.setAttribute('aria-label', t('fsChatFavorites'));
    favBtn.setAttribute('aria-expanded', 'false');
    favBtn.innerHTML = `${ICON_FAVORITE}<span>${t('fsChatFavorites')}</span>`;

    const favList = document.createElement('div');
    favList.className = 'tbc-fs-chat-fav-list';
    favList.hidden = true;
    favList.setAttribute('role', 'listbox');
    favList.setAttribute('aria-label', t('fsChatFavorites'));

    favWrap.append(favBtn, favList);

    const sendBtn = document.createElement('button');
    sendBtn.type = 'button';
    sendBtn.className = 'tbc-fs-chat-send';
    sendBtn.setAttribute('aria-label', t('fsChatSend'));
    sendBtn.innerHTML = `${ICON_CHAT_SEND}<span>${t('fsChatSend')}</span>`;

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'tbc-fs-chat-close';
    closeBtn.setAttribute('aria-label', t('fsChatClose'));
    closeBtn.textContent = t('fsChatClose');

    const meta = document.createElement('div');
    meta.className = 'tbc-fs-chat-meta';

    const status = document.createElement('div');
    status.className = 'tbc-fs-chat-status';

    row.append(input, favWrap, sendBtn, closeBtn);
    meta.append(status);
    root.append(row, meta);

    const trap = (e) => {
      e.stopPropagation();
    };
    root.addEventListener('keydown', trap);
    root.addEventListener('keyup', trap);
    root.addEventListener('keypress', trap);
    root.addEventListener('mousedown', trap);
    root.addEventListener('pointerdown', trap);
    root.addEventListener('click', trap);

    favBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleFavorites();
    });

    sendBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.submit();
    });

    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.close();
    });

    mount.appendChild(root);
    this.root = root;
    this.input = input;
    this.favBtn = favBtn;
    this.favList = favList;
    this.sendBtn = sendBtn;
    this.closeBtn = closeBtn;
    this.statusEl = status;
    this.favOpen = false;

    requestAnimationFrame(() => {
      input.focus();
    });
  }

  toggleFavorites() {
    if (this.favOpen) this.closeFavorites();
    else this.openFavorites();
  }

  openFavorites() {
    if (!this.favList || !this.favBtn) return;
    this.renderFavorites();
    this.favList.hidden = false;
    this.favBtn.setAttribute('aria-expanded', 'true');
    this.favBtn.classList.add('is-open');
    this.favOpen = true;
  }

  closeFavorites() {
    if (!this.favList || !this.favBtn) return;
    this.favList.hidden = true;
    this.favList.replaceChildren();
    this.favBtn.setAttribute('aria-expanded', 'false');
    this.favBtn.classList.remove('is-open');
    this.favOpen = false;
  }

  renderFavorites() {
    if (!this.favList) return;
    this.favList.replaceChildren();

    const items = this.listFavoriteItems();
    if (!items.length) {
      const empty = document.createElement('div');
      empty.className = 'tbc-fs-chat-fav-empty';
      empty.textContent = t('fsChatFavoritesEmpty');
      this.favList.appendChild(empty);
      return;
    }

    items.forEach((item) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tbc-fs-chat-fav-item';
      btn.setAttribute('role', 'option');
      btn.title = item.text;
      btn.textContent = item.text;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.input) {
          this.input.value = item.text;
          this.input.focus();
          const len = this.input.value.length;
          this.input.setSelectionRange(len, len);
        }
        this.closeFavorites();
      });
      this.favList.appendChild(btn);
    });
  }

  close() {
    this.closeFavorites();
    this.root?.remove();
    this.root = null;
    this.input = null;
    this.sendBtn = null;
    this.closeBtn = null;
    this.favBtn = null;
    this.favList = null;
    this.statusEl = null;
    this.sending = false;
    this.favOpen = false;
  }

  async submit() {
    if (!this.input || this.sending) return;
    const text = this.input.value.trim();
    if (!text) {
      this.setStatus('');
      return;
    }

    this.sending = true;
    if (this.sendBtn) this.sendBtn.disabled = true;
    this.closeFavorites();
    this.setStatus('');

    try {
      await sendTwitchChatMessage(text);
      this.input.value = '';
      this.setStatus(t('fsChatSent'), true);
      setTimeout(() => {
        if (this.statusEl?.textContent === t('fsChatSent')) this.setStatus('');
      }, 1200);
    } catch (error) {
      this.setStatus(chatSendErrorMessage(error));
    } finally {
      this.sending = false;
      if (this.sendBtn) this.sendBtn.disabled = false;
      this.input?.focus();
    }
  }
}

const PIP_ASPECT_LOCKED_KEY = 'tbcPipAspectLocked';

class EnhancedPip {
  constructor({ getSettings, danmaku, favoritesPanel, onToggleDanmaku, onOpenSettings, onStateChange } = {}) {
    this.getSettings = getSettings;
    this.danmaku = danmaku || null;
    this.favoritesPanel = favoritesPanel || null;
    this.onToggleDanmaku = onToggleDanmaku;
    this.onOpenSettings = onOpenSettings;
    this.onStateChange = onStateChange;
    this.pipWindow = null;
    this.sourceVideo = null;
    this.pipVideo = null;
    this.laneManager = new LaneManager();
    this.opening = false;
    this.inputOpen = false;
    this.favOpen = false;
    this.sending = false;
    this.nodes = null;
    this.keepAliveVideo = null;
    this.keepAliveHandle = null;
    this.keepAliveTimer = null;
    this.closedTimer = null;
    this.pageToastTimer = null;
    this.toastTimer = null;
    this.statusTimer = null;
    this.boundPlay = () => this.syncPlayback();
    this.boundPause = () => this.syncPlayback();
    this.boundResize = () => this.resetLanes();
    this.boundPageHide = () => this.cleanup();
    this.boundKeyDown = (event) => this.onKeyDown(event);
    this.boundComment = (payload) => this.renderComment(payload);
    this.aspectLocked = this.loadAspectLocked();
  }

  loadAspectLocked() {
    try {
      return !!GM_getValue(PIP_ASPECT_LOCKED_KEY, false);
    } catch (error) {
      return false;
    }
  }

  saveAspectLocked() {
    try {
      GM_setValue(PIP_ASPECT_LOCKED_KEY, this.aspectLocked);
    } catch (error) {
      /* storage unavailable */
    }
  }

  toggleAspectLock() {
    this.aspectLocked = !this.aspectLocked;
    this.saveAspectLocked();
    this.applyAspectLock();
  }

  applyAspectLock() {
    const wrap = this.nodes?.wrap;
    if (wrap) wrap.classList.toggle('is-aspect-locked', this.aspectLocked);
    const btn = this.nodes?.aspectBtn;
    if (!btn) return;
    btn.innerHTML = this.aspectLocked ? ICON_PIP_ASPECT_LOCK : ICON_PIP_ASPECT_UNLOCK;
    const label = t(this.aspectLocked ? 'pipAspectUnlock' : 'pipAspectLock');
    btn.title = label;
    btn.setAttribute('aria-label', label);
  }

  pageWindow() {
    try {
      if (typeof unsafeWindow !== 'undefined' && unsafeWindow?.documentPictureInPicture) {
        return unsafeWindow;
      }
    } catch (error) {
      // The sandbox may refuse unsafeWindow; the page window is the fallback.
    }
    return window;
  }

  isSupported() {
    const api = this.pageWindow().documentPictureInPicture;
    return typeof api?.requestWindow === 'function';
  }

  isOpen() {
    return !!(this.pipWindow && !this.pipWindow.closed);
  }

  isMediaStream(value) {
    return !!value && typeof value.getVideoTracks === 'function' && typeof value.getTracks === 'function';
  }

  captureSource(video) {
    const existing = video?.srcObject;
    if (this.isMediaStream(existing)) {
      try {
        const clone = typeof existing.clone === 'function' ? existing.clone() : null;
        if (this.isMediaStream(clone) && clone.getVideoTracks().length) return clone;
      } catch (error) {
        // Fall through to a fresh capture of a decoded element.
      }
    }
    if (typeof video?.captureStream !== 'function') return null;
    return video.captureStream();
  }

  findSourceVideo() {
    const root = document.querySelector(SELECTORS.videoPlayer);
    if (!root) return null;
    const videos = [...root.querySelectorAll('video')];
    const area = (video) => (video.videoWidth || 0) * (video.videoHeight || 0);
    const playing = videos
      .filter((video) => video.videoWidth > 0 && !video.paused && video.readyState >= 2)
      .sort((a, b) => area(b) - area(a));
    if (playing.length) return playing[0];
    const sized = videos
      .filter((video) => video.videoWidth > 0)
      .sort((a, b) => area(b) - area(a));
    if (sized.length) return sized[0];
    return videos[0] || null;
  }

  toggle() {
    if (this.opening) return;
    if (this.isOpen()) {
      this.close(true);
      return;
    }
    this.open();
  }

  async open() {
    if (this.opening || this.isOpen()) {
      if (this.isOpen()) {
        try { this.pipWindow.focus(); } catch (error) { /* window may already be closing */ }
      }
      return;
    }
    if (!this.isSupported()) {
      this.showPageToast(t('pipNeedBrowser'));
      return;
    }

    const source = this.findSourceVideo();
    if (!source || (typeof source.captureStream !== 'function' && !this.isMediaStream(source.srcObject))) {
      this.showPageToast(t('pipNoVideo'));
      return;
    }

    let stream = null;
    try {
      stream = this.captureSource(source);
    } catch (error) {
      this.showPageToast(t('pipCaptureFailed'));
      return;
    }
    if (!stream) {
      this.showPageToast(t('pipCaptureFailed'));
      return;
    }

    this.opening = true;
    let pipWindow = null;
    try {
      pipWindow = await this.pageWindow().documentPictureInPicture.requestWindow({
        width: 670,
        height: 380,
      });
    } catch (error) {
      this.stopStream(stream);
      this.showPageToast(t('pipOpenFailed'));
      return;
    } finally {
      this.opening = false;
    }

    if (!pipWindow) {
      this.stopStream(stream);
      this.showPageToast(t('pipOpenFailed'));
      return;
    }

    this.pipWindow = pipWindow;
    this.sourceVideo = source;
    this.mountDocument(pipWindow);
    const pipVideo = this.nodes.video;
    this.pipVideo = pipVideo;
    pipVideo.srcObject = stream;
    pipVideo.muted = true;
    try { await pipVideo.play(); } catch (error) { /* autoplay can reject until the next frame */ }

    this.dimSource(true);
    this.bindSourceSync(source);
    this.startKeepAlive(source);
    this.attachDanmaku();
    this.bindCleanup(pipWindow);
    this.syncSettings();
    this.syncPlayback();
    this.onStateChange?.();
    try { pipWindow.focus(); } catch (error) { /* focus is best-effort */ }
  }

  close(focusOpener = false) {
    const source = this.sourceVideo;
    this.cleanup();
    if (focusOpener) {
      try { window.focus(); } catch (error) { /* opener may be gone */ }
      try { source?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (error) { /* not laid out */ }
    }
  }

  destroy() {
    this.close(false);
    this.clearPageToast();
  }

  cleanup() {
    if (!this.pipWindow && !this.sourceVideo && !this.pipVideo) return;
    const win = this.pipWindow;
    const pipVideo = this.pipVideo;
    this.pipWindow = null;
    this.pipVideo = null;

    this.detachDanmaku();
    this.stopKeepAlive();
    this.unbindSourceSync();
    this.dimSource(false);
    clearInterval(this.closedTimer);
    this.closedTimer = null;
    clearTimeout(this.toastTimer);
    this.toastTimer = null;
    clearTimeout(this.statusTimer);
    this.statusTimer = null;

    if (win) {
      win.removeEventListener('pagehide', this.boundPageHide);
      win.removeEventListener('resize', this.boundResize);
      win.document?.removeEventListener('keydown', this.boundKeyDown, true);
    }
    this.stopStream(pipVideo?.srcObject);
    if (pipVideo) pipVideo.srcObject = null;

    this.nodes = null;
    this.inputOpen = false;
    this.favOpen = false;
    this.sending = false;
    this.sourceVideo = null;

    if (win && !win.closed) {
      try { win.close(); } catch (error) { /* already closing */ }
    }
    this.onStateChange?.();
  }

  stopStream(stream) {
    try {
      stream?.getTracks?.().forEach((track) => track.stop());
    } catch (error) {
      // Stopping a capture track must not break the source video.
    }
  }

  dimSource(hidden) {
    const video = this.sourceVideo;
    if (!video) return;
    if (hidden) {
      video.style.setProperty('opacity', '0.01', 'important');
      video.style.setProperty('pointer-events', 'none', 'important');
      return;
    }
    video.style.removeProperty('opacity');
    video.style.removeProperty('pointer-events');
  }

  bindSourceSync(source) {
    source.addEventListener('play', this.boundPlay);
    source.addEventListener('pause', this.boundPause);
  }

  unbindSourceSync() {
    const source = this.sourceVideo;
    if (!source) return;
    source.removeEventListener('play', this.boundPlay);
    source.removeEventListener('pause', this.boundPause);
  }

  syncPlayback() {
    const source = this.sourceVideo;
    const pipVideo = this.pipVideo;
    if (!source || !pipVideo) return;
    if (source.paused) pipVideo.pause();
    else pipVideo.play().catch(() => {});
  }

  startKeepAlive(video) {
    this.stopKeepAlive();
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 2;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    this.keepAliveVideo = video;
    const tick = () => {
      if (!this.isOpen() || this.keepAliveVideo !== video) return;
      try {
        if (video.readyState >= 2) context.drawImage(video, 0, 0, 2, 2);
      } catch (error) {
        // A tainted frame should not stop the keep-alive loop.
      }
      if (typeof video.requestVideoFrameCallback === 'function') {
        this.keepAliveHandle = video.requestVideoFrameCallback(tick);
      } else {
        this.keepAliveTimer = setTimeout(tick, 200);
      }
    };
    tick();
  }

  stopKeepAlive() {
    const video = this.keepAliveVideo;
    if (video && this.keepAliveHandle != null && typeof video.cancelVideoFrameCallback === 'function') {
      try { video.cancelVideoFrameCallback(this.keepAliveHandle); } catch (error) { /* already cancelled */ }
    }
    clearTimeout(this.keepAliveTimer);
    this.keepAliveHandle = null;
    this.keepAliveTimer = null;
    this.keepAliveVideo = null;
  }

  bindCleanup(pipWindow) {
    pipWindow.addEventListener('pagehide', this.boundPageHide);
    clearInterval(this.closedTimer);
    this.closedTimer = setInterval(() => {
      if (this.pipWindow?.closed) this.cleanup();
    }, 1000);
  }

  attachDanmaku() {
    if (!this.danmaku) return;
    this.danmaku.onComment = this.boundComment;
  }

  detachDanmaku() {
    if (this.danmaku?.onComment === this.boundComment) this.danmaku.onComment = null;
  }

  syncSettings() {
    if (!this.isOpen()) return;
    this.applyDanmakuVisibility();
    this.resetLanes();
  }

  applyDanmakuVisibility() {
    const layer = this.nodes?.layer;
    const button = this.nodes?.danmakuBtn;
    if (!layer) return;
    const enabled = !!this.getSettings().enabled;
    layer.style.visibility = enabled ? '' : 'hidden';
    button?.classList.toggle('is-off', !enabled);
    if (button) {
      button.title = enabled ? t('danmakuOn') : t('danmakuOff');
      button.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    }
  }

  resetLanes() {
    if (!this.isOpen()) return;
    const metrics = this.laneMetrics();
    this.laneManager.reset(metrics.count, metrics.laneHeight);
  }

  laneMetrics() {
    const settings = this.getSettings();
    const win = this.pipWindow;
    const main = this.nodes?.main;
    const height = main?.clientHeight || win?.innerHeight || 1;
    const laneHeight = Math.max(14, (Number(settings.fontSize) || 22) + 6);
    let areaHeight = height;
    if (settings.scrollArea === 'top-half') areaHeight = height * 0.5;
    else if (settings.scrollArea === 'bottom-half') {
      const reserve = this.inputOpen ? (this.nodes?.input?.offsetHeight || 52) + 4 : 0;
      areaHeight = Math.max(laneHeight, height * 0.5 - reserve);
    } else if (settings.scrollArea === 'top-quarter') areaHeight = height * 0.25;
    else {
      const reserve = this.inputOpen ? (this.nodes?.input?.offsetHeight || 52) + 4 : 0;
      areaHeight = Math.max(laneHeight, height - reserve);
    }
    return {
      laneHeight,
      count: Math.max(1, Math.floor(areaHeight / laneHeight)),
    };
  }

  renderComment(payload) {
    if (!this.isOpen() || !this.nodes?.layer) return;
    const settings = this.getSettings();
    if (!settings.enabled) return;
    const parts = payload?.parts?.length
      ? payload.parts
      : (payload?.message ? [{ type: 'text', value: payload.message }] : []);
    if (!parts.length) return;

    const doc = this.pipWindow.document;
    const layer = this.nodes.layer;
    const item = doc.createElement('div');
    item.className = 'tbc-pip-dm';
    this.appendParts(doc, item, parts);
    const opacity = clamp(Number(settings.danmakuOpacity) || 100, 10, 100) / 100;
    item.style.color = payload.usernameColor || '#efeff1';
    item.style.fontSize = `${settings.fontSize || 22}px`;
    item.style.fontFamily = settings.fontFamily || 'sans-serif';
    item.style.opacity = String(opacity);
    item.style.visibility = 'hidden';
    item.style.animation = 'none';
    layer.appendChild(item);

    const layerWidth = layer.clientWidth || this.pipWindow.innerWidth || 670;
    const itemWidth = item.offsetWidth;
    const speed = clamp(Number(settings.speed) || 5, 1, 10);
    const travel = layerWidth + itemWidth;
    const durationMs = Math.round((travel / Math.max(1, layerWidth)) * (30000 / speed));
    const metrics = this.laneMetrics();
    if (!this.laneManager.lanes.length) this.laneManager.reset(metrics.count, metrics.laneHeight);
    const lane = this.laneManager.acquire(durationMs);

    item.style.top = `${lane * metrics.laneHeight}px`;
    item.style.left = `${layerWidth}px`;
    item.style.setProperty('--tbc-travel', `${travel}px`);
    item.style.setProperty('--tbc-duration', `${durationMs}ms`);
    item.style.visibility = '';
    item.addEventListener('animationend', () => item.remove(), { once: true });
    void item.offsetWidth;
    item.style.animation = '';
  }

  appendParts(doc, item, parts) {
    for (const part of parts) {
      if (part.type === 'emote' && part.src) {
        const img = doc.createElement('img');
        img.className = 'tbc-pip-emote';
        img.src = part.src;
        img.alt = part.name || '';
        img.draggable = false;
        item.appendChild(img);
        continue;
      }
      const text = part.type === 'emote' ? (part.name || '') : (part.value || '');
      if (text) item.appendChild(doc.createTextNode(text));
    }
  }

  mountDocument(pipWindow) {
    const doc = pipWindow.document;
    doc.documentElement.lang = document.documentElement.lang || 'zh-CN';
    doc.head.replaceChildren();
    doc.body.replaceChildren();

    const style = doc.createElement('style');
    style.textContent = this.windowCss();
    doc.head.appendChild(style);

    const wrap = doc.createElement('div');
    wrap.id = 'tbc-pip-wrap';
    const main = doc.createElement('div');
    main.id = 'tbc-pip-main';

    const back = this.makeButton(doc, 'tbc-pip-back', t('pipBack'), t('pipBack'));
    back.textContent = t('pipBack');

    const buttons = doc.createElement('div');
    buttons.id = 'tbc-pip-btns';
    const reloadBtn = this.makeButton(doc, 'tbc-pip-reload', t('pipReload'), t('pipReload'), this.iconReload());
    const aspectBtn = this.makeButton(
      doc,
      'tbc-pip-aspect',
      t('pipAspectLock'),
      t('pipAspectLock'),
      ICON_PIP_ASPECT_UNLOCK,
    );
    const danmakuBtn = this.makeButton(doc, 'tbc-pip-danmaku-btn', t('pipDanmaku'), t('pipDanmaku'), ICON_DANMAKU_ON);
    const settingsBtn = this.makeButton(doc, 'tbc-pip-settings', t('pipSettings'), t('pipSettings'), ICON_SETTINGS);
    const sendBtn = this.makeButton(doc, 'tbc-pip-send', t('pipSend'), t('pipSend'), ICON_CHAT_SEND);
    buttons.append(reloadBtn, aspectBtn, danmakuBtn, settingsBtn, sendBtn);

    const video = doc.createElement('video');
    video.id = 'tbc-pip-video';
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');

    const layer = doc.createElement('div');
    layer.id = 'tbc-pip-danmaku';

    const toast = doc.createElement('div');
    toast.id = 'tbc-pip-toast';

    const input = doc.createElement('div');
    input.id = 'tbc-pip-input';
    const field = doc.createElement('input');
    field.id = 'tbc-pip-field';
    field.type = 'text';
    field.maxLength = 500;
    field.autocomplete = 'off';
    field.spellcheck = true;
    field.placeholder = currentVodId() ? t('pipVodNoSend') : t('fsChatPlaceholder');

    const favWrap = doc.createElement('div');
    favWrap.className = 'tbc-pip-fav-wrap';
    const favBtn = this.makeButton(doc, 'tbc-pip-fav', t('fsChatFavorites'), t('fsChatFavorites'), ICON_FAVORITE);
    const favList = doc.createElement('div');
    favList.id = 'tbc-pip-fav-list';
    favList.hidden = true;
    favWrap.append(favBtn, favList);

    const submit = this.makeButton(doc, 'tbc-pip-submit', t('fsChatSend'), t('fsChatSend'));
    submit.textContent = t('fsChatSend');

    const status = doc.createElement('div');
    status.id = 'tbc-pip-status';

    input.append(field, favWrap, submit, status);
    main.append(back, buttons, video, layer, toast);
    wrap.append(main, input);
    doc.body.appendChild(wrap);

    this.nodes = {
      wrap, main, back, reloadBtn, aspectBtn, danmakuBtn, settingsBtn, sendBtn,
      video, layer, toast, input, field, favBtn, favList, submit, status,
    };

    const stop = (event) => event.stopPropagation();
    reloadBtn.addEventListener('click', (event) => {
      stop(event);
      this.reloadVideo();
    });
    aspectBtn.addEventListener('click', (event) => {
      stop(event);
      this.toggleAspectLock();
    });
    danmakuBtn.addEventListener('click', (event) => {
      stop(event);
      this.onToggleDanmaku?.();
    });
    settingsBtn.addEventListener('click', (event) => {
      stop(event);
      this.openSettings();
    });
    sendBtn.addEventListener('click', (event) => {
      stop(event);
      this.setInputOpen(true);
    });
    back.addEventListener('click', (event) => {
      stop(event);
      this.close(true);
    });
    favBtn.addEventListener('click', (event) => {
      event.preventDefault();
      stop(event);
      this.toggleFavorites();
    });
    submit.addEventListener('click', (event) => {
      event.preventDefault();
      stop(event);
      this.submit();
    });
    main.addEventListener('click', (event) => {
      if (event.target.closest('#tbc-pip-btns, #tbc-pip-back, #tbc-pip-input')) return;
      this.setInputOpen(false);
    });
    pipWindow.addEventListener('resize', this.boundResize);
    doc.addEventListener('keydown', this.boundKeyDown, true);
    this.applyAspectLock();
    this.resetLanes();
    pipWindow.requestAnimationFrame(() => this.resetLanes());
  }

  makeButton(doc, id, label, title, html) {
    const button = doc.createElement('button');
    button.type = 'button';
    button.id = id;
    button.className = id === 'tbc-pip-back' || id === 'tbc-pip-submit' || id === 'tbc-pip-fav'
      ? id
      : 'tbc-pip-btn';
    if (id === 'tbc-pip-fav' || id === 'tbc-pip-submit' || id === 'tbc-pip-back') {
      button.className = id;
    }
    button.setAttribute('aria-label', label);
    button.title = title;
    if (html) button.innerHTML = html;
    return button;
  }

  iconReload() {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.65 6.35A7.95 7.95 0 0 0 12 4a8 8 0 1 0 7.75 10h-2.1A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>';
  }

  windowCss() {
    return `
      html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; background: #000; }
      #tbc-pip-wrap, #tbc-pip-main { position: relative; width: 100%; height: 100%; overflow: hidden; }
      #tbc-pip-video {
        position: absolute; inset: 0; width: 100%; height: 100%;
        object-fit: fill; background: #000; z-index: 1;
      }
      #tbc-pip-wrap.is-aspect-locked #tbc-pip-video { object-fit: contain; }
      #tbc-pip-danmaku { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 2; }
      .tbc-pip-dm {
        position: absolute; white-space: nowrap; font-weight: 700; line-height: 1.2;
        pointer-events: none; will-change: transform;
        text-shadow: 1px 1px 2px rgba(0,0,0,.9), -1px -1px 2px rgba(0,0,0,.9), 0 0 4px rgba(0,0,0,.8);
        animation: tbc-pip-scroll var(--tbc-duration, 8s) linear forwards;
      }
      .tbc-pip-emote {
        height: 1.2em; width: auto; vertical-align: -0.22em; margin: 0 0.1em; pointer-events: none;
      }
      @keyframes tbc-pip-scroll {
        from { transform: translateX(0); }
        to { transform: translateX(calc(-1 * var(--tbc-travel, 100vw))); }
      }
      #tbc-pip-btns {
        position: absolute; top: 50%; left: -50px; transform: translateY(-50%);
        display: flex; flex-direction: column; gap: 8px; z-index: 5;
        transition: left 0.3s ease;
      }
      #tbc-pip-wrap:hover #tbc-pip-btns { left: 10px; }
      .tbc-pip-btn, #tbc-pip-fav {
        position: relative; width: 36px; height: 36px; padding: 0; box-sizing: border-box;
        border: 2px solid #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center;
        background: rgba(0,0,0,.58); color: #fff; cursor: pointer;
      }
      .tbc-pip-btn svg, #tbc-pip-fav svg { width: 18px; height: 18px; fill: currentColor; display: block; }
      .tbc-pip-btn:hover, #tbc-pip-fav:hover { background: rgba(0,0,0,.82); }
      #tbc-pip-danmaku-btn.is-off { opacity: 0.45; }
      #tbc-pip-danmaku-btn.is-off::after {
        content: ""; position: absolute; width: 22px; height: 2px; background: #fff; transform: rotate(-40deg);
      }
      #tbc-pip-back {
        position: absolute; top: 10px; right: -180px; z-index: 6;
        padding: 6px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,.35);
        background: rgba(0,0,0,.65); color: #fff; font: 600 14px/1.25 sans-serif;
        cursor: pointer; white-space: nowrap; transition: right 0.3s ease;
      }
      #tbc-pip-wrap:hover #tbc-pip-back { right: 10px; }
      #tbc-pip-back:hover { background: rgba(0,0,0,.88); }
      #tbc-pip-toast {
        position: absolute; left: 50%; top: 16px; transform: translateX(-50%);
        z-index: 7; padding: 6px 12px; border-radius: 6px; background: rgba(0,0,0,.72);
        color: #fff; font: 13px/1.3 sans-serif; opacity: 0; pointer-events: none; transition: opacity .2s;
      }
      #tbc-pip-toast.is-show { opacity: 1; }
      #tbc-pip-input {
        display: none; position: absolute; left: 0; right: 0; bottom: 0; z-index: 8;
        box-sizing: border-box; gap: 8px; padding: 8px 10px; align-items: center; flex-wrap: wrap;
        background: rgba(14,14,16,.94); border-top: 1px solid rgba(255,255,255,.12);
        font-family: sans-serif;
      }
      #tbc-pip-input.is-active { display: flex; }
      #tbc-pip-field {
        flex: 1; min-width: 0; height: 34px; box-sizing: border-box; padding: 0 10px;
        border-radius: 6px; border: 1px solid rgba(255,255,255,.16); background: #18181b;
        color: #efeff1; font-size: 14px; outline: none;
      }
      #tbc-pip-field:focus { border-color: #9147ff; }
      #tbc-pip-fav { flex-shrink: 0; }
      .tbc-pip-fav-wrap { position: relative; flex-shrink: 0; }
      #tbc-pip-fav-list {
        position: absolute; left: 0; bottom: calc(100% + 6px); width: 220px; max-height: 180px;
        overflow: auto; background: #18181b; border: 1px solid rgba(255,255,255,.14); border-radius: 6px;
      }
      .tbc-pip-fav-item, .tbc-pip-fav-empty {
        display: block; width: 100%; box-sizing: border-box; text-align: left; background: transparent;
        color: #efeff1; border: 0; padding: 8px 10px; font-size: 13px;
      }
      .tbc-pip-fav-item { cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .tbc-pip-fav-item:hover { background: rgba(255,255,255,.08); }
      .tbc-pip-fav-empty { color: #adadb8; }
      #tbc-pip-submit {
        flex-shrink: 0; height: 34px; padding: 0 12px; border: 0; border-radius: 6px;
        background: #9147ff; color: #fff; font-weight: 700; cursor: pointer;
      }
      #tbc-pip-submit:disabled { opacity: 0.55; cursor: default; }
      #tbc-pip-status { flex: 1 0 100%; min-height: 0; color: #ff8280; font-size: 12px; line-height: 1.35; }
      #tbc-pip-status:empty { display: none; }
      #tbc-pip-status.is-ok { color: #00f593; }
    `;
  }

  onKeyDown(event) {
    if (!this.isOpen() || event.isComposing) return;
    if (event.key === 'Escape') {
      if (this.favOpen) {
        event.preventDefault();
        this.closeFavorites();
        return;
      }
      if (this.inputOpen) {
        event.preventDefault();
        this.setInputOpen(false);
      }
      return;
    }
    if (event.key !== 'Enter' || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const field = this.nodes?.field;
    if (field && this.pipWindow.document.activeElement === field) {
      event.preventDefault();
      this.submit();
      return;
    }
    event.preventDefault();
    this.setInputOpen(true);
  }

  setInputOpen(open) {
    if (!this.nodes?.input) return;
    this.inputOpen = !!open;
    this.nodes.input.classList.toggle('is-active', this.inputOpen);
    if (!this.inputOpen) this.closeFavorites();
    if (this.inputOpen) {
      this.nodes.field.placeholder = currentVodId() ? t('pipVodNoSend') : t('fsChatPlaceholder');
      this.pipWindow.requestAnimationFrame(() => this.nodes?.field?.focus());
    }
    this.resetLanes();
  }

  async reloadVideo() {
    const source = this.sourceVideo;
    const pipVideo = this.pipVideo;
    if (!source || !pipVideo || (typeof source.captureStream !== 'function' && !this.isMediaStream(source.srcObject))) {
      this.showToast(t('pipReloadFailed'));
      return;
    }
    try {
      if (source.paused) await source.play();
    } catch (error) {
      // Keep going; a paused source can still be recaptured.
    }
    let stream = null;
    try {
      stream = this.captureSource(source);
    } catch (error) {
      this.showToast(t('pipReloadFailed'));
      return;
    }
    if (!stream) {
      this.showToast(t('pipReloadFailed'));
      return;
    }
    const previous = pipVideo.srcObject;
    pipVideo.srcObject = stream;
    pipVideo.muted = true;
    if (previous && previous !== stream) this.stopStream(previous);
    if (source.paused) pipVideo.pause();
    else {
      try { await pipVideo.play(); } catch (error) { /* the next source play event retries */ }
    }
    try { this.pipWindow?.focus(); } catch (error) { /* focus is best-effort */ }
    this.showToast(t('pipReloaded'));
  }

  openSettings() {
    try { window.focus(); } catch (error) { /* opener focus can fail */ }
    try { this.sourceVideo?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (error) { /* not laid out */ }
    this.onOpenSettings?.();
    this.showToast(t('pipSettingsHint'));
  }

  showToast(message) {
    const toast = this.nodes?.toast;
    if (!toast) return;
    toast.textContent = message || '';
    toast.classList.add('is-show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => toast.classList.remove('is-show'), 2000);
  }

  showPageToast(message) {
    let toast = document.getElementById('tbc-pip-page-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'tbc-pip-page-toast';
      toast.className = 'tbc-pip-page-toast';
      (document.body || document.documentElement).appendChild(toast);
    }
    toast.textContent = message || '';
    toast.classList.add('is-show');
    clearTimeout(this.pageToastTimer);
    this.pageToastTimer = setTimeout(() => toast.classList.remove('is-show'), 2800);
  }

  clearPageToast() {
    clearTimeout(this.pageToastTimer);
    document.getElementById('tbc-pip-page-toast')?.remove();
  }

  listFavoriteItems() {
    if (this.favoritesPanel?.visibleItems) {
      this.favoritesPanel.state = loadFavoritesState();
      return this.favoritesPanel.visibleItems();
    }
    return listFavoritesForChannel(loadFavoritesState(), currentChannelLogin?.() || '');
  }

  toggleFavorites() {
    if (this.favOpen) this.closeFavorites();
    else this.openFavorites();
  }

  openFavorites() {
    const list = this.nodes?.favList;
    const button = this.nodes?.favBtn;
    if (!list || !button) return;
    this.renderFavorites();
    list.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    this.favOpen = true;
  }

  closeFavorites() {
    const list = this.nodes?.favList;
    const button = this.nodes?.favBtn;
    if (list) {
      list.hidden = true;
      list.replaceChildren();
    }
    button?.setAttribute('aria-expanded', 'false');
    this.favOpen = false;
  }

  renderFavorites() {
    const list = this.nodes?.favList;
    if (!list) return;
    const doc = this.pipWindow.document;
    list.replaceChildren();
    const items = this.listFavoriteItems();
    if (!items.length) {
      const empty = doc.createElement('div');
      empty.className = 'tbc-pip-fav-empty';
      empty.textContent = t('fsChatFavoritesEmpty');
      list.appendChild(empty);
      return;
    }
    items.forEach((item) => {
      const button = doc.createElement('button');
      button.type = 'button';
      button.className = 'tbc-pip-fav-item';
      button.title = item.text;
      button.textContent = item.text;
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const field = this.nodes?.field;
        if (field) {
          field.value = item.text;
          field.focus();
          const len = field.value.length;
          field.setSelectionRange(len, len);
        }
        this.closeFavorites();
      });
      list.appendChild(button);
    });
  }

  setStatus(message, ok = false) {
    const status = this.nodes?.status;
    if (!status) return;
    status.textContent = message || '';
    status.classList.toggle('is-ok', !!ok && !!message);
  }

  async submit() {
    const field = this.nodes?.field;
    if (!field || this.sending) return;
    const text = field.value.trim();
    if (!text) {
      this.setStatus('');
      return;
    }
    if (currentVodId()) {
      this.setStatus(t('pipVodNoSend'), false);
      return;
    }

    this.sending = true;
    if (this.nodes.submit) this.nodes.submit.disabled = true;
    this.closeFavorites();
    this.setStatus('');
    try {
      await sendTwitchChatMessage(text);
      field.value = '';
      this.setStatus(t('fsChatSent'), true);
      clearTimeout(this.statusTimer);
      this.statusTimer = setTimeout(() => {
        if (this.nodes?.status?.textContent === t('fsChatSent')) this.setStatus('');
      }, 1200);
    } catch (error) {
      this.setStatus(chatSendErrorMessage(error), false);
    } finally {
      this.sending = false;
      if (this.nodes?.submit) this.nodes.submit.disabled = false;
      field.focus();
    }
  }
}

class ControlButton {
  constructor({
    onToggleDanmaku,
    onToggleTranslate,
    onTogglePanel,
    onToggleSpeech,
    onToggleHistory,
    onTogglePip,
    getSettings,
    isPanelOpen,
    isSpeechPanelOpen,
    isHistoryPanelOpen,
    isPipOpen,
  }) {
    this.onToggleDanmaku = onToggleDanmaku;
    this.onToggleTranslate = onToggleTranslate;
    this.onTogglePanel = onTogglePanel;
    this.onToggleSpeech = onToggleSpeech;
    this.onToggleHistory = onToggleHistory;
    this.onTogglePip = onTogglePip;
    this.getSettings = getSettings;
    this.isPanelOpen = isPanelOpen;
    this.isSpeechPanelOpen = isSpeechPanelOpen;
    this.isHistoryPanelOpen = isHistoryPanelOpen;
    this.isPipOpen = isPipOpen;
    this.wrap = null;
    this.danmakuBtn = null;
    this.translateBtn = null;
    this.speechBtn = null;
    this.historyBtn = null;
    this.settingsBtn = null;
    this.pipBtn = null;
    this.controlsGroup = null;
    this.retryTimer = null;
  }

  createBtn(className, label, html) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `tbc-control-btn ${className}`;
    btn.setAttribute('aria-label', label);
    btn.innerHTML = html;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    return btn;
  }

  async mount() {
    this.controlsGroup = await waitForElement(SELECTORS.playerControls);
    if (!this.controlsGroup || this.controlsGroup.querySelector('.tbc-controls-wrap')) return;

    this.wrap = document.createElement('div');
    this.wrap.className = 'tbc-controls-wrap';

    this.danmakuBtn = this.createBtn('tbc-danmaku-btn', t('danmakuToggle'), `
      <span class="tbc-icon tbc-icon-on">${ICON_DANMAKU_ON}</span>
      <span class="tbc-icon tbc-icon-off">${ICON_DANMAKU_OFF}</span>
    `);
    this.danmakuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onToggleDanmaku();
    });

    this.translateBtn = this.createBtn('tbc-translate-btn', t('translateToggle'), `
      <span class="tbc-icon tbc-icon-on">${ICON_TRANSLATE_ON}</span>
      <span class="tbc-icon tbc-icon-off">${ICON_TRANSLATE_OFF}</span>
    `);
    this.translateBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onToggleTranslate?.();
    });

    this.speechBtn = this.createBtn('tbc-speech-btn', t('speechToggle'), `
      <span class="tbc-icon tbc-icon-on">${ICON_SPEECH_ON}</span>
      <span class="tbc-icon tbc-icon-mute">${ICON_SPEECH_MUTE}</span>
      <span class="tbc-icon tbc-icon-off">${ICON_SPEECH_OFF}</span>
    `);
    this.speechBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onToggleSpeech(this.speechBtn);
    });

    this.settingsBtn = this.createBtn('tbc-settings-btn', t('settingsToggle'), ICON_SETTINGS);
    this.settingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onTogglePanel(this.settingsBtn);
    });

    this.historyBtn = this.createBtn('tbc-history-btn', t('historyToggle'), ICON_DOWNLOAD);
    this.historyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onToggleHistory(this.historyBtn);
    });

    this.pipBtn = this.createBtn('tbc-pip-btn', t('pipOpen'), ICON_PIP);
    this.pipBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onTogglePip?.();
    });

    this.wrap.append(this.danmakuBtn, this.translateBtn, this.settingsBtn, this.speechBtn, this.historyBtn, this.pipBtn);
    this.controlsGroup.appendChild(this.wrap);
    this.updateDanmakuState();
    this.updateTranslateState();
    this.updateSpeechState();
    this.updatePanelState();
    this.updatePipState();
  }

  remount() {
    if (this.wrap?.isConnected && this.wrap.querySelector('.tbc-translate-btn') && this.wrap.querySelector('.tbc-speech-btn') && this.wrap.querySelector('.tbc-history-btn') && this.wrap.querySelector('.tbc-pip-btn')) return;
    this.wrap?.remove();
    this.wrap = null;
    this.danmakuBtn = null;
    this.translateBtn = null;
    this.speechBtn = null;
    this.historyBtn = null;
    this.settingsBtn = null;
    this.pipBtn = null;
    clearTimeout(this.retryTimer);
    this.retryTimer = setTimeout(() => this.mount(), 500);
  }

  updateDanmakuState() {
    if (!this.danmakuBtn) return;
    const enabled = this.getSettings().enabled;
    this.danmakuBtn.classList.toggle('tbc-danmaku-enabled', enabled);
    this.danmakuBtn.classList.toggle('tbc-danmaku-disabled', !enabled);
    this.danmakuBtn.title = enabled ? t('danmakuOn') : t('danmakuOff');
  }

  updateTranslateState() {
    if (!this.translateBtn) return;
    const enabled = !!this.getSettings().translateEnabled;
    this.translateBtn.classList.toggle('tbc-translate-on', enabled);
    this.translateBtn.classList.toggle('tbc-translate-off', !enabled);
    this.translateBtn.title = enabled ? t('translateOn') : t('translateOff');
    this.translateBtn.setAttribute('aria-pressed', enabled ? 'true' : 'false');
  }

  updateSpeechState() {
    if (!this.speechBtn) return;
    const settings = this.getSettings();
    const enabled = !!settings.speechEnabled;
    const muted = enabled && Number(settings.speechVolume) <= 0;
    const current = !enabled ? 'off' : muted ? 'mute' : 'on';
    this.speechBtn.classList.toggle('tbc-speech-on', current === 'on');
    this.speechBtn.classList.toggle('tbc-speech-mute', current === 'mute');
    this.speechBtn.classList.toggle('tbc-speech-off', current === 'off');
    this.speechBtn.classList.toggle('tbc-active', !!this.isSpeechPanelOpen?.());
    const label = current === 'on' ? t('speechOn') : current === 'mute' ? t('speechMute') : t('speechOff');
    this.speechBtn.title = label;
    this.speechBtn.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    this.speechBtn.setAttribute('aria-expanded', this.isSpeechPanelOpen?.() ? 'true' : 'false');
  }

  updateHistoryState() {
    if (!this.historyBtn) return;
    const open = !!this.isHistoryPanelOpen?.();
    this.historyBtn.classList.toggle('tbc-active', open);
    this.historyBtn.title = t('historyToggle');
    this.historyBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  updatePipState() {
    if (!this.pipBtn) return;
    const open = !!this.isPipOpen?.();
    this.pipBtn.classList.toggle('tbc-active', open);
    this.pipBtn.title = open ? t('pipClose') : t('pipOpen');
    this.pipBtn.setAttribute('aria-pressed', open ? 'true' : 'false');
  }

  updatePanelState() {
    if (!this.settingsBtn) return;
    this.settingsBtn.classList.toggle('tbc-active', this.isPanelOpen());
    this.settingsBtn.setAttribute('aria-expanded', this.isPanelOpen() ? 'true' : 'false');
    this.updateTranslateState();
    this.updateSpeechState();
    this.updateHistoryState();
  }

  destroy() {
    clearTimeout(this.retryTimer);
    this.wrap?.remove();
    this.wrap = null;
    this.danmakuBtn = null;
    this.translateBtn = null;
    this.speechBtn = null;
    this.historyBtn = null;
    this.settingsBtn = null;
    this.pipBtn = null;
  }
}

let settings = loadSettings();
let danmaku = null;
let danmakuEmitter = null;
let translateQueue = null;
let chatObserver = null;
let chatContextMenu = null;
let chatClearButton = null;
let favoritesPanel = null;
let fullscreenChat = null;
let enhancedPip = null;
let settingsPanel = null;
let speechPanel = null;
let historyPanel = null;
let controlButton = null;
let stylesInjected = false;
let navPath = location.pathname;
let pageActive = isPageActive();

function getSettings() {
  return settings;
}

function isBackgroundChatKept() {
  if (document.documentElement.dataset.tbcPreview === 'true') return true;
  if (enhancedPip?.isOpen()) return true;
  return false;
}

function isActive() {
  if (isBackgroundChatKept()) return true;
  return pageActive;
}

function syncBackgroundChat() {
  syncTabAntiFreeze(() => enhancedPip?.isOpen());
  if (isBackgroundChatKept()) {
    chatObserver?.ensureBackgroundIrc?.();
  } else {
    chatObserver?.maybeStopBackgroundIrc?.();
  }
  if (isBackgroundChatKept() && !pageActive) {
    pageActive = true;
  }
}

function onSettingsChange(newSettings) {
  settings = newSettings;
  danmaku?.updateLayout();
  controlButton?.updateDanmakuState();
  controlButton?.updateTranslateState();
  controlButton?.updateSpeechState();
  settingsPanel?.syncFromSettings();
  speechPanel?.syncFromSettings();
  enhancedPip?.syncSettings();
  syncBackgroundChat();
  if (document.documentElement.dataset.tbcPreview === 'true') {
    window.dispatchEvent(new CustomEvent('tbc-settings-updated', { detail: settings }));
  }
  if (!settings.translateEnabled) {
    translateQueue?.clear();
    clearChatTranslations();
  } else if (!settings.translateInChat) {
    clearChatTranslations();
  }
  if (!settings.speechEnabled || Number(settings.speechVolume) <= 0) {
    cancelSpeech();
  }
}

function toggleDanmaku() {
  settings.enabled = !settings.enabled;
  saveSettings(settings);
  onSettingsChange(settings);
}

function toggleTranslate() {
  settings.translateEnabled = !settings.translateEnabled;
  saveSettings(settings);
  onSettingsChange(settings);
}

function toggleSpeechEnabled() {
  settings.speechEnabled = !settings.speechEnabled;
  saveSettings(settings);
  onSettingsChange(settings);
}

function handleVisibilityChange() {
  if (document.documentElement.dataset.tbcPreview === 'true') {
    pageActive = true;
    return;
  }
  const wasChatActive = isActive();
  pageActive = isPageActive();
  syncBackgroundChat();
  const nowChatActive = isActive();

  if (wasChatActive && !nowChatActive) {
    danmakuEmitter?.clear();
    translateQueue?.clear();
    cancelSpeech();
  }
}

function teardown() {
  chatObserver?.stop();
  chatContextMenu?.detach();
  chatClearButton?.destroy();
  favoritesPanel?.destroy();
  fullscreenChat?.destroy();
  enhancedPip?.destroy();
  danmaku?.destroy();
  controlButton?.destroy();
  danmakuEmitter?.clear();
  translateQueue?.clear();
  clearChatTranslations(document, { force: true });
  settingsPanel?.close();
  speechPanel?.close();
  historyPanel?.close();
  cancelSpeech();
  tabAntiFreezeDisable();
  chatObserver = null;
  chatContextMenu = null;
  chatClearButton = null;
  favoritesPanel = null;
  fullscreenChat = null;
  enhancedPip = null;
  danmaku = null;
  danmakuEmitter = null;
  translateQueue = null;
  controlButton = null;
}

async function boot() {
  settings = loadSettings();
  pageActive = isPageActive();

  if (!stylesInjected) {
    injectStyles();
    stylesInjected = true;
  }

  ensureSpeechSpeaker(getSettings);

  danmaku = new DanmakuEngine(getSettings);
  danmakuEmitter = new DanmakuEmitter(danmaku, getSettings, isActive);
  translateQueue = new TranslateQueue(getSettings, isActive);
  chatObserver = new ChatObserver({
    getSettings,
    danmakuEmitter,
    translateQueue,
    isActive,
  });

  favoritesPanel = new FavoritesPanel();
  favoritesPanel.attach();

  chatContextMenu = new ChatContextMenu({
    getSettings,
    danmakuEmitter,
    isActive,
    favoritesPanel,
  });
  chatContextMenu.attach(document);

  danmaku.setSuperchatHelpers(() => ({
    getSettings,
    favoritesPanel,
    chatContextMenu,
  }));

  chatClearButton = new ChatClearButton({
    onClear: () => chatObserver?.clearIrcHistory?.(),
  });

  fullscreenChat = new FullscreenChatInput({ favoritesPanel });
  fullscreenChat.attach();

  enhancedPip = new EnhancedPip({
    getSettings,
    danmaku,
    favoritesPanel,
    onToggleDanmaku: toggleDanmaku,
    onOpenSettings: () => {
      speechPanel?.close();
      historyPanel?.close();
      const anchor = controlButton?.settingsBtn || controlButton?.wrap;
      if (anchor && !settingsPanel?.isOpen) settingsPanel.open(anchor);
      controlButton?.updatePanelState();
    },
    onStateChange: () => {
      syncBackgroundChat();
      controlButton?.updatePipState();
    },
  });

  if (!settingsPanel) {
    settingsPanel = new SettingsPanel({
      settings,
      onChange: onSettingsChange,
      onClose: () => controlButton?.updatePanelState(),
    });
  } else {
    settingsPanel.settings = settings;
  }

  if (!speechPanel) {
    speechPanel = new SpeechPanel({
      settings,
      onChange: onSettingsChange,
      onClose: () => controlButton?.updateSpeechState(),
    });
  } else {
    speechPanel.settings = settings;
  }

  if (!historyPanel) {
    historyPanel = new HistoryPanel({
      onClose: () => controlButton?.updateHistoryState(),
      getIrcComments: () => (
        chatObserver?.mode === 'irc' ? chatObserver.getIrcHistoryComments() : null
      ),
    });
  } else {
    historyPanel.getIrcComments = () => (
      chatObserver?.mode === 'irc' ? chatObserver.getIrcHistoryComments() : null
    );
  }

  controlButton = new ControlButton({
    onToggleDanmaku: toggleDanmaku,
    onToggleTranslate: toggleTranslate,
    onTogglePanel: (anchor) => {
      speechPanel.close();
      historyPanel.close();
      settingsPanel.toggle(anchor);
      controlButton.updatePanelState();
    },
    onToggleSpeech: (anchor) => {
      settingsPanel.close();
      historyPanel.close();
      speechPanel.toggle(anchor);
      controlButton.updatePanelState();
    },
    onToggleHistory: (anchor) => {
      settingsPanel.close();
      speechPanel.close();
      historyPanel.toggle(anchor);
      controlButton.updatePanelState();
    },
    getSettings,
    isPanelOpen: () => settingsPanel.isOpen,
    isSpeechPanelOpen: () => speechPanel.isOpen,
    isHistoryPanelOpen: () => historyPanel.isOpen,
    onTogglePip: () => enhancedPip?.toggle(),
    isPipOpen: () => !!enhancedPip?.isOpen(),
  });

  // Mount player UI first so FFZ/chat delays cannot block controls.
  await Promise.all([
    danmaku.mount(),
    controlButton.mount(),
    favoritesPanel.mount(),
  ]);
  await chatClearButton.mount();
  await chatObserver.start();

  window.__tbcApplySettings = onSettingsChange;
  window.__tbcGetSettings = getSettings;
  window.__tbcToggleTranslate = toggleTranslate;
  window.__tbcToggleSpeech = toggleSpeechEnabled;

  syncBackgroundChat();

  console.log(`[TBC] Twitch Danmaku initialized${chatObserver.ffzActive ? ' (FFZ compat)' : ''}`);
}

function watchNavigation() {
  setInterval(() => {
    if (location.pathname !== navPath) {
      navPath = location.pathname;
      teardown();
      boot().catch((err) => console.error('[TBC] Reinit failed:', err));
    } else {
      controlButton?.remount();
      chatClearButton?.remount();
      favoritesPanel?.remount();
    }
  }, 1500);
}

document.addEventListener('visibilitychange', handleVisibilityChange);

boot().catch((err) => console.error('[TBC] Init failed:', err));
watchNavigation();
})();