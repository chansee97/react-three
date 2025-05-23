import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface FogProps {
  color?: string;
  near?: number;
  far?: number;
}

/**
 * 雾效果组件 - 为场景添加轻微的雾效果，增强深度感
 */
export function Fog({
  color = '#e0e0e0',
  near = 10,
  far = 50
}: FogProps) {
  const { scene } = useThree();
  
  useEffect(() => {
    scene.fog = new THREE.Fog(color, near, far);
    return () => {
      scene.fog = null;
    };
  }, [scene, color, near, far]);
  
  return null;
} 