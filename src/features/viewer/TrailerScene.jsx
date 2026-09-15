import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { CameraControls, Environment, Html, Lightformer, Line } from '@react-three/drei';
import { mm } from './models.js';
import { getCameraPose } from './camera.js';
import { bicycleGaps, postGaps } from './measurements.js';

const Guide = ({ points, color = '#146d82' }) => <Line points={points} color={color} lineWidth={1.6} depthTest={false} transparent renderOrder={10} />;
const GuideLabel = ({ position, children, caption }) => <Html position={position} center zIndexRange={[8, 0]} style={{ pointerEvents: 'none' }}><span className="dimension-label">{children}<small>{caption}</small></span></Html>;

const DetailDimensions = ({ data, mode, pair, side }) => {
  if (mode === 'bikes') {
    const gaps = bicycleGaps(data.axes);
    const gap = gaps[Math.min(pair, gaps.length - 1)];
    const [x1, x2] = [gap.from.point[0], gap.to.point[0]];
    return <group>
      {[gap.from, gap.to].map(({ id, point }) => <group key={id}>
        <Guide points={[point, [point[0], 1.98, 0], [point[0], 1.98, 1.15]]} />
        <Guide points={[[point[0], 1.98, 1.09], [point[0], 1.98, 1.21]]} />
      </group>)}
      <Guide points={[[x1, 1.98, 1.15], [x2, 1.98, 1.15]]} />
      <GuideLabel position={[(x1 + x2) / 2, 1.98, 1.38]} caption={`${gap.from.id} → ${gap.to.id} · deck centreline`}>{Math.round(gap.value)} mm</GuideLabel>
    </group>;
  }
  const gaps = postGaps(data.posts, side);
  const gap = gaps[Math.min(pair, gaps.length - 1)];
  const [x1, x2] = [gap.from.centre[0], gap.to.centre[0]];
  const bottom = gap.from.centre[1] - gap.from.size[1] / 2;
  const top = bottom + gap.from.size[1];
  const z = side === 'left' ? 1.08 : -1.08;
  const color = '#a76824';
  return <group>
    {[gap.from, gap.to].map((post) => <Guide key={post.id} color={color} points={[post.centre, [post.centre[0], post.centre[1], z], [post.centre[0], bottom - 0.16, z]]} />)}
    <Guide color={color} points={[[x1, bottom - 0.1, z], [x2, bottom - 0.1, z]]} />
    {[bottom, top].map((y) => <Guide key={y} color={color} points={[[x1, y, gap.from.centre[2]], [x1 - 0.4, y, z]]} />)}
    <Guide color={color} points={[[x1 - 0.34, bottom, z], [x1 - 0.34, top, z]]} />
    <Guide color={color} points={[[x1 - 0.34, top, z], [x1 - 0.34, top + 0.2, z]]} />
    <GuideLabel position={[x1 - 0.34, top + 0.35, z]} caption="upright tube height">{Math.round(gap.from.size[1] * 1000)} mm</GuideLabel>
    <GuideLabel position={[(x1 + x2) / 2, bottom - 0.26, z]} caption={`${side} row · centre to centre`}>{Math.round(gap.value)} mm</GuideLabel>
  </group>;
};

const Dimensions = ({ model }) => {
  const half = model.deck / 2000;
  const color = '#146d82';
  return <group>
    <Line points={[[-half, 0.69, 1.04], [half, 0.69, 1.04]]} color={color} lineWidth={1.4} />
    {[-half, half].map((x) => <Line key={x} points={[[x, 0.69, 0.86], [x, 0.69, 1.16]]} color={color} lineWidth={1.4} />)}
    <Html position={[0, 0.69, 1.07]} center zIndexRange={[8, 0]}><span className="dimension-label">{mm(model.deck)}<small>nominal deck length</small></span></Html>
    <Line points={[[half + 0.25, 0.69, -0.8], [half + 0.25, 0.69, 0.8]]} color={color} lineWidth={1.4} />
    {[-0.8, 0.8].map((z) => <Line key={z} points={[[half + 0.1, 0.69, z], [half + 0.37, 0.69, z]]} color={color} lineWidth={1.4} />)}
    <Html position={[half + 0.3, 0.69, 0]} center zIndexRange={[8, 0]}><span className="dimension-label">1,600 mm<small>nominal width</small></span></Html>
  </group>;
};

/** Render the original geometry at real scale with fixed-scale camera presets. */
export const TrailerScene = ({ scene, model, dimensions, measurements, measurementMode, measurementPair, postSide, view, reset, rotating, onInteract, reducedMotion, controlsRef }) => {
  const { size, invalidate } = useThree();
  const firstView = useRef(true);
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const { position, target } = getCameraPose(view, size.width / size.height, dimensions);
    const transition = !firstView.current && !reducedMotion;
    controls.setLookAt(...position, ...target, transition);
    firstView.current = false;
    invalidate();
  }, [view, reset, dimensions, size.width, size.height, reducedMotion, controlsRef, invalidate]);
  useFrame((_, delta) => {
    if (rotating) { controlsRef.current?.rotate(delta * 0.16, 0, false); invalidate(); }
  });
  useEffect(() => { invalidate(); }, [rotating, invalidate]);

  return <>
    <ambientLight intensity={0.55} />
    <hemisphereLight args={['#f0f8ff', '#74838b', 1.4]} />
    <directionalLight position={[-3, 7, 5]} intensity={2.1} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-4} shadow-camera-right={4} shadow-camera-top={4} shadow-camera-bottom={-4} shadow-normalBias={0.015} shadow-bias={-0.00015} />
    <Environment resolution={128} frames={1}>
      <color attach="background" args={['#b6c3cd']} />
      <Lightformer position={[-3, 6, 4]} target={[0, 0, 0]} intensity={3} scale={[8, 5]} />
      <Lightformer position={[4, 3, -4]} target={[0, 0, 0]} intensity={2} scale={[5, 4]} />
    </Environment>
    {scene && <primitive object={scene} dispose={null} />}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.006, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <shadowMaterial transparent opacity={0.2} />
    </mesh>
    {dimensions && scene && (measurementMode === 'deck' ? <Dimensions model={model} /> : <DetailDimensions data={measurements} mode={measurementMode} pair={measurementPair} side={postSide} />)}
    <CameraControls ref={controlsRef} makeDefault minDistance={1.4} maxDistance={32} maxPolarAngle={Math.PI * 0.499} smoothTime={reducedMotion ? 0 : 0.28} onControlStart={onInteract} />
  </>;
};
