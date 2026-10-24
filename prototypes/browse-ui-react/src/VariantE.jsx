// PROTOTYPE variant E: keyboard-first. One virtualized table over ALL Videos (no row cap),
// every filter/jump/sort lives in a ⌘K command palette and shows up as a removable pill.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Command } from 'cmdk';
import { useVirtualizer } from '@tanstack/react-virtual';
import { AppHead, Chip, Drawer, FMT_LABEL, Highlight, Tags, fmtAge, fmtDate, fmtN, fmtS, matchQ, median } from './shared.jsx';

const COLS = [['score', 'Score'], ['title', 'Title'], ['ch', 'Channel'], ['topic', 'Topic'], ['t', 'Published'], ['views', 'Views'], ['base', 'Baseline'], ['n', 'n']];

export default function VariantE({ data }) {
  const [filters, setFilters] = useState([{ kind: 'fmt', value: 'long', label: 'Long-form' }, { kind: 'min', value: 3, label: 'Score ≥ 3×' }]);
  const [sort, setSort] = useState({ k: 'score', dir: -1 });
  const [palette, setPalette] = useState(false);
  const [pq, setPq] = useState('');
  const [cursor, setCursor] = useState(0);
  const [open, setOpen] = useState(null);
  const scrollRef = useRef(null);

  const rows = useMemo(() => {
    const by = k => filters.filter(f => f.kind === k).map(f => f.value);
    const chs = by('ch'), tps = by('topic'), fmt = by('fmt')[0], min = by('min')[0], qs = by('q'), hideImm = by('mature').length;
    const rs = data.videos.filter(v => (!fmt || v.fmt === fmt) && (!min || (v.score ?? 0) >= min) && (!chs.length || chs.includes(v.ch))
      && (!tps.length || tps.includes(v.topic)) && (!hideImm || v.age >= 30) && qs.every(q => matchQ(v, q, data.topics)));
    const key = { title: v => v.title, ch: v => data.channels[v.ch].name, topic: v => data.topics[v.topic].name, score: v => v.score ?? -1 }[sort.k] || (v => v[sort.k]);
    return rs.sort((a, b) => (key(a) > key(b) ? 1 : key(a) < key(b) ? -1 : 0) * sort.dir);
  }, [data, filters, sort]);

  const virt = useVirtualizer({ count: rows.length, getScrollElement: () => scrollRef.current, estimateSize: () => 34, overscan: 20 });
  useEffect(() => setCursor(0), [filters, sort]);

  useEffect(() => {
    const k = e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setPalette(p => !p); return; }
      if (palette || e.target.closest('input, select, textarea')) return;
      if (e.key === '/') { e.preventDefault(); setPalette(true); }
      if (e.key === 'j' || e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => { const n = Math.min(rows.length - 1, c + 1); virt.scrollToIndex(n); return n; }); }
      if (e.key === 'k' || e.key === 'ArrowUp') { e.preventDefault(); setCursor(c => { const n = Math.max(0, c - 1); virt.scrollToIndex(n); return n; }); }
      if (e.key === 'Enter' && rows[cursor]) setOpen(rows[cursor]);
      if (e.key === 'Backspace' && filters.length) setFilters(f => f.slice(0, -1));
    };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  });

  const add = f => { setFilters(fs => [...fs.filter(x => !(['fmt', 'min'].includes(f.kind) && x.kind === f.kind) && !(x.kind === f.kind && x.value === f.value)), f]); setPalette(false); setPq(''); };
  const ql = pq.toLowerCase();
  const m = s => !ql || s.toLowerCase().includes(ql);
  const vidHits = pq.length > 1 ? data.videos.filter(v => matchQ(v, pq, data.topics)).sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 6) : [];
  const scored = rows.filter(v => v.score != null);

  return <div className="page">
    <AppHead data={data}><span className="small">Press <kbd>⌘K</kbd> / <kbd>/</kbd> for commands · <kbd>j</kbd><kbd>k</kbd> move · <kbd>↵</kbd> open · <kbd>⌫</kbd> drop last filter</span></AppHead>
    <div className="e-bar">
      <button className="e-open" onClick={() => setPalette(true)}>🔍 Search, filter, jump… <kbd style={{ float: 'right' }}>⌘K</kbd></button>
      {filters.map((f, i) => <span className="pill" key={i}>{f.label}<button onClick={() => setFilters(fs => fs.filter((_, j) => j !== i))}>×</button></span>)}
      <span className="small muted" style={{ marginLeft: 'auto' }}><b>{rows.length.toLocaleString()}</b> videos · {new Set(rows.map(v => v.ch)).size} channels · median {fmtS(median(scored.map(v => v.score)))}</span>
    </div>
    <div className="e-grid e-head">{COLS.map(([k, l]) => <div key={k} className={sort.k === k ? 'on' : ''} onClick={() => setSort(s => s.k === k ? { k, dir: -s.dir } : { k, dir: ['title', 'ch', 'topic'].includes(k) ? 1 : -1 })}>{l}{sort.k === k ? (sort.dir < 0 ? ' ↓' : ' ↑') : ''}</div>)}</div>
    <div ref={scrollRef} style={{ flex: 1, overflow: 'auto' }}>
      <div style={{ height: virt.getTotalSize(), position: 'relative' }}>
        {virt.getVirtualItems().map(it => {
          const v = rows[it.index];
          return <div key={v.id} className={`e-grid e-row ${it.index === cursor ? 'cur' : ''}`} style={{ top: it.start }} onClick={() => { setCursor(it.index); setOpen(v); }}>
            <div><Chip v={v} /></div><div title={v.title}><Highlight text={v.title} q={filters.filter(f => f.kind === 'q').map(f => f.value).join(' ')} /><Tags v={v} /></div>
            <div>{data.channels[v.ch].name}</div><div className="muted">{data.topics[v.topic].name}</div>
            <div className="muted">{fmtDate(v.t)}</div><div className="num">{fmtN(v.views)}</div><div className="num muted">{fmtN(v.base)}</div><div className="num muted">{v.n}</div>
          </div>;
        })}
      </div>
    </div>

    <Command.Dialog open={palette} onOpenChange={setPalette} label="Command palette" shouldFilter={false}>
      <Command.Input value={pq} onValueChange={setPq} placeholder="Type a title idea, channel, topic, or ‘score 5’…" />
      <Command.List>
        <Command.Empty>No matches.</Command.Empty>
        {pq && <Command.Group heading="Search"><Command.Item onSelect={() => add({ kind: 'q', value: pq, label: `“${pq}”` })}>Filter titles containing “{pq}”</Command.Item></Command.Group>}
        {vidHits.length > 0 && <Command.Group heading="Jump to video">{vidHits.map(v => <Command.Item key={v.id} value={'v' + v.id} onSelect={() => { setOpen(v); setPalette(false); }}><Chip v={v} /><span>{v.title}</span><span className="muted small" style={{ marginLeft: 'auto' }}>{data.channels[v.ch].name} · {fmtAge(v.age)}</span></Command.Item>)}</Command.Group>}
        <Command.Group heading="Channels">{data.channels.filter(c => m(c.name)).slice(0, pq ? 8 : 4).map(c => <Command.Item key={c.id} value={'c' + c.id} onSelect={() => add({ kind: 'ch', value: c.id, label: c.name })}>📺 {c.name}<span className="muted small" style={{ marginLeft: 'auto' }}>{fmtN(c.subs)} subs · {Math.round(c.rate * 100)}% outliers</span></Command.Item>)}</Command.Group>
        <Command.Group heading="Topics">{data.topics.filter(t => m(t.name)).slice(0, pq ? 8 : 4).map(t => <Command.Item key={t.id} value={'t' + t.id} onSelect={() => add({ kind: 'topic', value: t.id, label: t.name })}># {t.name}</Command.Item>)}</Command.Group>
        <Command.Group heading="Filters">
          {[2, 3, 5, 10].map(n => ({ n, l: `Score ≥ ${n}×` })).filter(x => m(x.l) || m('score')).map(x => <Command.Item key={x.n} value={x.l} onSelect={() => add({ kind: 'min', value: x.n, label: x.l })}>⚡ {x.l}</Command.Item>)}
          {['long', 'mid', 'short'].filter(f => m(FMT_LABEL[f]) || m('format')).map(f => <Command.Item key={f} value={f} onSelect={() => add({ kind: 'fmt', value: f, label: FMT_LABEL[f] })}>🎞 Format: {FMT_LABEL[f]}</Command.Item>)}
          {m('mature hide immature') && <Command.Item value="mature" onSelect={() => add({ kind: 'mature', value: 1, label: 'Mature only (30d+)' })}>⏳ Hide immature videos</Command.Item>}
          {m('clear reset') && <Command.Item value="clear" onSelect={() => { setFilters([]); setPalette(false); }}>🧹 Clear all filters</Command.Item>}
        </Command.Group>
        <Command.Group heading="Sort">{[['score', 'Best score'], ['t', 'Newest'], ['views', 'Most views']].filter(([, l]) => m(l) || m('sort')).map(([k, l]) => <Command.Item key={k} value={'s' + k} onSelect={() => { setSort({ k, dir: -1 }); setPalette(false); }}>↕ Sort by {l}</Command.Item>)}</Command.Group>
      </Command.List>
    </Command.Dialog>
    <Drawer v={open} data={data} onClose={() => setOpen(null)} />
  </div>;
}
