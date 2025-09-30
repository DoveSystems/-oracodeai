import React from 'react';
import JSZip from 'jszip';
import FileTree from '../components/files/FileTree';
import EditorPane from '../components/editor/EditorPane';
import { startWebContainer } from '../lib/webcontainers';
import { ensureCrossOriginIsolated } from '../lib/isolation';

export default function PreviewZip(){
  const [files, setFiles] = React.useState({});
  const [selected, setSelected] = React.useState('');
  const [iframeUrl, setIframeUrl] = React.useState('');
  const [log, setLog] = React.useState('');
  const [mode, setMode] = React.useState('idle'); // idle|ready|running|static|error
  const iso = ensureCrossOriginIsolated();

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const zip = await JSZip.loadAsync(file);
    const out = {};
    await Promise.all(Object.keys(zip.files).map(async (k)=>{
      const entry = zip.files[k];
      if (entry.dir) return;
      const text = await entry.async('string');
      out[k] = text;
    }));
    setFiles(out);
    window.__ZIP_FILES__ = out;
    // pick a default file
    const entry = Object.keys(out).find(p => /src\/main\.(t|j)sx?$/.test(p)) ||
                  Object.keys(out).find(p => /index\.html$/.test(p)) ||
                  Object.keys(out)[0];
    setSelected(entry);
    setMode('ready');
  };

  const appendLog = (t) => setLog(l => (l + (l ? '\n' : '') + t).slice(-20000));

  const runWebContainer = async () => {
    try {
      setLog('');
      if (!iso.ok) throw new Error('Not crossOriginIsolated');
      const { url } = await startWebContainer(files, appendLog);
      setIframeUrl(url);
      setMode('running');
    } catch (e) {
      appendLog('WebContainer failed: ' + (e.message || e));
      runStatic();
    }
  };

  const runStatic = () => {
    const index = Object.keys(files).find(k => k.match(/index\.html$/i));
    if (!index) { setMode('error'); appendLog('No index.html found for static preview'); return; }
    const html = files[index];
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setIframeUrl(url);
    setMode('static');
  };

  const onEdit = (val) => {
    if (!selected) return;
    setFiles(f => {
      const next = { ...f, [selected]: val };
      window.__ZIP_FILES__ = next;
      if (mode === 'static') {
        // refresh static preview
        const index = Object.keys(next).find(k => k.match(/index\.html$/i));
        if (index) {
          const blob = new Blob([next[index]], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          setIframeUrl(url);
        }
      }
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {!iso.ok && (
        <div className="p-3 rounded border border-yellow-700 bg-yellow-900/30 text-yellow-100 text-sm">
          {iso.message}
        </div>
      )}
      <div className="flex items-center gap-3">
        <input type="file" accept=".zip" onChange={onUpload} />
        <button onClick={runWebContainer} disabled={!Object.keys(files).length} className="px-4 py-2 rounded bg-cyan-600 disabled:opacity-50">Run (WebContainer)</button>
        <button onClick={runStatic} disabled={!Object.keys(files).length} className="px-4 py-2 rounded bg-gray-700 disabled:opacity-50">Run Static</button>
        <span className="text-xs opacity-70">Mode: {mode}</span>
      </div>

      <div className="grid grid-cols-12 gap-3" style={{ height: '70vh' }}>
        <div className="col-span-3 overflow-auto border border-gray-700 rounded p-2">
          <FileTree filesMap={files} selected={selected} onSelect={setSelected} />
        </div>
        <div className="col-span-5">
          <EditorPane path={selected} value={files[selected] || ''} onChange={onEdit} />
        </div>
        <div className="col-span-4 border border-gray-700 rounded overflow-hidden">
          {iframeUrl ? <iframe src={iframeUrl} title="preview" className="w-full h-full" /> : <div className="p-3 text-sm text-gray-400">No preview yet</div>}
        </div>
      </div>

      <div>
        <div className="text-sm font-semibold mb-1">Logs</div>
        <textarea readOnly value={log} className="w-full h-40 bg-gray-900 text-gray-100 border border-gray-700 rounded p-2 text-xs" />
      </div>
    </div>
  );
}
