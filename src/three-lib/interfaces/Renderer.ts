import * as THREE from 'three';

export interface Renderer {
  setSize(width: number, height: number): void;
  setPixelRatio(ratio: number): void;
  getDomElement(): HTMLCanvasElement;
  render(scene: THREE.Scene, camera: THREE.Camera): void;
  dispose(): void;
} 