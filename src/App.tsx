import { useRef } from 'react';
import { ThreeScene } from './components/scene';
import type { SceneAPI } from './components/scene/types';
import './App.css';

function App() {
  // 场景API实例的引用
  const sceneAPIRef = useRef<SceneAPI | null>(null);

  
  // 当ThreeScene组件挂载时获取SceneAPI实例
  const handleSceneReady = (api: SceneAPI) => {
    sceneAPIRef.current = api;
    console.log('场景初始化完成，获取到SceneAPI');
  };

  return (
    <div className="app" style={{ width: '100%', height: '100vh' }}>
      <ThreeScene 
        initialConfig={{
          groundSize: [40, 30],
        }}
        showControls={true}
        onReady={handleSceneReady}
      />
    </div>
  )
}

export default App
