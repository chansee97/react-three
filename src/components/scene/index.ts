// 导出主要组件
export { ThreeScene } from './ThreeScene';

// 导出类型
export type { SceneConfig, SceneAPI, TileStatus } from './types';

// 导出辅助组件
export { GridsHelper } from './helpers/GridsHelper';
export { Tile } from './helpers/Tile';
export { Lights } from './helpers/Lights';
export { Ground } from './helpers/Ground';
export { AxesHelper } from './helpers/AxesHelper';
export { PathLine } from './helpers/PathLine';

// 导出UI组件
export { ControlPanel } from './ui';

// 导出工具函数
export { coordsToKey, keyToCoords, findPath } from './utils/pathfinding';
export { gridToWorldPosition, worldToGridPosition, calculateObjectGridPositions } from './utils/gridUtils';

// 导出状态管理
export { useSceneStore } from './store';
