import { Vector3 } from 'three';

const directions = {
  Perspective: [-1, 0.72, 1],
  Front: [-1, 0.015, 0],
  Rear: [1, 0.015, 0],
  Side: [0, 0.015, 1],
  Top: [0, 1, 0.001],
};

/** Fit a shared reference envelope so every trailer uses the same physical scale. */
export const getCameraPose = (view, aspect) => {
  const target = new Vector3(-0.35, 0.72, 0);
  const backward = new Vector3(...directions[view]).normalize();
  const right = new Vector3().crossVectors(new Vector3(0, 1, 0), backward).normalize();
  const up = new Vector3().crossVectors(backward, right).normalize();
  const tangent = Math.tan(37 * Math.PI / 360);
  let distance = 2.5;
  // Includes the largest trailer and the nominal dimension guides.
  for (const x of [-2.75, 2.15]) for (const y of [-0.02, 1.45]) for (const z of [-0.9, 1.25]) {
    const relative = new Vector3(x, y, z).sub(target);
    const depth = relative.dot(backward);
    distance = Math.max(distance,
      depth + Math.abs(relative.dot(right)) / (tangent * aspect * 0.86),
      depth + Math.abs(relative.dot(up)) / (tangent * 0.86));
  }
  return { position: target.clone().addScaledVector(backward, distance).toArray(), target: target.toArray() };
};
