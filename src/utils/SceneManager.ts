import * as THREE from 'three';
import { findPath } from './pathfinding';

// 场景配置接口
export interface SceneConfig {
  gridSize?: number;       // 网格总尺寸
  divisions?: number;      // 网格分割数量
  baseColor?: string;      // 基础颜色
  startColor?: string;     // 起点颜色
  endColor?: string;       // 终点颜色
  pathColor?: string;      // 路径颜色
  obstacleColor?: string;  // 障碍物颜色
  hoverColor?: string;     // 悬停颜色
  groundSize?: [number, number]; // 地面尺寸
  groundPosition?: [number, number, number]; // 地面位置
}

// 网格单元格的状态类型
type TileStatus = 'default' | 'start' | 'end' | 'path' | 'obstacle';

// 坐标转换为 key
const coordsToKey = (x: number, y: number): string => `${x},${y}`;

export class SceneManager {
  private config: Required<SceneConfig>;
  private tileStatus: Map<string, TileStatus> = new Map();
  private startTile: [number, number] | null = null;
  private endTile: [number, number] | null = null;
  private obstacles: [number, number][] = [];
  private customComponents: THREE.Object3D[] = [];
  private path: [number, number][] = [];
  private initialized: boolean = false;

  constructor(config: SceneConfig = {}) {
    // 设置默认配置
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
      groundPosition: [0, -0.1, 0]
    };
    
