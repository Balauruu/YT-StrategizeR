// PROTOTYPE variant H: Topic × Channel matrix. Each cell is how a Topic performs on one Channel
// (median score, outlier count, or volume). Hatched = the Channel never covers that Topic,
// which shows gaps as well as winners. Click a cell, row or column to list its Videos.
import { useMemo, useState } from 'react';
import { AppHead, Chip, Drawer, FMT_LABEL, Tags, fmtAge, fmtN, fmtS, median } from './shared.jsx';

const METRICS = { med: 'Median score', out: 'Outliers (≥3×)', n: 'Videos' };
function color(metric, val, max) {
  if (val == null) return '#fff';
  if (metric === 'med') { // diverging on log scale: amber under 1×, purple→red over
    const l = Math.max(-1, Math.min(1, Math.log2(val) / 2));
    return l < 0 ? `rgba(212,160,23,${-l * 0.8 + 0.1})` : `rgba(${124 + l * 96},${58 - l * 20},${237 - l * 199},${l * 0.85 + 0.1})`;
  }
  return `rgba(124,58,237,${val ? 0.12 + 0.85 * val / max : 0.04})`;
}

export default function VariantH({ data }) {
  const [metric, setMetric] = useState('med');
  const [fmt, setFmt] = useState('long');
  const [chSort, setChSort] = useState('rate');
  const [sel, setSel] = useState(null); // {topic?, ch?}
  const [open, setOpen] = useState(null);

  const vids = useMemo(() => data.videos.filter(v => v.score != null && (fmt === 'all' || v.fmt === fmt)), [data, fmt]);
  const cells = useMemo(() => {
    const m = {};
    vids.forEach(v => { (m[v.topic + ':' + v.ch] ||= []).push(v); });
    const out = {};
    for (const [k, vs] of Object.entries(m)) out[k] = { med: median(vs.map(v => v.score)), out: vs.filter(v => v.score >= 3).length, n: vs.length };
    return out;
  }, [vids]);
  const chans = useMemo(() => [...data.channels].sort(chSort === 'subs' ? (a, b) => b.subs - a.subs : chSort === 'name' ? (a, b) => a.name.localeCompare(b.name) : (a, b) => b.rate - a.rate), [data, chSort]);
  const rows = useMemo(() => data.topics.map(t => {
    const cs = chans.map(c => cells[t.id + ':' + c.id]);
    const withOut = cs.filter(c => c?.out).length, covered = cs.filter(Boolean).length;
    const all = vids.filter(v => v.topic === t.id);
    return { t, cs, withOut, covered, med: median(all.map(v => v.score)) };
  }).sort((a, b) => b.withOut - a.withOut || b.med - a.med), [data, chans, cells, vids]);
  const max = Math.max(1, ...Object.values(cells).map(c => c[metric] ?? 0));

  const listed = sel ? vids.filter(v => (sel.topic == null || v.topic === sel.topic) && (sel.ch == null || v.ch === sel.ch)).sort((a, b) => b.score - a.score) : [];
  const selLabel = sel && [sel.topic != null && data.topics[sel.topic].name, sel.ch != null && data.channels[sel.ch].name].filter(Boolean).join(' on ');

  return <div className="page">
    <AppHead data={data}>
      {Object.entries(METRICS).map(([k, l]) => <button key={k} className={`btn ${metric === k ? 'on' : ''}`} onClick={() => setMetric(k)}>{l}</button>)}
      <select value={fmt} onChange={e => setFmt(e.target.value)}>{['long', 'mid', 'short', 'all'].map(f => <option key={f} value={f}>{FMT_LABEL[f]}</option>)}</select>
      <select value={chSort} onChange={e => setChSort(e.target.value)}><option value="rate">Channels by outlier rate</option><option value="subs">Channels by subscribers</option><option value="name">Channels by name</option></select>
    </AppHead>
    <div className="h-wrap">
      <p className="small muted" style={{ marginTop: 0 }}>Rows = Topics, ranked by how many Channels have an outlier in them. Columns = Channels. <span style={{ background: 'repeating-linear-gradient(45deg,#e5e5e3,#e5e5e3 3px,#fafaf9 3px,#fafaf9 6px)', padding: '0 8px' }}>hatched</span> = Channel never covers the Topic (a gap, or a niche boundary).</p>
      <table className="h-table">
        <thead><tr><th /><th className="small" style={{ verticalAlign: 'bottom', textAlign: 'left' }}>chans w/<br />outliers</th>
          {chans.map(c => <th key={c.id} className={sel?.ch === c.id && sel.topic == null ? 'sel' : ''} onClick={() => setSel({ ch: c.id })}><div title={`${fmtN(c.subs)} subs`}>{c.name}</div></th>)}</tr></thead>
        <tbody>{rows.map(({ t, cs, withOut, covered }) => <tr key={t.id}>
          <th className={sel?.topic === t.id && sel.ch == null ? 'sel' : ''} onClick={() => setSel({ topic: t.id })}>{t.name}</th>
          <td className="small" style={{ textAlign: 'center' }}><b>{withOut}</b><span className="muted">/{covered}</span></td>
          {cs.map((c, i) => { const ch = chans[i]; const val = c?.[metric];
            return c ? <td key={ch.id} className={`c ${sel?.topic === t.id && sel?.ch === ch.id ? 'sel' : ''}`} style={{ background: color(metric, val, max), color: metric === 'med' && val > 2.5 || metric !== 'med' && val / max > 0.55 ? '#fff' : '#333' }}
              title={`${t.name} on ${ch.name}: ${c.n} videos, median ${fmtS(c.med)}, ${c.out} outliers`} onClick={() => setSel({ topic: t.id, ch: ch.id })}>
              {metric === 'med' ? fmtS(val).replace('×', '') : val || ''}</td> : <td key={ch.id} className="c empty" title={`${ch.name} has no ${t.name} videos`} />; })}
        </tr>)}</tbody>
      </table>
      {sel && <div className="h-list"><div style={{ padding: '10px 12px', borderBottom: '1px solid var(--line)' }}><b>{selLabel}</b> <span className="muted small">· {listed.length} videos · median {fmtS(median(listed.map(v => v.score)))} · {listed.filter(v => v.score >= 3).length} outliers</span>
        <button className="btn" style={{ float: 'right' }} onClick={() => setSel(null)}>close</button></div>
        {listed.slice(0, 100).map(v => <div key={v.id} className="f-vid" onClick={() => setOpen(v)}><Chip v={v} />
          <div>{v.title}<Tags v={v} /><div className="small muted">{data.channels[v.ch].name} · {data.topics[v.topic].name}</div></div>
          <span className="small muted num">{fmtN(v.views)}<br />{fmtAge(v.age)}</span></div>)}</div>}
    </div>
    <Drawer v={open} data={data} onClose={() => setOpen(null)} />
  </div>;
}
