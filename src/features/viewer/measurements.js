/** Intersect a bicycle's wheel-centre axis with the longitudinal deck centreline. */
export const axisAtCentre = ({ rear, front }) => {
  const fraction = -rear[2] / (front[2] - rear[2]);
  return rear.map((value, index) => value + fraction * (front[index] - value));
};

/** Longitudinal distances between adjacent bicycle axes, in millimetres. */
export const bicycleGaps = (axes) => {
  const points = axes.map((axis) => ({ id: axis.id, point: axisAtCentre(axis) })).sort((a, b) => a.point[0] - b.point[0]);
  return points.slice(1).map((next, index) => ({ from: points[index], to: next, value: (next.point[0] - points[index].point[0]) * 1000 }));
};

/** Consecutive upright spacings measured separately on each side. */
export const postGaps = (posts, side) => {
  const row = posts.filter((post) => post.side === side).sort((a, b) => a.centre[0] - b.centre[0]);
  return row.slice(1).map((post, index) => ({ from: row[index], to: post, value: (post.centre[0] - row[index].centre[0]) * 1000 }));
};

/** Display measured dimensions to the nearest millimetre without false precision. */
export const measurementRange = (values) => {
  const min = Math.round(Math.min(...values));
  const max = Math.round(Math.max(...values));
  return min === max ? `${min}` : `${min}–${max}`;
};
