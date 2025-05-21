import { useRef, useEffect, useState } from 'react';
import { createSceneInElement } from './scene/ThreeScene';
import type { SceneAPI } from './scene/types';
import { ControlPanel } from './scene/ui';
import './App.css';

function App() {
  // 场景容器引用
  const containerRef = useRef<HTMLDivElement>(null);
  // 场景API实例的引用
  const [sceneAPI, setSceneAPI] = useState<SceneAPI | null>(null);
  
  // 初始化场景
  useEffect(() => {
    if (containerRef.current && !sceneAPI) {
      try {
        console.log('正在初始化Three.js场景...');
        // 通过DOM元素创建场景，使用自定义配置
        const api = createSceneInElement(containerRef.current, {
          groundSize: [20, 30],
          groundPosition: [0, -0.1, 0]
        });
        
        // 保存API引用
        setSceneAPI(api);
        console.log('场景初始化完成，获取到SceneAPI');
      } catch (error) {
        console.error('Three.js场景初始化失败:', error);
      }
    }
    
    // 清理函数
    return () => {
      if (sceneAPI) {
        try {
          console.log('正在清理Three.js场景...');
          // 调用API的dispose方法
          sceneAPI.dispose();
          setSceneAPI(null);
          console.log('Three.js场景清理完成');
        } catch (error) {
          console.error('Three.js场景清理失败:', error);
        }
      }
    };
  }, []);

  return (
    <div className="app">
      <div 
        ref={containerRef} 
        className="scene-container"
      />
      {sceneAPI && <ControlPanel sceneAPI={sceneAPI} />}
    </div>
  );
}

export default App; 