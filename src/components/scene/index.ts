// 导出主要组件
export { IntegratedScene, getSceneAPIFromElement } from './IntegratedScene';
export { SceneManager } from './SceneManager';

// 导出类型
export type { SceneConfig, SceneAPI, TileStatus } from './types';

// 导出辅助组件
export { Grid } from './helpers/Grid';
export { Tile } from './helpers/Tile';
export { Lights } from './helpers/Lights';
export { Ground } from './helpers/Ground';
export { AxesHelper } from './helpers/AxesHelper';

// 导出工具函数
export { coordsToKey, keyToCoords, findPath } from './utils/pathfinding';
export { gridToWorldPosition, worldToGridPosition, calculateObjectGridPositions } from './utils/gridUtils';
