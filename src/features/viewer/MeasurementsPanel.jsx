import { bicycleGaps, measurementRange, postGaps } from './measurements.js';

const Metric = ({ label, value, note }) => <div className="measurement-metric"><dt>{label}</dt><dd>{value}<small> mm</small></dd>{note && <p>{note}</p>}</div>;
const DimensionMark = ({ x1, x2, y, label }) => <g className="diagram-dimension"><path d={`M${x1} ${y - 6}v12m0 -6H${x2}m0 -6v12`} /><text x={(x1 + x2) / 2} y={y + 23} textAnchor="middle">{label}</text></g>;

const BicycleDiagram = ({ data, gap }) => {
  const coordinates = data.axes.flatMap((axis) => [axis.front[0], axis.rear[0]]);
  const min = Math.min(...coordinates), max = Math.max(...coordinates);
  const x = (value) => 30 + (value - min) / (max - min) * 380;
  const y = (value) => 113 + value * 66;
  return <svg viewBox="0 0 440 240" role="img" aria-label={`Top view. Positions ${gap.from.id} and ${gap.to.id}: ${Math.round(gap.value)} millimetres apart at the deck centreline.`}>
    <rect x="14" y="45" width="412" height="138" rx="5" className="diagram-deck" />
    <path d="M14 113H426" className="diagram-centreline" />
    {data.axes.map((axis) => <g key={axis.id} className={axis.id === gap.from.id || axis.id === gap.to.id ? 'diagram-axis selected' : 'diagram-axis'}>
      <line x1={x(axis.rear[0])} y1={y(axis.rear[2])} x2={x(axis.front[0])} y2={y(axis.front[2])} />
      <circle cx={x(axis.rear[0])} cy={y(axis.rear[2])} r="3" />
      <circle cx={x(axis.front[0])} cy={y(axis.front[2])} r="3" />
    </g>)}
    {[gap.from, gap.to].map((point) => <g key={point.id}><path d={`M${x(point.point[0])} 113V201`} className="diagram-extension" /><text x={x(point.point[0])} y="32" textAnchor="middle">{point.id}</text><circle cx={x(point.point[0])} cy="113" r="5" className="diagram-dot" /></g>)}
    <DimensionMark x1={x(gap.from.point[0])} x2={x(gap.to.point[0])} y={201} label={`${Math.round(gap.value)} mm`} />
  </svg>;
};

const PostDiagram = ({ gap }) => {
  const height = Math.round(gap.from.size[1] * 1000);
  const width = Math.round(gap.from.size[0] * 1000);
  const depth = Math.round(gap.from.size[2] * 1000);
  return <svg viewBox="0 0 440 240" role="img" aria-label={`Upright tube: ${height} millimetres tall, ${width} by ${depth} millimetres external section. Selected pair: ${Math.round(gap.value)} millimetres centre to centre.`}>
    <path d="M98 183H280" className="diagram-base" />
    {[130, 245].map((x) => <g key={x}><rect x={x - 5} y="40" width="10" height="143" className="diagram-post" /><path d={`M${x} 25V205`} className="diagram-centreline" /></g>)}
    <text x="130" y="20" textAnchor="middle">{gap.from.id.split(' ')[1]}</text><text x="245" y="20" textAnchor="middle">{gap.to.id.split(' ')[1]}</text>
    <path d="M120 40H76m44 143H76M83 40V183m-6 -143h12m-12 143h12" className="diagram-dimension" />
    <text x="70" y="108" textAnchor="end" className="diagram-value">{height}</text><text x="70" y="125" textAnchor="end">mm</text>
    <DimensionMark x1={130} x2={245} y={202} label={`${Math.round(gap.value)} mm`} />
    <rect x="332" y="91" width="42" height="42" className="diagram-post" />
    <text x="353" y="72" textAnchor="middle">{width} × {depth} mm</text>
    <text x="353" y="157" textAnchor="middle">Outer section</text>
  </svg>;
};

