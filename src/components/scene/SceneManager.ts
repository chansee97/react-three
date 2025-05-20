import * as THREE from 'three';
import type { SceneConfig, SceneAPI, TileStatus } from './types';
import { findPath, coordsToKey } from './utils/pathfinding';
import { calculateObjectGridPositions, gridToWorldPosition, worldToGridPosition } from './utils/gridUtils';

/**
 * 场景管理器 - 负责管理场景状态和提供API
 */
export class SceneManager implements SceneAPI {
  private config: Required<SceneConfig>;
  private tileStatus: Map<string, TileStatus> = new Map();
  private startTile: [number, number] | null = null;
  private endTile: [number, number] | null = null;
  private obstacles: [number, number][] = [];
  private customComponents: THREE.Object3D[] = [];
  private path: [number, number][] = [];
  private isInitializedState: boolean = false;
  
  constructor(initialConfig?: Partial<SceneConfig>) {
    // 默认配置
    this.config = {
      gridSize: 20,
      divisions: 20,
      baseColor: "#444444",
      startColor: "#ff0000",
      endColor: "#ffff00",
      pathColor: "#ff69b4",
      obstacleColor: "#222222",
      hoverColor: "#00aaff",
      groundSize: [20, 20],
      groundPosition: [0, -0.1, 0],
      ...(initialConfig || {})
    };
  }
  
  // 获取配置
  getConfig = (): SceneConfig => {
    return { ...this.config };
  };
  
  // 更新配置
  updateConfig = (newConfig: Partial<SceneConfig>): void => {
    this.config = { ...this.config, ...newConfig };
  };
  
  // 设置起点
  setStartPoint = (x: number, y: number): void => {
    // 如果有旧的起点，移除它
    if (this.startTile) {
      const oldKey = coordsToKey(this.startTile[0], this.startTile[1]);
      this.tileStatus.delete(oldKey);
    }
    
    // 设置新的起点
    this.startTile = [x, y];
    this.tileStatus.set(coordsToKey(x, y), 'start');
    
    // 如果有终点，重新计算路径
    if (this.endTile) {
      this.calculatePath();
    }
  };
  
  // 设置终点
  setEndPoint = (x: number, y: number): void => {
    // 如果有旧的终点，移除它
    if (this.endTile) {
      const oldKey = coordsToKey(this.endTile[0], this.endTile[1]);
      this.tileStatus.delete(oldKey);
    }
    
    // 设置新的终点
    this.endTile = [x, y];
    this.tileStatus.set(coordsToKey(x, y), 'end');
    
    // 如果有起点，重新计算路径
    if (this.startTile) {
      this.calculatePath();
    }
  };
  
  // 添加障碍物
  addObstacle = (x: number, y: number): void => {
    // 检查是否已经是障碍物
    const key = coordsToKey(x, y);
    if (this.tileStatus.get(key) === 'obstacle') {
      return;
    }
    
    // 检查是否是起点或终点
    if (
      (this.startTile && this.startTile[0] === x && this.startTile[1] === y) ||
      (this.endTile && this.endTile[0] === x && this.endTile[1] === y)
    ) {
      return;
    }
    
    // 添加障碍物
    this.obstacles.push([x, y]);
    this.tileStatus.set(key, 'obstacle');
    
    // 重新计算路径
    if (this.startTile && this.endTile) {
      this.calculatePath();
    }
  };
  
  // 移除障碍物
  removeObstacle = (x: number, y: number): void => {
    // 检查是否是障碍物
    const key = coordsToKey(x, y);
    if (this.tileStatus.get(key) !== 'obstacle') {
      return;
    }
    
    // 移除障碍物
    this.obstacles = this.obstacles.filter(([ox, oy]) => !(ox === x && oy === y));
    this.tileStatus.delete(key);
    
    // 重新计算路径
    if (this.startTile && this.endTile) {
      this.calculatePath();
    }
  };
  
  // 切换障碍物状态
  toggleObstacle = (x: number, y: number): void => {
    const key = coordsToKey(x, y);
    if (this.tileStatus.get(key) === 'obstacle') {
      this.removeObstacle(x, y);
    } else {
      this.addObstacle(x, y);
    }
  };
  
  // 计算路径
  calculatePath = (): void => {
    if (!this.startTile || !this.endTile) {
      this.path = [];
      return;
    }
    
    const [startX, startY] = this.startTile;
    const [endX, endY] = this.endTile;
    
    // 计算路径
    const newPath = findPath(
      startX, startY, 
      endX, endY, 
      this.config.divisions, this.config.divisions, 
      this.obstacles
    );
    
    // 更新路径
    this.path = newPath;
    
    // 清除旧路径状态
    this.clearPath();
    
    // 将路径点标记为'path'状态 - 这样它们在Tile组件中会被设置为透明
    // 同时路径也会通过PathLine组件显示为红色线条
    newPath.forEach(([x, y]) => {
      // 跳过起点和终点，保持它们的原始状态
      if ((x === startX && y === startY) || (x === endX && y === endY)) {
        return;
      }
      this.tileStatus.set(coordsToKey(x, y), 'path');
    });
  };
  
