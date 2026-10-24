// PROTOTYPE variant F: a resizable workspace of linked panels (crossfilter). Clicking a Channel,
// Topic or score bucket filters every OTHER panel; each panel ignores its own selection so you
// can see the alternatives. Layout is resizable and remembered.
import { useMemo, useState } from 'react';
import { Group, Panel, Separator, useDefaultLayout } from 'react-resizable-panels';
import { AppHead, Chip, Detail, FMT_LABEL, Tags, TIER_COLOR, fmtAge, fmtN, fmtS, median } from './shared.jsx';

const BUCKETS = [
  { l: '≤0.5×', lo: 0, hi: 0.5, tier: 'under' }, { l: '0.5–1×', lo: 0.5, hi: 1, tier: 't0' }, { l: '1–2×', lo: 1, hi: 2, tier: 't0' },
  { l: '2–3×', lo: 2, hi: 3, tier: 't1' }, { l: '3–5×', lo: 3, hi: 5, tier: 't2' }, { l: '5–10×', lo: 5, hi: 10, tier: 't3' }, { l: '10×+', lo: 10, hi: Infinity, tier: 't4' },
];
const toggle = (set, x) => { const s = new Set(set); s.has(x) ? s.delete(x) : s.add(x); return s; };

function PanelBox({ title, onClear, children }) {
  return <div className="f-panel"><h3>{title}{onClear && <button onClick={onClear}>clear</button>}</h3><div className="f-body">{children}</div></div>;
}

