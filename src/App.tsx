import React, { useState, useCallback } from 'react';
import { ThreeCanvas } from './three-lib';
import './App.css';

const App: React.FC = () => {
  const [highPerformance, setHighPerformance] = useState(false);
  const [cubeColor, setCubeColor] = useState(0xff0000); // 默认红色

  // 高性能模式变化处理
  const handleHighPerformanceChange = useCallback((enabled: boolean) => {
    console.log('切换渲染模式:', enabled ? '高性能' : '标准');
    setHighPerformance(enabled);
  }, []);

  // 颜色变化处理
  const handleColorChange = useCallback((color: number) => {
    setCubeColor(color);
  }, []);

  return (
    <div className="app">
      <main className="app-main">
        <ThreeCanvas 
          highPerformance={highPerformance}
          cubeColor={cubeColor}
          showDebugPanel={true}
          onHighPerformanceChange={handleHighPerformanceChange}
          onColorChange={handleColorChange}
        />
      </main>
    </div>
  );
};

export default App; 