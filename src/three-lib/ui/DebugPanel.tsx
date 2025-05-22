import React, { useState } from 'react';
import './DebugPanel.css';

export interface DebugPanelProps {
  title?: string;
  onHighPerformanceChange?: (enabled: boolean) => void;
  onColorChange?: (color: number) => void;
  onReset?: () => void;
  highPerformance?: boolean;
  currentColor?: number;
  fps?: number;
  showFps?: boolean;
  showControls?: boolean;
}

const DebugPanel: React.FC<DebugPanelProps> = ({
  title = 'Three.js 控制面板',
  onHighPerformanceChange,
  onColorChange,
  onReset,
  highPerformance = false,
  currentColor = 0xff0000,
  fps = 0,
  showFps = true,
  showControls = true,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedColor, setSelectedColor] = useState(currentColor);
  
  // 预定义颜色
  const predefinedColors = [
    { name: '红色', value: 0xff0000 },
    { name: '绿色', value: 0x00ff00 },
    { name: '蓝色', value: 0x0000ff },
    { name: '黄色', value: 0xffff00 },
    { name: '青色', value: 0x00ffff },
    { name: '品红', value: 0xff00ff }
  ];
  
  // 处理颜色选择
  const handleColorSelect = (color: number) => {
    setSelectedColor(color);
    onColorChange?.(color);
  };

  // 十六进制颜色格式化
  const formatHexColor = (color: number) => `#${color.toString(16).padStart(6, '0')}`;

  // 处理性能模式切换
  const toggleHighPerformance = () => {
    if (onHighPerformanceChange) {
      onHighPerformanceChange(!highPerformance);
    }
  };

  return (
    <div className={`debug-panel ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="debug-panel-header" onClick={() => setIsCollapsed(!isCollapsed)}>
        <h3>{title}</h3>
        <span className="toggle-icon">{isCollapsed ? '▼' : '▲'}</span>
      </div>
      
      {!isCollapsed && (
        <div className="debug-panel-content">
          {showFps && (
            <div className="debug-section">
              <h4>性能</h4>
              <div className="fps-display">
                <span>FPS: {fps}</span>
                <div className="fps-bar-container">
                  <div 
                    className="fps-bar" 
                    style={{ 
                      width: `${Math.min(100, fps / 60 * 100)}%`,
                      backgroundColor: fps > 50 ? '#4CAF50' : fps > 30 ? '#FFC107' : '#F44336' 
                    }} 
                  />
                </div>
              </div>
              <div className="renderer-info">
                当前渲染器: <span className="renderer-type">{highPerformance ? '高性能' : '标准'}</span>
              </div>
            </div>
          )}
          
          {showControls && (
            <>
              <div className="debug-section">
                <h4>渲染设置</h4>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={highPerformance}
                    onChange={(e) => onHighPerformanceChange?.(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                  <span className="toggle-label">高性能模式</span>
                </label>
                <div className="option-description">
                  启用高性能渲染器，包含阴影和高级效果
                </div>
                <button 
                  className="mode-toggle-button"
                  onClick={toggleHighPerformance}
                >
                  切换到{highPerformance ? '标准' : '高性能'}模式
                </button>
              </div>
              
              <div className="debug-section">
                <h4>立方体颜色</h4>
                <div className="color-grid">
                  {predefinedColors.map((color) => (
                    <div
                      key={color.value}
                      className={`color-box ${selectedColor === color.value ? 'selected' : ''}`}
                      style={{ backgroundColor: formatHexColor(color.value) }}
                      onClick={() => handleColorSelect(color.value)}
                      title={color.name}
                    />
                  ))}
                </div>
                <div className="color-display">
                  <span>当前颜色: </span>
                  <div
                    className="current-color-box"
                    style={{ backgroundColor: formatHexColor(currentColor) }}
                  />
                  <span>{formatHexColor(currentColor)}</span>
                </div>
              </div>
              
              {onReset && (
                <div className="debug-section">
                  <h4>操作</h4>
                  <button className="debug-button" onClick={onReset}>
                    重置场景
                  </button>
                  <div className="option-description">
                    重置相机位置和立方体旋转
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DebugPanel; 