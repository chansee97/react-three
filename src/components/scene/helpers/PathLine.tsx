import { useMemo } from 'react';
import * as THREE from 'three';

export interface PathLineProps {
  points?: [number, number][];
  gridSize?: number;
  color?: string;
  height?: number;
  lineWidth?: number;
}

/**
 * 路径线组件 - 使用线条连接路径点
 */
export function PathLine({ 
  points = [], 
  gridSize = 20,
  color = '#ff0000',
  height = 0.05,
  lineWidth = 2
}: PathLineProps) {
  // 计算网格的起始坐标和单元格大小
  const tileSize = 1; // 每个网格单元为1单位
  const offsetX = -gridSize / 2 + tileSize / 2;
  const offsetZ = -gridSize / 2 + tileSize / 2;

  // 将网格路径点转换为世界坐标中的THREE.Vector3数组
  const pathPoints = useMemo(() => {
    if (!points || points.length < 2) return [];
    
    return points.map(([gridX, gridZ]) => {
      // 将网格坐标转换为世界坐标
      const x = offsetX + gridX * tileSize;
      const z = offsetZ + gridZ * tileSize;
      return new THREE.Vector3(x, height, z);
    });
  }, [points, height, offsetX, offsetZ]);
  
  // 创建几何体和材质
  const geometry = useMemo(() => {
    if (pathPoints.length < 2) return new THREE.BufferGeometry();
    return new THREE.BufferGeometry().setFromPoints(pathPoints);
  }, [pathPoints]);
  
  const material = useMemo(() => {
    return new THREE.LineBasicMaterial({ 
      color: color,
      linewidth: lineWidth
    });
  }, [color, lineWidth]);
  
  // 如果路径为空或只有一个点，不渲染任何内容
  if (pathPoints.length < 2) return null;
  
  // 使用 primitive 来创建线条
  return (
    <primitive 
      object={new THREE.Line(geometry, material)} 
      position={[0, 0, 0]}
    />
  );
}
