import { useMemo } from 'react';
import * as THREE from 'three';

interface PathLineProps {
  path: [number, number][];
  height?: number;
  color?: string;
  lineWidth?: number;
}

/**
 * 路径线组件 - 使用线条连接路径点
 */
export function PathLine({ 
  path, 
  height = 0.05, 
  color = '#ff0000',
  lineWidth = 2
}: PathLineProps) {
  // 将路径点转换为THREE.Vector3数组
  const points = useMemo(() => {
    if (!path || path.length < 2) return [];
    return path.map(([x, z]) => new THREE.Vector3(x, height, z));
  }, [path, height]);
  
  // 创建几何体和材质
  const geometry = useMemo(() => {
    if (points.length < 2) return new THREE.BufferGeometry();
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [points]);
  
  const material = useMemo(() => {
    return new THREE.LineBasicMaterial({ 
      color: color,
      linewidth: lineWidth // 注意：WebGL限制可能会使线宽度设置无效
    });
  }, [color, lineWidth]);
  
  // 如果路径为空或只有一个点，不渲染任何内容
  if (points.length < 2) return null;
  
  // 使用 primitive 来创建线条，而不是使用 JSX 元素
  return (
    <primitive 
      object={new THREE.Line(geometry, material)} 
      position={[0, 0, 0]}
    />
  );
}
