import React, { memo } from 'react';
import { Tile } from './Tile';
import type { SceneConfig, TileStatus } from '../types';
import { coordsToKey } from '../utils/pathfinding';

interface GridProps {
  config: SceneConfig;
  tileStatus: Map<string, TileStatus>;
  height?: number;
  onTileLeftClick?: (position: [number, number, number], gridCoords: [number, number]) => void;
  onTileRightClick?: (x: number, z: number) => void;
  onTileMiddleClick?: (x: number, z: number) => void;
}

/**
 * 网格组件 - 渲染整个网格和瓦片
 */
function Grid({ 
  config,
  tileStatus,
  height = 0.01,
  onTileLeftClick,
  onTileRightClick,
  onTileMiddleClick
}: GridProps) {
  const { gridSize, divisions, baseColor, hoverColor } = config;
  const tileSize = gridSize / divisions;
  
  // 渲染网格
  const tiles = [];
  
  // 计算网格的起始坐标（使网格中心与坐标原点对齐）
  const start = -gridSize / 2 + tileSize / 2;
  
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
      
      tiles.push(
        <Tile 
          key={`tile-${x}-${z}`}
          position={position}
          size={tileSize * 0.98} // 稍微缩小一点，形成网格间隙
          color={baseColor}
          hoverColor={hoverColor}
          status={status}
          onClick={() => {
            if (onTileLeftClick) {
              onTileLeftClick(position, [x, z]);
            }
          }}
          onRightClick={() => {
            if (onTileRightClick) {
              onTileRightClick(x, z);
            }
          }}
          onMiddleClick={() => {
            if (onTileMiddleClick) {
              onTileMiddleClick(x, z);
            }
          }}
        />
      );
    }
  }
  
  return <>{tiles}</>;
}

// 使用memo包装Grid组件，避免不必要的重新渲染
export const MemoizedGrid = memo(Grid);
export { MemoizedGrid as Grid };
