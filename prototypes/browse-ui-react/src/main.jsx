// PROTOTYPE entry: fetch fake data from the FastAPI backend once, then render the chosen variant.
import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import { Switcher } from './shared.jsx';
import VariantE from './VariantE.jsx';
import VariantF from './VariantF.jsx';
import VariantG from './VariantG.jsx';
import VariantH from './VariantH.jsx';
import VariantI from './VariantI.jsx';
import './styles.css';

const VARIANTS = [
  { key: 'E', name: 'Command palette + full virtual table', C: VariantE },
  { key: 'F', name: 'Linked resizable panels', C: VariantF },
  { key: 'G', name: 'Zoomable Topic map', C: VariantG },
  { key: 'H', name: 'Topic × Channel heatmap', C: VariantH },
  { key: 'I', name: 'Consolidated: Videos · Topics · Channels', C: VariantI },
];

function App() {
  const [data, setData] = useState(null);
  const [key, setKey] = useState(() => new URLSearchParams(location.search).get('variant') || 'E');
  useEffect(() => { // retry: the Python API can start a moment after Vite
    const load = () => fetch('/api/data').then(r => r.ok ? r.json() : Promise.reject()).then(setData).catch(() => setTimeout(load, 500));
    load();
  }, []);
  const current = VARIANTS.find(v => v.key === key) || VARIANTS[0];
  const change = k => {
    const u = new URL(location.href); u.searchParams.set('variant', k);
    history.replaceState(null, '', u); setKey(k);
  };
  useEffect(() => { document.title = `Prototype ${current.key} — ${current.name}`; }, [current]);
  if (!data) return <p style={{ padding: 20 }}>Loading fake data from the Python API…</p>;
  return <><current.C key={current.key} data={data} /><Switcher variants={VARIANTS} current={current} onChange={change} /></>;
}

createRoot(document.getElementById('root')).render(<App />);
