import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// 获取根元素
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('无法找到root DOM元素');
}

try {
  const root = createRoot(rootElement);
  
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} catch (error) {
  console.error('React应用渲染失败:', error);
  
  // 在页面上显示错误信息
  rootElement.innerHTML = `
    <div style="color: red; padding: 20px;">
      <h2>应用加载失败</h2>
      <p>${error instanceof Error ? error.message : String(error)}</p>
      <p>请检查控制台获取更多信息</p>
    </div>
  `;
}
