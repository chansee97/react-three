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
  cubeColor?: number;
  showDebugPanel?: boolean;
  onHighPerformanceChange?: (enabled: boolean) => void;
  onColorChange?: (color: number) => void;
}

/**
 * Three.js画布组件，使用依赖注入
 */
const ThreeCanvas: React.FC<ThreeCanvasProps> = ({ 
  highPerformance = false,
  cubeColor = 0xff0000, // 红色
  showDebugPanel = true,
  onHighPerformanceChange,
  onColorChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<ThreeScene | null>(null);
  const [fps, setFps] = useState(0);
  const [currentColor, setCurrentColor] = useState(cubeColor);
  const [highPerformanceMode, setHighPerformanceMode] = useState(highPerformance);
  
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
          createColoredObjectFactory(currentColor)
        );
        
        // 注册FPS更新回调
        sceneRef.current.onFpsUpdate(setFps);
      }
    }, 50); // 短暂延迟，给浏览器时间清理旧的WebGL上下文
  }, [highPerformanceMode, currentColor]);
  
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
  
  // 处理颜色变化
  const handleColorChange = useCallback((color: number) => {
    setCurrentColor(color);
    
    // 更新场景中立方体的颜色
    if (sceneRef.current) {
      sceneRef.current.updateCubeColor(color);
    }
    
    // 通知父组件
    if (onColorChange) {
      onColorChange(color);
    }
  }, [onColorChange]);
  
  // 重置场景
  const handleReset = useCallback(() => {
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
          currentColor={currentColor}
          onHighPerformanceChange={handleHighPerformanceToggle}
          onColorChange={handleColorChange}
          onReset={handleReset}
        />
      )}
    </div>
  );
};

export default ThreeCanvas; 