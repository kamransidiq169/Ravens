"use client";

import { PerspectiveCamera, View } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";

function Spinner() {
  const mesh = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (mesh.current) mesh.current.rotation.y += delta;
  });
  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[1.2, 1]} />
      <meshNormalMaterial wireframe />
    </mesh>
  );
}

export default function CanvasSmokeScene() {
  return (
    <>
      <View className="relative z-(--z-content) mx-auto my-16 h-80 w-full max-w-xl" data-testid="canvas-smoke">
        <ambientLight intensity={1} />
        <PerspectiveCamera makeDefault position={[0, 0, 4]} />
        <Spinner />
      </View>
    </>
  );
}
