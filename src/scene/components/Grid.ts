import * as THREE from 'three';
import { COLORS, GRID } from '../constants';
import { gridToWorldPosition } from '../utils/gridUtils';

/**
 * 网格管理类
 */
export class Grid {
  // 网格尺寸
  private gridWidth: number;
  private gridHeight: number;
  private cellSizeX: number;
  private cellSizeZ: number;
  private divisionsX: number;
  private divisionsZ: number;
  
  // 网格元素
  private tiles: THREE.Mesh[] = [];
  private gridHelper: THREE.GridHelper | null = null;
  
  // 是否显示网格辅助线
  private showGridHelper: boolean = false; // 默认不显示网格线
  
  constructor(gridWidth: number, gridHeight: number, cellSize: number) {
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    
    // 计算网格划分
    this.divisionsX = Math.round(gridWidth / cellSize);
    this.divisionsZ = Math.round(gridHeight / cellSize);
    
    // 计算单元格大小
    this.cellSizeX = gridWidth / this.divisionsX;
    this.cellSizeZ = gridHeight / this.divisionsZ;
  }
  
  /**
   * 创建网格并添加到场景
   */
  createGrid(scene: THREE.Scene): void {
    // 清除现有瓦片
    this.tiles.forEach(tile => scene.remove(tile));
    this.tiles = [];
    
    // 添加网格辅助器
    this.createGridHelper(scene);
    
    // 创建瓦片
    this.createTiles(scene);
  }
  
  /**
   * 创建网格辅助器
   */
  private createGridHelper(scene: THREE.Scene): void {
    // 移除旧的辅助器
    if (this.gridHelper) {
      scene.remove(this.gridHelper);
      this.gridHelper = null;
    }
    
    // 如果不显示辅助器，直接返回
    if (!this.showGridHelper) {
      return;
    }
    
    // 创建新的辅助器
    this.gridHelper = new THREE.GridHelper(
      Math.max(this.gridWidth, this.gridHeight), 
      Math.max(this.divisionsX, this.divisionsZ),
      0x444444, // 主线颜色
      0x888888  // 次线颜色
    );
    this.gridHelper.position.y = 0.01; // 稍微抬高以避免z-fighting
    
    // 确保网格线可见
    this.gridHelper.visible = true;
    
    // 添加到场景
    scene.add(this.gridHelper);
  }
  
  /**
   * 切换网格辅助器显示
   */
  toggleGridHelper(scene: THREE.Scene): void {    
    // 切换状态
    this.showGridHelper = !this.showGridHelper;
    
    // 重新创建辅助器
    this.createGridHelper(scene);
  }
  
  /**
   * 检查网格辅助器是否可见
   */
  isGridHelperVisible(): boolean {
    return this.showGridHelper;
  }
  
  /**
   * 创建瓦片
   */
  private createTiles(scene: THREE.Scene): void {
    // 为每个网格位置创建一个瓦片
    for (let x = 0; x < this.divisionsX; x++) {
      for (let z = 0; z < this.divisionsZ; z++) {
        const geometry = new THREE.PlaneGeometry(
          this.cellSizeX * GRID.tileScale, 
          this.cellSizeZ * GRID.tileScale
        );
        const material = new THREE.MeshStandardMaterial({ 
          color: "#444444", // 默认颜色
          transparent: true,
          opacity: 0.0,
          visible: false
        });
        
        const tile = new THREE.Mesh(geometry, material);
        tile.rotation.x = -Math.PI / 2;
        
        // 计算位置
        const worldPos = this.gridToWorld(x, z, 0);
        tile.position.set(worldPos[0], worldPos[1], worldPos[2]);
        
        // 存储网格坐标
        tile.userData = { gridX: x, gridZ: z };
        
        // 添加到场景
        scene.add(tile);
        this.tiles.push(tile);
      }
    }
  }
  
  /**
   * 更新瓦片颜色
   */
  updateTileColors(tileStatus: Map<string, string>): void {
    this.tiles.forEach(tile => {
      const { gridX, gridZ } = tile.userData;
      const key = `${gridX},${gridZ}`;
      const status = tileStatus.get(key);
      
      // 根据状态设置颜色
      switch (status) {
        case 'start':
          (tile.material as THREE.MeshStandardMaterial).color.set(COLORS.start);
          (tile.material as THREE.MeshStandardMaterial).opacity = 1.0;
          (tile.material as THREE.MeshStandardMaterial).visible = true;
          break;
        case 'end':
          (tile.material as THREE.MeshStandardMaterial).color.set(COLORS.end);
          (tile.material as THREE.MeshStandardMaterial).opacity = 1.0;
          (tile.material as THREE.MeshStandardMaterial).visible = true;
          break;
        case 'obstacle':
          (tile.material as THREE.MeshStandardMaterial).color.set(COLORS.obstacle);
          (tile.material as THREE.MeshStandardMaterial).opacity = 1.0;
          (tile.material as THREE.MeshStandardMaterial).visible = true;
          break;
        default:
          // 普通方格不渲染
          (tile.material as THREE.MeshStandardMaterial).opacity = 0.0;
          (tile.material as THREE.MeshStandardMaterial).visible = false;
      }
    });
  }
  
  /**
   * 将网格坐标转换为世界坐标
   */
  gridToWorld(gridX: number, gridZ: number, height: number = 0): [number, number, number] {
    return gridToWorldPosition(
      gridX, gridZ, height, 
      this.gridWidth, this.gridHeight, 
      this.cellSizeX, this.cellSizeZ
    );
  }
  
  /**
   * 获取所有瓦片
   */
  getTiles(): THREE.Mesh[] {
    return this.tiles;
  }
  
  /**
   * 获取网格尺寸和划分信息
   */
  getGridInfo(): { 
    width: number, 
    height: number, 
    divisionsX: number, 
    divisionsZ: number,
    cellSizeX: number,
    cellSizeZ: number
  } {
    return {
      width: this.gridWidth,
      height: this.gridHeight,
      divisionsX: this.divisionsX,
      divisionsZ: this.divisionsZ,
      cellSizeX: this.cellSizeX,
      cellSizeZ: this.cellSizeZ
    };
  }
  
  /**
   * 清理资源
   */
  dispose(scene: THREE.Scene): void {
    // 移除瓦片
    this.tiles.forEach(tile => {
      scene.remove(tile);
      if (tile.geometry) tile.geometry.dispose();
      if (tile.material) {
        if (Array.isArray(tile.material)) {
          tile.material.forEach(mat => mat.dispose());
        } else {
          (tile.material as THREE.Material).dispose();
        }
      }
    });
    this.tiles = [];
    
    // 移除辅助器
    if (this.gridHelper) {
      scene.remove(this.gridHelper);
      this.gridHelper = null;
    }
  }
} 