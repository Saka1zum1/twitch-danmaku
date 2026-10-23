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
