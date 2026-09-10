import { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { TrailerScene } from './TrailerScene.jsx';
import { CompareDialog } from './CompareDialog.jsx';
import { useTrailerModel } from './useTrailerModel.js';
import { mm, models } from './models.js';

const paths = {
  ruler: <><path d="m4 15 11-11 5 5L9 20 4 15Z" /><path d="m12 7 2 2m-5 1 2 2m-5 1 2 2" /></>,
  rotate: <><path d="M20 10a8 8 0 1 0-2 8M20 4v6h-6" /></>,
  expand: <><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" /></>,
  reset: <><path d="M4 10a8 8 0 1 1 2 8M4 4v6h6" /></>,
  compare: <><path d="M5 4v16M19 4v16M2 8h6m8 8h6M10 5h4m-4 14h4" /></>,
  bike: <><circle cx="5" cy="16" r="4" /><circle cx="19" cy="16" r="4" /><path d="m5 16 5-9 5 9H5m10 0 3-11h-3M8 7h5" /></>,
};
const Icon = ({ name }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;

/** Interactive operations review of the three bicycle trailer studies. */
export const TrailerViewer = () => {
  const [selected, setSelected] = useState(11);
  const [view, setView] = useState('Perspective');
  const [dimensions, setDimensions] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [reset, setReset] = useState(0);
  const [retry, setRetry] = useState(0);
  const [compare, setCompare] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [contextLost, setContextLost] = useState(false);
  const [notice, setNotice] = useState('');
  const [reducedMotion, setReducedMotion] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const stageRef = useRef();
  const controlsRef = useRef();
  const model = models.find((item) => item.id === selected);
  const { scene, progress, error } = useTrailerModel(model.url, retry);
  const stopRotation = useCallback(() => setRotating(false), []);
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { setReducedMotion(query.matches); if (query.matches) setRotating(false); };
    query.addEventListener('change', update);
    const syncFullscreen = () => setFullscreen(document.fullscreenElement === stageRef.current);
    document.addEventListener('fullscreenchange', syncFullscreen);
    return () => { query.removeEventListener('change', update); document.removeEventListener('fullscreenchange', syncFullscreen); };
  }, []);
  const resetCamera = () => { setRotating(false); setView('Perspective'); setReset((value) => value + 1); };
  const chooseModel = (id) => { setSelected(id); setRotating(false); };
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await stageRef.current.requestFullscreen();
    } catch { setNotice('Full screen is unavailable in this browser. Open the viewer in a separate browser window.'); }
  };
  const handleKey = (event) => {
    if (event.target !== event.currentTarget) return;
    const controls = controlsRef.current;
    const keys = { ArrowLeft: [-0.15, 0], ArrowRight: [0.15, 0], ArrowUp: [0, -0.1], ArrowDown: [0, 0.1] };
    if (keys[event.key]) { event.preventDefault(); stopRotation(); controls?.rotate(...keys[event.key], !reducedMotion); }
    if (event.key === '+' || event.key === '=') { event.preventDefault(); controls?.dolly(0.5, !reducedMotion); }
    if (event.key === '-') { event.preventDefault(); controls?.dolly(-0.5, !reducedMotion); }
    if (event.key.toLowerCase() === 'r') resetCamera();
  };
  return <div className="app-shell">
    <header className="app-header flex items-center justify-between gap-4">
      <div className="brand flex items-center gap-3"><span className="brand-icon"><Icon name="bike" /></span><span>Fleet<span className="brand-light"> / Trailer review</span></span></div>
      <div className="header-right flex items-center gap-5"><span className="internal-label">Operations workspace</span><button className="compare-button flex items-center gap-2" onClick={() => setCompare(true)}><Icon name="compare" />Compare layouts</button></div>
    </header>
    <main className="workspace">
      <section className="stage" ref={stageRef} aria-label="Interactive trailer model" tabIndex={0} onKeyDown={handleKey}>
        <div className="stage-heading"><p className="eyebrow">BICYCLE TRAILER STUDY</p><h1>{selected} bicycle positions</h1><p>{model.name}<span className="heading-separator">/</span>JPLA750-based layout</p></div>
        <div className="stage-tools flex flex-col gap-2">
          <button className="icon-button" onClick={resetCamera} title="Reset view (R)" aria-label="Reset view"><Icon name="reset" /></button>
          {document.fullscreenEnabled && <button className="icon-button" onClick={toggleFullscreen} title={fullscreen ? 'Exit full screen' : 'Full screen'} aria-label={fullscreen ? 'Exit full screen' : 'Full screen'}><Icon name="expand" /></button>}
        </div>
        <div className="canvas-area">
          {!contextLost && <Canvas shadows frameloop={rotating ? 'always' : 'demand'} dpr={[1, 1.6]} camera={{ position: [-5.35, 4.32, 5], fov: 37, near: 0.05, far: 100 }} gl={{ antialias: true, powerPreference: 'high-performance' }} fallback={<div className="load-state"><p>3D is unavailable in this browser. Enable hardware acceleration or use another browser.</p></div>} onCreated={({ gl }) => { gl.domElement.addEventListener('webglcontextlost', (event) => { event.preventDefault(); setContextLost(true); }, { once: true }); }}>
            <TrailerScene scene={scene} model={model} dimensions={dimensions} view={view} reset={reset} rotating={rotating} onInteract={stopRotation} reducedMotion={reducedMotion} controlsRef={controlsRef} />
          </Canvas>}
          {(!scene || contextLost) && <div className="load-state" role="status"><img src={model.preview} alt={`${selected}-position trailer perspective preview`} /><div className="load-message">{error || contextLost ? <><strong>{contextLost ? 'The 3D view was interrupted.' : 'Model unavailable'}</strong><p>{error || 'Reload the viewer to restore the 3D view.'}</p><button className="compare-button" onClick={() => contextLost ? location.reload() : setRetry((value) => value + 1)}>Try again</button></> : <><strong>Preparing your {selected}-position trailer</strong><progress max="100" value={progress} aria-label="Loading model" /><span>{progress}%</span></>}</div></div>}
        </div>
        <div className="stage-bottom"><div className="view-controls" aria-label="Camera views">{['Perspective', 'Front', 'Rear', 'Side', 'Top'].map((name) => <button key={name} aria-pressed={view === name} onClick={() => { setView(name); setReset((value) => value + 1); setRotating(false); }}>{name}</button>)}</div>
          <div className="stage-options flex items-center justify-center gap-2"><button aria-pressed={dimensions} onClick={() => setDimensions((value) => !value)}><Icon name="ruler" />Dimensions</button><button aria-pressed={rotating} onClick={() => setRotating((value) => !value)}><Icon name="rotate" />{rotating ? 'Stop rotation' : 'Auto rotate'}</button></div>
          <p className="interaction-hint">Drag to orbit · Scroll to zoom · Right-drag to pan <span>· Arrow keys to orbit, + / − to zoom</span></p>
        </div>
      </section>
      <aside className="spec-panel" aria-label="Selected trailer specifications">
        <p className="eyebrow">SELECTED LAYOUT</p><div className="capacity"><strong>{selected}</strong><span>bicycle<br />positions</span></div><p className="model-description">{model.description}</p>
        <dl className="spec-list"><div><dt>Nominal loading area</dt><dd>{model.deck.toLocaleString('en-GB')} × 1,600 <small>mm</small></dd></div><div><dt>Nominal overall length</dt><dd>{mm(model.total)}</dd></div><div><dt>Rail centre spacing</dt><dd>225 <small>mm</small></dd></div><div><dt>Post arrangement</dt><dd>{model.posts}</dd></div></dl>
        <div className="length-comparison"><h2>Overall length</h2>{models.map((item) => <div key={item.id} className={`length-row ${item.id === selected ? 'active' : ''}`}><span>{item.id}</span><div><i style={{ width: `${item.total / 4445 * 100}%` }} /></div><span>{(item.total / 1000).toFixed(3)} m</span></div>)}<p>Same scale across all three models</p></div>
        <details className="study-note"><summary>Layout study · validation pending</summary><p>Positions describe the modelled layout. Actual bicycle clearance and permissible payload need confirmation. The extended chassis and load balance also need validation.</p><p>Dimensions follow the local 11, 13 and 15-position study reports.</p></details>
      </aside>
      <nav className="model-selector" aria-label="Choose trailer capacity">{models.map((item) => <button key={item.id} className={`model-option ${item.id === selected ? 'selected' : ''}`} aria-pressed={item.id === selected} onClick={() => chooseModel(item.id)}><img src={item.preview} alt="" /><span className="model-option-copy"><strong>{item.id} positions</strong><span>{item.name}</span><small>{item.deck.toLocaleString('en-GB')} × 1,600 mm deck</small></span><span className="selection-mark" aria-hidden="true">{item.id === selected ? '✓' : '+'}</span></button>)}</nav>
    </main>
    <footer className="app-footer flex items-center justify-between gap-3"><span>JPLA750 layout studies</span><span>11 / 13 / 15 positions <span className="footer-divider">·</span> Internal review</span></footer>
    {notice && <div className="notice" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss message">×</button></div>}
    <CompareDialog open={compare} onClose={() => setCompare(false)} selected={selected} onSelect={chooseModel} />
  </div>;
};