  // 清除路径
  clearPath = (): void => {
    // 清空路径数组
    this.path = [];
    
    // 移除所有路径瓦片状态
    for (const [key, status] of this.tileStatus.entries()) {
      if (status === 'path') {
        this.tileStatus.delete(key);
      }
    }
  };
  
  // 清除所有（路径和障碍物）
  clearAll = (): void => {
    this.tileStatus = new Map();
    this.obstacles = [];
    this.endTile = null;
    this.path = [];
    
    // 保留起点
    if (this.startTile) {
      this.tileStatus.set(coordsToKey(this.startTile[0], this.startTile[1]), 'start');
    }
  };
  
  // 添加自定义组件
  addCustomComponent = (component: THREE.Object3D, addAsObstacle: boolean = true): void => {
    this.customComponents.push(component);
    
    // 如果需要将组件添加为障碍物
    if (addAsObstacle && component instanceof THREE.Mesh) {
      // 计算组件覆盖的网格坐标
      const gridPositions = this.calculateObjectGridPositions(component);
      
      // 添加障碍物
      gridPositions.forEach(([x, y]) => {
        this.addObstacle(x, y);
      });
      
      // 将组件与其网格坐标关联起来（存储在组件的userData中）
      component.userData = {
        ...component.userData,
        gridPositions
      };
    }
  };
  
  // 移除自定义组件
  removeCustomComponent = (component: THREE.Object3D, removeObstacles: boolean = true): void => {
    // 如果需要移除组件对应的障碍物
    if (removeObstacles && component.userData && component.userData.gridPositions) {
      // 获取组件关联的网格坐标
      const gridPositions = component.userData.gridPositions as [number, number][];
      
      // 移除障碍物
      gridPositions.forEach(([x, y]) => {
        this.removeObstacle(x, y);
      });
    }
    
    // 从自定义组件列表中移除组件
    const index = this.customComponents.indexOf(component);
    if (index !== -1) {
      this.customComponents.splice(index, 1);
    }
  };
  
  // 计算物体覆盖的网格坐标
  calculateObjectGridPositions = (object: THREE.Mesh): [number, number][] => {
    return calculateObjectGridPositions(object, this.config);
  };
  
  // 获取自定义组件列表
  getCustomComponents = (): THREE.Object3D[] => {
    return [...this.customComponents];
  };
  
  // 获取路径
  getPath = (): [number, number][] => {
    return [...this.path];
  };
  
  // 获取瓦片状态
  getTileStatus = (x: number, y: number): TileStatus | undefined => {
    return this.tileStatus.get(coordsToKey(x, y));
  };
  
  // 获取所有瓦片状态
  getAllTileStatus = (): Map<string, TileStatus> => {
    return new Map(this.tileStatus);
  };
  
  // 获取路径点
  getPathPoints = (): [number, number][] => {
    return [...this.path];
  };
  
  // 获取起点和终点
  getStartAndEndPoints = (): { start: [number, number] | null, end: [number, number] | null } => {
    return {
      start: this.startTile,
      end: this.endTile
    };
  };
  
  // 获取起点
  getStartPoint = (): [number, number] | null => {
    return this.startTile ? [...this.startTile] : null;
  };
  
  // 获取终点
  getEndPoint = (): [number, number] | null => {
    return this.endTile ? [...this.endTile] : null;
  };
  
  // 获取障碍物列表
  getObstacles = (): [number, number][] => {
    return [...this.obstacles];
  };
  
  // 将网格坐标转换为世界坐标
  gridToWorldPosition = (gridX: number, gridY: number, height: number = 0): [number, number, number] => {
    return gridToWorldPosition(gridX, gridY, height, this.config);
  };
  
  // 将世界坐标转换为网格坐标
  worldToGridPosition = (x: number, z: number): [number, number] => {
    return worldToGridPosition(x, z, this.config);
  };
  
  // 检查是否已初始化
  isInitialized = (): boolean => {
    return this.isInitializedState && this.startTile !== null;
  };
  
  // 设置初始化状态
  setInitialized(value: boolean): void {
    this.isInitializedState = value;
  }
  
  // 初始化随机起点
  initializeRandomStart(): void {
    const { divisions } = this.config;
    
    // 随机选择起点
    const randomX = Math.floor(Math.random() * divisions);
    const randomY = Math.floor(Math.random() * divisions);
    
    // 设置起点
    this.setStartPoint(randomX, randomY);
  }
}
