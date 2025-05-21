# Three.js 场景

这是一个使用纯Three.js实现的3D场景，提供了网格寻路演示功能。

## 功能特性

- 3D网格场景渲染
- A*寻路算法实现
- 交互式设置起点、终点和障碍物
- 自动计算并显示最短路径
- 场景控制面板

## 技术栈

- Three.js
- TypeScript
- Vite

## 项目结构

- `src/main.ts` - 应用入口点
- `src/scene.ts` - 场景渲染和交互管理
- `src/sceneManager.ts` - 场景状态和寻路逻辑

## 使用方法

### 安装依赖

```bash
npm install
# 或
pnpm install
```

### 开发模式

```bash
npm run dev
# 或
pnpm dev
```

### 构建项目

```bash
npm run build
# 或
pnpm build
```

## 交互指南

- **左键点击**: 设置起点
- **右键点击**: 设置终点
- **中键点击**: 切换障碍物

## 控制面板

- **清除路径**: 仅清除当前路径
- **清除所有**: 清除路径和障碍物
- **添加障碍物示例**: 添加预设的障碍物示例
- **显示/隐藏网格**: 切换网格辅助线显示
- **显示/隐藏坐标轴**: 切换坐标轴辅助线显示

## 从React Three Fiber迁移

本项目原先使用React Three Fiber实现，现已迁移到纯Three.js实现。主要变化：

1. 移除了React相关依赖
2. 使用原生DOM API替代React组件
3. 使用命令式Three.js API替代声明式React Three Fiber
4. 场景管理逻辑保持不变，但实现方式改为原生JavaScript/TypeScript
