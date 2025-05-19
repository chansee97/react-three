# 3D场景和寻路系统

## 概述

本项目提供了一个基于React Three Fiber的3D场景和八方向A*寻路系统，可以轻松地集成到React应用中。

## 核心功能

- 可配置的网格系统
- 八方向A*寻路算法
- 支持障碍物设置
- 自定义组件添加
- 完整的状态管理
- 世界坐标与网格坐标转换

## 使用方法

### 基础用法

最简单的使用方式是在React组件中使用`Scene`组件：

```tsx
import { Scene } from './components/Scene'

function App() {
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
      />
    </div>
  )
}
```

### 获取SceneManager实例

如果需要通过代码操作场景，可以通过`onReady`回调获取SceneManager实例：

```tsx
import { useRef } from 'react'
import { Scene } from './components/Scene'
import { SceneManager } from './utils/SceneManager'

function App() {
  const sceneManagerRef = useRef<SceneManager | null>(null);
  
  // 当Scene组件挂载时获取SceneManager实例
  const handleSceneReady = (manager: SceneManager) => {
    sceneManagerRef.current = manager;
    
    // 示例：添加障碍物
    manager.addObstacle(5, 5);
    manager.addObstacle(5, 6);
    
    // 示例：设置起点和终点
    manager.setStartPoint(1, 1);
    manager.setEndPoint(10, 10);
  };

  return (
    <div className="app">
      <Scene 
        initialConfig={{
          gridSize: 20,
          divisions: 20
        }}
        onReady={handleSceneReady}
      />
    </div>
  )
}
```

### 添加自定义组件

可以通过SceneManager添加自定义Three.js组件：

```tsx
import * as THREE from 'three';

// 创建一个自定义3D对象
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
cube.position.set(0, 1, 0);

// 添加到场景
sceneManager.addCustomComponent(cube);
```

### 读取寻路路径

可以通过SceneManager读取当前的寻路路径：

```tsx
// 获取当前路径（网格坐标）
const path = sceneManager.getPath();
console.log('当前路径:', path);

// 转换为世界坐标
const worldPath = path.map(([x, y]) => 
  sceneManager.gridToWorldPosition(x, y, 0.5) // 高度设为0.5
);
console.log('世界坐标路径:', worldPath);
```

## 配置选项

SceneManager接受以下配置参数：

```typescript
interface SceneConfig {
  gridSize?: number;       // 网格总尺寸
  divisions?: number;      // 网格分割数量
  baseColor?: string;      // 基础颜色
  startColor?: string;     // 起点颜色
  endColor?: string;       // 终点颜色
  pathColor?: string;      // 路径颜色
  obstacleColor?: string;  // 障碍物颜色
  hoverColor?: string;     // 悬停颜色
  groundSize?: [number, number]; // 地面尺寸
  groundPosition?: [number, number, number]; // 地面位置
}
```

## 交互方式

- **左键点击**：输出坐标信息
- **右键点击**：设置终点（黄色）
- **中键点击**：切换障碍物（添加/移除）

## API参考

### SceneManager

主要功能类，管理整个场景状态：

- `setStartPoint(x, y)` - 设置起点
- `setEndPoint(x, y)` - 设置终点
- `addObstacle(x, y)` - 添加障碍物
- `removeObstacle(x, y)` - 移除障碍物
- `toggleObstacle(x, y)` - 切换障碍物状态
- `calculatePath()` - 计算路径
- `clearPath()` - 清除路径
- `clearAll()` - 清除所有（路径和障碍物）
- `addCustomComponent(component)` - 添加自定义组件
- `removeCustomComponent(component)` - 移除自定义组件
- `getPath()` - 获取当前路径
- `getStartPoint()` - 获取起点
- `getEndPoint()` - 获取终点
- `getObstacles()` - 获取所有障碍物
- `gridToWorldPosition(x, y, height)` - 网格坐标转世界坐标
- `worldToGridPosition(x, z)` - 世界坐标转网格坐标

### Scene组件

React组件，用于在React应用中使用SceneManager：

```tsx
<Scene 
  initialConfig={...}  // SceneConfig配置对象
  showControls={true}  // 是否显示控制按钮
  onReady={callback}   // 当SceneManager准备好时的回调
>
  {/* 可以添加其他Three.js组件 */}
</Scene>
``` 