export default function VariantF({ data }) {
  const [fmt, setFmt] = useState('long');
  const [chs, setChs] = useState(new Set());
  const [tps, setTps] = useState(new Set());
  const [bks, setBks] = useState(new Set([4, 5, 6]));
  const [sel, setSel] = useState(null);
  const outer = useDefaultLayout({ id: 'proto-f-outer', storage: localStorage });
  const mid = useDefaultLayout({ id: 'proto-f-mid', storage: localStorage });

  const base = useMemo(() => data.videos.filter(v => v.score != null && (fmt === 'all' || v.fmt === fmt)), [data, fmt]);
  const bucketOf = s => BUCKETS.findIndex(b => s >= b.lo && s < b.hi);
  const pass = (v, skip) => (skip === 'ch' || !chs.size || chs.has(v.ch)) && (skip === 'tp' || !tps.size || tps.has(v.topic)) && (skip === 'bk' || !bks.size || bks.has(bucketOf(v.score)));

  const chRows = useMemo(() => {
    const vs = base.filter(v => pass(v, 'ch'));
    return data.channels.map(c => { const m = vs.filter(v => v.ch === c.id); return { c, n: m.length, out: m.filter(v => v.score >= 3).length }; })
      .filter(r => r.n).sort((a, b) => b.out / b.n - a.out / a.n);
  }, [base, tps, bks]);
  const tpRows = useMemo(() => {
    const vs = base.filter(v => pass(v, 'tp'));
    return data.topics.map(t => { const m = vs.filter(v => v.topic === t.id); return { t, n: m.length, out: m.filter(v => v.score >= 3).length, chans: new Set(m.filter(v => v.score >= 3).map(v => v.ch)).size }; })
      .filter(r => r.n).sort((a, b) => b.chans - a.chans || b.out - a.out);
  }, [base, chs, bks]);
  const hist = useMemo(() => { const h = BUCKETS.map(() => 0); base.filter(v => pass(v, 'bk')).forEach(v => h[bucketOf(v.score)]++); return h; }, [base, chs, tps]);
  const vids = useMemo(() => base.filter(v => pass(v)).sort((a, b) => b.score - a.score), [base, chs, tps, bks]);
  const hmax = Math.max(...hist, 1);
  const selV = sel != null ? data.videos[sel] : vids[0];

  return <div className="page">
    <AppHead data={data}>
      <select value={fmt} onChange={e => setFmt(e.target.value)}>{['long', 'mid', 'short', 'all'].map(f => <option key={f} value={f}>{FMT_LABEL[f]}</option>)}</select>
      <span className="small">Click anything to cross-filter · drag the dividers to resize</span>
    </AppHead>
    <div style={{ flex: 1, minHeight: 0 }}>
      <Group orientation="horizontal" defaultLayout={outer.defaultLayout} onLayoutChanged={outer.onLayoutChanged}>
        <Panel id="lists" defaultSize="24" minSize="15">
          <Group orientation="vertical">
            <Panel id="chs" defaultSize="50" minSize="15">
              <PanelBox title={`Channels · outlier rate`} onClear={chs.size ? () => setChs(new Set()) : null}>
                {chRows.map(({ c, n, out }) => <div key={c.id} className={`f-item ${chs.has(c.id) ? 'on' : ''}`} onClick={() => setChs(s => toggle(s, c.id))} title={`${out} of ${n} videos ≥ 3×`}>
                  <span>{c.name}</span><div className="f-bar"><i style={{ width: `${Math.min(100, out / n * 300)}%` }} /></div><span className="small muted num">{out}</span></div>)}
              </PanelBox>
            </Panel>
            <Separator />
            <Panel id="tps" defaultSize="50" minSize="15">
              <PanelBox title="Topics · channels w/ outliers" onClear={tps.size ? () => setTps(new Set()) : null}>
                {tpRows.map(({ t, n, out, chans }) => <div key={t.id} className={`f-item ${tps.has(t.id) ? 'on' : ''}`} onClick={() => setTps(s => toggle(s, t.id))} title={`${out} outliers on ${chans} channels, ${n} videos`}>
                  <span>{t.name}</span><div className="f-bar"><i style={{ width: `${chans / data.channels.length * 100}%`, background: '#c026d3' }} /></div><span className="small muted num">{chans}</span></div>)}
              </PanelBox>
            </Panel>
          </Group>
        </Panel>
        <Separator />
        <Panel id="mid" defaultSize="44" minSize="25">
          <Group orientation="vertical" defaultLayout={mid.defaultLayout} onLayoutChanged={mid.onLayoutChanged}>
            <Panel id="hist" defaultSize="28" minSize="15">
              <PanelBox title="Score distribution · click bars" onClear={bks.size ? () => setBks(new Set()) : null}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 'calc(100% - 22px)', padding: '8px 12px 0' }}>
                  {hist.map((h, i) => <div key={i} onClick={() => setBks(s => toggle(s, i))} style={{ flex: 1, cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }} title={`${h} videos`}>
                    <span className="small muted" style={{ textAlign: 'center' }}>{h}</span>
                    <div style={{ height: `${h / hmax * 75}%`, minHeight: 2, background: TIER_COLOR[BUCKETS[i].tier], opacity: !bks.size || bks.has(i) ? 1 : 0.25, borderRadius: '3px 3px 0 0' }} />
                  </div>)}
                </div>
                <div style={{ display: 'flex', gap: 6, padding: '0 12px' }}>{BUCKETS.map(b => <span key={b.l} className="small muted" style={{ flex: 1, textAlign: 'center' }}>{b.l}</span>)}</div>
              </PanelBox>
            </Panel>
            <Separator />
            <Panel id="vids" defaultSize="72" minSize="20">
              <PanelBox title={`Videos · ${vids.length} · median ${fmtS(median(vids.map(v => v.score)))}`}>
                {vids.slice(0, 400).map(v => <div key={v.id} className={`f-vid ${selV?.id === v.id ? 'on' : ''}`} onClick={() => setSel(v.id)}>
                  <Chip v={v} /><div>{v.title}<Tags v={v} /><div className="small muted">{data.channels[v.ch].name} · {data.topics[v.topic].name}</div></div>
                  <span className="small muted num">{fmtN(v.views)}<br />{fmtAge(v.age)}</span></div>)}
              </PanelBox>
            </Panel>
          </Group>
        </Panel>
        <Separator />
        <Panel id="detail" defaultSize="32" minSize="20">
          <PanelBox title="Detail"><div style={{ padding: 12 }}>{selV ? <Detail v={selV} data={data} /> : <p className="muted">Nothing matches.</p>}</div></PanelBox>
        </Panel>
      </Group>
    </div>
  </div>;
}
