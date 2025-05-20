import * as THREE from 'three';

// 场景配置接口
export interface SceneConfig {
  gridSize: number;
  divisions: number;
  baseColor: string;
  startColor?: string;
  endColor?: string;
  pathColor?: string;
  obstacleColor?: string;
  hoverColor?: string;
  groundSize?: [number, number];
  groundPosition?: [number, number, number];
}

// 网格状态类型
export type TileStatus = 'default' | 'start' | 'end' | 'path' | 'obstacle' | 'hover';

// 场景API接口
export interface SceneAPI {
  getConfig: () => SceneConfig;
  updateConfig: (newConfig: Partial<SceneConfig>) => void;
  setStartPoint: (x: number, y: number) => void;
  setEndPoint: (x: number, y: number) => void;
  addObstacle: (x: number, y: number) => void;
  removeObstacle: (x: number, y: number) => void;
  toggleObstacle: (x: number, y: number) => void;
  calculatePath: () => void;
  clearPath: () => void;
  clearAll: () => void;
  addCustomComponent: (component: THREE.Object3D, addAsObstacle?: boolean) => void;
  removeCustomComponent: (component: THREE.Object3D, removeObstacles?: boolean) => void;
  calculateObjectGridPositions: (object: THREE.Mesh) => [number, number][];
  getCustomComponents: () => THREE.Object3D[];
  getPath: () => [number, number][];
  getTileStatus: (x: number, y: number) => TileStatus | undefined;
  getAllTileStatus: () => Map<string, TileStatus>;
  getStartPoint: () => [number, number] | null;
  getEndPoint: () => [number, number] | null;
  getObstacles: () => [number, number][];
  gridToWorldPosition: (gridX: number, gridY: number, height?: number) => [number, number, number];
  worldToGridPosition: (x: number, z: number) => [number, number];
  isInitialized: () => boolean;
}
