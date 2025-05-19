import { useRef, useEffect } from 'react'
import { Scene } from './components/Scene'
import { SceneManager } from './utils/SceneManager'
import './App.css'

function App() {
  // 场景管理器实例的引用
  const sceneManagerRef = useRef<SceneManager | null>(null);
  
  // 示例：如何获取SceneManager实例并使用它
  useEffect(() => {
    const timer = setTimeout(() => {
      if (sceneManagerRef.current) {
        // 添加一些障碍物示例
        const obstacles = [
          [5, 5], [5, 6], [5, 7], [6, 7], [7, 7],
          [12, 12], [12, 13], [13, 12], [14, 12]
        ];
        
        obstacles.forEach(([x, y]) => {
          sceneManagerRef.current?.addObstacle(x, y);
        });
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // 当Scene组件挂载时获取SceneManager实例
  const handleSceneReady = (manager: SceneManager) => {
    sceneManagerRef.current = manager;
  };

  return (
    <div className="app">
      <Scene 
        initialConfig={{
          gridSize: 20,
          divisions: 20,
          baseColor: "#444444",
          hoverColor: "#00aaff"
        }}
        showControls={true}
        onReady={handleSceneReady}
      />
    </div>
  )
}

export default App
