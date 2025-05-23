import type { SceneConfig } from '../types';
import * as THREE from 'three';

/**
 * 网格坐标和世界坐标转换工具
 */

// 将网格坐标转换为世界坐标
export function gridToWorldPosition(
  gridX: number, 
  gridY: number, 
  height: number = 0,
  gridSize: number
): [number, number, number] {
  const tileSize = 1; // 每个网格单元为1单位
  
  // 计算偏移量，使网格中心与坐标原点对齐
  const offsetX = -gridSize / 2 + tileSize / 2;
  const offsetZ = -gridSize / 2 + tileSize / 2;
  
  const x = offsetX + gridX * tileSize;
  const z = offsetZ + gridY * tileSize;
  
  return [x, height, z];
}

// 将世界坐标转换为网格坐标
export function worldToGridPosition(
  x: number, 
  z: number,
  gridSize: number
): [number, number] {
  const tileSize = 1; // 每个网格单元为1单位
  
  // 计算偏移量，使网格中心与坐标原点对齐
  const offsetX = -gridSize / 2 + tileSize / 2;
  const offsetZ = -gridSize / 2 + tileSize / 2;
  
  const gridX = Math.round((x - offsetX) / tileSize);
  const gridY = Math.round((z - offsetZ) / tileSize);
  
  return [gridX, gridY];
}

// 计算物体覆盖的网格坐标
export function calculateObjectGridPositions(
  object: THREE.Mesh,
  config?: SceneConfig
): [number, number][] {
  if (!config) {
    // 如果没有提供配置，使用默认值
    config = {
      groundSize: [20, 20],
    };
  }
  
  // 获取物体的世界坐标
  const worldPos = object.position.toArray();
  const coveredGridPositions: [number, number][] = [];
  
  // 根据物体类型计算其覆盖的网格坐标
  let corners: [number, number][] = [];
  
  // 从 groundSize 计算 gridSize (两者一致)
  const gridSize = config.groundSize[0];
  
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
    const gridPos = worldToGridPosition(
      worldPos[0], 
      worldPos[2], 
      gridSize
    );
    return [gridPos];
  }
  
  // 将每个角转换为网格坐标
  corners.forEach(([x, z]) => {
    const gridPos = worldToGridPosition(
      x, 
      z, 
      gridSize
    );
    
    // 检查是否已经添加过这个网格坐标
    const posKey = `${gridPos[0]},${gridPos[1]}`;
    if (!coveredGridPositions.some(pos => `${pos[0]},${pos[1]}` === posKey)) {
      coveredGridPositions.push(gridPos);
    }
  });
  
  return coveredGridPositions;
}
