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
  private animationId: number | null = null;
  
  // FPS计算相关
  private frameCount = 0;
  private lastFpsUpdateTime = 0;
  private currentFps = 0;
  private fpsCallback: ((fps: number) => void) | null = null;
  
  // Helper对象
  private axesHelper: THREE.AxesHelper;
  private gridHelper: THREE.GridHelper | null = null;
  private polarGridHelper: THREE.PolarGridHelper | null = null;
  private directionalLight: THREE.DirectionalLight;
  private directionalLightHelper: THREE.DirectionalLightHelper | null = null;
  private cameraHelper: THREE.CameraHelper | null = null;

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

    // 添加环境光和方向光
    const ambientLight = this.objectFactory.createLight('ambient');
    this.scene.add(ambientLight);

    this.directionalLight = this.objectFactory.createLight('directional', {
      position: { x: 1, y: 1, z: 1 }
    }) as THREE.DirectionalLight;
    this.scene.add(this.directionalLight);

    // 添加坐标轴辅助（默认显示）
    this.axesHelper = this.objectFactory.createAxesHelper();
    this.scene.add(this.axesHelper);

    // 开始动画循环
    this.animate();

    // 处理窗口大小变化
    window.addEventListener('resize', this.handleResize);
  }

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);

    // 更新控制器
    this.controls.update();

    // 更新灯光助手（如果存在）
    if (this.directionalLightHelper) {
      this.directionalLightHelper.update();
    }

    // 更新相机助手（如果存在）
    if (this.cameraHelper) {
      this.cameraHelper.update();
    }

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
  
  // 重置场景方法
  public resetScene(): void {
    console.log('重置相机位置和控制器');
    
    // 销毁旧的控制器
    this.controls.dispose();
    
    // 重置相机位置
    this.camera.position.set(0, 0, 3);
    this.camera.lookAt(0, 0, 0);
    this.camera.updateProjectionMatrix();
    
    // 重新创建控制器
    const domElement = this.renderer.getDomElement();
    this.controls = new OrbitControlsAdapter(this.camera, domElement);
    this.controls.setEnableDamping(true);
    
    console.log('相机位置已重置:', this.camera.position);
  }
  
  // 注册FPS回调
  public onFpsUpdate(callback: (fps: number) => void): void {
    this.fpsCallback = callback;
  }
  
  // 获取当前FPS
  public getFps(): number {
    return this.currentFps;
  }

  // 控制坐标轴辅助显示
  public toggleAxesHelper(visible: boolean): void {
    this.axesHelper.visible = visible;
  }

  // 控制网格辅助显示
  public toggleGridHelper(visible: boolean): void {
    if (visible && !this.gridHelper) {
      this.gridHelper = this.objectFactory.createGridHelper();
      this.scene.add(this.gridHelper);
    } else if (!visible && this.gridHelper) {
      this.scene.remove(this.gridHelper);
      this.gridHelper = null;
    }
  }

  // 控制极坐标网格辅助显示
  public togglePolarGridHelper(visible: boolean): void {
    if (visible && !this.polarGridHelper) {
      this.polarGridHelper = this.objectFactory.createPolarGridHelper();
      this.scene.add(this.polarGridHelper);
    } else if (!visible && this.polarGridHelper) {
      this.scene.remove(this.polarGridHelper);
      this.polarGridHelper = null;
    }
  }

  // 控制方向光辅助显示
  public toggleDirectionalLightHelper(visible: boolean): void {
    if (visible && !this.directionalLightHelper) {
      this.directionalLightHelper = this.objectFactory.createDirectionalLightHelper(this.directionalLight);
      this.scene.add(this.directionalLightHelper);
    } else if (!visible && this.directionalLightHelper) {
      this.scene.remove(this.directionalLightHelper);
      this.directionalLightHelper = null;
    }
  }

  // 控制相机辅助显示
  public toggleCameraHelper(visible: boolean): void {
    if (visible && !this.cameraHelper) {
      // 创建一个辅助相机来展示
      const helperCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
      helperCamera.position.set(0, 0, 10);
      helperCamera.lookAt(0, 0, 0);
      
      this.cameraHelper = this.objectFactory.createCameraHelper(helperCamera);
      this.scene.add(this.cameraHelper);
    } else if (!visible && this.cameraHelper) {
      this.scene.remove(this.cameraHelper);
      this.cameraHelper = null;
    }
  }

  public dispose() {
    console.log('销毁Three.js场景');
    
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    window.removeEventListener('resize', this.handleResize);
    
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