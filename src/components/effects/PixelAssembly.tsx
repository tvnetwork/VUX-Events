import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Center, Float } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

const VOXEL_COUNT = 5000;
const GRID_SIZE = 70; // 70x70 approx for 5000 voxels

interface VoxelData {
  initialPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  color: THREE.Color;
}

function PixelGrid({ onComplete }: { onComplete: () => void }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Theme colors
  const colors = [
    '#a855f7', // purple-500
    '#ec4899', // pink-500
    '#3b82f6', // blue-500
    '#ffffff', // white
  ].map(c => new THREE.Color(c));

  const voxels = useMemo(() => {
    const temp: VoxelData[] = [];
    for (let i = 0; i < VOXEL_COUNT; i++) {
        // Random scattered initial positions
        const initialPos = new THREE.Vector3(
            (Math.random() - 0.5) * 50,
            (Math.random() - 0.5) * 50,
            (Math.random() - 0.5) * 50
        );

        // Grid target positions
        const x = (i % GRID_SIZE) - GRID_SIZE / 2;
        const y = Math.floor(i / GRID_SIZE) - GRID_SIZE / 2;
        const targetPos = new THREE.Vector3(x * 0.1, y * 0.1, 0);

        temp.push({
            initialPos,
            targetPos,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }
    return temp;
  }, []);

  useEffect(() => {
    if (!meshRef.current) return;

    // Set initial positions
    voxels.forEach((voxel, i) => {
      dummy.position.copy(voxel.initialPos);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      meshRef.current!.setColorAt(i, voxel.color);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;

    // GSAP assembly animation
    const tl = gsap.timeline({
      onComplete: () => {
        // Fade out slightly before resolving completely
        gsap.to(meshRef.current!.material, {
          opacity: 0,
          duration: 1,
          delay: 1,
          onComplete
        });
      }
    });

    const animationData = { progress: 0 };

    tl.to(animationData, {
      progress: 1,
      duration: 3,
      ease: "power4.inOut",
      onUpdate: () => {
        const p = animationData.progress;
        voxels.forEach((voxel, i) => {
          // Linear interpolation with a per-voxel stagger/offset based on index
          // We use a normalized index to create a wave-like effect
          const offset = (i / VOXEL_COUNT) * 0.3;
          const localP = Math.min(1, Math.max(0, (p - offset) / 0.7));
          
          dummy.position.lerpVectors(voxel.initialPos, voxel.targetPos, localP);
          
          // Add a little rotation to the voxels during flight
          dummy.rotation.set(
            (1 - localP) * Math.sin(i),
            (1 - localP) * Math.cos(i),
            0
          );
          
          dummy.updateMatrix();
          meshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current!.instanceMatrix.needsUpdate = true;
      }
    });

    return () => {
      tl.kill();
    };
  }, [voxels, onComplete]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, VOXEL_COUNT]}>
      <boxGeometry args={[0.08, 0.08, 0.08]} />
      <meshStandardMaterial transparent roughness={0.1} metalness={0.8} />
    </instancedMesh>
  );
}

export function PixelAssembly({ onComplete }: { onComplete: () => void }) {
  return (
    <div 
      id="pixel-assembly-container"
      className="fixed inset-0 z-[100] bg-[#0b0b0f]"
    >
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={50} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <spotLight position={[-10, 10, 20]} angle={0.15} penumbra={1} intensity={2} />
        
        <Center>
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <PixelGrid onComplete={onComplete} />
          </Float>
        </Center>
      </Canvas>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center space-y-4">
          <h2 className="text-white/10 text-9xl font-black uppercase italic tracking-tighter select-none">
            VUX
          </h2>
        </div>
      </div>
    </div>
  );
}
