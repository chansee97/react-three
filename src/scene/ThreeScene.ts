import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { SceneConfig, SceneAPI, TileStatus } from './types';
import { findPath, coordsToKey } from './utils/pathfinding';
import { calculateObjectGridPositions, worldToGridPosition } from './utils/gridUtils';
import { Grid, Ground, PathRenderer } from './components';
import { COLORS, DEFAULT_CONFIG, GRID } from './constants';

export class ThreeScene implements SceneAPI {
  // Three.js核心对象
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private container: HTMLElement | null = null;
  
  // 场景状态
  private config: Required<SceneConfig>;
  private tileStatus: Map<string, TileStatus> = new Map();
  private startTile: [number, number] | null = null;
  private endTile: [number, number] | null = null;
  private obstacles: [number, number][] = [];
  private customComponents: THREE.Object3D[] = [];
  private path: [number, number][] = [];
  private isInitializedState: boolean = false;
  
  // 组件
  private grid: Grid;
  private ground: Ground;
  private pathRenderer: PathRenderer;
  
  // 鼠标交互
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private isControlsEnabled: boolean = true;
  
  // 辅助器
  private axesHelper: THREE.AxesHelper | null = null;
  private directionalLightHelper: THREE.DirectionalLightHelper | null = null;
  private directionalLight: THREE.DirectionalLight | null = null;
  
  // 显示设置
  private showAxes: boolean = false;
  private showLightHelper: boolean = false;
  
