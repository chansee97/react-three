import * as THREE from 'three';
import { Renderer } from '../interfaces';

export class WebGLRendererAdapter implements Renderer {
  private renderer: THREE.WebGLRenderer;

  constructor(options?: THREE.WebGLRendererParameters) {
    this.renderer = new THREE.WebGLRenderer(options || { antialias: true });
    
    // 设置基本的渲染器选项
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
  }

  setSize(width: number, height: number): void {
    this.renderer.setSize(width, height);
  }

  setPixelRatio(ratio: number): void {
    this.renderer.setPixelRatio(ratio);
  }

  getDomElement(): HTMLCanvasElement {
    return this.renderer.domElement;
  }

  render(scene: THREE.Scene, camera: THREE.Camera): void {
    if (scene && camera) {
      this.renderer.render(scene, camera);
    }
  }

  dispose(): void {
    try {
      // 强制释放渲染器相关资源
      this.renderer.forceContextLoss();
      this.renderer.dispose();
      
      // 移除DOM元素
      const canvas = this.renderer.domElement;
      if (canvas.parentElement) {
        canvas.parentElement.removeChild(canvas);
      }
      
      // 清除其他可能的引用
      const gl = this.renderer.getContext();
      if (gl && typeof gl.getExtension === 'function') {
        // 尝试释放WebGL扩展资源
        const loseContext = gl.getExtension('WEBGL_lose_context');
        if (loseContext) {
          loseContext.loseContext();
        }
      }
    } catch (error) {
      console.error('Error disposing WebGL renderer:', error);
    }
  }
} 