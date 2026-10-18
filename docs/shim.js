(() => {
  'use strict';

  const DEMO_DURATION = 180;
  const DEMO_PAGES = 12;
  const PAGE_DELAY_MS = 450;

  window.GM_getValue = () => null;
  window.GM_setValue = () => {};
  window.GM_setClipboard = () => {};
  window.GM_addStyle = (css) => {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  };

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function edge(id, offset, login, displayName, text, cursor) {
    return {
      cursor,
      node: {
        id: String(id),
        contentOffsetSeconds: offset,
        createdAt: new Date(Date.UTC(2024, 0, 1, 0, 0, offset)).toISOString(),
        commenter: { id: `u-${login}`, login, displayName },
        message: {
          fragments: [{ text }],
          userColor: login === 'bob' ? '#ff7f50' : '#efeff1',
        },
      },
    };
  }

  function commentsPage(page) {
    const base = page * 12;
    const edges = [];
    for (let i = 0; i < 8; i += 1) {
      const offset = base + i * 2 + 1;
      const cheer = i === 3;
      edges.push(edge(
        `${page}-${i}`,
        offset,
        cheer ? 'bob' : 'alice',
        cheer ? 'Bob' : 'Alice',
        cheer ? `Cheer100 page ${page}` : `hello page ${page} line ${i}`,
        `c-${page}-${i}`,
      ));
    }
    return {
      data: {
        video: {
          comments: {
            edges,
            pageInfo: { hasNextPage: page + 1 < DEMO_PAGES },
          },
        },
      },
    };
  }

  window.GM_xmlhttpRequest = (opts) => {
    (async () => {
      try {
        const body = JSON.parse(opts.data || '{}');
        let payload;

        if (body.query) {
          payload = {
            data: {
              video: {
                title: 'Twitch Danmaku Demo VOD',
                createdAt: '2024-01-01T00:00:00Z',
                lengthSeconds: DEMO_DURATION,
                owner: { displayName: 'DemoChannel', login: 'demochannel' },
              },
            },
          };
        } else if (body.operationName === 'VideoCommentsByOffsetOrCursor') {
          await wait(PAGE_DELAY_MS);
          if (body.variables?.contentOffsetSeconds != null) {
            payload = commentsPage(0);
          } else {
            const cursor = String(body.variables?.cursor || '');
            const match = cursor.match(/c-(\d+)-/);
            const page = match ? Number(match[1]) + 1 : DEMO_PAGES;
            payload = page < DEMO_PAGES
              ? commentsPage(page)
              : { data: { video: { comments: { edges: [], pageInfo: { hasNextPage: false } } } } };
          }
        } else {
          payload = { data: null };
        }

        opts.onload?.({ status: 200, responseText: JSON.stringify(payload) });
      } catch (error) {
        opts.onerror?.(error);
      }
    })();
  };
})();
