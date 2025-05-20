/*
 * @Author: chansee97 chen.dev@foxmail.com
 * @Date: 2025-05-21 00:53:47
 * @LastEditors: chansee97 chen.dev@foxmail.com
 * @LastEditTime: 2025-05-21 01:16:13
 * @FilePath: \react-three\src\components\scene\helpers\Lights.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { useRef } from 'react';
import * as THREE from 'three';

interface LightsProps {
  showHelpers?: boolean;
}

/**
 * 场景灯光组件
 */
export function Lights({ showHelpers = false }: LightsProps) {
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
      {showHelpers && mainLightRef.current && (
        <directionalLightHelper args={[mainLightRef.current, 1, '#ffff00']} />
      )}
      
      {/* 辅助方向光 */}
      <directionalLight 
        ref={secondaryLightRef}
        position={[-10, 5, -10]} 
        intensity={0.5} 
      />
      
      {/* 辅助方向光辅助器 */}
      {showHelpers && secondaryLightRef.current && (
        <directionalLightHelper args={[secondaryLightRef.current, 0.5, '#00ffff']} />
      )}
    </>
  );
}
