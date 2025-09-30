import React from 'react';

function Node({ path, depth, onSelect, selected, filesMap }) {
  const isDir = Object.keys(filesMap).some(p => p.startsWith(path + '/') && p !== path);
  const [open, setOpen] = React.useState(depth < 1);
  const name = path.split('/').filter(Boolean).pop() || path;

  if (isDir) {
    const children = Object.keys(filesMap)
      .filter(p => p.startsWith(path + '/') && p !== path)
      .map(p => p.split('/').slice(0, depth + 2).join('/'))
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort();
    return (
      <div style={{ paddingLeft: depth * 10 }}>
        <button className="text-left w-full hover:bg-white/5 rounded px-2 py-1" onClick={() => setOpen(o=>!o)}>
          <span className="opacity-60 mr-1">{open ? '▾' : '▸'}</span>{name || '/'}
        </button>
        {open && children.map(ch => (
          <Node key={ch} path={ch} depth={depth+1} onSelect={onSelect} selected={selected} filesMap={filesMap} />
        ))}
      </div>
    );
  }

  return (
    <button
      style={{ paddingLeft: depth * 10 }}
      onClick={() => onSelect(path)}
      className={`text-left w-full hover:bg-white/5 rounded px-2 py-1 ${selected===path ? 'bg-cyan-600/20 border border-cyan-600/40' : ''}`}
    >
      {name}
    </button>
  );
}

export default function FileTree({ filesMap = {}, onSelect, selected }) {
  const roots = React.useMemo(() => {
    const paths = Object.keys(filesMap);
    const top = paths.map(p => p.split('/')[0]).filter(Boolean);
    return Array.from(new Set(top)).sort().map(t => t);
  }, [filesMap]);
  return (
    <div className="text-sm">
      {roots.map(r => <Node key={r} path={r} depth={0} onSelect={onSelect} selected={selected} filesMap={filesMap} />)}
    </div>
  );
}
