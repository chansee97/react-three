import React, { memo } from 'react';
import { Tile } from './Tile';
import { Plane } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import type { TileStatus } from '../types';
import { coordsToKey } from '../utils/pathfinding';

export interface PathfindingGridProps {
  gridSize?: number;
  tileStatus?: Map<string, TileStatus>;
  onTileClick?: (position: [number, number, number], gridCoords: [number, number]) => void;
  onTileRightClick?: (position: [number, number, number], gridCoords: [number, number]) => void;
  onTileMiddleClick?: (position: [number, number, number], gridCoords: [number, number]) => void;
}

/**
 * 寻路网格组件 - 渲染整个交互式瓦片网格
 */
function PathfindingGrid({ 
  gridSize = 20,
  tileStatus = new Map(),
  onTileClick,
  onTileRightClick,
  onTileMiddleClick
}: PathfindingGridProps) {
  // 内置颜色定义
  const COLORS = {
    base: "#444444",
    start: "#ff0000",
    end: "#ffff00",
    obstacle: "#222222",
    hover: "#00aaff"
  };

  // 设置网格数量和单元格大小
  const divisions = gridSize; // 网格分割数与gridSize相同
  const tileSize = 1; // 每个网格单元为1单位
  const height = 0.01; // 略高于地面
  
  // 渲染网格
  const tiles = [];
  
  // 计算网格的起始坐标（使网格中心与坐标原点对齐）
  const start = -gridSize / 2 + tileSize / 2;
  
  // 处理整个平面的点击事件
  const handlePlaneClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    
    if (!onTileClick) return;
    
    // 获取点击的世界坐标
    const point = event.point;
    
    // 计算网格坐标
    const gridX = Math.floor((point.x - start + gridSize/2) / tileSize);
    const gridZ = Math.floor((point.z - start + gridSize/2) / tileSize);
    
    // 确保坐标在有效范围内
    if (gridX >= 0 && gridX < divisions && gridZ >= 0 && gridZ < divisions) {
      // 计算位置
      const xPos = start + gridX * tileSize;
      const zPos = start + gridZ * tileSize;
      const position: [number, number, number] = [xPos, height, zPos];
      
      // 调用回调
      onTileClick(position, [gridX, gridZ]);
    }
  };
  
  // 处理整个平面的右键点击
  const handlePlaneRightClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    
    if (!onTileRightClick) return;
    
    // 获取点击的世界坐标
    const point = event.point;
    
    // 计算网格坐标
    const gridX = Math.floor((point.x - start + gridSize/2) / tileSize);
    const gridZ = Math.floor((point.z - start + gridSize/2) / tileSize);
    
    // 确保坐标在有效范围内
    if (gridX >= 0 && gridX < divisions && gridZ >= 0 && gridZ < divisions) {
      // 计算位置
      const xPos = start + gridX * tileSize;
      const zPos = start + gridZ * tileSize;
      const position: [number, number, number] = [xPos, height, zPos];
      
      // 调用回调
      onTileRightClick(position, [gridX, gridZ]);
    }
  };
  
  // 处理整个平面的中键点击
  const handlePlaneMiddleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    
    if (!onTileMiddleClick || event.button !== 1) return;
    
    // 获取点击的世界坐标
    const point = event.point;
    
    // 计算网格坐标
    const gridX = Math.floor((point.x - start + gridSize/2) / tileSize);
    const gridZ = Math.floor((point.z - start + gridSize/2) / tileSize);
    
    // 确保坐标在有效范围内
    if (gridX >= 0 && gridX < divisions && gridZ >= 0 && gridZ < divisions) {
      // 计算位置
      const xPos = start + gridX * tileSize;
      const zPos = start + gridZ * tileSize;
      const position: [number, number, number] = [xPos, height, zPos];
      
      // 调用回调
      onTileMiddleClick(position, [gridX, gridZ]);
    }
  };
  
  // 创建网格 - 确保网格是水平排列的（x-z平面）
  for (let x = 0; x < divisions; x++) {
    for (let z = 0; z < divisions; z++) {
      // 计算当前网格的位置
      const xPos = start + x * tileSize;
      const zPos = start + z * tileSize;
      // 使用 [x, height, z] 确保网格在 x-z 平面上水平排列
      const position: [number, number, number] = [xPos, height, zPos];
      
      // 获取网格状态
      const status = tileStatus.get(coordsToKey(x, z)) || ('default' as TileStatus);
      
      // 根据状态选择颜色
      let color = COLORS.base;
      switch (status) {
        case 'start':
          color = COLORS.start;
          break;
        case 'end':
          color = COLORS.end;
          break;
        case 'path':
          // 路径格子使用基础颜色
          color = COLORS.base;
          break;
        case 'obstacle':
          color = COLORS.obstacle;
          break;
        default:
          color = COLORS.base;
      }
      
      tiles.push(
        <Tile 
          key={`tile-${x}-${z}`}
          position={position}
          size={tileSize * 0.98} // 稍微缩小一点，形成网格间隙
          color={color}
          hoverColor={COLORS.hover}
          status={status}
          onClick={() => {
            if (onTileClick) {
              onTileClick(position, [x, z]);
            }
          }}
          onRightClick={() => {
            if (onTileRightClick) {
              onTileRightClick(position, [x, z]);
            }
          }}
          onMiddleClick={() => {
            if (onTileMiddleClick) {
              onTileMiddleClick(position, [x, z]);
            }
          }}
        />
      );
    }
  }
  
  return (
    <>
      {/* 不可见的平面，用于接收整个网格区域的点击事件 */}
      <Plane 
        args={[gridSize, gridSize]} 
        position={[0, height, 0]} 
        rotation={[-Math.PI / 2, 0, 0]}
        visible={false}
        onClick={handlePlaneClick}
        onContextMenu={handlePlaneRightClick}
        onPointerDown={handlePlaneMiddleClick}
      />
      {/* 可见的瓦片 */}
      {tiles}
    </>
  );
}

// 使用memo包装PathfindingGrid组件，避免不必要的重新渲染
export const MemoizedPathfindingGrid = memo(PathfindingGrid);
export { MemoizedPathfindingGrid as PathfindingGrid }; 