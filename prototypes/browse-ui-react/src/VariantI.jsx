// PROTOTYPE variant I: the consolidated set. Three views, one per domain noun (Videos, Topics,
// Channels), sharing one global filter bar (pills + ⌘K palette), one detail pane on the right,
// and links between views. Where the earlier variants went:
//   A facets + D scored query + E virtual table/palette → Videos view, plus the app-wide ⌘K and pills
//   B topic ranking + G map                             → Topics view (list and map side by side, linked)
//   C swimlanes                                         → Channels view
//   F cross-filtering                                   → global filter state shared by every view; detail pane
import { useEffect, useMemo, useRef, useState } from 'react';
import { Command } from 'cmdk';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Group, Panel, Separator } from 'react-resizable-panels';
import { select } from 'd3-selection';
import { zoom, zoomIdentity } from 'd3-zoom';
import { Chip, Detail, FMT_LABEL, Highlight, Tags, TIER_COLOR, TOPIC_COLORS, DAY, TODAY, fmtAge, fmtDate, fmtN, fmtS, matchQ, median, tier } from './shared.jsx';

const VIEWS = [['videos', 'Videos'], ['topics', 'Topics'], ['channels', 'Channels']];

// Cheap title-pattern stats for the Topic detail (the real feature is its own ticket).
const patterns = vs => vs.length ? {
  len: median(vs.map(v => v.title.length)), num: vs.filter(v => /\d/.test(v.title)).length / vs.length,
  q: vs.filter(v => v.title.includes('?')).length / vs.length, i: vs.filter(v => /^I\b/.test(v.title)).length / vs.length,
} : null;
const pct = x => Math.round(x * 100) + '%';

