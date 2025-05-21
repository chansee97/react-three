import type { SceneConfig } from '../types';
import * as THREE from 'three';

/**
 * 网格坐标和世界坐标转换工具
 */

/**
 * 计算单元格大小
 */
export function calculateCellSize(gridWidth: number, gridHeight: number, divisionsX: number, divisionsZ: number): [number, number] {
  return [
    gridWidth / divisionsX,
    gridHeight / divisionsZ
  ];
}

/**
 * 计算网格划分数量
 */
export function calculateGridDivisions(width: number, height: number, cellSize: number): [number, number] {
  return [
    Math.round(width / cellSize),
    Math.round(height / cellSize)
  ];
}

/**
 * 将网格坐标转换为世界坐标
 */
export function gridToWorldPosition(
  gridX: number, 
  gridZ: number, 
  height: number, 
  gridWidth: number, 
  gridHeight: number,
  cellSizeX: number,
  cellSizeZ: number
): [number, number, number] {
  // 计算网格单元格的尺寸
  const offsetX = -gridWidth / 2;
  const offsetZ = -gridHeight / 2;
  
  // 计算世界坐标
  const x = offsetX + (gridX + 0.5) * cellSizeX;
  const z = offsetZ + (gridZ + 0.5) * cellSizeZ;
  
  return [x, height, z];
}

/**
 * 将世界坐标转换为网格坐标
 */
export function worldToGridPosition(
  x: number, 
  z: number, 
  gridWidth: number, 
  gridHeight: number,
  cellSizeX: number,
  cellSizeZ: number,
  divisionsX: number,
  divisionsZ: number
): [number, number] {
  // 计算偏移量
  const offsetX = -gridWidth / 2;
  const offsetZ = -gridHeight / 2;
  
  // 计算网格坐标
  const gridX = Math.floor((x - offsetX) / cellSizeX);
  const gridZ = Math.floor((z - offsetZ) / cellSizeZ);
  
  // 确保坐标在有效范围内
  const clampedX = Math.max(0, Math.min(divisionsX - 1, gridX));
  const clampedZ = Math.max(0, Math.min(divisionsZ - 1, gridZ));
  
  return [clampedX, clampedZ];
}

/**
 * 计算物体覆盖的网格坐标
 */
export function calculateObjectGridPositions(
  object: THREE.Mesh, 
  gridWidth: number, 
  gridHeight: number,
  cellSizeX: number,
  cellSizeZ: number,
  divisionsX: number,
  divisionsZ: number
): [number, number][] {
  // 获取物体的边界框
  if (!object.geometry.boundingBox) {
    object.geometry.computeBoundingBox();
  }
  
  const boundingBox = object.geometry.boundingBox!;
  const positions: [number, number][] = [];
  
  // 获取物体的世界变换
  const matrix = object.matrixWorld;
  
  // 计算边界框的8个顶点
  const vertices = [
    new THREE.Vector3(boundingBox.min.x, boundingBox.min.y, boundingBox.min.z),
    new THREE.Vector3(boundingBox.min.x, boundingBox.min.y, boundingBox.max.z),
    new THREE.Vector3(boundingBox.min.x, boundingBox.max.y, boundingBox.min.z),
    new THREE.Vector3(boundingBox.min.x, boundingBox.max.y, boundingBox.max.z),
    new THREE.Vector3(boundingBox.max.x, boundingBox.min.y, boundingBox.min.z),
    new THREE.Vector3(boundingBox.max.x, boundingBox.min.y, boundingBox.max.z),
    new THREE.Vector3(boundingBox.max.x, boundingBox.max.y, boundingBox.min.z),
    new THREE.Vector3(boundingBox.max.x, boundingBox.max.y, boundingBox.max.z)
  ];
  
  // 应用物体的世界变换
  vertices.forEach(vertex => vertex.applyMatrix4(matrix));
  
  // 查找覆盖的网格坐标
  const minX = Math.min(...vertices.map(v => v.x));
  const maxX = Math.max(...vertices.map(v => v.x));
  const minZ = Math.min(...vertices.map(v => v.z));
  const maxZ = Math.max(...vertices.map(v => v.z));
  
  // 转换为网格坐标
  const [gridMinX, gridMinZ] = worldToGridPosition(
    minX, minZ, gridWidth, gridHeight, cellSizeX, cellSizeZ, divisionsX, divisionsZ
  );
  const [gridMaxX, gridMaxZ] = worldToGridPosition(
    maxX, maxZ, gridWidth, gridHeight, cellSizeX, cellSizeZ, divisionsX, divisionsZ
  );
  
  // 收集所有覆盖的网格坐标
  for (let x = gridMinX; x <= gridMaxX; x++) {
    for (let z = gridMinZ; z <= gridMaxZ; z++) {
      positions.push([x, z]);
    }
  }
  
  return positions;
}
