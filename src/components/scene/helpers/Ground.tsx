import React from 'react';

export interface GroundProps {
  size?: [number, number];
  groundColor?: string;
}

/**
 * 地面组件 - 简单的底层平面
 */
export function Ground({ 
  size = [20, 20], 
  groundColor = "#333333"
}: GroundProps) {
  // 固定位置为 [0, 0, 0]
  const position: [number, number, number] = [0, 0, 0];

  return (
    <>
      {/* 底层平面 */}
      <mesh 
        position={position} 
        rotation={[-Math.PI / 2, 0, 0]} 
        receiveShadow
      >
        <planeGeometry args={size} />
        <meshStandardMaterial color={groundColor} />
      </mesh>
    </>
  );
}
