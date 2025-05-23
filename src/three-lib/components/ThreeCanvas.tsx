import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  ThreeScene, 
  createHighPerformanceRenderer,
  createStandardRenderer, 
  createDampedControls,
  createColoredObjectFactory
} from '../';
import { DebugPanel } from '../ui';

interface ThreeCanvasProps {
  highPerformance?: boolean;
  showDebugPanel?: boolean;
  onHighPerformanceChange?: (enabled: boolean) => void;
}

/**
 * Three.js画布组件，使用依赖注入
 */
const ThreeCanvas: React.FC<ThreeCanvasProps> = ({ 
  highPerformance = false,
  showDebugPanel = true,
  onHighPerformanceChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<ThreeScene | null>(null);
  const [fps, setFps] = useState(0);
  const [highPerformanceMode, setHighPerformanceMode] = useState(highPerformance);
  
  // Helper状态
  const [showAxes, setShowAxes] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [showPolarGrid, setShowPolarGrid] = useState(false);
  const [showLightHelper, setShowLightHelper] = useState(false);
  const [showCameraHelper, setShowCameraHelper] = useState(false);
  
  // 初始化和重新创建场景
  const createScene = useCallback(() => {
    if (!containerRef.current) return;
    
    // 先清理旧场景
    if (sceneRef.current) {
      sceneRef.current.dispose();
      sceneRef.current = null;
    }
    
    // 添加延迟以确保WebGL上下文完全释放
    setTimeout(() => {
      if (containerRef.current) {
        // 创建新场景
        sceneRef.current = new ThreeScene(
          containerRef.current,
          highPerformanceMode ? createHighPerformanceRenderer : createStandardRenderer,
          createDampedControls,
          createColoredObjectFactory(0xffffff)
        );
        
        // 注册FPS更新回调
        sceneRef.current.onFpsUpdate(setFps);
        
        // 应用当前helper状态
        sceneRef.current.toggleAxesHelper(showAxes);
        sceneRef.current.toggleGridHelper(showGrid);
        sceneRef.current.togglePolarGridHelper(showPolarGrid);
        sceneRef.current.toggleDirectionalLightHelper(showLightHelper);
        sceneRef.current.toggleCameraHelper(showCameraHelper);
      }
    }, 50); // 短暂延迟，给浏览器时间清理旧的WebGL上下文
  }, [highPerformanceMode, showAxes, showGrid, showPolarGrid, showLightHelper, showCameraHelper]);
  
  // 初始化场景的effect
  useEffect(() => {
    createScene();
    
    // 组件卸载时清理资源
    return () => {
      if (sceneRef.current) {
        sceneRef.current.dispose();
        sceneRef.current = null;
      }
    };
  }, [createScene]);
  
  // 处理高性能模式切换
  const handleHighPerformanceToggle = useCallback((enabled: boolean) => {
    setHighPerformanceMode(enabled);
    
    // 通知父组件
    if (onHighPerformanceChange) {
      onHighPerformanceChange(enabled);
    }
  }, [onHighPerformanceChange]);
  
  // 处理helper切换
  const handleAxesHelperToggle = useCallback((visible: boolean) => {
    setShowAxes(visible);
    if (sceneRef.current) {
      sceneRef.current.toggleAxesHelper(visible);
    }
  }, []);
  
  const handleGridHelperToggle = useCallback((visible: boolean) => {
    setShowGrid(visible);
    if (sceneRef.current) {
      sceneRef.current.toggleGridHelper(visible);
    }
  }, []);
  
  const handlePolarGridHelperToggle = useCallback((visible: boolean) => {
    setShowPolarGrid(visible);
    if (sceneRef.current) {
      sceneRef.current.togglePolarGridHelper(visible);
    }
  }, []);
  
  const handleLightHelperToggle = useCallback((visible: boolean) => {
    setShowLightHelper(visible);
    if (sceneRef.current) {
      sceneRef.current.toggleDirectionalLightHelper(visible);
    }
  }, []);
  
  const handleCameraHelperToggle = useCallback((visible: boolean) => {
    setShowCameraHelper(visible);
    if (sceneRef.current) {
      sceneRef.current.toggleCameraHelper(visible);
    }
  }, []);
  
  // 重置场景
  const handleReset = useCallback(() => {
    console.log('ThreeCanvas: 重置场景');
    if (sceneRef.current) {
      sceneRef.current.resetScene();
    }
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
      />
      
      {showDebugPanel && (
        <DebugPanel
          title="Three.js 控制面板"
          fps={fps}
          highPerformance={highPerformanceMode}
          onHighPerformanceChange={handleHighPerformanceToggle}
          onReset={handleReset}
          // Helper控制
          showAxes={showAxes}
          showGrid={showGrid}
          showPolarGrid={showPolarGrid}
          showLightHelper={showLightHelper}
          showCameraHelper={showCameraHelper}
          onAxesHelperChange={handleAxesHelperToggle}
          onGridHelperChange={handleGridHelperToggle}
          onPolarGridHelperChange={handlePolarGridHelperToggle}
          onLightHelperChange={handleLightHelperToggle}
          onCameraHelperChange={handleCameraHelperToggle}
        />
      )}
    </div>
  );
};

export default ThreeCanvas; 