    try {
      // 应用用户自定义配置
      if (config) {
        if (config.gridSize !== undefined) this.config.gridSize = config.gridSize;
        if (config.divisions !== undefined) this.config.divisions = config.divisions;
        if (config.baseColor !== undefined) this.config.baseColor = config.baseColor;
        if (config.startColor !== undefined) this.config.startColor = config.startColor;
        if (config.endColor !== undefined) this.config.endColor = config.endColor;
        if (config.pathColor !== undefined) this.config.pathColor = config.pathColor;
        if (config.obstacleColor !== undefined) this.config.obstacleColor = config.obstacleColor;
        if (config.hoverColor !== undefined) this.config.hoverColor = config.hoverColor;
        if (config.groundSize !== undefined) this.config.groundSize = config.groundSize;
        if (config.groundPosition !== undefined) this.config.groundPosition = config.groundPosition;
      }

      // 初始化随机起点
      this.initializeRandomStart();
      
      // 标记为已初始化
      this.initialized = true;
    } catch (error) {
      console.error('SceneManager初始化失败:', error);
      this.initialized = false;
    }
  }

  // 初始化随机起点
  private initializeRandomStart(): void {
    try {
      const { divisions } = this.config;
      
      // 随机选择起点
      const randomX = Math.floor(Math.random() * divisions);
      const randomY = Math.floor(Math.random() * divisions);
      
      // 设置起点和初始状态
      this.startTile = [randomX, randomY];
      
      this.tileStatus.clear();
      this.tileStatus.set(coordsToKey(randomX, randomY), 'start');
      
      // 设置障碍物
      this.obstacles.forEach(([x, y]) => {
        this.tileStatus.set(coordsToKey(x, y), 'obstacle');
      });
    } catch (error) {
      console.error('初始化随机起点失败:', error);
      this.startTile = [0, 0]; // 使用默认起点
      this.tileStatus.set(coordsToKey(0, 0), 'start');
    }
  }

  // 获取配置
  getConfig(): Required<SceneConfig> {
    return { ...this.config };
  }

  // 更新配置
  updateConfig(newConfig: Partial<SceneConfig>): void {
    Object.assign(this.config, newConfig);
  }

  // 设置起点
  setStartPoint(x: number, y: number): void {
    // 如果点击的是终点或障碍物，则忽略
    if (
      (this.endTile && this.endTile[0] === x && this.endTile[1] === y) || 
      this.obstacles.some(([ox, oy]) => ox === x && oy === y)
    ) {
      return;
    }
    
    // 更新起点
    this.startTile = [x, y];
    
    // 更新状态
    this.tileStatus.forEach((status, key) => {
      if (status === 'start') {
        this.tileStatus.delete(key);
      }
    });
    
    this.tileStatus.set(coordsToKey(x, y), 'start');
    
    // 重新计算路径
    this.calculatePath();
  }

  // 设置终点
  setEndPoint(x: number, y: number): void {
    // 如果点击的是起点或障碍物，则忽略
    if (
      (this.startTile && this.startTile[0] === x && this.startTile[1] === y) || 
      this.obstacles.some(([ox, oy]) => ox === x && oy === y)
    ) {
      return;
    }
    
    // 更新终点
    this.endTile = [x, y];
    
    // 更新状态
    this.tileStatus.forEach((status, key) => {
      if (status === 'end') {
        this.tileStatus.delete(key);
      }
    });
    
    this.tileStatus.set(coordsToKey(x, y), 'end');
    
    // 重新计算路径
    this.calculatePath();
  }

  // 添加障碍物
  addObstacle(x: number, y: number): void {
    // 如果点击的是起点或终点，则忽略
    if (
      (this.startTile && this.startTile[0] === x && this.startTile[1] === y) || 
      (this.endTile && this.endTile[0] === x && this.endTile[1] === y)
    ) {
      return;
    }
    
    // 检查是否已经是障碍物
    const existingIndex = this.obstacles.findIndex(([ox, oy]) => ox === x && oy === y);
    if (existingIndex !== -1) {
      return; // 已经是障碍物
    }
    
    // 添加到障碍物列表
    this.obstacles.push([x, y]);
    
    // 更新状态
    this.tileStatus.set(coordsToKey(x, y), 'obstacle');
    
    // 重新计算路径
    this.calculatePath();
  }

  // 移除障碍物
  removeObstacle(x: number, y: number): void {
    const existingIndex = this.obstacles.findIndex(([ox, oy]) => ox === x && oy === y);
    if (existingIndex === -1) {
      return; // 不是障碍物
    }
    
    // 从障碍物列表中移除
    this.obstacles.splice(existingIndex, 1);
    
    // 更新状态
    this.tileStatus.delete(coordsToKey(x, y));
    
    // 重新计算路径
    this.calculatePath();
  }

  // 切换障碍物状态（添加/删除）
  toggleObstacle(x: number, y: number): void {
    const existingIndex = this.obstacles.findIndex(([ox, oy]) => ox === x && oy === y);
    if (existingIndex === -1) {
      this.addObstacle(x, y);
    } else {
      this.removeObstacle(x, y);
    }
  }

  // 计算路径
  calculatePath(): void {
    if (!this.startTile || !this.endTile) {
      this.path = [];
      return;
    }

    const [startX, startY] = this.startTile;
    const [endX, endY] = this.endTile;
    
    // 计算路径
    this.path = findPath(
      startX, startY, 
      endX, endY, 
      this.config.divisions, this.config.divisions, 
      this.obstacles
    );
    
    // 移除起点和终点，它们有自己的状态
    const pathWithoutEnds = this.path.filter(([x, y]) => {
      return (
        (x !== startX || y !== startY) && 
        (x !== endX || y !== endY)
      )
    });
    
    // 更新路径状态
    this.tileStatus.forEach((status, key) => {
      if (status === 'path') {
        this.tileStatus.delete(key);
      }
    });
    
    // 确保起点和终点仍然存在
    if (this.startTile) {
      this.tileStatus.set(coordsToKey(this.startTile[0], this.startTile[1]), 'start');
    }
    
    if (this.endTile) {
      this.tileStatus.set(coordsToKey(this.endTile[0], this.endTile[1]), 'end');
    }
    
    // 然后设置新路径
    pathWithoutEnds.forEach(([x, y]) => {
      this.tileStatus.set(coordsToKey(x, y), 'path');
    });
  }

  // 清除路径
  clearPath(): void {
    this.tileStatus.forEach((status, key) => {
      if (status === 'path') {
        this.tileStatus.delete(key);
      }
    });
    this.endTile = null;
    this.path = [];
  }

  // 清除所有（路径和障碍物）
  clearAll(): void {
    this.tileStatus.clear();
    this.obstacles = [];
    this.endTile = null;
    this.path = [];
    
    // 保留起点
    if (this.startTile) {
      this.tileStatus.set(coordsToKey(this.startTile[0], this.startTile[1]), 'start');
    } else {
      this.initializeRandomStart();
    }
  }

  // 添加自定义组件
  addCustomComponent(component: THREE.Object3D): void {
    this.customComponents.push(component);
  }

  // 移除自定义组件
  removeCustomComponent(component: THREE.Object3D): void {
    const index = this.customComponents.indexOf(component);
    if (index !== -1) {
      this.customComponents.splice(index, 1);
    }
  }

  // 获取所有自定义组件
  getCustomComponents(): THREE.Object3D[] {
    return [...this.customComponents];
  }

  // 获取当前路径
  getPath(): [number, number][] {
    return [...this.path];
  }

  // 获取网格状态
  getTileStatus(x: number, y: number): TileStatus | undefined {
    return this.tileStatus.get(coordsToKey(x, y));
  }

  // 获取所有网格状态
  getAllTileStatus(): Map<string, TileStatus> {
    return new Map(this.tileStatus);
  }

  // 获取起点
  getStartPoint(): [number, number] | null {
    return this.startTile ? [...this.startTile] : null;
  }

  // 获取终点
  getEndPoint(): [number, number] | null {
    return this.endTile ? [...this.endTile] : null;
  }

  // 获取所有障碍物
  getObstacles(): [number, number][] {
    return [...this.obstacles];
  }

  // 将网格坐标转换为世界坐标
  gridToWorldPosition(gridX: number, gridY: number, height: number = 0): [number, number, number] {
    const { gridSize, divisions } = this.config;
    const tileSize = gridSize / divisions;
    const start = -gridSize / 2 + tileSize / 2;
    
    const x = start + gridX * tileSize;
    const z = start + gridY * tileSize;
    
    return [x, height, z];
  }

  // 将世界坐标转换为网格坐标
  worldToGridPosition(x: number, z: number): [number, number] {
    const { gridSize, divisions } = this.config;
    const tileSize = gridSize / divisions;
    const start = -gridSize / 2 + tileSize / 2;
    
    const gridX = Math.round((x - start) / tileSize);
    const gridY = Math.round((z - start) / tileSize);
    
    return [gridX, gridY];
  }

  // 检查SceneManager是否已正确初始化
  isInitialized(): boolean {
    return this.initialized && this.startTile !== null;
  }
} 