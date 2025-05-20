import * as THREE from 'three';
import { SceneManager } from '../SceneManager';

/**
 * 创建一个新的场景管理器
 * @param initialConfig 初始配置
 * @returns 场景管理器实例
 */
export const createSceneManager = (initialConfig?: any) => {
  return new SceneManager(initialConfig);
};

/**
 * 创建一个立方体组件
 * @param position 位置
 * @param size 尺寸
 * @param color 颜色
 * @returns THREE.Mesh对象
 */
export const createBox = (
  position: [number, number, number] = [0, 0, 0],
  size: [number, number, number] = [1, 1, 1],
  color: string = '#ff0000'
): THREE.Mesh => {
  const geometry = new THREE.BoxGeometry(size[0], size[1], size[2]);
  const material = new THREE.MeshStandardMaterial({ color });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(position[0], position[1], position[2]);
  mesh.userData.type = 'box';
  mesh.userData.size = [...size];
  return mesh;
};

/**
 * 创建一个球体组件
 * @param position 位置
 * @param radius 半径
 * @param color 颜色
 * @returns THREE.Mesh对象
 */
export const createSphere = (
  position: [number, number, number] = [0, 0, 0],
  radius: number = 0.5,
  color: string = '#00ff00'
): THREE.Mesh => {
  const geometry = new THREE.SphereGeometry(radius, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(position[0], position[1], position[2]);
  mesh.userData.type = 'sphere';
  mesh.userData.radius = radius;
  return mesh;
};

/**
 * 创建一个圆柱体组件
 * @param position 位置
 * @param radius 半径
 * @param height 高度
 * @param color 颜色
 * @returns THREE.Mesh对象
 */
export const createCylinder = (
  position: [number, number, number] = [0, 0, 0],
  radius: number = 0.5,
  height: number = 1,
  color: string = '#0000ff'
): THREE.Mesh => {
  const geometry = new THREE.CylinderGeometry(radius, radius, height, 32);
  const material = new THREE.MeshStandardMaterial({ color });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(position[0], position[1], position[2]);
  mesh.userData.type = 'cylinder';
  mesh.userData.radius = radius;
  mesh.userData.height = height;
  return mesh;
};