/** Readable dimension sheet with one selectable measurement family and pair. */
export const MeasurementsPanel = ({ data, model, loaded, mode, onMode, pair, onPair, side, onSide, onShow }) => {
  const gaps = mode === 'posts' ? postGaps(data.posts, side) : bicycleGaps(data.axes);
  const gapIndex = Math.min(pair, gaps.length - 1);
  const gap = gaps[gapIndex];
  return <section className="measurements-panel" aria-labelledby="measurements-heading">
    <div className="measurements-heading"><div><p className="eyebrow">MEASUREMENT SHEET</p><h2 id="measurements-heading">Spacing & upright dimensions</h2><p>{model.label} · {model.deck.toLocaleString('en-GB')} mm deck · {loaded ? 'With bicycles' : 'Without bicycles'}</p></div><button className="compare-button" onClick={onShow}>Show in 3D ↗</button></div>
    <div className="measurement-tabs" role="group" aria-label="Measurement category">{[['bikes', 'Bicycle spacing'], ['posts', 'Uprights'], ['deck', 'Loading area']].map(([id, label]) => <button key={id} aria-pressed={mode === id} onClick={() => onMode(id)}>{label}</button>)}</div>
    <div className={`measurement-content ${mode === 'posts' ? 'upright-measurements' : ''}`}>
      {mode === 'deck' ? <>
        <div className="measurement-drawing"><svg viewBox="0 0 440 240" role="img" aria-label={`Nominal loading area: ${model.deck} by 1600 millimetres.`}><rect x="75" y="40" width="280" height="130" rx="5" className="diagram-deck" /><DimensionMark x1={75} x2={355} y={195} label={`${model.deck.toLocaleString('en-GB')} mm`} /><text x="215" y="110" textAnchor="middle" className="diagram-value">1,600 mm wide</text></svg><p>Nominal loading area · schematic</p></div>
        <dl className="measurement-metrics"><Metric label="Deck length" value={model.deck.toLocaleString('en-GB')} /><Metric label="Deck width" value="1,600" /><Metric label="Overall trailer length" value={model.total.toLocaleString('en-GB')} /></dl>
      </> : <>
        <div className="measurement-drawing">{mode === 'bikes' ? <BicycleDiagram data={data} gap={gap} /> : <PostDiagram gap={gap} />}<p>{mode === 'bikes' ? `Top view · ${loaded ? 'wheel-centre axes' : 'nominal position axes'}` : 'Side elevation · tube only, fittings excluded'} · schematic</p></div>
        <dl className="measurement-metrics">{mode === 'bikes' ? <>
          <Metric label={loaded ? 'Bicycle centre spacing' : 'Nominal position spacing'} value={measurementRange(gaps.map((item) => item.value))} note={loaded ? 'Measured at the longitudinal deck centreline.' : 'Rail pitch. No bicycles in this variant.'} />
          <Metric label={`Selected pair · ${gap.from.id} → ${gap.to.id}`} value={Math.round(gap.value)} />
          {loaded && <Metric label="Original unloaded rail pitch" value={data.nominalPitch} note="The fitted layout includes offsets and angled bicycles." />}
        </> : <>
          <Metric label="Upright tube height" value={measurementRange(data.posts.map((post) => post.size[1] * 1000))} />
          <Metric label="Outer section · width × depth" value={`${measurementRange(data.posts.map((post) => post.size[0] * 1000))} × ${measurementRange(data.posts.map((post) => post.size[2] * 1000))}`} />
          <Metric label={`${side === 'left' ? 'Left' : 'Right'} row · centre spacing`} value={measurementRange(gaps.map((item) => item.value))} note="Measured along the same side. End spacing can differ." />
        </>}</dl>
      </>}
    </div>
    {mode !== 'deck' && <div className="measurement-pairs"><div className="measurement-pairs-heading"><h3>{mode === 'bikes' ? 'Choose a neighbouring pair' : 'Choose an upright pair'}</h3>{mode === 'posts' && <div role="group" aria-label="Upright row">{['left', 'right'].map((row) => <button key={row} aria-pressed={side === row} onClick={() => onSide(row)}>{row === 'left' ? 'Left row' : 'Right row'}</button>)}</div>}</div><div className="gap-list" role="group" aria-label="Measured pairs">{gaps.map((item, index) => <button key={index} aria-pressed={gapIndex === index} onClick={() => onPair(index)}><span>{mode === 'bikes' ? `${item.from.id} → ${item.to.id}` : `${item.from.id.split(' ')[1]} → ${item.to.id.split(' ')[1]}`}</span><strong>{Math.round(item.value)} <small>mm</small></strong></button>)}</div></div>}
    <p className="measurement-footnote">{mode === 'bikes' ? 'Centre-to-centre spacing is not free clearance between handlebars, pedals or frames.' : mode === 'posts' ? 'Section is measured externally; wall thickness is not specified.' : 'Nominal dimensions may differ from the modelled floor and small protrusions.'} Values rounded to the nearest millimetre.</p>
    <details className="measurement-source"><summary>Measurement source & method</summary><p>{data.source}{loaded && data.loadingReport ? ` · ${data.loadingReport}` : ''}</p><p>Uprights: geometry bounds and centre positions in the source GLB. {loaded ? 'Bicycle spacing: longitudinal distance between wheel-centre axes where they cross the middle of the deck width.' : 'Empty positions: nominal rail pitch from the layout study.'}</p></details>
  </section>;
};
