import React, { useState, useCallback } from 'react';
import { ThreeCanvas } from './three-lib';
import './App.css';

const App: React.FC = () => {
  const [highPerformance, setHighPerformance] = useState(false);

  // 高性能模式变化处理
  const handleHighPerformanceChange = useCallback((enabled: boolean) => {
    console.log('切换渲染模式:', enabled ? '高性能' : '标准');
    setHighPerformance(enabled);
  }, []);

  return (
    <div className="app">
      <main className="app-main">
        <ThreeCanvas 
          highPerformance={highPerformance}
          showDebugPanel={true}
          onHighPerformanceChange={handleHighPerformanceChange}
        />
      </main>
    </div>
  );
};

export default App; 