// ---------- global filter bar ----------
function FilterBar({ data, f, setF, openPalette }) {
  const rm = (k, val) => setF(s => ({ ...s, [k]: Array.isArray(s[k]) ? s[k].filter(x => x !== val) : '' }));
  return <div className="i-filters">
    <select value={f.fmt} onChange={e => setF(s => ({ ...s, fmt: e.target.value }))}>{['long', 'mid', 'short', 'all'].map(x => <option key={x} value={x}>{FMT_LABEL[x]}</option>)}</select>
    <select value={f.min} onChange={e => setF(s => ({ ...s, min: +e.target.value }))} title="Outlier threshold used by every view">{[2, 3, 5, 10].map(x => <option key={x} value={x}>Outlier ≥ {x}×</option>)}</select>
    {f.q && <span className="pill">“{f.q}”<button onClick={() => rm('q')}>×</button></span>}
    {f.chs.map(id => <span className="pill" key={'c' + id}>📺 {data.channels[id].name}<button onClick={() => rm('chs', id)}>×</button></span>)}
    {f.topics.map(id => <span className="pill" key={'t' + id}># {data.topics[id].name}<button onClick={() => rm('topics', id)}>×</button></span>)}
    <button className="e-open" style={{ minWidth: 220 }} onClick={openPalette}>+ Search or filter… <kbd style={{ float: 'right' }}>⌘K</kbd></button>
    {(f.q || f.chs.length || f.topics.length) ? <button className="btn" onClick={() => setF(s => ({ ...s, q: '', chs: [], topics: [] }))}>Clear</button> : null}
  </div>;
}

function Palette({ data, open, setOpen, setF, setView, setFocus }) {
  const [pq, setPq] = useState('');
  const ql = pq.toLowerCase(), m = s => !ql || s.toLowerCase().includes(ql);
  const done = () => { setOpen(false); setPq(''); };
  const hits = pq.length > 1 ? data.videos.filter(v => matchQ(v, pq, data.topics)).sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 5) : [];
  return <Command.Dialog open={open} onOpenChange={setOpen} label="Command palette" shouldFilter={false}>
    <Command.Input value={pq} onValueChange={setPq} placeholder="Title idea, Channel, Topic, or a view name…" />
    <Command.List>
      {pq && <Command.Group heading="Search"><Command.Item onSelect={() => { setF(s => ({ ...s, q: pq })); setView('videos'); done(); }}>Filter all views to titles containing “{pq}”</Command.Item></Command.Group>}
      {hits.length > 0 && <Command.Group heading="Open video">{hits.map(v => <Command.Item key={v.id} value={'v' + v.id} onSelect={() => { setFocus({ kind: 'video', id: v.id }); done(); }}><Chip v={v} />{v.title}<span className="muted small" style={{ marginLeft: 'auto' }}>{data.channels[v.ch].name}</span></Command.Item>)}</Command.Group>}
      <Command.Group heading="Go to view">{VIEWS.filter(([, l]) => m(l)).map(([k, l]) => <Command.Item key={k} value={k} onSelect={() => { setView(k); done(); }}>→ {l}</Command.Item>)}</Command.Group>
      <Command.Group heading="Filter by Channel">{data.channels.filter(c => m(c.name)).slice(0, pq ? 6 : 3).map(c => <Command.Item key={c.id} value={'c' + c.id} onSelect={() => { setF(s => ({ ...s, chs: [...new Set([...s.chs, c.id])] })); done(); }}>📺 {c.name}</Command.Item>)}</Command.Group>
      <Command.Group heading="Filter by Topic">{data.topics.filter(t => m(t.name)).slice(0, pq ? 6 : 3).map(t => <Command.Item key={t.id} value={'t' + t.id} onSelect={() => { setF(s => ({ ...s, topics: [...new Set([...s.topics, t.id])] })); done(); }}># {t.name}</Command.Item>)}</Command.Group>
    </Command.List>
  </Command.Dialog>;
}

// ---------- detail pane: Video, Topic, Channel or map selection ----------
function DetailPane({ data, focus, base, f, setFocus, drill }) {
  if (!focus) return <p className="muted small">Select a Video, Topic or Channel to see it here.</p>;
  if (focus.kind === 'video') return <Detail v={data.videos[focus.id]} data={data} />;
  const vs = focus.kind === 'topic' ? base.filter(v => v.topic === focus.id) : focus.kind === 'channel' ? base.filter(v => v.ch === focus.id) : focus.items;
  const outs = vs.filter(v => v.score >= f.min);
  const title = focus.kind === 'topic' ? data.topics[focus.id].name : focus.kind === 'channel' ? data.channels[focus.id].name : 'Map selection';
  const best = {}; outs.forEach(v => { const k = focus.kind === 'channel' ? v.topic : v.ch; if (!best[k] || best[k].score < v.score) best[k] = v; });
  const p = patterns(vs), all = patterns(base);
  return <div className="det">
    <div className="small muted">{focus.kind === 'selection' ? 'Region of similar titles' : focus.kind === 'topic' ? 'Topic' : 'Channel'}</div>
    <h2>{title}</h2>
    <div className="kv">
      {focus.kind === 'channel' && <><span>Subscribers</span><span>{fmtN(data.channels[focus.id].subs)}</span></>}
      <span>Videos</span><span>{vs.length}</span>
      <span>Median score</span><span>{fmtS(median(vs.map(v => v.score)))}</span>
      <span>Outliers ≥{f.min}×</span><span>{outs.length} ({vs.length ? pct(outs.length / vs.length) : '—'})</span>
      {focus.kind !== 'channel' && <><span>Channels w/ outliers</span><span><b>{new Set(outs.map(v => v.ch)).size}</b> of {new Set(vs.map(v => v.ch)).size}</span></>}
    </div>
    {focus.kind !== 'selection' && <button className="btn on" onClick={() => drill(focus)}>Show these {vs.length} videos →</button>}
    {p && focus.kind !== 'channel' && <><h4>Title patterns vs all Videos</h4><div className="kv">
      <span>Median length</span><span>{p.len} chars <span className="muted">({all.len})</span></span>
      <span>Has a number</span><span>{pct(p.num)} <span className="muted">({pct(all.num)})</span></span>
      <span>Question</span><span>{pct(p.q)} <span className="muted">({pct(all.q)})</span></span>
      <span>Starts with “I”</span><span>{pct(p.i)} <span className="muted">({pct(all.i)})</span></span></div></>}
    <h4>{focus.kind === 'channel' ? 'Best outlier per Topic' : 'Best outlier per Channel'}</h4>
    {Object.values(best).sort((a, b) => b.score - a.score).slice(0, 10).map(v => <div className="sib" key={v.id} style={{ cursor: 'pointer' }} onClick={() => setFocus({ kind: 'video', id: v.id, back: focus })}>
      <Chip v={v} /><span>{v.title} <span className="muted small">— {focus.kind === 'channel' ? data.topics[v.topic].name : data.channels[v.ch].name}</span></span></div>)}
    {!outs.length && <p className="muted small">No outliers at this threshold.</p>}
  </div>;
}

// ---------- Videos view (A + D + E) ----------
function VideosView({ data, rows, f, setF, focus, setFocus }) {
  const [sort, setSort] = useState({ k: 'score', dir: -1 });
  const [cursor, setCursor] = useState(0);
  const ref = useRef(null);
  const sorted = useMemo(() => {
    const key = { title: v => v.title, ch: v => data.channels[v.ch].name, score: v => v.score ?? -1 }[sort.k] || (v => v[sort.k]);
    return rows.filter(v => (v.score ?? 0) >= f.min || f.q).sort((a, b) => (key(a) > key(b) ? 1 : key(a) < key(b) ? -1 : 0) * sort.dir);
  }, [rows, sort, f.min, f.q]);
  const virt = useVirtualizer({ count: sorted.length, getScrollElement: () => ref.current, estimateSize: () => 34, overscan: 20 });
  useEffect(() => {
    const k = e => {
      if (e.target.closest('input, select, textarea, [cmdk-root]')) return;
      const mv = d => { e.preventDefault(); setCursor(c => { const n = Math.max(0, Math.min(sorted.length - 1, c + d)); virt.scrollToIndex(n); setFocus({ kind: 'video', id: sorted[n].id }); return n; }); };
      if (e.key === 'j') mv(1); if (e.key === 'k') mv(-1);
    };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  });
  const count = (key, id) => rows.filter(v => v[key] === id && (v.score ?? 0) >= f.min).length;
  const toggle = (k, id) => setF(s => ({ ...s, [k]: s[k].includes(id) ? s[k].filter(x => x !== id) : [...s[k], id] }));
  const scored = rows.filter(v => v.score != null), qOut = scored.filter(v => v.score >= f.min);
  const cols = [['score', 'Score'], ['title', 'Title'], ['ch', 'Channel'], ['t', 'Published'], ['views', 'Views'], ['base', 'Baseline']];
  return <div className="i-videos">
    <aside className="i-facets">
      <h4>Channels</h4>{data.channels.map(c => ({ c, n: count('ch', c.id) })).sort((a, b) => b.n - a.n).map(({ c, n }) => <label key={c.id}><input type="checkbox" checked={f.chs.includes(c.id)} onChange={() => toggle('chs', c.id)} /> {c.name}<span className="c">{n}</span></label>)}
      <h4>Topics</h4>{data.topics.map(t => ({ t, n: count('topic', t.id) })).sort((a, b) => b.n - a.n).map(({ t, n }) => <label key={t.id}><input type="checkbox" checked={f.topics.includes(t.id)} onChange={() => toggle('topics', t.id)} /> {t.name}<span className="c">{n}</span></label>)}
    </aside>
    <div className="i-table">
      {f.q ? <div className="i-qsum"><span>Titles like <b>“{f.q}”</b>:</span><span><b>{rows.length}</b> matches</span><span><b>{new Set(rows.map(v => v.ch)).size}</b> Channels use it</span>
        <span>median <b>{fmtS(median(scored.map(v => v.score)))}</b></span><span>outlier rate <b>{scored.length ? pct(qOut.length / scored.length) : '—'}</b></span><span><b>{new Set(qOut.map(v => v.ch)).size}</b> Channels with an outlier</span></div>
        : <div className="i-qsum muted small">{sorted.length.toLocaleString()} outliers ≥{f.min}×. Search with ⌘K to score a title idea across Channels. <kbd>j</kbd>/<kbd>k</kbd> to step.</div>}
      <div className="e-grid i-grid e-head">{cols.map(([k, l]) => <div key={k} className={sort.k === k ? 'on' : ''} onClick={() => setSort(s => s.k === k ? { k, dir: -s.dir } : { k, dir: ['title', 'ch'].includes(k) ? 1 : -1 })}>{l}</div>)}</div>
      <div ref={ref} style={{ flex: 1, overflow: 'auto' }}><div style={{ height: virt.getTotalSize(), position: 'relative' }}>
        {virt.getVirtualItems().map(it => { const v = sorted[it.index];
          return <div key={v.id} className={`e-grid i-grid e-row ${focus?.kind === 'video' && focus.id === v.id ? 'cur' : ''}`} style={{ top: it.start }} onClick={() => { setCursor(it.index); setFocus({ kind: 'video', id: v.id }); }}>
            <div><Chip v={v} /></div><div title={v.title}><Highlight text={v.title} q={f.q} /><Tags v={v} /></div><div>{data.channels[v.ch].name}</div>
            <div className="muted">{fmtDate(v.t)}</div><div className="num">{fmtN(v.views)}</div><div className="num muted">{fmtN(v.base)}</div></div>; })}
      </div></div>
    </div>
  </div>;
}

// ---------- Topics view (B + G) ----------
function TopicMap({ data, pts, f, hot, setFocus }) {
  const wrap = useRef(null), cv = useRef(null);
  const [size, setSize] = useState({ w: 600, h: 500 });
  const [tf, setTf] = useState(zoomIdentity);
  const [box, setBox] = useState(null);
  const ext = useMemo(() => { const xs = data.videos.map(v => v.mx), ys = data.videos.map(v => v.my); return [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]; }, [data]);
  const px = v => [tf.applyX(24 + (v.mx - ext[0]) / (ext[1] - ext[0]) * (size.w - 48)), tf.applyY(24 + (v.my - ext[2]) / (ext[3] - ext[2]) * (size.h - 48))];
  useEffect(() => { const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height })); ro.observe(wrap.current); return () => ro.disconnect(); }, []);
  useEffect(() => { select(cv.current).call(zoom().scaleExtent([0.7, 30]).filter(e => !e.shiftKey && !e.button).on('zoom', e => setTf(e.transform))); }, []);
  useEffect(() => {
    const c = cv.current, dpr = devicePixelRatio || 1; c.width = size.w * dpr; c.height = size.h * dpr;
    const g = c.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, size.w, size.h);
    for (const v of pts) {
      const [x, y] = px(v), on = hot == null || v.topic === hot;
      g.globalAlpha = on ? (v.score >= f.min ? 0.9 : 0.3) : 0.05; g.fillStyle = TOPIC_COLORS[v.topic % TOPIC_COLORS.length];
      g.beginPath(); g.arc(x, y, (1.5 + Math.max(0, Math.log2(v.score)) * 1.5) * tf.k ** 0.25, 0, 7); g.fill();
    }
    g.globalAlpha = 1; g.font = '600 12px system-ui'; g.textAlign = 'center';
    for (const t of data.topics) { const vs = pts.filter(v => v.topic === t.id); if (!vs.length) continue;
      const [x, y] = px({ mx: median(vs.map(v => v.mx)), my: median(vs.map(v => v.my)) });
      g.lineWidth = 4; g.strokeStyle = 'rgba(255,255,255,.9)'; g.strokeText(t.name, x, y); g.fillStyle = hot === t.id ? '#000' : '#333'; g.fillText(t.name, x, y); }
  });
  const loc = e => { const b = cv.current.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
  const near = (mx, my) => { let best = null, bd = 64; for (const v of pts) { const [x, y] = px(v), d = (x - mx) ** 2 + (y - my) ** 2; if (d < bd) { bd = d; best = v; } } return best; };
  return <div className="g-canvas" ref={wrap} style={{ height: '100%' }}>
    <canvas ref={cv} onMouseDown={e => { if (e.shiftKey) { const [x, y] = loc(e); setBox({ x0: x, y0: y, x1: x, y1: y }); } }}
      onMouseMove={e => { if (box) { const [x, y] = loc(e); setBox(b => ({ ...b, x1: x, y1: y })); } }}
      onMouseUp={() => { if (!box) return; const xa = Math.min(box.x0, box.x1), xb = Math.max(box.x0, box.x1), ya = Math.min(box.y0, box.y1), yb = Math.max(box.y0, box.y1);
        const items = pts.filter(v => { const [x, y] = px(v); return x >= xa && x <= xb && y >= ya && y <= yb; }); if (items.length) setFocus({ kind: 'selection', items }); setBox(null); }}
      onClick={e => { if (e.shiftKey) return; const v = near(...loc(e)); if (v) setFocus({ kind: 'video', id: v.id }); }} />
    <div className="g-help">Scroll zoom · drag pan · <b>shift-drag</b> select a region · click a dot</div>
    {box && <div style={{ position: 'absolute', left: Math.min(box.x0, box.x1), top: Math.min(box.y0, box.y1), width: Math.abs(box.x1 - box.x0), height: Math.abs(box.y1 - box.y0), border: '1px dashed #111', background: 'rgba(51,85,221,.08)', pointerEvents: 'none' }} />}
  </div>;
}

