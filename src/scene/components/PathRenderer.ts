import * as THREE from 'three';
import { COLORS } from '../constants';
import { Grid } from './Grid';

/**
 * 路径渲染器类
 */
export class PathRenderer {
  private pathLine: THREE.Line | null = null;
  private grid: Grid;
  
  constructor(grid: Grid) {
    this.grid = grid;
  }
  
  /**
   * 更新路径线
   */
  updatePathLine(path: [number, number][], scene: THREE.Scene): void {
    // 移除旧的路径线
    if (this.pathLine) {
      scene.remove(this.pathLine);
      this.pathLine = null;
    }
    
    // 如果没有路径，直接返回
    if (path.length === 0) {
      return;
    }
    
    // 创建路径点 - 将高度设为0
    const points = path.map(([x, z]) => {
      const [wx, wy, wz] = this.grid.gridToWorld(x, z, 0);
      return new THREE.Vector3(wx, wy, wz);
    });
    
    // 创建路径线
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ 
      color: COLORS.path,
      linewidth: 3 
    });
    this.pathLine = new THREE.Line(geometry, material);
    
    // 添加到场景
    scene.add(this.pathLine);
  }
  
  /**
   * 清理资源
   */
  dispose(scene: THREE.Scene): void {
    if (this.pathLine) {
      scene.remove(this.pathLine);
      if (this.pathLine.geometry) this.pathLine.geometry.dispose();
      if (this.pathLine.material) {
        if (Array.isArray(this.pathLine.material)) {
          this.pathLine.material.forEach(mat => mat.dispose());
        } else {
          (this.pathLine.material as THREE.Material).dispose();
        }
      }
      this.pathLine = null;
    }
  }
} 