  /**
   * 构造函数
   */
  constructor(container: HTMLElement, initialConfig?: Partial<SceneConfig>) {
    this.container = container;
    
    // 初始化配置
    this.config = {
      ...DEFAULT_CONFIG,
      ...(initialConfig || {})
    };
    
    // 创建场景
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(COLORS.background);
    this.scene.fog = new THREE.Fog(COLORS.background, 8, 40);
    
    // 初始化相机
    this.camera = new THREE.PerspectiveCamera(
      60, 
      container.clientWidth / container.clientHeight, 
      0.1, 
      1000
    );
    this.camera.position.set(0, 10, 10);
    
    // 初始化渲染器
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    container.appendChild(this.renderer.domElement);
    
    // 初始化控制器
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 30;
    this.controls.maxPolarAngle = Math.PI / 2;
    
    // 初始化射线投射器和鼠标位置
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    // 初始化组件
    const [width, depth] = this.config.groundSize;
    this.grid = new Grid(width, depth, GRID.cellSize);
    this.ground = new Ground();
    this.pathRenderer = new PathRenderer(this.grid);
    
    // 使用箭头函数绑定
    window.addEventListener('resize', this.handleResize);
    
    // 添加鼠标事件监听器
    this.renderer.domElement.addEventListener('mousedown', this.handleMouseDown);
    
    // 添加键盘事件监听器 - 快捷键切换辅助器
    window.addEventListener('keydown', this.handleKeyDown);
    
    // 阻止右键菜单
    this.renderer.domElement.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });
    
    // 初始化场景
    this.initScene();
    
    // 开始渲染循环
    this.animate();
    
    // 初始化随机起点
    this.initializeRandomStart();
    
    // 标记为已初始化
    this.setInitialized(true);
    
    // 将API附加到DOM容器
    (container as unknown as { __sceneAPI: SceneAPI }).__sceneAPI = this;
    container.classList.add('scene-container');
    
    console.log('ThreeScene初始化完成，网格尺寸:', this.grid.getGridInfo());
  }
  
  /**
   * 初始化场景
   */
  private initScene(): void {
    // 清除现有对象
    this.clearScene();
    
    // 添加灯光
    this.addLights();
    
    // 添加地面
    this.ground.createGround(
      this.scene, 
      this.config.groundSize[0], 
      this.config.groundSize[1],
      this.config.groundPosition
    );
    
    // 添加网格
    this.grid.createGrid(this.scene);
    
    // 更新网格状态
    this.updateGridState();
    
    // 添加辅助器 - 使用创建新的方法来确保正确添加辅助器
    this.setupHelpers();
    
    // 首次强制渲染
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
  
  /**
   * 设置辅助器
   */
  private setupHelpers(): void {
    // 移除旧的辅助器
    this.removeHelpers();
    
    // 创建坐标轴辅助器
    if (this.showAxes) {
      this.axesHelper = new THREE.AxesHelper(10);
      this.axesHelper.position.set(0, 0.05, 0); // 稍微抬高以避免z-fighting
      this.axesHelper.visible = true; // 确保可见
      this.scene.add(this.axesHelper);
    }
    
    // 创建光源辅助器
    if (this.showLightHelper && this.directionalLight) {
      this.directionalLightHelper = new THREE.DirectionalLightHelper(this.directionalLight, 5);
      this.directionalLightHelper.visible = true; // 确保可见
      this.scene.add(this.directionalLightHelper);
    }
    
    // 检查网格辅助器状态
    this.grid.isGridHelperVisible();
  }
  
  /**
   * 更新辅助器显示
   */
  private updateHelpers(): void {
    // 调用设置方法确保辅助器正确更新
    this.setupHelpers();
    
    // 强制渲染一次，确保变化立即可见
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
  
  /**
   * 清除场景
   */
  private clearScene(): void {
    // 移除自定义组件
    this.customComponents.forEach(component => {
      this.scene.remove(component);
    });
    this.customComponents = [];
    
    // 清理组件
    this.grid.dispose(this.scene);
    this.ground.dispose(this.scene);
    this.pathRenderer.dispose(this.scene);
    
    // 清理辅助器
    this.removeHelpers();
  }
  
  /**
   * 添加灯光
   */
  private addLights(): void {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    // 方向光（模拟太阳光）
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    this.directionalLight.position.set(5, 10, 5);
    this.directionalLight.castShadow = true;
    
    // 设置阴影属性
    this.directionalLight.shadow.mapSize.width = 1024;
    this.directionalLight.shadow.mapSize.height = 1024;
    this.directionalLight.shadow.camera.near = 0.5;
    this.directionalLight.shadow.camera.far = 50;
    this.directionalLight.shadow.camera.left = -20;
    this.directionalLight.shadow.camera.right = 20;
    this.directionalLight.shadow.camera.top = 20;
    this.directionalLight.shadow.camera.bottom = -20;
    
    this.scene.add(this.directionalLight);
  }
  
  /**
   * 移除所有辅助器
   */
  private removeHelpers(): void {
    // 移除坐标轴辅助器
    if (this.axesHelper) {
      this.scene.remove(this.axesHelper);
      this.axesHelper = null;
    }
    
    // 移除方向光辅助器
    if (this.directionalLightHelper) {
      this.scene.remove(this.directionalLightHelper);
      this.directionalLightHelper = null;
    }
    
    // 注意：网格辅助器由Grid类自己管理，不在这里移除
  }
  
  /**
   * 切换坐标轴辅助器显示
   */
  toggleAxesHelper(): void {
    // 切换状态
    this.showAxes = !this.showAxes;
    
    // 立即更新场景中的辅助器
    this.updateHelpers();
    
    // 强制渲染一次，确保变化立即可见
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
  
  /**
   * 切换光线辅助器显示
   */
  toggleLightHelper(): void {
    // 切换状态
    this.showLightHelper = !this.showLightHelper;
    
    // 立即更新场景中的辅助器
    this.updateHelpers();
    
    // 强制渲染一次，确保变化立即可见
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
  
  /**
   * 切换网格显示
   */
  toggleGridHelper(): void {
    // 通过Grid组件的showGridHelper属性控制
    this.grid.toggleGridHelper(this.scene);
    
    // 强制渲染一次，确保变化立即可见
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
  
  /**
   * 获取辅助器显示状态
   */
  getHelperStatus(): { axesHelper: boolean, lightHelper: boolean, gridHelper: boolean } {
    return {
      axesHelper: this.showAxes,
      lightHelper: this.showLightHelper,
      gridHelper: this.grid.isGridHelperVisible()
    };
  }
  
  /**
   * 更新网格状态
   */
  private updateGridState(): void {
    // 将tileStatus转换为键值对Map以便Grid组件使用
    const statusMap = new Map<string, string>();
    this.tileStatus.forEach((status, key) => {
      statusMap.set(key, status);
    });
    
    // 更新瓦片颜色
    this.grid.updateTileColors(statusMap);
    
    // 更新路径线
    this.pathRenderer.updatePathLine(this.path, this.scene);
  }
  
  /**
   * 窗口大小改变事件处理
   */
  private handleResize = (): void => {
    if (!this.container || !this.camera || !this.renderer) return;
    
    // 更新相机
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    
    // 更新渲染器
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }
  
  /**
   * 动画循环
   */
  private animate = (): void => {
    requestAnimationFrame(this.animate);
    
    // 更新控制器
    if (this.controls) {
      this.controls.update();
    }
    
    // 确保辅助器可见性
    if (this.axesHelper) {
      this.axesHelper.visible = this.showAxes;
    }
    
    if (this.directionalLightHelper) {
      this.directionalLightHelper.visible = this.showLightHelper;
    }
    
    // 渲染场景，添加空值检查
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
  
  /**
   * 处理鼠标点击事件
   */
  private handleMouseDown = (event: MouseEvent): void => {
    // 如果点击的是控制面板元素，不处理此事件
    if ((event.target as HTMLElement).closest('.control-panel')) {
      return;
    }
    
    if (!this.renderer || !this.camera || !this.isControlsEnabled) return;
    
    // 计算鼠标在画布上的归一化坐标
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // 更新射线
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    // 检查与瓦片的交叉
    const intersects = this.raycaster.intersectObjects(this.grid.getTiles());
    
    if (intersects.length > 0) {
      const tile = intersects[0].object as THREE.Mesh;
      const { gridX, gridZ } = tile.userData;
      
      // 根据鼠标按键执行不同操作
      switch (event.button) {
        case 0: // 左键 - 设置起点
          this.setStartPoint(gridX, gridZ);
          break;
        case 2: // 右键 - 设置终点
          this.setEndPoint(gridX, gridZ);
          break;
        case 1: // 中键 - 切换障碍物
          this.toggleObstacle(gridX, gridZ);
          break;
      }
    }
  }
  
  /**
   * 处理键盘事件
   */
  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'a') {
      this.toggleAxesHelper();
    } else if (event.key === 'l') {
      this.toggleLightHelper();
    } else if (event.key === 'g') {
      this.toggleGridHelper();
    }
  }
  
  // 以下是SceneAPI的实现
  
  /**
   * 获取配置
   */
  getConfig(): SceneConfig {
    return { ...this.config };
  }
  
  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<SceneConfig>): void {
    // 更新配置
    this.config = { ...this.config, ...newConfig };
    
    // 如果groundSize发生变化，需要重新创建网格
    if (newConfig.groundSize) {
      const [width, depth] = this.config.groundSize;
      this.grid = new Grid(width, depth, GRID.cellSize);
      this.pathRenderer = new PathRenderer(this.grid);
    }
    
    // 重新初始化场景
    this.initScene();
  }
  
  /**
   * 设置起点
   */
  setStartPoint(x: number, y: number): void {
    // 如果有旧的起点，移除它
    if (this.startTile) {
      const oldKey = coordsToKey(this.startTile[0], this.startTile[1]);
      this.tileStatus.delete(oldKey);
    }
    
    // 设置新的起点
    this.startTile = [x, y];
    this.tileStatus.set(coordsToKey(x, y), 'start');
    
    // 更新网格状态
    this.updateGridState();
    
    // 如果有终点，重新计算路径
    if (this.endTile) {
      this.calculatePath();
    }
  }
  
  /**
   * 设置终点
   */
  setEndPoint(x: number, y: number): void {
    // 如果有旧的终点，移除它
    if (this.endTile) {
      const oldKey = coordsToKey(this.endTile[0], this.endTile[1]);
      this.tileStatus.delete(oldKey);
    }
    
    // 设置新的终点
    this.endTile = [x, y];
    this.tileStatus.set(coordsToKey(x, y), 'end');
    
    // 更新网格状态
    this.updateGridState();
    
    // 如果有起点，重新计算路径
    if (this.startTile) {
      this.calculatePath();
    }
  }
  
  /**
   * 添加障碍物
   */
  addObstacle(x: number, y: number): void {
    // 检查是否已经是障碍物
    const key = coordsToKey(x, y);
    if (this.tileStatus.get(key) === 'obstacle') {
      return;
    }
    
    // 检查是否是起点或终点
    if (
      (this.startTile && this.startTile[0] === x && this.startTile[1] === y) ||
      (this.endTile && this.endTile[0] === x && this.endTile[1] === y)
    ) {
      return;
    }
    
    // 添加障碍物
    this.obstacles.push([x, y]);
    this.tileStatus.set(key, 'obstacle');
    
    // 更新网格状态
    this.updateGridState();
    
    // 重新计算路径
    if (this.startTile && this.endTile) {
      this.calculatePath();
    }
  }
  
  /**
   * 移除障碍物
   */
  removeObstacle(x: number, y: number): void {
    // 检查是否是障碍物
    const key = coordsToKey(x, y);
    if (this.tileStatus.get(key) !== 'obstacle') {
      return;
    }
    
    // 移除障碍物
    this.obstacles = this.obstacles.filter(([ox, oy]) => !(ox === x && oy === y));
    this.tileStatus.delete(key);
    
    // 更新网格状态
    this.updateGridState();
    
    // 重新计算路径
    if (this.startTile && this.endTile) {
      this.calculatePath();
    }
  }
  
  /**
   * 切换障碍物状态
   */
  toggleObstacle(x: number, y: number): void {
    const key = coordsToKey(x, y);
    if (this.tileStatus.get(key) === 'obstacle') {
      this.removeObstacle(x, y);
    } else {
      this.addObstacle(x, y);
    }
  }
  
  /**
   * 计算路径
   */
  calculatePath(): void {
    if (!this.startTile || !this.endTile) {
      this.path = [];
      this.updateGridState();
      return;
    }
    
    const [startX, startY] = this.startTile;
    const [endX, endY] = this.endTile;
    
    // 获取网格信息
    const { divisionsX, divisionsZ } = this.grid.getGridInfo();
    
    // 计算路径
    const newPath = findPath(
      startX, startY, 
      endX, endY, 
      divisionsX,
      divisionsZ,
      this.obstacles
    );
    
    // 更新路径
    this.path = newPath;
    
    // 更新网格状态
    this.updateGridState();
    
    // 打印路径信息以便调试
    console.log('路径计算完成:', this.path);
  }
  
  /**
   * 清除路径
   */
  clearPath(): void {
    // 清除路径
    this.path = [];
    
    // 更新网格状态
    this.updateGridState();
  }
  
  /**
   * 清除所有（路径和障碍物）
   */
  clearAll(): void {
    this.tileStatus = new Map();
    this.obstacles = [];
    this.endTile = null;
    this.path = [];
    
    // 保留起点
    if (this.startTile) {
      this.tileStatus.set(coordsToKey(this.startTile[0], this.startTile[1]), 'start');
    }
    
    // 更新网格状态
    this.updateGridState();
  }
  
  /**
   * 添加自定义组件
   */
  addCustomComponent(component: THREE.Object3D, addAsObstacle: boolean = true): void {
    this.customComponents.push(component);
    this.scene.add(component);
    
    // 如果需要将组件添加为障碍物
    if (addAsObstacle && component instanceof THREE.Mesh) {
      // 获取网格信息
      const { width, height, cellSizeX, cellSizeZ, divisionsX, divisionsZ } = this.grid.getGridInfo();
      
      // 计算组件覆盖的网格坐标
      const gridPositions = calculateObjectGridPositions(
        component, width, height, cellSizeX, cellSizeZ, divisionsX, divisionsZ
      );
      
      // 添加障碍物
      gridPositions.forEach(([x, y]) => {
        this.addObstacle(x, y);
      });
      
      // 将组件与其网格坐标关联起来（存储在组件的userData中）
      component.userData = {
        ...component.userData,
        gridPositions
      };
    }
  }
  
  /**
   * 移除自定义组件
   */
  removeCustomComponent(component: THREE.Object3D, removeObstacles: boolean = true): void {
    // 如果需要移除组件对应的障碍物
    if (removeObstacles && component.userData && component.userData.gridPositions) {
      // 获取组件关联的网格坐标
      const gridPositions = component.userData.gridPositions as [number, number][];
      
      // 移除障碍物
      gridPositions.forEach(([x, y]) => {
        this.removeObstacle(x, y);
      });
    }
    
    // 从自定义组件列表中移除组件
    const index = this.customComponents.indexOf(component);
    if (index !== -1) {
      this.customComponents.splice(index, 1);
      this.scene.remove(component);
    }
  }
  
  /**
   * 计算物体覆盖的网格坐标
   */
  calculateObjectGridPositions(object: THREE.Mesh): [number, number][] {
    const { width, height, cellSizeX, cellSizeZ, divisionsX, divisionsZ } = this.grid.getGridInfo();
    return calculateObjectGridPositions(
      object, width, height, cellSizeX, cellSizeZ, divisionsX, divisionsZ
    );
  }
  
  /**
   * 获取自定义组件列表
   */
  getCustomComponents(): THREE.Object3D[] {
    return [...this.customComponents];
  }
  
  /**
   * 获取路径
   */
  getPath(): [number, number][] {
    return [...this.path];
  }
  
  /**
   * 获取瓦片状态
   */
  getTileStatus(x: number, y: number): TileStatus | undefined {
    return this.tileStatus.get(coordsToKey(x, y));
  }
  
  /**
   * 获取所有瓦片状态
   */
  getAllTileStatus(): Map<string, TileStatus> {
    return new Map(this.tileStatus);
  }
  
  /**
   * 获取路径点
   */
  getPathPoints(): [number, number][] {
    return [...this.path];
  }
  
  /**
   * 获取起点和终点
   */
  getStartAndEndPoints(): { start: [number, number] | null, end: [number, number] | null } {
    return {
      start: this.startTile,
      end: this.endTile
    };
  }
  
  /**
   * 获取起点
   */
  getStartPoint(): [number, number] | null {
    return this.startTile ? [...this.startTile] : null;
  }
  
  /**
   * 获取终点
   */
  getEndPoint(): [number, number] | null {
    return this.endTile ? [...this.endTile] : null;
  }
  
  /**
   * 获取障碍物列表
   */
  getObstacles(): [number, number][] {
    return [...this.obstacles];
  }
  
  /**
   * 将网格坐标转换为世界坐标
   */
  gridToWorldPosition(gridX: number, gridY: number, height: number = 0): [number, number, number] {
    return this.grid.gridToWorld(gridX, gridY, height);
  }
  
  /**
   * 将世界坐标转换为网格坐标
   */
  worldToGridPosition(x: number, z: number): [number, number] {
    const { width, height, cellSizeX, cellSizeZ, divisionsX, divisionsZ } = this.grid.getGridInfo();
    return worldToGridPosition(
      x, z, width, height, cellSizeX, cellSizeZ, divisionsX, divisionsZ
    );
  }
  
  /**
   * 检查是否已初始化
   */
  isInitialized(): boolean {
    return this.isInitializedState && this.startTile !== null;
  }
  
  /**
   * 设置初始化状态
   */
  setInitialized(value: boolean): void {
    this.isInitializedState = value;
  }
  
  /**
   * 初始化随机起点
   */
  initializeRandomStart(): void {
    // 获取网格信息
    const { divisionsX, divisionsZ } = this.grid.getGridInfo();
    
    // 随机选择起点
    const randomX = Math.floor(Math.random() * divisionsX);
    const randomY = Math.floor(Math.random() * divisionsZ);
    
    // 设置起点
    this.setStartPoint(randomX, randomY);
  }
  
  /**
   * 销毁场景
   */
  dispose(): void {
    // 停止动画循环
    try {
      if (typeof window !== 'undefined') {
        const highestId = window.setTimeout(() => {}, 0);
        for (let i = 0; i < highestId; i++) {
          window.clearTimeout(i);
        }
      }
    } catch (e) {
      console.warn('清理timeout时出错', e);
    }
    
    // 移除事件监听器
    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.removeEventListener('mousedown', this.handleMouseDown);
    }
    
    // 移除窗口大小变化监听
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.handleResize);
      // 移除键盘事件监听器
      window.removeEventListener('keydown', this.handleKeyDown);
    }
    
    // 清理场景
    this.clearScene();
    
    // 移除DOM元素
    if (this.renderer && this.renderer.domElement) {
      const domElement = this.renderer.domElement;
      if (domElement.parentNode) {
        domElement.parentNode.removeChild(domElement);
      }
      
      // 释放渲染器资源
      this.renderer.dispose();
    }
    
    // 释放控制器
    if (this.controls) {
      this.controls.dispose();
    }
    
    // 清空引用
    this.scene = null as unknown as THREE.Scene;
    this.camera = null as unknown as THREE.PerspectiveCamera;
    this.controls = null as unknown as OrbitControls;
    this.renderer = null as unknown as THREE.WebGLRenderer;
    this.container = null;
  }
}

/**
 * 从DOM元素获取SceneAPI
 */
export function getSceneAPIFromElement(element: HTMLElement): SceneAPI | null {
  // 查找最近的Scene容器
  const sceneContainer = element.closest('.scene-container');
  if (sceneContainer) {
    // 尝试获取API
    return (sceneContainer as { __sceneAPI?: SceneAPI }).__sceneAPI || null;
  }
  return null;
}

/**
 * 创建场景并附加到DOM元素
 */
export function createSceneInElement(
  element: HTMLElement, 
  config?: Partial<SceneConfig>
): SceneAPI {
  // 确保元素存在
  if (!element) {
    throw new Error('无法创建场景：DOM元素不存在');
  }
  
  // 创建场景
  return new ThreeScene(element, config) as SceneAPI;
}
