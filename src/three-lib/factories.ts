import { 
  WebGLRendererAdapter, 
  CustomRendererAdapter,
  OrbitControlsAdapter,
  ThreeObjectFactory
} from './adapters';
import { Renderer, CameraControls, ObjectFactory } from './interfaces';
import * as THREE from 'three';

/**
 * 创建高性能渲染器
 */
export function createHighPerformanceRenderer(): Renderer {
  return new CustomRendererAdapter({
    antialias: true,
    powerPreference: 'high-performance'
  });
}

/**
 * 创建标准渲染器
 */
export function createStandardRenderer(): Renderer {
  return new WebGLRendererAdapter({
    antialias: true,
    powerPreference: 'default',
  });
}

/**
 * 创建移动设备优化的渲染器
 */
export function createMobileRenderer(): Renderer {
  const renderer = new WebGLRendererAdapter({
    antialias: false, // 移动设备禁用抗锯齿提高性能
    powerPreference: 'low-power'
  });
  renderer.setPixelRatio(1); // 固定像素比以提高性能
  return renderer;
}

/**
 * 创建具有阻尼的相机控制器
 */
export function createDampedControls(camera: THREE.Camera, domElement: HTMLElement): CameraControls {
  const controls = new OrbitControlsAdapter(camera, domElement);
  controls.setEnableDamping(true);
  return controls;
}

/**
 * 创建对象工厂，自定义默认颜色
 */
export function createColoredObjectFactory(defaultColor: number): ObjectFactory {
  return {
    createCube(options) {
      const factory = new ThreeObjectFactory();
      return factory.createCube({ 
        ...options,
        color: options?.color || defaultColor 
      });
    },
    createLight(type, options) {
      const factory = new ThreeObjectFactory();
      return factory.createLight(type, options);
    },
    createAxesHelper(size) {
      const factory = new ThreeObjectFactory();
      return factory.createAxesHelper(size);
    }
  };
} 