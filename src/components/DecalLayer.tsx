import { useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { Decal } from '@/types/hat';

interface DecalLayerProps {
  decal: Decal;
  // targetMesh kept in the prop signature so callers don't need to change,
  // but the flat-plane renderer no longer needs it.
  targetMesh?: THREE.Mesh | null;
  isSelected?: boolean;
  onClick?: (e: ThreeEvent<PointerEvent>) => void;
}

const TRANSPARENT_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
const SURFACE_OFFSET = 8; // cap-mesh units to push the plane outward, well clear of the shell

/**
 * Renders a decal as a flat textured plane positioned and oriented along
 * the cap surface normal. Avoids the DecalGeometry projection box, which
 * is fragile against curved-surface clipping and bleeds onto the inner
 * shell of the cap when the projection depth covers shell thickness.
 *
 * The plane:
 *   - sits at `decal.position` plus a small offset along `decal.normal`
 *     so it floats just above the fabric (no z-fighting),
 *   - is oriented so its +Z axis matches `decal.normal`,
 *   - is sized by `decal.scale[0]` x `decal.scale[1]`,
 *   - is single-sided (FrontSide) so the inside of the cap stays clean.
 */
export default function DecalLayer({ decal, isSelected, onClick }: DecalLayerProps) {
  const url = decal.type === 'image' && decal.url ? decal.url : TRANSPARENT_PIXEL;
  const texture = useTexture(url);

  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.needsUpdate = true;
    return null;
  }, [texture]);

  const { position, rotation } = useMemo(() => {
    const normal = new THREE.Vector3(...(decal.normal || [0, 0, 1]));
    if (normal.lengthSq() < 1e-8) normal.set(0, 0, 1);
    normal.normalize();

    const basis = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      normal,
    );
    const spin = decal.spin ?? decal.rotation?.[2] ?? 0;
    const spinQ = new THREE.Quaternion().setFromAxisAngle(normal, spin);
    const finalQ = basis.multiply(spinQ);
    const euler = new THREE.Euler().setFromQuaternion(finalQ);

    const pos: [number, number, number] = [
      decal.position[0] + normal.x * SURFACE_OFFSET,
      decal.position[1] + normal.y * SURFACE_OFFSET,
      decal.position[2] + normal.z * SURFACE_OFFSET,
    ];
    return {
      position: pos,
      rotation: [euler.x, euler.y, euler.z] as [number, number, number],
    };
  }, [decal.position, decal.normal, decal.spin, decal.rotation]);

  const sizeX = Math.max(0.03, decal.scale?.[0] ?? 1);
  const sizeY = Math.max(0.03, decal.scale?.[1] ?? sizeX);

  const isGoldEmbroidery = decal.style === 'gold-embroidery';
  const isEmbroidery = decal.style === 'embroidery' || isGoldEmbroidery;

  return (
    <mesh
      position={position}
      rotation={rotation}
      onPointerDown={(e) => {
        if (!onClick) return;
        e.stopPropagation();
        onClick(e);
      }}
      renderOrder={isSelected ? 2 : 1}
    >
      <planeGeometry args={[sizeX, sizeY]} />
      <meshStandardMaterial
        map={texture}
        transparent
        alphaTest={0.04}
        depthTest
        depthWrite={false}
        side={THREE.FrontSide}
        polygonOffset
        polygonOffsetFactor={isSelected ? -4 : -2}
        polygonOffsetUnits={isSelected ? -4 : -2}
        roughness={isGoldEmbroidery ? 0.25 : isEmbroidery ? 0.55 : 0.7}
        metalness={isGoldEmbroidery ? 0.75 : isEmbroidery ? 0.25 : 0.1}
        emissive={isSelected ? '#1f1f1f' : isGoldEmbroidery ? '#6B4500' : isEmbroidery ? '#3D2200' : '#000000'}
        emissiveIntensity={isSelected ? 0.3 : isGoldEmbroidery ? 0.32 : isEmbroidery ? 0.14 : 0}
      />
    </mesh>
  );
}
