import React from 'react';
import Editor from '@monaco-editor/react';

export default function EditorPane({ path, value, onChange }) {
  const language = path.endsWith('.tsx') || path.endsWith('.ts') ? 'typescript'
    : path.endsWith('.jsx') || path.endsWith('.js') ? 'javascript'
    : path.endsWith('.css') ? 'css'
    : path.endsWith('.html') ? 'html' : 'plaintext';

  return (
    <div className="h-full border border-gray-700 rounded overflow-hidden">
      <div className="px-3 py-2 text-xs bg-gray-800 border-b border-gray-700 flex items-center justify-between">
        <div className="truncate">{path || 'No file selected'}</div>
      </div>
      <div style={{ height: 'calc(100% - 34px)' }}>
        <Editor
          height="100%"
          theme="vs-dark"
          path={path}
          language={language}
          value={value}
          onChange={(v)=>onChange(v ?? '')}
          options={{
            fontSize: 13,
            minimap: { enabled: false }
          }}
        />
      </div>
    </div>
  );
}