function TopicsView({ data, rows, f, focus, setFocus }) {
  const [hover, setHover] = useState(null);
  const pts = useMemo(() => rows.filter(v => v.score != null).sort((a, b) => a.score - b.score), [rows]);
  const list = useMemo(() => data.topics.map(t => {
    const vs = pts.filter(v => v.topic === t.id), outs = vs.filter(v => v.score >= f.min);
    const hist = [0, 0, 0, 0, 0, 0]; vs.forEach(v => hist[['under', 't0', 't1', 't2', 't3', 't4'].indexOf(tier(v.score))]++);
    return { t, n: vs.length, outs: outs.length, chans: new Set(outs.map(v => v.ch)).size, on: new Set(vs.map(v => v.ch)).size, med: median(vs.map(v => v.score)), hist };
  }).filter(r => r.n).sort((a, b) => b.chans - a.chans || b.med - a.med), [data, pts, f.min]);
  const sel = focus?.kind === 'topic' ? focus.id : null;
  return <Group orientation="horizontal">
    <Panel id="tlist" defaultSize="42" minSize="25"><div className="f-body" style={{ height: '100%', background: 'var(--panel)' }}>
      <p className="small muted" style={{ padding: '8px 12px', margin: 0 }}>Ranked by how many <b>different Channels</b> have an outlier in the Topic. Hover to find it on the map.</p>
      {list.map((r, i) => <div key={r.t.id} className={`i-topic ${sel === r.t.id ? 'on' : ''}`} onMouseEnter={() => setHover(r.t.id)} onMouseLeave={() => setHover(null)} onClick={() => setFocus({ kind: 'topic', id: r.t.id })}>
        <span className="b-rank">{i + 1}</span>
        <div><b><span className="dot" style={{ background: TOPIC_COLORS[r.t.id % TOPIC_COLORS.length] }} />{r.t.name}</b>
          <div className="small muted"><b style={{ color: 'var(--ink)' }}>{r.chans}</b> of {r.on} Channels with outliers · {r.outs} outliers / {r.n} · median {fmtS(r.med)}</div>
          <div className="b-heat" style={{ margin: '4px 0 0' }}>{r.hist.map((h, j) => <i key={j} style={{ flex: h + 0.01, background: ['#d4a017', '#d6d6db', '#3b82f6', '#7c3aed', '#c026d3', '#dc2626'][j] }} />)}</div></div>
      </div>)}
    </div></Panel>
    <Separator />
    <Panel id="tmap" defaultSize="58" minSize="25"><TopicMap data={data} pts={pts} f={f} hot={hover ?? sel} setFocus={setFocus} /></Panel>
  </Group>;
}

