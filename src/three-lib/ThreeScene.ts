import * as THREE from 'three';
import { Renderer, CameraControls, ObjectFactory } from './interfaces';
import { 
  WebGLRendererAdapter, 
  OrbitControlsAdapter, 
  ThreeObjectFactory 
} from './adapters';

export class ThreeScene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: Renderer;
  private controls: CameraControls;
  private objectFactory: ObjectFactory;
  private cube: THREE.Mesh;
  private animationId: number | null = null;
  
  // FPS计算相关
  private frameCount = 0;
  private lastFpsUpdateTime = 0;
  private currentFps = 0;
  private fpsCallback: ((fps: number) => void) | null = null;

  constructor(
    container: HTMLElement,
    rendererFactory?: () => Renderer,
    controlsFactory?: (camera: THREE.Camera, domElement: HTMLElement) => CameraControls,
    objectFactoryInstance?: ObjectFactory
  ) {
    // 创建场景
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x222222);

    // 创建相机
    this.camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.z = 3;

    // 创建渲染器（使用工厂或默认适配器）
    this.renderer = rendererFactory 
      ? rendererFactory() 
      : new WebGLRendererAdapter({ antialias: true });
    
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.getDomElement());

    // 添加轨道控制器（使用工厂或默认适配器）
    this.controls = controlsFactory
      ? controlsFactory(this.camera, this.renderer.getDomElement())
      : new OrbitControlsAdapter(this.camera, this.renderer.getDomElement());
    
    this.controls.setEnableDamping(true);

    // 创建对象工厂（使用提供的实例或创建新实例）
    this.objectFactory = objectFactoryInstance || new ThreeObjectFactory();

    // 创建一个简单的立方体
    this.cube = this.objectFactory.createCube();
    this.scene.add(this.cube);

    // 添加环境光和方向光
    const ambientLight = this.objectFactory.createLight('ambient');
    this.scene.add(ambientLight);

    const directionalLight = this.objectFactory.createLight('directional', {
      position: { x: 1, y: 1, z: 1 }
    });
    this.scene.add(directionalLight);

    // 添加坐标轴辅助
    const axesHelper = this.objectFactory.createAxesHelper();
    this.scene.add(axesHelper);

    // 开始动画循环
    this.animate();

    // 处理窗口大小变化
    window.addEventListener('resize', this.handleResize);
  }

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);

    // 旋转立方体
    if (this.cube) {
      this.cube.rotation.x += 0.01;
      this.cube.rotation.y += 0.01;
    }

    // 更新控制器
    this.controls.update();

    // 渲染场景
    this.renderer.render(this.scene, this.camera);
    
    // 计算FPS
    this.frameCount++;
    const now = performance.now();
    const elapsed = now - this.lastFpsUpdateTime;
    
    // 每秒更新一次FPS
    if (elapsed >= 1000) {
      this.currentFps = Math.round((this.frameCount * 1000) / elapsed);
      this.frameCount = 0;
      this.lastFpsUpdateTime = now;
      
      // 通过回调函数更新FPS
      if (this.fpsCallback) {
        this.fpsCallback(this.currentFps);
      }
    }
  };

  private handleResize = () => {
    const container = this.renderer.getDomElement().parentElement;
    if (!container) return;

    this.camera.aspect = container.clientWidth / container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(container.clientWidth, container.clientHeight);
  };

  // 更新立方体颜色的方法
  public updateCubeColor(color: number): void {
    if (this.cube && this.cube.material instanceof THREE.MeshStandardMaterial) {
      this.cube.material.color.set(color);
    }
  }
  
  // 重置场景方法
  public resetScene(): void {
    // 重置相机位置
    this.camera.position.set(0, 0, 3);
    this.camera.rotation.set(0, 0, 0);
    
    // 重置立方体
    if (this.cube) {
      this.cube.position.set(0, 0, 0);
      this.cube.rotation.set(0, 0, 0);
      this.cube.scale.set(1, 1, 1);
    }
  }
  
  // 注册FPS回调
  public onFpsUpdate(callback: (fps: number) => void): void {
    this.fpsCallback = callback;
  }
  
  // 获取当前FPS
  public getFps(): number {
    return this.currentFps;
  }

  public dispose() {
    console.log('销毁Three.js场景');
    
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    window.removeEventListener('resize', this.handleResize);
    
    // 清理立方体资源
    if (this.cube) {
      if (this.cube.geometry) this.cube.geometry.dispose();
      if (this.cube.material instanceof THREE.Material) {
        this.cube.material.dispose();
      } else if (Array.isArray(this.cube.material)) {
        this.cube.material.forEach(material => material.dispose());
      }
      this.scene.remove(this.cube);
    }
    
    // 清理场景中的所有对象
    while(this.scene.children.length > 0) { 
      const object = this.scene.children[0];
      this.scene.remove(object);
    }
    
    // 释放控制器和渲染器资源
    this.controls.dispose();
    this.renderer.dispose();
    
    // 清除FPS回调
    this.fpsCallback = null;
    
    console.log('Three.js场景已销毁');
  }
} 