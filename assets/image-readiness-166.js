// Fetch/decode only requested media. Failed attempts are retryable; overlapping
// requests for one image share work, and every path eventually releases callers.
export function createImageReadiness({ createImage = () => new Image(), timeout = 15000 } = {}) {
  const pending = new Map();
  return function ready(url) {
    if (pending.has(url)) return pending.get(url);
    let resolve;
    const promise = new Promise(done => { resolve = done; });
    pending.set(url, promise);
    let image, timer, settled = false;
    const finish = success => {
      if (settled) return;
      settled = true; clearTimeout(timer);
      if (image) image.onload = image.onerror = null;
      if (!success) pending.delete(url);
      resolve(success);
    };
    try {
      image = createImage();
      timer = setTimeout(() => finish(false), timeout);
      image.onload = () => {
        if (typeof image.decode !== 'function') { finish(true); return; }
        Promise.resolve().then(() => image.decode()).then(() => finish(true), () => finish(image.naturalWidth > 0));
      };
      image.onerror = () => finish(false);
      image.src = url;
    } catch { finish(false); }
    return promise;
  };
}
