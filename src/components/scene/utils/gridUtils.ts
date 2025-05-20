import { SceneConfig } from '../types';
import * as THREE from 'three';

/**
 * 网格坐标和世界坐标转换工具
 */

// 将网格坐标转换为世界坐标
export function gridToWorldPosition(
  gridX: number, 
  gridY: number, 
  height: number = 0,
  config: SceneConfig
): [number, number, number] {
  const { gridSize, divisions } = config;
  const tileSize = gridSize / divisions;
  const start = -gridSize / 2 + tileSize / 2;
  
  const x = start + gridX * tileSize;
  const z = start + gridY * tileSize;
  
  return [x, height, z];
}

// 将世界坐标转换为网格坐标
export function worldToGridPosition(
  x: number, 
  z: number,
  config: SceneConfig
): [number, number] {
  const { gridSize, divisions } = config;
  const tileSize = gridSize / divisions;
  const start = -gridSize / 2 + tileSize / 2;
  
  const gridX = Math.round((x - start) / tileSize);
  const gridY = Math.round((z - start) / tileSize);
  
  return [gridX, gridY];
}

// 计算物体覆盖的网格坐标
export function calculateObjectGridPositions(
  object: THREE.Mesh,
  config: SceneConfig
): [number, number][] {
  // 获取物体的世界坐标
  const worldPos = object.position.toArray();
  const coveredGridPositions: [number, number][] = [];
  
  // 根据物体类型计算其覆盖的网格坐标
  let corners: [number, number][] = [];
  
  // 检查物体类型并计算其覆盖的区域
  if (object.geometry instanceof THREE.BoxGeometry) {
    // 立方体
    const size = object.geometry.parameters.width || 1;
    const halfSize = size / 2;
    
    corners = [
      [worldPos[0] - halfSize, worldPos[2] - halfSize], // 左下
      [worldPos[0] - halfSize, worldPos[2] + halfSize], // 左上
      [worldPos[0] + halfSize, worldPos[2] - halfSize], // 右下
      [worldPos[0] + halfSize, worldPos[2] + halfSize]  // 右上
    ];
  } else if (object.geometry instanceof THREE.SphereGeometry || 
             object.geometry instanceof THREE.CylinderGeometry) {
    // 球体或圆柱体
    const radius = object.geometry instanceof THREE.SphereGeometry
      ? object.geometry.parameters.radius || 0.5
      : object.geometry.parameters.radiusTop || 0.5;
    
    corners = [
      [worldPos[0] - radius, worldPos[2] - radius], // 左下
      [worldPos[0] - radius, worldPos[2] + radius], // 左上
      [worldPos[0] + radius, worldPos[2] - radius], // 右下
      [worldPos[0] + radius, worldPos[2] + radius]  // 右上
    ];
  } else {
    // 其他类型的物体，只使用中心点
    const gridPos = worldToGridPosition(worldPos[0], worldPos[2], config);
    return [gridPos];
  }
  
  // 将每个角转换为网格坐标
  corners.forEach(([x, z]) => {
    const gridPos = worldToGridPosition(x, z, config);
    
    // 检查是否已经添加过这个网格坐标
    const posKey = `${gridPos[0]},${gridPos[1]}`;
    if (!coveredGridPositions.some(pos => `${pos[0]},${pos[1]}` === posKey)) {
      coveredGridPositions.push(gridPos);
    }
  });
  
  return coveredGridPositions;
}
