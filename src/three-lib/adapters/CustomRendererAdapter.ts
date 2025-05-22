import * as THREE from 'three';
import { Renderer } from '../interfaces';

// 定义Stats接口
interface Stats {
  begin(): void;
  end(): void;
  dom: HTMLElement;
}

// 这是一个自定义渲染器的示例
// 它在标准WebGL渲染器的基础上添加了一些额外功能
export class CustomRendererAdapter implements Renderer {
  private renderer: THREE.WebGLRenderer;
  private stats?: Stats; // 性能监控
  
  constructor(options?: THREE.WebGLRendererParameters) {
    // 创建基础渲染器
    this.renderer = new THREE.WebGLRenderer(options || { 
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    
    // 设置更多高级选项
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    // 在生产环境中，可以按需加载stats.js
    // this.stats = new Stats();
    // document.body.appendChild(this.stats.dom);
  }

  setSize(width: number, height: number): void {
    this.renderer.setSize(width, height);
  }

  setPixelRatio(ratio: number): void {
    this.renderer.setPixelRatio(Math.min(ratio, 2)); // 限制像素比以提高性能
  }

  getDomElement(): HTMLCanvasElement {
    return this.renderer.domElement;
  }

  render(scene: THREE.Scene, camera: THREE.Camera): void {
    // 如果有性能监控，开始记录
    if (this.stats) this.stats.begin();
    
    // 执行渲染
    if (scene && camera) {
      this.renderer.render(scene, camera);
    }
    
    // 如果有性能监控，结束记录
    if (this.stats) this.stats.end();
  }

  dispose(): void {
    try {
      // 强制释放渲染器相关资源
      this.renderer.forceContextLoss();
      this.renderer.dispose();
      
      // 清理性能监控
      if (this.stats && this.stats.dom && this.stats.dom.parentNode) {
        this.stats.dom.parentNode.removeChild(this.stats.dom);
      }
      
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
      console.error('Error disposing CustomRenderer:', error);
    }
  }
} 