// ---------- Channels view (C) ----------
function ChannelsView({ data, rows, f, focus, setFocus }) {
  const [years, setYears] = useState(3);
  const from = TODAY - years * 365 * DAY, LO = Math.log(0.2), HI = Math.log(40);
  const X = t => ((t - from) / (TODAY - from)) * 990 + 5, Y = s => 52 - (Math.min(HI, Math.max(LO, Math.log(s))) - LO) / (HI - LO) * 48;
  const chans = useMemo(() => data.channels.map(c => {
    const vs = rows.filter(v => v.ch === c.id && v.score != null && v.t >= from);
    return { c, vs: vs.sort((a, b) => a.score - b.score), outs: vs.filter(v => v.score >= f.min).length };
  }).filter(r => r.vs.length).sort((a, b) => b.outs / b.vs.length - a.outs / a.vs.length), [data, rows, f.min, years]);
  return <div style={{ height: '100%', overflow: 'auto', padding: '8px 14px 80px' }}>
    <div className="c-bar"><select value={years} onChange={e => setYears(+e.target.value)}><option value={1}>Last 12 months</option><option value={3}>Last 3 years</option><option value={6}>Last 6 years</option></select>
      <span className="small muted">Height = score vs the Channel’s own baseline. Dashed = {f.min}×. Click a name for the Channel, a dot for the Video.</span></div>
    {chans.map(({ c, vs, outs }) => <div className="c-row" key={c.id} style={{ outline: focus?.kind === 'channel' && focus.id === c.id ? '2px solid var(--accent)' : 'none' }}>
      <div className="meta" style={{ cursor: 'pointer' }} onClick={() => setFocus({ kind: 'channel', id: c.id })}><b>{c.name}</b><br /><span className="muted">{fmtN(c.subs)} subs</span><br />{outs} outliers <span className="muted">· {pct(outs / vs.length)}</span></div>
      <svg viewBox="0 0 1000 56" preserveAspectRatio="none" onClick={e => { const id = e.target.dataset?.id; if (id) setFocus({ kind: 'video', id: +id }); }}>
        <line x1="0" x2="1000" y1={Y(f.min)} y2={Y(f.min)} stroke="#7c3aed" strokeDasharray="3 4" vectorEffect="non-scaling-stroke" opacity=".5" />
        <line x1="0" x2="1000" y1={Y(1)} y2={Y(1)} stroke="#ccc" vectorEffect="non-scaling-stroke" />
        {vs.map(v => <circle key={v.id} data-id={v.id} className="dot" cx={X(v.t)} cy={Y(v.score)} r={v.score >= f.min ? 4 : 2.2} fill={TIER_COLOR[tier(v.score)]} opacity={v.score >= f.min ? 0.95 : 0.5}><title>{v.title} — {fmtS(v.score)}</title></circle>)}
      </svg></div>)}
  </div>;
}

