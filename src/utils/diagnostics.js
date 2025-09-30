export function getIsolationSnapshot() {
  const snapshot = {
    crossOriginIsolated: typeof globalThis.crossOriginIsolated !== 'undefined' ? globalThis.crossOriginIsolated : false,
    hasSharedArrayBuffer: typeof globalThis.SharedArrayBuffer !== 'undefined',
    isSecureContext: typeof globalThis.isSecureContext !== 'undefined' ? globalThis.isSecureContext : false,
    isTopLevel: (() => { try { return window.top === window.self } catch { return false } })(),
    hasWorker: typeof Worker !== 'undefined',
    hasServiceWorker: typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
    coop: null,
    coep: null,
    corp: null,
    oac: null,
    timestamp: new Date().toISOString(),
  };
  const metas = Array.from(document.querySelectorAll('meta[http-equiv], meta[content]'));
  metas.forEach(m => {
    const key = (m.getAttribute('http-equiv') || '').toLowerCase();
    const val = (m.getAttribute('content') || '').toLowerCase();
    if (key.includes('cross-origin-opener-policy')) snapshot.coop = val;
    if (key.includes('cross-origin-embedder-policy')) snapshot.coep = val;
  });
  return snapshot;
}

export function findPotentialIsolationBreakers() {
  const issues = [];
  const origin = location.origin;
  const isCrossOrigin = (url) => {
    try { return new URL(url, location.href).origin !== origin } catch { return false }
  };
  const offenders = [];
  Array.from(document.querySelectorAll('link[rel="stylesheet"], link[rel="preload"][as="style"]')).forEach(el => {
    const href = el.getAttribute('href');
    if (href && isCrossOrigin(href)) offenders.push({ type: 'stylesheet', url: href, hint: 'Self-host CSS (e.g., Google Fonts).' });
  });
  Array.from(document.querySelectorAll('script[src]')).forEach(el => {
    const src = el.getAttribute('src');
    if (src && isCrossOrigin(src)) offenders.push({ type: 'script', url: src, hint: 'Use same-origin or ensure CORS headers & `crossorigin`.' });
  });
  Array.from(document.querySelectorAll('img[src]')).forEach(el => {
    const src = el.getAttribute('src');
    if (src && isCrossOrigin(src)) offenders.push({ type: 'image', url: src, hint: 'Prefer same-origin or ensure CORS/CORP.' });
  });
  Array.from(document.querySelectorAll('iframe[src]')).forEach(el => {
    const src = el.getAttribute('src');
    if (src) offenders.push({ type: 'iframe', url: src, hint: 'Embedding/being embedded breaks COOP/COEP.' });
  });
  const perf = performance.getEntriesByType?.('resource') || [];
  perf.forEach(r => {
    try { const u = new URL(r.name); if (u.origin !== origin) offenders.push({ type: 'resource', url: r.name, hint: 'Cross-origin network request; check CORS/CORP.' }) } catch {}
  });
  const seen = new Set();
  for (const o of offenders) if (!seen.has(o.url)) { seen.add(o.url); issues.push(o) }
  return issues;
}

export function summarizeReadiness(snapshot) {
  const required = [
    snapshot.crossOriginIsolated,
    snapshot.hasSharedArrayBuffer,
    snapshot.isSecureContext,
    snapshot.isTopLevel,
    snapshot.hasWorker,
  ];
  return required.every(Boolean);
}
