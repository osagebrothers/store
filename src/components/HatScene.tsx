import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import { Canvas as FabricCanvas } from 'fabric';
import HatModel from './HatModel';
import { Suspense, useEffect, useState } from 'react';
import * as THREE from 'three';

import { Decal, TextStyle } from '@/types/hat';

// Camera presets: spherical positions around target [0, 0.08, 0] at distance 2.8
const R = 2.8;
const TARGET: [number, number, number] = [0, 0.08, 0];

export interface CameraPreset {
  label: string;
  shortLabel: string;
  position: [number, number, number];
}

export const CAMERA_PRESETS: CameraPreset[] = [
  { label: 'Front', shortLabel: 'F', position: [0, 0.2, R] },
  { label: 'Back', shortLabel: 'B', position: [0, 0.2, -R] },
  { label: 'Right', shortLabel: 'R', position: [-R, 0.2, 0] },
  { label: '3/4 Right', shortLabel: '¾R', position: [-R * 0.707, 0.2, -R * 0.707] },
  { label: '3/4 Left', shortLabel: '¾L', position: [R * 0.707, 0.2, R * 0.707] },
  { label: 'Left', shortLabel: 'L', position: [R, 0.2, 0] },
  { label: 'Under Brim', shortLabel: 'UB', position: [0, -R * 0.5, R * 0.866] },
  { label: 'Top Down', shortLabel: 'TD', position: [0, R * 0.866, R * 0.5] },
];

export interface HatSceneRef {
  setCameraPreset: (index: number) => void;
}

function CameraController({ presetIndex, trigger }: { presetIndex: number; trigger: number }) {
  const { camera } = useThree();

  useEffect(() => {
    if (presetIndex < 0 || trigger === 0) return;

    const preset = CAMERA_PRESETS[presetIndex];
    if (!preset) return;

    const start = camera.position.clone();
    const end = new THREE.Vector3(...preset.position);
    const duration = 500;
    const startTime = performance.now();

    let raf: number;
    function animate() {
      const elapsed = performance.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      camera.position.lerpVectors(start, end, ease);
      camera.lookAt(...TARGET);

      if (t < 1) {
        raf = requestAnimationFrame(animate);
      }
    }
    animate();
    return () => cancelAnimationFrame(raf);
  }, [presetIndex, trigger, camera]);

  return null;
}

interface HatSceneProps {
  hatColor: string;
  bandColor?: string;
  texture?: string;
  text: string;
  backText?: string;
  brimText?: string;
  textColor: string;
  textStyle?: TextStyle;
  font?: string;
  flagCode?: string;
  decals?: Decal[];
  onDecalUpdate?: (id: string, updates: Partial<Decal>) => void;
  selectedDecalId?: string;
  onDecalSelect?: (id: string | null) => void;
  placementMode?: boolean;
  onPlacementComplete?: () => void;
  autoRotate?: boolean;
  className?: string;
  fabricCanvas?: FabricCanvas | null;
  editingOnSurface?: boolean;
  onEditingSurface?: (editing: boolean) => void;
  cameraPreset?: number;
  cameraPresetTrigger?: number;
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        intensity={1.8}
        castShadow
      />
      <directionalLight position={[-5, 5, -5]} intensity={0.4} color="#f0f0ff" />
      <Environment preset="city" />
    </>
  );
}

export default function HatScene({
  hatColor,
  bandColor,
  texture,
  text,
  backText,
  brimText,
  textColor,
  textStyle,
  font,
  flagCode,
  decals,
  onDecalUpdate,
  selectedDecalId,
  onDecalSelect,
  placementMode = false,
  onPlacementComplete,
  autoRotate = false,
  className,
  fabricCanvas,
  editingOnSurface = false,
  onEditingSurface,
  cameraPreset = -1,
  cameraPresetTrigger = 0,
}: HatSceneProps) {
  const [paused, setPaused] = useState(false);
  const effectiveAutoRotate = autoRotate && !paused;
  return (
    <div className={`relative ${className || ''}`}>
      <Canvas
        camera={{ position: [0, 0.2, 2.8], fov: 35 }}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
          outputColorSpace: THREE.SRGBColorSpace,
          preserveDrawingBuffer: true,
        }}
        dpr={[1, 2]}
        style={{ background: 'transparent' }}
        onPointerMissed={() => onDecalSelect?.(null)}
      >
        <Suspense fallback={null}>
          <Lights />
          <HatModel
            hatColor={hatColor}
            bandColor={bandColor}
            texture={texture}
            text={text}
            backText={backText}
            brimText={brimText}
            textColor={textColor}
            textStyle={textStyle}
            fontFamily={font}
            flagCode={flagCode}
            decals={decals}
            onDecalUpdate={onDecalUpdate}
            selectedDecalId={selectedDecalId}
            onDecalSelect={onDecalSelect}
            placementMode={placementMode}
            onPlacementComplete={onPlacementComplete}
            autoRotate={effectiveAutoRotate}
            fabricCanvas={fabricCanvas}
            onEditingSurface={onEditingSurface}
          />
          <CameraController presetIndex={cameraPreset} trigger={cameraPresetTrigger} />
          <ContactShadows
            position={[0, -0.52, 0]}
            opacity={0.25}
            scale={5}
            blur={2.5}
            far={3}
          />
          <OrbitControls
            target={[0, 0.08, 0]}
            enabled={!placementMode && !editingOnSurface}
            enablePan={false}
            enableZoom={!effectiveAutoRotate}
            minDistance={1.8}
            maxDistance={5}
            enableDamping
            dampingFactor={0.05}
            maxPolarAngle={Math.PI * 0.75}
            minPolarAngle={Math.PI * 0.15}
            makeDefault
          />
        </Suspense>
      </Canvas>
      {autoRotate && (
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-pressed={paused}
          aria-label={paused ? 'Resume rotation' : 'Pause rotation'}
          data-testid="rotation-toggle"
          className="absolute right-4 top-4 z-10 inline-flex h-9 items-center gap-2 rounded-full border border-white/25 bg-black/55 px-3 text-[10px] uppercase tracking-[0.2em] text-white/85 backdrop-blur transition-colors hover:border-white/50 hover:bg-black/75"
        >
          <span aria-hidden="true">{paused ? '▶' : '⏸'}</span>
          <span>{paused ? 'Play' : 'Pause'}</span>
        </button>
      )}
      {placementMode && (
        <div className="absolute left-4 bottom-4 z-10 rounded border border-white/20 bg-black/70 px-3 py-2 text-[10px] tracking-wide uppercase text-white/80">
          Placement mode: click surface to stamp layer
        </div>
      )}
      {editingOnSurface && (
        <div className="absolute left-4 bottom-4 z-10 rounded border border-yellow-400/30 bg-black/70 px-3 py-2 text-[10px] tracking-wide uppercase text-yellow-300/80">
          Editing text on surface — drag to move, handles to resize
        </div>
      )}
    </div>
  );
}
