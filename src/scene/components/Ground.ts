import * as THREE from 'three';
import { COLORS, MATERIALS } from '../constants';

/**
 * 地面渲染器类
 */
export class Ground {
  private ground: THREE.Mesh | null = null;
  
  /**
   * 创建地面
   */
  createGround(
    scene: THREE.Scene,
    width: number,
    depth: number,
    position: [number, number, number] = [0, -0.01, 0]
  ): void {
    // 移除旧的地面
    this.dispose(scene);
    
    // 创建新的地面
    const geometry = new THREE.PlaneGeometry(width, depth);
    const material = new THREE.MeshStandardMaterial({ 
      color: COLORS.ground,
      roughness: MATERIALS.groundRoughness,
      metalness: MATERIALS.groundMetalness,
      side: THREE.DoubleSide
    });
    
    this.ground = new THREE.Mesh(geometry, material);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.position.set(position[0], position[1], position[2]);
    this.ground.receiveShadow = true;
    
    scene.add(this.ground);
  }
  
  /**
   * 获取地面网格
   */
  getGround(): THREE.Mesh | null {
    return this.ground;
  }
  
  /**
   * 清理资源
   */
  dispose(scene: THREE.Scene): void {
    if (this.ground) {
      scene.remove(this.ground);
      if (this.ground.geometry) this.ground.geometry.dispose();
      if (this.ground.material) {
        if (Array.isArray(this.ground.material)) {
          this.ground.material.forEach(mat => mat.dispose());
        } else {
          (this.ground.material as THREE.Material).dispose();
        }
      }
      this.ground = null;
    }
  }
} 