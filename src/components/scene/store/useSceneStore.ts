import { create } from 'zustand';
import * as THREE from 'three';
import type { SceneConfig, TileStatus } from '../types';
import { findPath, coordsToKey } from '../utils/pathfinding';
import { calculateObjectGridPositions } from '../utils/gridUtils';

// 定义状态接口
interface SceneState {
  // 配置
  config: Required<SceneConfig>;
  
  // 状态数据
  tileStatus: Map<string, TileStatus>;
  startTile: [number, number] | null;
  endTile: [number, number] | null;
  obstacles: [number, number][];
  customComponents: THREE.Object3D[];
  path: [number, number][];
  isInitialized: boolean;
  
  // UI状态
  showLights: boolean;
  showAxes: boolean;
  showGrid: boolean;
  
  // 操作方法
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
  getPath: () => [number, number][];
  getTileStatus: (x: number, y: number) => TileStatus | undefined;
  setInitialized: (value: boolean) => void;
  initializeRandomStart: () => void;
  
  // UI操作
  toggleLights: () => void;
  toggleAxes: () => void;
  toggleGrid: () => void;
}

// 创建Zustand store
export const useSceneStore = create<SceneState>((set, get) => ({
  // 默认配置
  config: {
    groundSize: [20, 20],
  },
  
  // 初始状态
  tileStatus: new Map(),
  startTile: null,
  endTile: null,
  obstacles: [],
  customComponents: [],
  path: [],
  isInitialized: false,
  
  // UI状态
  showLights: false,
  showAxes: false,
  showGrid: false,
  
  // 更新配置
  updateConfig: (newConfig: Partial<SceneConfig>) => set((state) => ({
    config: { ...state.config, ...newConfig }
  })),
  
  // 设置起点
  setStartPoint: (x: number, y: number) => set((state) => {
    const newTileStatus = new Map(state.tileStatus);
    
    // 如果有旧的起点，移除它
    if (state.startTile) {
      const oldKey = coordsToKey(state.startTile[0], state.startTile[1]);
      newTileStatus.delete(oldKey);
    }
    
    // 设置新的起点
    newTileStatus.set(coordsToKey(x, y), 'start');
    
    const newState = {
      startTile: [x, y] as [number, number],
      tileStatus: newTileStatus
    };
    
    // 如果有终点，重新计算路径
    if (state.endTile) {
      setTimeout(() => get().calculatePath(), 0);
    }
    
    return newState;
  }),
  
  // 设置终点
  setEndPoint: (x: number, y: number) => set((state) => {
    const newTileStatus = new Map(state.tileStatus);
    
    // 如果有旧的终点，移除它
    if (state.endTile) {
      const oldKey = coordsToKey(state.endTile[0], state.endTile[1]);
      newTileStatus.delete(oldKey);
    }
    
    // 设置新的终点
    newTileStatus.set(coordsToKey(x, y), 'end');
    
    const newState = {
      endTile: [x, y] as [number, number],
      tileStatus: newTileStatus
    };
    
    // 如果有起点，重新计算路径
    if (state.startTile) {
      setTimeout(() => get().calculatePath(), 0);
    }
    
    return newState;
  }),
  
  // 添加障碍物
  addObstacle: (x: number, y: number) => set((state) => {
    // 检查是否已经是障碍物
    const key = coordsToKey(x, y);
    if (state.tileStatus.get(key) === 'obstacle') {
      return state;
    }
    
    // 检查是否是起点或终点
    if (
      (state.startTile && state.startTile[0] === x && state.startTile[1] === y) ||
      (state.endTile && state.endTile[0] === x && state.endTile[1] === y)
    ) {
      return state;
    }
    
    const newTileStatus = new Map(state.tileStatus);
    newTileStatus.set(key, 'obstacle');
    
    const newState = {
      obstacles: [...state.obstacles, [x, y] as [number, number]],
      tileStatus: newTileStatus
    };
    
    // 重新计算路径
    if (state.startTile && state.endTile) {
      setTimeout(() => get().calculatePath(), 0);
    }
    
    return newState;
  }),
  
  // 移除障碍物
  removeObstacle: (x: number, y: number) => set((state) => {
    // 检查是否是障碍物
    const key = coordsToKey(x, y);
    if (state.tileStatus.get(key) !== 'obstacle') {
      return state;
    }
    
    const newTileStatus = new Map(state.tileStatus);
    newTileStatus.delete(key);
    
    const newState = {
      obstacles: state.obstacles.filter(([ox, oy]) => !(ox === x && oy === y)),
      tileStatus: newTileStatus
    };
    
    // 重新计算路径
    if (state.startTile && state.endTile) {
      setTimeout(() => get().calculatePath(), 0);
    }
    
    return newState;
  }),
  
  // 切换障碍物状态
  toggleObstacle: (x: number, y: number) => {
    const key = coordsToKey(x, y);
    const state = get();
    if (state.tileStatus.get(key) === 'obstacle') {
      state.removeObstacle(x, y);
    } else {
      state.addObstacle(x, y);
    }
  },
  
  // 计算路径
  calculatePath: () => set((state) => {
    if (!state.startTile || !state.endTile) {
      return { path: [] };
    }
    
    const [startX, startY] = state.startTile;
    const [endX, endY] = state.endTile;
    
    // 使用groundSize[0]作为网格大小
    const gridSize = state.config.groundSize[0];
    
    // 计算路径
    const newPath = findPath(
      startX, startY, 
      endX, endY, 
      gridSize, gridSize, 
      state.obstacles
    );
    
    // 清除旧路径状态
    const newTileStatus = new Map(state.tileStatus);
    for (const [key, status] of newTileStatus.entries()) {
      if (status === 'path') {
        newTileStatus.delete(key);
      }
    }
    
    // 将路径点标记为'path'状态
    newPath.forEach(([x, y]) => {
      // 跳过起点和终点，保持它们的原始状态
      if ((x === startX && y === startY) || (x === endX && y === endY)) {
        return;
      }
      newTileStatus.set(coordsToKey(x, y), 'path');
    });
    
    return {
      path: newPath,
      tileStatus: newTileStatus
    };
  }),
  
  // 清除路径
  clearPath: () => set((state) => {
    // 清除路径状态
    const newTileStatus = new Map(state.tileStatus);
    for (const [key, status] of newTileStatus.entries()) {
      if (status === 'path') {
        newTileStatus.delete(key);
      }
    }
    
    return {
      path: [],
      tileStatus: newTileStatus
    };
  }),
  
  // 清除所有（路径和障碍物）
  clearAll: () => set((state) => {
    const newTileStatus = new Map();
    
    // 保留起点
    if (state.startTile) {
      newTileStatus.set(coordsToKey(state.startTile[0], state.startTile[1]), 'start');
    }
    
    return {
      tileStatus: newTileStatus,
      obstacles: [],
      endTile: null,
      path: []
    };
  }),
  
  // 添加自定义组件
  addCustomComponent: (component: THREE.Object3D, addAsObstacle = true) => set((state) => {
    const newComponents = [...state.customComponents, component];
    
    if (addAsObstacle && component instanceof THREE.Mesh) {
      // 计算组件覆盖的网格位置
      const gridPositions = calculateObjectGridPositions(component);
      
      // 将这些位置添加为障碍物
      const newObstacles = [...state.obstacles];
      const newTileStatus = new Map(state.tileStatus);
      
      gridPositions.forEach(([x, y]) => {
        // 检查是否已经是障碍物
        const key = coordsToKey(x, y);
        if (state.tileStatus.get(key) !== 'obstacle') {
          newObstacles.push([x, y]);
          newTileStatus.set(key, 'obstacle');
        }
      });
      
      // 重新计算路径
      if (state.startTile && state.endTile) {
        setTimeout(() => get().calculatePath(), 0);
      }
      
      return {
        customComponents: newComponents,
        obstacles: newObstacles,
        tileStatus: newTileStatus
      };
    }
    
    return { customComponents: newComponents };
  }),
  
  // 移除自定义组件
  removeCustomComponent: (component: THREE.Object3D, removeObstacles = true) => set((state) => {
    const newComponents = state.customComponents.filter(c => c !== component);
    
    if (removeObstacles && component instanceof THREE.Mesh) {
      // 计算组件覆盖的网格位置
      const gridPositions = calculateObjectGridPositions(component);
      
      // 将这些位置从障碍物中移除
      const newObstacles = state.obstacles.filter(([ox, oy]) => {
        return !gridPositions.some(([x, y]) => x === ox && y === oy);
      });
      
      // 更新瓦片状态
      const newTileStatus = new Map(state.tileStatus);
      gridPositions.forEach(([x, y]) => {
        const key = coordsToKey(x, y);
        if (newTileStatus.get(key) === 'obstacle') {
          newTileStatus.delete(key);
        }
      });
      
      // 重新计算路径
      if (state.startTile && state.endTile) {
        setTimeout(() => get().calculatePath(), 0);
      }
      
      return {
        customComponents: newComponents,
        obstacles: newObstacles,
        tileStatus: newTileStatus
      };
    }
    
    return { customComponents: newComponents };
  }),
  
  // 计算对象网格位置
  calculateObjectGridPositions: (object: THREE.Mesh): [number, number][] => {
    return calculateObjectGridPositions(object);
  },
  
  // 获取路径
  getPath: () => get().path,
  
  // 获取瓦片状态
  getTileStatus: (x: number, y: number) => {
    const key = coordsToKey(x, y);
    return get().tileStatus.get(key);
  },
  
  // 设置初始化状态
  setInitialized: (value: boolean) => set({ isInitialized: value }),
  
  // 初始化随机起点
  initializeRandomStart: () => {
    const state = get();
    // 使用groundSize[0]作为网格大小
    const gridSize = state.config.groundSize[0];
    const x = Math.floor(Math.random() * gridSize);
    const y = Math.floor(Math.random() * gridSize);
    state.setStartPoint(x, y);
  },
  
  // UI操作
  toggleLights: () => set((state) => ({ showLights: !state.showLights })),
  toggleAxes: () => set((state) => ({ showAxes: !state.showAxes })),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
})); 