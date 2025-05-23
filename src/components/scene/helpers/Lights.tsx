import { useRef } from 'react';
import * as THREE from 'three';

interface LightsProps {
  showLights?: boolean;
}

/**
 * 场景灯光组件
 */
export function Lights({ showLights = false }: LightsProps) {
  // 使用引用来访问灯光对象
  const mainLightRef = useRef<THREE.DirectionalLight>(null);
  const secondaryLightRef = useRef<THREE.DirectionalLight>(null);
  
  return (
    <>
      {/* 环境光 */}
      <ambientLight intensity={1} />
      
      {/* 主方向光 */}
      <directionalLight 
        ref={mainLightRef}
        position={[10, 10, 10]} 
        intensity={1} 
        castShadow 
      />
      
      {/* 主方向光辅助器 - 单独渲染以避免嵌套问题 */}
      {showLights && mainLightRef.current && (
        <directionalLightHelper args={[mainLightRef.current, 1, '#ffff00']} />
      )}
      
      {/* 辅助方向光 */}
      <directionalLight 
        ref={secondaryLightRef}
        position={[-10, 5, -10]} 
        intensity={0.5} 
      />
      
      {/* 辅助方向光辅助器 */}
      {showLights && secondaryLightRef.current && (
        <directionalLightHelper args={[secondaryLightRef.current, 0.5, '#00ffff']} />
      )}
    </>
  );
}
