import { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { SceneManager } from '../utils/SceneManager';
import type { SceneConfig } from '../utils/SceneManager';
import { Lights } from './Lights';
import { Ground } from './Objects';
import { AxesHelper, GridHelper } from './Helpers';

// 颜色映射
const STATUS_COLORS: Record<string, string> = {
  default: "#444444",
  start: "#ff0000",  // 红色 - 起点
  end: "#ffff00",    // 黄色 - 终点
  path: "#ff69b4",   // 粉色 - 路径
  obstacle: "#222222" // 深灰色 - 障碍物
};

// 单个网格块组件
function Tile({ 
  position, 
  size, 
  color, 
  hoverColor, 
  status,
  onClick, 
  onRightClick,
  onMiddleClick
}: { 
  position: [number, number, number],
  size: number,
  color: string,
  hoverColor: string,
  status: string,
  onClick: () => void,
  onRightClick: () => void,
  onMiddleClick: () => void
}) {
  const [hovered, setHovered] = useState(false);
  
  // 根据状态确定颜色
  const tileColor = hovered && status === 'default' 
    ? hoverColor 
    : STATUS_COLORS[status] || color;
  
  return (
    <mesh 
      position={position}
      rotation={[-Math.PI / 2, 0, 0]} 
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onContextMenu={(e) => {
        e.stopPropagation();
        onRightClick();
      }}
      onPointerDown={(e) => {
        if (e.button === 1) { // 中键
          e.stopPropagation();
          onMiddleClick();
        }
      }}
    >
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial 
        color={tileColor} 
        transparent={true}
        opacity={0.8}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// 网格组件，使用SceneManager管理状态
function Grid({ 
  sceneManager,
  onTileLeftClick,
  height = 0.01
}: { 
  sceneManager: SceneManager,
  onTileLeftClick?: (position: [number, number, number], gridCoords: [number, number]) => void,
  height?: number
}) {
  const [, forceUpdate] = useState({});
  const config = sceneManager.getConfig();
  const { gridSize, divisions, baseColor, hoverColor } = config;
  const tileSize = gridSize / divisions;
  
  // 通过这个函数强制更新组件
  const updateGrid = () => {
    forceUpdate({});
  };
  
  // 渲染网格
  const tiles = [];
  
  // 计算网格的起始坐标（使网格中心与坐标原点对齐）
  const start = -gridSize / 2 + tileSize / 2;
  
  // 创建网格
  for (let x = 0; x < divisions; x++) {
    for (let z = 0; z < divisions; z++) {
      // 计算当前网格的位置
      const xPos = start + x * tileSize;
      const zPos = start + z * tileSize;
      const position: [number, number, number] = [xPos, height, zPos];
      
      // 获取网格状态
      const status = sceneManager.getTileStatus(x, z) || 'default';
      
      tiles.push(
        <Tile 
          key={`tile-${x}-${z}`}
          position={position}
          size={tileSize * 0.98} // 稍微缩小一点，形成网格间隙
          color={baseColor}
          hoverColor={hoverColor}
          status={status}
          onClick={() => {
            if (onTileLeftClick) {
              onTileLeftClick(position, [x, z]);
            }
          }}
          onRightClick={() => {
            sceneManager.setEndPoint(x, z);
            updateGrid();
          }}
          onMiddleClick={() => {
            sceneManager.toggleObstacle(x, z);
            updateGrid();
          }}
        />
      );
    }
  }
  
  return <>{tiles}</>;
}

// 自定义组件渲染器
function CustomComponentsRenderer({ sceneManager }: { sceneManager: SceneManager }) {
  const [components, setComponents] = useState<THREE.Object3D[]>([]);
  
  // 当SceneManager中的自定义组件更新时，更新组件状态
  useEffect(() => {
    setComponents(sceneManager.getCustomComponents());
    
    // 这应该有一个更新机制，这里简化处理
    const interval = setInterval(() => {
      setComponents(sceneManager.getCustomComponents());
    }, 1000);
    
    return () => clearInterval(interval);
  }, [sceneManager]);
  
  return (
    <>
      {components.map((component, index) => (
        <primitive key={`custom-${index}`} object={component} />
      ))}
    </>
  );
}

// 场景组件属性
interface SceneProps {
  sceneManager: SceneManager;
  showHelpers?: boolean;
  showAxes?: boolean;
  showGrid?: boolean;
  children?: React.ReactNode;
}

// 场景内容组件
function SceneContent({
  sceneManager,
  showHelpers = false,
  showAxes = false,
  showGrid = false,
  children
}: SceneProps) {
  const config = sceneManager.getConfig();
  
  // 处理网格左键点击 - 输出坐标信息
  const handleTileClick = (position: [number, number, number], gridCoords: [number, number]) => {
    const [x, y] = gridCoords;
    console.log(`左键点击坐标: 世界坐标(${position[0].toFixed(2)}, ${position[1].toFixed(2)}, ${position[2].toFixed(2)}) 网格坐标(${x}, ${y})`);
  };
  
  return (
    <>
      <color attach="background" args={['#ccc']} />
      <fog attach="fog" args={['#ccc', 8, 40]} />
      
      <Lights showHelpers={showHelpers} />
      
      {/* 基础地面 */}
      <Ground 
        size={config.groundSize} 
        position={config.groundPosition} 
      />
      
      {/* 可交互网格系统 - 使用SceneManager */}
      <Grid 
        sceneManager={sceneManager}
        onTileLeftClick={handleTileClick}
      />
      
      {/* 辅助器 */}
      <AxesHelper visible={showAxes} size={10} />
      <GridHelper visible={showGrid} />
      
      {/* 自定义组件 */}
      <CustomComponentsRenderer sceneManager={sceneManager} />
      
      {/* 其他子组件 */}
      {children}
      
      <OrbitControls 
        minPolarAngle={0} 
        maxPolarAngle={Math.PI / 2.3} 
        minDistance={4} 
        maxDistance={20}
      />
    </>
  );
}

// 主场景组件
export function Scene({
  initialConfig = {},
  showControls = true,
  onReady,
  children
}: {
  initialConfig?: SceneConfig;
  showControls?: boolean;
  onReady?: (sceneManager: SceneManager) => void;
  children?: React.ReactNode;
}) {
  const sceneManagerRef = useRef<SceneManager | null>(null);
  const [showHelpers, setShowHelpers] = useState(false);
  const [showAxes, setShowAxes] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [renderKey, setRenderKey] = useState(0); // 添加渲染键以强制刷新
  const [loadingAttempts, setLoadingAttempts] = useState(0);
  
  // 重新初始化SceneManager
  const reinitialize = useCallback(() => {
    try {
      // 清除旧的实例
      sceneManagerRef.current = null;
      
      // 增加尝试次数
      setLoadingAttempts(prev => prev + 1);
      
      // 重置状态
      setIsLoaded(false);
      
      // 强制重新渲染
      setRenderKey(prev => prev + 1);
    } catch (error) {
      console.error('重新初始化失败:', error);
    }
  }, []);
  
  // 创建并初始化SceneManager
  useEffect(() => {
    // 只在未加载时或重新初始化时执行
    if (!isLoaded || !sceneManagerRef.current) {
      try {
        // 创建SceneManager实例
        console.log('正在创建SceneManager...尝试次数:', loadingAttempts + 1);
        const manager = new SceneManager(initialConfig);
        sceneManagerRef.current = manager;
        
        if (manager.isInitialized()) {
          // 标记为已加载
          console.log('SceneManager初始化成功');
          setIsLoaded(true);
          
          // 强制组件更新
          setRenderKey(prev => prev + 1);
          
          // 通知父组件SceneManager已准备好
          if (onReady) {
            onReady(manager);
          }
        } else {
          console.error('SceneManager初始化失败');
        }
      } catch (error) {
        console.error('初始化SceneManager时出错:', error);
      }
    }
  }, [initialConfig, onReady, loadingAttempts, isLoaded]);
  
  // 确保SceneManager已初始化
  const isManagerReady = sceneManagerRef.current && isLoaded && sceneManagerRef.current.isInitialized();
  
  // 如果SceneManager还没准备好，显示加载中
  if (!isManagerReady) {
    return (
      <div className="loading">
        场景加载中...
        <button 
          onClick={reinitialize} 
          style={{ 
            marginTop: '15px', 
            padding: '5px 10px', 
            background: '#2196f3', 
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          重新加载
        </button>
      </div>
    );
  }
  
  // 使用渲染键强制重新渲染组件
  return (
    <div className="scene-container" key={renderKey}>
      <Canvas 
        shadows 
        camera={{ position: [0, 10, 15], fov: 45 }}
        gl={{ antialias: true }}
      >
        <SceneContent 
          sceneManager={sceneManagerRef.current!}
          showHelpers={showHelpers}
          showAxes={showAxes}
          showGrid={showGrid}
        >
          {children}
        </SceneContent>
      </Canvas>
      
      {showControls && (
        <div className="controls">
          <button onClick={() => setShowHelpers(!showHelpers)}>
            {showHelpers ? '隐藏灯光辅助器' : '显示灯光辅助器'}
          </button>
          <button onClick={() => setShowAxes(!showAxes)}>
            {showAxes ? '隐藏坐标轴' : '显示坐标轴'}
          </button>
          <button onClick={() => setShowGrid(!showGrid)}>
            {showGrid ? '隐藏网格' : '显示网格'}
          </button>
          <button onClick={() => {
            if (sceneManagerRef.current) {
              sceneManagerRef.current.clearPath();
              // 强制更新
              setRenderKey(prev => prev + 1);
            }
          }}>
            清除路径
          </button>
          <button onClick={() => {
            if (sceneManagerRef.current) {
              sceneManagerRef.current.clearAll();
              // 强制更新
              setRenderKey(prev => prev + 1);
            }
          }}>
            清除全部
          </button>
        </div>
      )}
    </div>
  );
}

// 导出获取SceneManager的辅助函数
export function getSceneManagerFromElement(element: HTMLElement): SceneManager | null {
  // 查找最近的Scene组件，并获取其SceneManager
  // 这是一个简化的实现，实际中可能需要使用React Context或其他方法
  const sceneContainer = element.closest('.scene-container');
  if (sceneContainer) {
    // 使用类型断言而不是any
    const sceneComponentData = (sceneContainer as { __reactInternalInstance?: { sceneManager?: SceneManager } }).__reactInternalInstance;
    if (sceneComponentData && sceneComponentData.sceneManager) {
      return sceneComponentData.sceneManager;
    }
  }
  return null;
} 