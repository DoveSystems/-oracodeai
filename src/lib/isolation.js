export function ensureCrossOriginIsolated() {
  const ok = globalThis.crossOriginIsolated;
  return {
    ok,
    message: ok
      ? 'crossOriginIsolated OK'
      : 'This preview requires COOP/COEP headers (COOP: same-origin, COEP: require-corp). The app will use a safe fallback preview.'
  };
}
