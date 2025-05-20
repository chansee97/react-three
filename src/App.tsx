import { useRef, useEffect } from 'react';
import { IntegratedScene } from './components/scene/IntegratedScene';
import type { SceneAPI } from './components/scene/types';
import './App.css';

function App() {
  // 场景API实例的引用
  const sceneAPIRef = useRef<SceneAPI | null>(null);
  
  // 示例：如何获取SceneManager实例并使用它
  useEffect(() => {
    const timer = setTimeout(() => {
      if (sceneAPIRef.current) {
        // 添加一些障碍物示例
        const obstacles = [
          [5, 5], [5, 6], [5, 7], [6, 7], [7, 7],
          [12, 12], [12, 13], [13, 12], [14, 12]
        ];
        
        obstacles.forEach(([x, y]) => {
          sceneAPIRef.current?.addObstacle(x, y);
        });
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // 当IntegratedScene组件挂载时获取SceneAPI实例
  const handleSceneReady = (api: SceneAPI) => {
    sceneAPIRef.current = api;
    console.log('场景初始化完成，获取到SceneAPI');
  };

  return (
    <div className="app" style={{ width: '100%', height: '100vh' }}>
      <IntegratedScene 
        initialConfig={{
          gridSize: 20,
          divisions: 20,
          baseColor: "#a0a0a0",
          hoverColor: "#c0c0c0",
          groundSize: [20, 20],
          groundPosition: [0, -0.1, 0]
        }}
        showControls={true}
        onReady={handleSceneReady}
      />
    </div>
  )
}

export default App
