// PROTOTYPE variant G: the 2D Topic map as the main screen. Every Video is a point on a canvas
// (fake embedding positions from the API), sized by score, coloured by Topic or tier.
// Scroll to zoom, drag to pan, shift-drag to box-select; the side panel summarises the selection.
import { useEffect, useMemo, useRef, useState } from 'react';
import { select } from 'd3-selection';
import { zoom, zoomIdentity } from 'd3-zoom';
import { AppHead, Chip, Drawer, FMT_LABEL, TIER_COLOR, TOPIC_COLORS, fmtAge, fmtN, fmtS, matchQ, median, tier } from './shared.jsx';

export default function VariantG({ data }) {
  const wrapRef = useRef(null), canvasRef = useRef(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [tf, setTf] = useState(zoomIdentity);
  const [colorBy, setColorBy] = useState('topic');
  const [fmt, setFmt] = useState('long');
  const [onlyOut, setOnlyOut] = useState(false);
  const [q, setQ] = useState('');
  const [hover, setHover] = useState(null);
  const [box, setBox] = useState(null);        // live drag rectangle in screen px
  const [picked, setPicked] = useState(null);  // array of Videos in the last box
  const [open, setOpen] = useState(null);

  const pts = useMemo(() => data.videos.filter(v => v.score != null && (fmt === 'all' || v.fmt === fmt)).sort((a, b) => a.score - b.score), [data, fmt]);
  const ext = useMemo(() => {
    const xs = data.videos.map(v => v.mx), ys = data.videos.map(v => v.my);
    return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
  }, [data]);
  const pad = 30;
  const sx = x => pad + (x - ext.x0) / (ext.x1 - ext.x0) * (size.w - 2 * pad);
  const sy = y => pad + (y - ext.y0) / (ext.y1 - ext.y0) * (size.h - 2 * pad);
  const px = v => [tf.applyX(sx(v.mx)), tf.applyY(sy(v.my))];
  const r = v => 1.6 + Math.max(0, Math.log2(v.score)) * 1.6;
  const lit = v => (!onlyOut || v.score >= 3) && matchQ(v, q, data.topics);

  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(wrapRef.current); return () => ro.disconnect();
  }, []);
  useEffect(() => {
    const z = zoom().scaleExtent([0.7, 30]).filter(e => !e.shiftKey && !e.button).on('zoom', e => setTf(e.transform));
    select(canvasRef.current).call(z); return () => select(canvasRef.current).on('.zoom', null);
  }, []);

  useEffect(() => {
    const c = canvasRef.current, dpr = devicePixelRatio || 1;
    c.width = size.w * dpr; c.height = size.h * dpr;
    const g = c.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, size.w, size.h);
    const sel = new Set(picked?.map(v => v.id));
    for (const v of pts) {
      const [x, y] = px(v); if (x < -10 || y < -10 || x > size.w + 10 || y > size.h + 10) continue;
      g.globalAlpha = lit(v) ? (v.score >= 3 ? 0.9 : 0.35) : 0.04;
      g.fillStyle = colorBy === 'topic' ? TOPIC_COLORS[v.topic % TOPIC_COLORS.length] : TIER_COLOR[tier(v.score)];
      g.beginPath(); g.arc(x, y, r(v) * Math.sqrt(tf.k) ** 0.5, 0, 7); g.fill();
      if (sel.has(v.id)) { g.globalAlpha = 1; g.strokeStyle = '#111'; g.lineWidth = 1; g.stroke(); }
    }
    g.globalAlpha = 1; g.font = '600 13px system-ui'; g.textAlign = 'center';
    for (const t of data.topics) {
      const vs = pts.filter(v => v.topic === t.id); if (!vs.length) continue;
      const x = tf.applyX(sx(median(vs.map(v => v.mx)))), y = tf.applyY(sy(median(vs.map(v => v.my))));
      const label = `${t.name} · ${vs.filter(v => v.score >= 3).length} outliers`;
      g.lineWidth = 4; g.strokeStyle = 'rgba(255,255,255,.9)'; g.strokeText(label, x, y); g.fillStyle = '#111'; g.fillText(label, x, y);
    }
  });

  const nearest = (mx, my) => {
    let best = null, bd = 64;
    for (const v of pts) { if (!lit(v)) continue; const [x, y] = px(v), d = (x - mx) ** 2 + (y - my) ** 2; if (d < bd) { bd = d; best = v; } }
    return best;
  };
  const local = e => { const b = canvasRef.current.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
  const onDown = e => { if (e.shiftKey) { const [x, y] = local(e); setBox({ x0: x, y0: y, x1: x, y1: y }); } };
  const onMove = e => {
    const [x, y] = local(e);
    if (box) setBox(b => ({ ...b, x1: x, y1: y })); else { const v = nearest(x, y); setHover(v ? { v, x, y } : null); }
  };
  const onUp = () => {
    if (!box) return;
    const [xa, xb] = [Math.min(box.x0, box.x1), Math.max(box.x0, box.x1)], [ya, yb] = [Math.min(box.y0, box.y1), Math.max(box.y0, box.y1)];
    const inBox = pts.filter(v => { const [x, y] = px(v); return lit(v) && x >= xa && x <= xb && y >= ya && y <= yb; });
    setPicked(inBox.length ? inBox.sort((a, b) => b.score - a.score) : null); setBox(null);
  };
  const onClick = e => { if (e.shiftKey) return; const v = nearest(...local(e)); if (v) setOpen(v); };

  const side = picked || pts.filter(lit).slice(-40).reverse();
  const sideOut = side.filter(v => v.score >= 3);
  return <div className="page">
    <AppHead data={data}>
      <input type="search" placeholder="Highlight titles…" value={q} onChange={e => setQ(e.target.value)} style={{ padding: '3px 8px', borderRadius: 6, border: 0 }} />
      <select value={fmt} onChange={e => setFmt(e.target.value)}>{['long', 'mid', 'short', 'all'].map(f => <option key={f} value={f}>{FMT_LABEL[f]}</option>)}</select>
      <button className={`btn ${colorBy === 'topic' ? 'on' : ''}`} onClick={() => setColorBy('topic')}>Colour: Topic</button>
      <button className={`btn ${colorBy === 'tier' ? 'on' : ''}`} onClick={() => setColorBy('tier')}>Colour: score tier</button>
      <label className="small"><input type="checkbox" checked={onlyOut} onChange={e => setOnlyOut(e.target.checked)} /> Outliers only</label>
    </AppHead>
    <div className="g-wrap">
      <div className="g-canvas" ref={wrapRef}>
        <canvas ref={canvasRef} onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={() => setHover(null)} onClick={onClick} />
        <div className="g-help">Scroll = zoom · drag = pan · <b>shift-drag</b> = select region · click = open<br />Bigger dot = higher score. Nearby dots = similar titles.</div>
        {box && <div style={{ position: 'absolute', left: Math.min(box.x0, box.x1), top: Math.min(box.y0, box.y1), width: Math.abs(box.x1 - box.x0), height: Math.abs(box.y1 - box.y0), border: '1px dashed #111', background: 'rgba(51,85,221,.08)', pointerEvents: 'none' }} />}
        {hover && !box && <div className="g-tip" style={{ left: hover.x + 12, top: hover.y + 12 }}><b>{fmtS(hover.v.score)}</b> {hover.v.title}<br /><span style={{ opacity: .7 }}>{data.channels[hover.v.ch].name} · {data.topics[hover.v.topic].name} · {fmtN(hover.v.views)}</span></div>}
      </div>
      <aside className="g-side">
        {picked ? <><h3 style={{ margin: '0 0 4px' }}>Selected region <button className="btn" style={{ float: 'right' }} onClick={() => setPicked(null)}>clear</button></h3>
          <p className="small muted" style={{ marginTop: 0 }}>{picked.length} videos · {new Set(picked.map(v => v.ch)).size} channels · median {fmtS(median(picked.map(v => v.score)))} · <b>{sideOut.length}</b> outliers on <b>{new Set(sideOut.map(v => v.ch)).size}</b> channels</p></>
          : <><h3 style={{ margin: '0 0 4px' }}>Top outliers in view</h3><p className="small muted" style={{ marginTop: 0 }}>Shift-drag on the map to study a region of similar titles.</p></>}
        {side.slice(0, 80).map(v => <div key={v.id} className="f-vid" onClick={() => setOpen(v)} style={{ padding: '6px 0' }}>
          <Chip v={v} /><div>{v.title}<div className="small muted">{data.channels[v.ch].name}</div></div><span className="small muted">{fmtAge(v.age)}</span></div>)}
      </aside>
    </div>
    <Drawer v={open} data={data} onClose={() => setOpen(null)} />
  </div>;
}
