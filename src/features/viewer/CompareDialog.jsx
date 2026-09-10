import { useEffect, useRef } from 'react';
import { mm, models } from './models.js';

/** Accessible modal comparison with native focus management and Escape handling. */
export const CompareDialog = ({ open, onClose, selected, onSelect }) => {
  const ref = useRef();
  useEffect(() => {
    if (open && !ref.current.open) ref.current.showModal();
    if (!open && ref.current.open) ref.current.close();
  }, [open]);
  const rows = [
    ['Nominal loading area', (m) => `${m.deck.toLocaleString('en-GB')} × 1,600 mm`],
    ['Modelled floor', (m) => `${m.floor.toLocaleString('en-GB')} × 1,530 mm`],
    ['Nominal overall length', (m) => mm(m.total)],
    ['Extra length vs. 11 positions', (m) => m.extra ? `+${mm(m.extra)}` : 'Reference'],
    ['Posts', (m) => m.posts],
    ['Rail centre spacing', () => '225 mm'],
    ['End margin on floor', () => '95 mm'],
  ];
  return <dialog ref={ref} className="compare-dialog" onClose={onClose} onClick={(event) => { if (event.target === ref.current) onClose(); }} aria-labelledby="compare-heading">
    <div className="dialog-heading"><div><p className="eyebrow">DIMENSIONS & CAPACITY</p><h2 id="compare-heading">Three layouts. One clear comparison.</h2></div><button className="icon-button" onClick={onClose} aria-label="Close comparison">×</button></div>
    <div className="table-scroll"><table><thead><tr><th scope="col">Study specification</th>{models.map((m) => <th scope="col" key={m.id} className={m.id === selected ? 'chosen-column' : ''}><strong>{m.id}</strong> positions</th>)}</tr></thead><tbody>{rows.map(([label, value]) => <tr key={label}><th scope="row">{label}</th>{models.map((m) => <td key={m.id} className={m.id === selected ? 'chosen-column' : ''}>{value(m)}</td>)}</tr>)}</tbody><tfoot><tr><td />{models.map((m) => <td key={m.id}><button className="text-button" onClick={() => { onSelect(m.id); onClose(); }}>Explore {m.id} positions ↗</button></td>)}</tr></tfoot></table></div>
    <p className="dialog-note">All layouts use the same 225 mm rail spacing. Capacity describes modelled positions. Real bicycle clearance, permissible payload and the extended chassis require validation.</p>
  </dialog>;
};
