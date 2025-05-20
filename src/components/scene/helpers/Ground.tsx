import React from 'react';

interface GroundProps {
  size?: [number, number];
  position?: [number, number, number];
}

/**
 * 地面组件
 */
export function Ground({ 
  size = [20, 20], 
  position = [0, -0.1, 0] 
}: GroundProps) {
  return (
    <mesh 
      position={position} 
      rotation={[-Math.PI / 2, 0, 0]} 
      receiveShadow
    >
      <planeGeometry args={size} />
      <meshStandardMaterial color="#999999" />
    </mesh>
  );
}
