import { PathfindingGrid as PathfindingGridComponent } from './helpers/PathfindingGrid';
import type { TileStatus } from './types';

export interface PathfindingGridProps {
  gridSize?: number;
  divisions?: number;
  tileStatus?: Map<string, TileStatus>;
  onTileClick?: (position: [number, number, number], gridCoords: [number, number]) => void;
  onTileRightClick?: (position: [number, number, number], gridCoords: [number, number]) => void;
  onTileMiddleClick?: (position: [number, number, number], gridCoords: [number, number]) => void;
}

/**
 * 寻路网格组件 - 处理交互式瓦片网格
 */
export function PathfindingGrid(props: PathfindingGridProps) {
  return <PathfindingGridComponent {...props} />;
} 