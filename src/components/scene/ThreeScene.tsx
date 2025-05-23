import React, { useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// 导入类型和工具
import type { SceneConfig, SceneAPI } from './types';
import { useSceneStore } from './store';
import { gridToWorldPosition, worldToGridPosition } from './utils';

// 导入组件
import { Lights, GridsHelper, Ground, AxesHelper, PathLine, PathfindingGrid, SkyBox, Fog } from './helpers';
import { ControlPanel } from './ui';

// 定义组件属性类型
interface ThreeSceneProps {
  initialConfig: SceneConfig;
  showControls?: boolean;
  onReady?: (sceneAPI: SceneAPI) => void;
  children?: React.ReactNode;
}

/**
 * Three.js场景组件 - 主要的3D场景入口组件
 */
export function ThreeScene({
  initialConfig,
  showControls = true,
  onReady,
  children
}: ThreeSceneProps) {
  // 使用Zustand store
  const {
    config,
    updateConfig,
    tileStatus,
    path,
    customComponents,
    showLights,
    showAxes,
    showGrid,
    toggleLights,
    toggleAxes,
    toggleGrid,
    setStartPoint,
    setEndPoint,
    toggleObstacle,
    calculatePath,
    clearPath,
    clearAll,
    addCustomComponent,
    removeCustomComponent,
    initializeRandomStart,
    setInitialized,
    isInitialized
  } = useSceneStore();
  
  // 初始化配置
  useEffect(() => {
    if (!isInitialized) {
      updateConfig(initialConfig);
      initializeRandomStart();
      setInitialized(true);
      
      // 如果提供了onReady回调，创建API对象并通知父组件
      if (onReady) {
        // 创建符合SceneAPI接口的对象
        const sceneAPI: SceneAPI = {
          getConfig: () => config,
          updateConfig,
          setStartPoint,
          setEndPoint,
          addObstacle: (x, y) => useSceneStore.getState().addObstacle(x, y),
          removeObstacle: (x, y) => useSceneStore.getState().removeObstacle(x, y),
          toggleObstacle,
          calculatePath,
          clearPath,
          clearAll,
          addCustomComponent,
          removeCustomComponent,
          calculateObjectGridPositions: (object) => useSceneStore.getState().calculateObjectGridPositions(object),
          getCustomComponents: () => customComponents,
          getPath: () => path,
          getTileStatus: (x, y) => useSceneStore.getState().getTileStatus(x, y),
          getAllTileStatus: () => tileStatus,
          getStartPoint: () => useSceneStore.getState().startTile,
          getEndPoint: () => useSceneStore.getState().endTile,
          getObstacles: () => useSceneStore.getState().obstacles,
          gridToWorldPosition: (gridX, gridY, height) => {
            const { groundSize } = config;
            const gridSize = groundSize[0];
            return gridToWorldPosition(gridX, gridY, height, gridSize);
          },
          worldToGridPosition: (x, z) => {
            const { groundSize } = config;
            const gridSize = groundSize[0];
            return worldToGridPosition(x, z, gridSize);
          },
          isInitialized: () => isInitialized
        };
        
        onReady(sceneAPI);
      }
    }
  }, [initialConfig, onReady, isInitialized, config, updateConfig, setInitialized, initializeRandomStart, tileStatus, path, customComponents, setStartPoint, setEndPoint, toggleObstacle, calculatePath, clearPath, clearAll, addCustomComponent, removeCustomComponent]);
  
  // 处理瓦片左键点击
  const handleTileClick = useCallback((position: [number, number, number], gridCoords: [number, number]) => {
    const [x, z] = gridCoords;
    setStartPoint(x, z);
  }, [setStartPoint]);
  
  // 处理瓦片右键点击
  const handleTileRightClick = useCallback((position: [number, number, number], gridCoords: [number, number]) => {
    const [x, z] = gridCoords;
    setEndPoint(x, z);
  }, [setEndPoint]);
  
  // 处理瓦片中键点击
  const handleTileMiddleClick = useCallback((position: [number, number, number], gridCoords: [number, number]) => {
    const [x, z] = gridCoords;
    toggleObstacle(x, z);
  }, [toggleObstacle]);

  
  // 移除所有自定义组件
  const removeAllComponents = useCallback(() => {
    customComponents.forEach((component: THREE.Object3D) => {
      // 移除组件，自动清除其障碍物
      removeCustomComponent(component, true);
    });
  }, [customComponents, removeCustomComponent]);
  
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
      {/* 控制面板 */}
      {showControls && (
        <ControlPanel
          showLights={showLights}
          showAxes={showAxes}
          showGrid={showGrid}
          toggleLights={toggleLights}
          toggleAxes={toggleAxes}
          toggleGrid={toggleGrid}
          clearPath={clearPath}
          clearAll={clearAll}
          removeAllComponents={removeAllComponents}
        />
      )}
      
      {/* Three.js 场景 */}
      <Canvas
        camera={{ position: [0, 10, 10], fov: 60 }}
        style={{ background: '#d1d1ea' }}
      >
        {/* 天空盒 */}
        <SkyBox 
          sunPosition={[100, 10, 100]}
          rayleigh={0.3}
        />
        
        {/* 雾效果 */}
        <Fog 
          color="#d1d1ea" 
          near={25} 
          far={80} 
        />
      
        {/* 灯光 */}
        <Lights showLights={showLights} />
        
        {/* 轨道控制器 */}
        <OrbitControls />
        
        {/* 辅助工具 */}
        {showAxes && <AxesHelper size={10} />}
        {showGrid && <GridsHelper 
          config={config}
          color="#888888"
          secondaryColor="#444444"
        />}
        
        {/* 地面 */}
        <Ground 
          size={config.groundSize} 
          groundColor="#333333" 
        />
        
        {/* 寻路网格 */}
        <PathfindingGrid 
          gridSize={config.groundSize[0]} 
          tileStatus={tileStatus}
          onTileClick={handleTileClick}
          onTileRightClick={handleTileRightClick}
          onTileMiddleClick={handleTileMiddleClick}
        />
        
        {/* 路径线 */}
        {path.length > 1 && (
          <PathLine 
            points={path} 
            gridSize={config.groundSize[0]} 
            color="#ff69b4" 
          />
        )}
        
        {/* 自定义组件 */}
        {customComponents.map((component: THREE.Object3D, index: number) => (
          <primitive key={index} object={component} />
        ))}
        
        {/* 子组件 */}
        {children}
      </Canvas>
    </div>
  );
}
