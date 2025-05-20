import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// 导入类型和工具
import type { SceneConfig, SceneAPI, TileStatus } from './types';
import { SceneManager } from './SceneManager';
import { createBox, createSphere, createCylinder } from './utils/sceneHelpers';

// 导入组件
import { Lights } from './helpers/Lights';
import { Grid } from './helpers/Grid';
import { Ground } from './helpers/Ground';
import { AxesHelper } from './helpers/AxesHelper';
import { PathLine } from './helpers/PathLine';

interface IntegratedSceneProps {
  initialConfig?: Partial<SceneConfig>;
  showControls?: boolean;
  onReady?: (sceneAPI: SceneAPI) => void;
  children?: React.ReactNode;
}

/**
 * 集成场景组件 - 主要的场景入口组件
 */
export function IntegratedScene({
  initialConfig = {},
  showControls = true,
  onReady,
  children
}: IntegratedSceneProps) {
  // 场景管理器
  const sceneManagerRef = useRef<SceneManager | null>(null);
  
  // UI 状态
  const [showHelpers, setShowHelpers] = useState(false);
  const [showAxes, setShowAxes] = useState(false);
  const [showGrid, setShowGrid] = useState(false);  // 组件状态
  const [renderKey] = useState(0);
  
  // 场景状态 - 这些状态用于UI渲染，实际数据存储在SceneManager中
  const [tileStatus, setTileStatus] = useState<Map<string, TileStatus>>(new Map());
  const [customComponents, setCustomComponents] = useState<THREE.Object3D[]>([]);
  const [pathPoints, setPathPoints] = useState<[number, number][]>([]);
  
  // 从SceneManager同步状态到组件状态
  const syncStateFromManager = useCallback(() => {
    if (sceneManagerRef.current) {
      setTileStatus(sceneManagerRef.current.getAllTileStatus());
      setCustomComponents(sceneManagerRef.current.getCustomComponents());
      
      // 获取路径点
      setPathPoints(sceneManagerRef.current.getPathPoints());
    }
  }, []);
  
  // 当场景管理器状态变化时，同步到组件状态
  useEffect(() => {
    if (sceneManagerRef.current) {
      syncStateFromManager();
    }
  }, [syncStateFromManager]);

  // 初始化场景管理器
  useEffect(() => {
    if (!sceneManagerRef.current) {
      sceneManagerRef.current = new SceneManager(initialConfig);
      
      // 初始化随机起点
      sceneManagerRef.current.initializeRandomStart();
      
      // 标记为已初始化
      sceneManagerRef.current.setInitialized(true);
      
      // 同步状态
      syncStateFromManager();
      
      // 创建API对象并通知父组件
      if (onReady && sceneManagerRef.current) {
        onReady(sceneManagerRef.current);
      }
    }
  }, [initialConfig, onReady, syncStateFromManager]);
  

  
  // 处理瓦片左键点击
  const handleTileClick = useCallback((position: [number, number, number], gridCoords: [number, number]) => {
    if (sceneManagerRef.current) {
      const [x, z] = gridCoords;
      sceneManagerRef.current.setStartPoint(x, z);
      syncStateFromManager();
    }
  }, [syncStateFromManager]);
  
  // 处理瓦片右键点击
  const handleTileRightClick = useCallback((x: number, z: number) => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setEndPoint(x, z);
      syncStateFromManager();
    }
  }, [syncStateFromManager]);
  
  // 处理瓦片中键点击
  const handleTileMiddleClick = useCallback((x: number, z: number) => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.toggleObstacle(x, z);
      syncStateFromManager();
    }
  }, [syncStateFromManager]);
  
  // 创建一个自定义组件（一个红色立方体）
  const createCube = useCallback(() => {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 0.5, 0); // 设置位置
    
    // 将组件添加到场景中
    if (sceneManagerRef.current) {
      // 添加组件，自动将其覆盖的网格标记为障碍物
      sceneManagerRef.current.addCustomComponent(cube, true);
      syncStateFromManager();
    }
  }, [syncStateFromManager]);
  
  // 创建一个自定义组件（一个蓝色球体）
  const createSphere = useCallback(() => {
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(2, 0.5, 2); // 设置位置
    
    // 将组件添加到场景中
    if (sceneManagerRef.current) {
      // 添加组件，自动将其覆盖的网格标记为障碍物
      sceneManagerRef.current.addCustomComponent(sphere, true);
      syncStateFromManager();
    }
  }, [syncStateFromManager]);
  
  // 创建一个自定义组件（一个绿色圆柱体）
  const createCylinder = useCallback(() => {
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const cylinder = new THREE.Mesh(geometry, material);
    cylinder.position.set(-2, 1, -2); // 设置位置
    
    // 将组件添加到场景中
    if (sceneManagerRef.current) {
      // 添加组件，自动将其覆盖的网格标记为障碍物
      sceneManagerRef.current.addCustomComponent(cylinder, true);
      syncStateFromManager();
    }
  }, [syncStateFromManager]);
  
  // 移除所有自定义组件
  const removeAllComponents = useCallback(() => {
    if (sceneManagerRef.current) {
      customComponents.forEach(component => {
        // 移除组件，自动清除其障碍物
        sceneManagerRef.current?.removeCustomComponent(component, true);
      });
      syncStateFromManager();
    }
  }, [customComponents, syncStateFromManager]);
  
  // 禁用浏览器默认右键菜单
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // 在场景容器内禁用右键菜单
      const target = e.target as HTMLElement;
      if (target.closest('.scene-container')) {
        e.preventDefault();
      }
    };
    
    // 添加全局事件监听
    document.addEventListener('contextmenu', handleContextMenu);
    
    // 清理函数
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);
  
  // 渲染场景
  return (
    <div className="scene-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* 统一的控制面板 */}
      {showControls && (
        <div className="controls-panel" style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          background: 'rgba(255,255,255,0.8)',
          padding: '10px',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          maxWidth: '300px'
        }}>
          {/* 显示控制选项 */}
          <div style={{ marginBottom: '5px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px', borderBottom: '1px solid #ddd', paddingBottom: '3px' }}>显示选项</div>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              <button 
                style={{
                  padding: '4px 8px',
                  background: showHelpers ? '#e0e0e0' : '#ffffff',
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
                onClick={() => setShowHelpers(!showHelpers)}
              >
                {showHelpers ? '隐藏辅助器' : '显示辅助器'}
              </button>
              <button 
                style={{
                  padding: '4px 8px',
                  background: showAxes ? '#e0e0e0' : '#ffffff',
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
                onClick={() => setShowAxes(!showAxes)}
              >
                {showAxes ? '隐藏坐标轴' : '显示坐标轴'}
              </button>
              <button 
                style={{
                  padding: '4px 8px',
                  background: showGrid ? '#e0e0e0' : '#ffffff',
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
                onClick={() => setShowGrid(!showGrid)}
              >
                {showGrid ? '隐藏网格' : '显示网格'}
              </button>
            </div>
          </div>
          
          {/* 路径控制选项 */}
          <div style={{ marginBottom: '5px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px', borderBottom: '1px solid #ddd', paddingBottom: '3px' }}>路径操作</div>
            <div style={{ display: 'flex', gap: '5px' }}>
              <button 
                style={{
                  padding: '4px 8px',
                  background: '#ffffff',
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  flex: 1
                }}
                onClick={() => {
                  if (sceneManagerRef.current) {
                    sceneManagerRef.current.clearPath();
                    syncStateFromManager();
                  }
                }}
              >
                清除路径
              </button>
              <button 
                style={{
                  padding: '4px 8px',
                  background: '#ffffff',
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  flex: 1
                }}
                onClick={() => {
                  if (sceneManagerRef.current) {
                    sceneManagerRef.current.clearAll();
                    syncStateFromManager();
                  }
                }}
              >
                清除所有
              </button>
            </div>
          </div>
          
          {/* 自定义组件控制 */}
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '5px', borderBottom: '1px solid #ddd', paddingBottom: '3px' }}>添加组件</div>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              <button 
                style={{
                  padding: '4px 8px',
                  background: '#ffffff',
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
                onClick={createCube}
              >
                添加立方体
              </button>
              <button 
                style={{
                  padding: '4px 8px',
                  background: '#ffffff',
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
                onClick={createSphere}
              >
                添加球体
              </button>
              <button 
                style={{
                  padding: '4px 8px',
                  background: '#ffffff',
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
                onClick={createCylinder}
              >
                添加圆柱体
              </button>
              <button 
                style={{
                  padding: '4px 8px',
                  background: '#ffffff',
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  width: '100%',
                  marginTop: '5px'
                }}
                onClick={removeAllComponents}
              >
                移除所有组件
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 3D场景 */}
      <Canvas
        key={renderKey}
        shadows
        dpr={[1, 2]} // 限制设备像素比例范围，优化性能
        gl={{ antialias: true, alpha: false }} // 开启抗锯齿，关闭透明度以提高性能
        camera={{ position: [0, 10, 10], fov: 60 }}
        performance={{ min: 0.5 }} // 当帧率下降时自动降低渲染质量
      >
        {/* 使用Suspense处理加载状态 */}
        <React.Suspense fallback={null}>
          {/* 场景环境设置 */}
          <color attach="background" args={['#ccc']} />
          <fog attach="fog" args={['#ccc', 8, 40]} />

          {/* 灯光 */}
          <Lights showHelpers={showHelpers} />
          
          {/* 地面 */}
          <Ground 
            size={initialConfig.groundSize || [20, 20]} 
            position={initialConfig.groundPosition || [0, -0.1, 0]} 
          />
          
          {/* 网格辅助器 - 仅在需要时渲染 */}
          {showGrid && (
            <gridHelper 
              args={[
                initialConfig.gridSize || 20, 
                initialConfig.divisions || 20
              ]} 
              position={[0, 0.02, 0]}
            />
          )}
          
          {/* 网格 - 使用React.memo优化渲染性能 */}
          {sceneManagerRef.current && (
            <Grid 
              config={sceneManagerRef.current.getConfig()}
              tileStatus={tileStatus}
              onTileLeftClick={handleTileClick}
              onTileRightClick={handleTileRightClick}
              onTileMiddleClick={handleTileMiddleClick}
            />
          )}
          
          {/* 路径线 - 使用红色线条连接起点和终点 */}
          {pathPoints.length > 0 && (
            <PathLine 
              path={pathPoints}
              height={0.1} // 稍高于网格，确保可见
              color="#ff0000"
              lineWidth={3}
            />
          )}
          
          {/* 自定义组件 */}
          <group name="custom-components">
            {customComponents.map((component, index) => (
              <primitive key={`custom-component-${index}`} object={component} />
            ))}
          </group>
          
          {/* 辅助器 - 仅在需要时渲染 */}
          {showAxes && <AxesHelper size={10} />}
          
          {/* 轨道控制器 - 添加限制以提高用户体验 */}
          <OrbitControls 
            enableDamping 
            dampingFactor={0.05} 
            minDistance={5} 
            maxDistance={30}
            maxPolarAngle={Math.PI / 2} 
          />
          
          {/* 子组件 */}
          {children}
        </React.Suspense>
      </Canvas>
    </div>
  );
}

/**
 * 从DOM元素获取SceneAPI的辅助函数
 */
export function getSceneAPIFromElement(element: HTMLElement): SceneAPI | null {
  // 查找最近的Scene组件，并获取其SceneAPI
  const sceneContainer = element.closest('.scene-container');
  if (sceneContainer) {
    // 使用类型断言
    const sceneComponentData = (sceneContainer as { __reactInternalInstance?: { sceneAPI?: SceneAPI } }).__reactInternalInstance;
    if (sceneComponentData && sceneComponentData.sceneAPI) {
      return sceneComponentData.sceneAPI;
    }
  }
  return null;
}