// ---------- shell ----------
export default function VariantI({ data }) {
  const [view, setView] = useState('topics');
  const [f, setF] = useState({ fmt: 'long', min: 3, q: '', chs: [], topics: [] });
  const [focus, setFocus] = useState(null);
  const [palette, setPalette] = useState(false);
  useEffect(() => {
    const k = e => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setPalette(p => !p); }
      if (e.key === '/' && !e.target.closest('input, select, textarea')) { e.preventDefault(); setPalette(true); } };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, []);
  // base = format only (for stats/denominators); rows = all global filters applied, shared by every view
  const base = useMemo(() => data.videos.filter(v => f.fmt === 'all' || v.fmt === f.fmt), [data, f.fmt]);
  const rows = useMemo(() => base.filter(v => (!f.chs.length || f.chs.includes(v.ch)) && (!f.topics.length || f.topics.includes(v.topic)) && matchQ(v, f.q, data.topics)), [base, f, data]);
  const drill = fo => { setF(s => fo.kind === 'topic' ? { ...s, topics: [fo.id] } : { ...s, chs: [fo.id] }); setView('videos'); };
  const props = { data, rows, f, setF, focus, setFocus };
  return <div className="page">
    <div className="apphead"><b>YT-StrategizeR</b>
      <nav className="i-tabs">{VIEWS.map(([k, l]) => <button key={k} className={view === k ? 'on' : ''} onClick={() => setView(k)}>{l}</button>)}</nav>
      <span className="sync">Last Sync {data.syncedAt} · fake data</span></div>
    <FilterBar data={data} f={f} setF={setF} openPalette={() => setPalette(true)} />
    <div className="i-body">
      <div className="i-main">{view === 'videos' ? <VideosView {...props} /> : view === 'topics' ? <TopicsView {...props} /> : <ChannelsView {...props} />}</div>
      <aside className="i-pane">{focus?.back && <button className="btn small" onClick={() => setFocus(focus.back)}>← back</button>}
        <DetailPane data={data} focus={focus} base={base.filter(v => v.score != null)} f={f} setFocus={setFocus} drill={drill} /></aside>
    </div>
    <Palette data={data} open={palette} setOpen={setPalette} setF={setF} setView={setView} setFocus={setFocus} />
  </div>;
}
