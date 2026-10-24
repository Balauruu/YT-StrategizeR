// PROTOTYPE shared bits: formatting, score chip, Video detail drawer, variant switcher.
import { Fragment, useEffect } from 'react';

export const DAY = 864e5;
export const TODAY = Date.UTC(2026, 9, 24);
export const FMT_LABEL = { short: 'Short', mid: '61–180s', long: 'Long-form', all: 'All formats' };
export const fmtN = n => n >= 1e6 ? (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(n >= 1e4 ? 0 : 1) + 'K' : String(Math.round(n));
export const fmtS = s => s == null ? '—' : s < 10 ? s.toFixed(1) + '×' : Math.round(s) + '×';
export const fmtDate = t => new Date(t).toISOString().slice(0, 10);
export const fmtAge = d => d < 30 ? d + 'd' : d < 365 ? Math.round(d / 30) + 'mo' : (d / 365).toFixed(1) + 'y';
export const median = a => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
export const tier = s => s == null ? 'na' : s >= 10 ? 't4' : s >= 5 ? 't3' : s >= 3 ? 't2' : s >= 2 ? 't1' : s <= 0.5 ? 'under' : 't0';
export const TIER_NAME = { t4: 'exceptional', t3: 'breakout', t2: 'strong', t1: 'notable', t0: 'normal', under: 'under', na: 'no score' };
export const TIER_COLOR = { t4: '#dc2626', t3: '#c026d3', t2: '#7c3aed', t1: '#3b82f6', t0: '#b5b5ba', under: '#d4a017', na: '#ddd' };
export const TOPIC_COLORS = ['#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c', '#0891b2', '#ca8a04', '#db2777', '#4f46e5', '#65a30d', '#0d9488', '#b91c1c', '#7c3aed'];
export const matchQ = (v, q, topics) => !q || q.toLowerCase().split(/\s+/).every(w => v.title.toLowerCase().includes(w) || topics[v.topic].name.toLowerCase().includes(w));

export function Chip({ v }) {
  const tip = v.score == null ? `Fewer than 5 comparable videos (n=${v.n})`
    : `${TIER_NAME[tier(v.score)]}: vs median of ${v.n} videos (baseline ${fmtN(v.base)} views)` + (v.n < 10 ? ' · low confidence' : '') + (v.fluke ? ' · check baseline / possible fluke' : '');
  return <span className={`chip ${tier(v.score)} ${v.n < 10 ? 'dim' : ''}`} title={tip}>{fmtS(v.score)}{v.fluke ? ' ⚠' : ''}</span>;
}
export function Tags({ v }) {
  return <>
    {v.age < 30 && <span className="tag imm" title="Under 30 days old: still accumulating views">immature</span>}
    {v.top10 && v.score < 3 && <span className="tag top" title="In the channel’s top 10%">top 10%</span>}
  </>;
}
export function Highlight({ text, q }) {
  const words = (q || '').toLowerCase().split(/\s+/).filter(w => w.length > 1);
  if (!words.length) return text;
  const re = new RegExp('(' + words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'ig');
  return text.split(re).map((p, i) => i % 2 ? <mark key={i}>{p}</mark> : p);
}

export function AppHead({ data, children }) {
  return <div className="apphead"><b>YT-StrategizeR</b>
    <span className="small">{data.channels.length} channels · {data.videos.length.toLocaleString()} videos</span>
    {children}
    <span className="sync">Last Sync {data.syncedAt} · fake data from FastAPI</span></div>;
}

function BaselineChart({ v, data }) {
  const all = [...v.nbrs.map(id => data.videos[id]), v].sort((a, b) => a.t - b.t);
  const max = Math.max(...all.map(x => x.views), v.base * 3.2);
  const W = 400, H = 120, bw = W / all.length, y = val => H - 14 - (val / max) * (H - 24);
  return <svg viewBox={`0 0 ${W} ${H}`} width="100%">
    {all.map((x, i) => <rect key={x.id} x={i * bw + 2} y={y(x.views)} width={bw - 4} height={H - 14 - y(x.views)} fill={x === v ? TIER_COLOR[tier(v.score)] : '#d6d6db'}><title>{x.title} — {fmtN(x.views)}</title></rect>)}
    <line x1="0" x2={W} y1={y(v.base)} y2={y(v.base)} stroke="#333" strokeDasharray="4 3" />
    <text x={W - 2} y={y(v.base) - 3} fontSize="10" textAnchor="end">median {fmtN(v.base)}</text>
    <line x1="0" x2={W} y1={y(v.base * 3)} y2={y(v.base * 3)} stroke="#7c3aed" strokeDasharray="2 3" />
    <text x={W - 2} y={y(v.base * 3) - 3} fontSize="10" textAnchor="end" fill="#7c3aed">3× line</text>
    <text x="0" y={H - 2} fontSize="10" fill="#888">{fmtDate(all[0].t)}</text>
    <text x={W} y={H - 2} fontSize="10" fill="#888" textAnchor="end">{fmtDate(all[all.length - 1].t)}</text>
  </svg>;
}

export function Detail({ v, data }) {
  const ch = data.channels[v.ch];
  const sibs = data.videos.filter(x => x.topic === v.topic && x.fmt === v.fmt && x.ch !== v.ch && x.outlier).sort((a, b) => b.score - a.score).slice(0, 6);
  const kv = [['Channel', `${ch.name} · ${fmtN(ch.subs)} subs`], ['Topic', data.topics[v.topic].name], ['Published', `${fmtDate(v.t)} (${fmtAge(v.age)} ago)`],
    ['Format', `${FMT_LABEL[v.fmt]} · ${Math.floor(v.dur / 60)}:${String(v.dur % 60).padStart(2, '0')}`],
    ['Views', v.views.toLocaleString() + (v.age < 30 ? ` · ${fmtN(v.views / v.age)}/day pace` : '')],
    ['Baseline', `median of ${v.n} nearest-in-time ${FMT_LABEL[v.fmt]} videos = ${fmtN(v.base)}`]];
  return <div className="det"><h2>{v.title}</h2>
    <div><Chip v={v} /> <Tags v={v} /> <span className="muted small">{TIER_NAME[tier(v.score)]}</span></div>
    <div className="kv">{kv.map(([k, val]) => <Fragment key={k}><span>{k}</span><span>{val}</span></Fragment>)}</div>
    <h4>Baseline neighbours</h4>{v.n ? <BaselineChart v={v} data={data} /> : <p className="muted">No comparable videos.</p>}
    <h4>Same Topic, outliers on other Channels</h4>
    {sibs.length ? sibs.map(x => <div className="sib" key={x.id}><Chip v={x} /><span>{x.title} <span className="muted small">— {data.channels[x.ch].name}</span></span></div>)
      : <p className="muted small">None — this Topic hasn’t broken out elsewhere.</p>}
  </div>;
}

export function Drawer({ v, data, onClose }) {
  useEffect(() => {
    const k = e => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  if (!v) return null;
  return <div className="drawer"><button className="x" onClick={onClose} title="Close (Esc)">×</button><Detail v={v} data={data} /></div>;
}

export function Switcher({ variants, current, onChange }) {
  const i = variants.findIndex(v => v.key === current.key);
  const go = d => onChange(variants[(i + d + variants.length) % variants.length].key);
  useEffect(() => {
    const k = e => {
      if (e.target.closest('input, textarea, select, [contenteditable], [cmdk-root]')) return;
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  });
  if (import.meta.env.PROD) return null;
  return <div id="switcher"><button onClick={() => go(-1)} title="Previous (←)">‹</button>
    <span>{current.key} ({current.name})</span><button onClick={() => go(1)} title="Next (→)">›</button></div>;
}
