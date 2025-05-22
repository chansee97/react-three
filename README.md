# React + Three.js 基础示例

这是一个使用React和Three.js创建的基础3D场景示例项目。

## 功能特点

- 使用React管理UI组件
- Three.js处理3D渲染
- 包含一个可旋转的3D立方体
- 支持轨道控制器进行场景交互
- 响应式设计，自动适应窗口大小变化

## 项目结构

```
src/
├── components/         # React组件
│   └── ThreeCanvas.tsx # Three.js画布组件
├── three-lib/          # Three.js相关代码
│   ├── ThreeScene.ts   # Three.js场景管理类
│   └── index.ts        # 导出文件
├── App.css             # 应用样式
├── App.tsx             # 主应用组件
├── main.tsx            # 应用入口
└── style.css           # 全局样式
```

## 开发环境设置

### 安装依赖

```bash
npm install
# 或
yarn
# 或
pnpm install
```

### 运行开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

### 构建生产版本

```bash
npm run build
# 或
yarn build
# 或
pnpm build
```

## 扩展建议

- 添加更多的3D模型和场景元素
- 实现更复杂的交互和动画
- 添加材质和纹理
- 集成物理引擎
- 添加后期处理效果

## 技术栈

- React
- TypeScript
- Three.js
- Vite
