"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import {
  buildFormations,
  writeFormation,
  PARTICLE_COUNT,
  type FormationKind,
} from "./formations";

const TRANSITION_SECONDS = 1.4;

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function ParticleField({ formation }: { formation: FormationKind }) {
  const data = useMemo(() => buildFormations(), []);
  const geomRef = useRef<THREE.BufferGeometry>(null);
  const groupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  const state = useRef({
    prev: "flow" as FormationKind,
    next: "flow" as FormationKind,
    progress: 1,
    cur: new Float32Array(PARTICLE_COUNT * 3),
    scratchA: new Float32Array(PARTICLE_COUNT * 3),
    scratchB: new Float32Array(PARTICLE_COUNT * 3),
  });

  const sizes = useMemo(() => {
    const s = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) s[i] = 0.5 + data.rand[i];
    return s;
  }, [data]);

  useFrame((three, delta) => {
    const s = state.current;
    const t = three.clock.elapsedTime;

    if (formation !== s.next) {
      s.prev = s.next;
      s.next = formation;
      s.progress = 0;
    }
    if (s.progress < 1) {
      s.progress = Math.min(1, s.progress + delta / TRANSITION_SECONDS);
    }

    if (s.progress >= 1) {
      writeFormation(s.next, data, t, s.cur);
    } else {
      writeFormation(s.prev, data, t, s.scratchA);
      writeFormation(s.next, data, t, s.scratchB);
      const p = easeInOutCubic(s.progress);
      const cur = s.cur;
      const a = s.scratchA;
      const b = s.scratchB;
      for (let i = 0; i < cur.length; i++) cur[i] = a[i] + (b[i] - a[i]) * p;
    }

    const geom = geomRef.current;
    if (geom) {
      const attr = geom.getAttribute("position") as THREE.BufferAttribute;
      attr.needsUpdate = true;
    }

    // cursor / gyroscope parallax — damped rotation toward pointer
    const group = groupRef.current;
    if (group) {
      const targetY = pointer.x * 0.22;
      const targetX = -pointer.y * 0.14;
      group.rotation.y += (targetY - group.rotation.y) * Math.min(1, delta * 3);
      group.rotation.x += (targetX - group.rotation.x) * Math.min(1, delta * 3);
    }
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry ref={geomRef}>
          <bufferAttribute
            attach="attributes-position"
            args={[state.current.cur, 3]}
          />
          <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
        </bufferGeometry>
        <pointsMaterial
          color="#FFB300"
          size={0.042}
          sizeAttenuation
          transparent
          opacity={0.8}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

export default function TapeCanvas({
  formation,
}: {
  formation: FormationKind;
}) {
  return (
    <Canvas
      aria-hidden="true"
      camera={{ position: [0, 0, 9], fov: 50 }}
      dpr={[1, 1.75]}
      gl={{ antialias: false, powerPreference: "low-power", alpha: true }}
      className="!absolute inset-0"
    >
      <ParticleField formation={formation} />
    </Canvas>
  );
}
