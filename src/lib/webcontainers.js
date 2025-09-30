let webcontainerInstance = null;

export async function startWebContainer(filesMap, onLog = () => {}, portHint = 5173) {
  if (!globalThis.crossOriginIsolated) {
    throw new Error('crossOriginIsolated required for WebContainers');
  }
  const { WebContainer } = await import('@webcontainer/api');
  if (!webcontainerInstance) {
    webcontainerInstance = await WebContainer.boot();
  }
  // mount files
  await webcontainerInstance.mount(toFS(filesMap));

  // install deps
  onLog('Installing dependencies...');
  const install = await webcontainerInstance.spawn('pnpm', ['install']);
  install.output.pipeTo(new WritableStream({ write: d => onLog(String(d)) }));
  const code = await install.exit;
  if (code !== 0) throw new Error('pnpm install failed');

  // run dev
  onLog('Starting dev server...');
  const dev = await webcontainerInstance.spawn('pnpm', ['run', 'dev', '--', '--host', '0.0.0.0']);
  dev.output.pipeTo(new WritableStream({ write: d => onLog(String(d)) }));

  // wait for server
  const url = await new Promise((resolve) => {
    webcontainerInstance.on('server-ready', (port, url) => resolve(url));
    setTimeout(()=> resolve(`http://localhost:${portHint}`), 8000);
  });
  return { url, instance: webcontainerInstance };
}

export function toFS(filesMap) {
  const tree = {};
  for (const [path, content] of Object.entries(filesMap || {})) {
    const parts = path.split('/');
    let node = tree;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;
      if (isFile) {
        node[part] = { file: { contents: content ?? '' } };
      } else {
        node[part] = node[part] || { directory: {} };
        node = node[part].directory;
      }
    }
  }
  return tree;
}
