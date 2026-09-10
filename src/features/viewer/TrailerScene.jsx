import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { CameraControls, Environment, Html, Lightformer, Line } from '@react-three/drei';
import { mm } from './models.js';
import { getCameraPose } from './camera.js';

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
export const TrailerScene = ({ scene, model, dimensions, view, reset, rotating, onInteract, reducedMotion, controlsRef }) => {
  const { size, invalidate } = useThree();
  const firstView = useRef(true);
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const { position, target } = getCameraPose(view, size.width / size.height);
    const transition = !firstView.current && !reducedMotion;
    controls.setLookAt(...position, ...target, transition);
    firstView.current = false;
    invalidate();
  }, [view, reset, size.width, size.height, reducedMotion, controlsRef, invalidate]);
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
    {dimensions && scene && <Dimensions model={model} />}
    <CameraControls ref={controlsRef} makeDefault minDistance={1.4} maxDistance={32} maxPolarAngle={Math.PI * 0.499} smoothTime={reducedMotion ? 0 : 0.28} onControlStart={onInteract} />
  </>;
};
