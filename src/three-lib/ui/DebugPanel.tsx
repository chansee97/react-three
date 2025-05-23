import React, { useState } from 'react';
import './DebugPanel.css';

export interface DebugPanelProps {
  title?: string;
  onHighPerformanceChange?: (enabled: boolean) => void;
  onReset?: () => void;
  highPerformance?: boolean;
  fps?: number;
  showFps?: boolean;
  showControls?: boolean;
  
  // Helper控制属性
  showAxes?: boolean;
  showGrid?: boolean;
  showPolarGrid?: boolean;
  showLightHelper?: boolean;
  showCameraHelper?: boolean;
  onAxesHelperChange?: (visible: boolean) => void;
  onGridHelperChange?: (visible: boolean) => void;
  onPolarGridHelperChange?: (visible: boolean) => void;
  onLightHelperChange?: (visible: boolean) => void;
  onCameraHelperChange?: (visible: boolean) => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({
  title = 'Three.js 控制面板',
  onHighPerformanceChange,
  onReset,
  highPerformance = false,
  fps = 0,
  showFps = true,
  showControls = true,
  
  // Helper控制默认值
  showAxes = true,
  showGrid = false,
  showPolarGrid = false,
  showLightHelper = false,
  showCameraHelper = false,
  onAxesHelperChange,
  onGridHelperChange,
  onPolarGridHelperChange,
  onLightHelperChange,
  onCameraHelperChange,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [helperSectionCollapsed, setHelperSectionCollapsed] = useState(false);

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
              </div>
              
              <div className="debug-section">
                <div 
                  className="section-header" 
                  onClick={() => setHelperSectionCollapsed(!helperSectionCollapsed)}
                >
                  <h4>辅助工具</h4>
                  <span className="toggle-icon">{helperSectionCollapsed ? '▼' : '▲'}</span>
                </div>
                
                {!helperSectionCollapsed && (
                  <div className="helper-controls">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={showAxes}
                        onChange={(e) => onAxesHelperChange?.(e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                      <span className="toggle-label">坐标轴</span>
                    </label>
                    
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={showGrid}
                        onChange={(e) => onGridHelperChange?.(e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                      <span className="toggle-label">网格</span>
                    </label>
                    
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={showPolarGrid}
                        onChange={(e) => onPolarGridHelperChange?.(e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                      <span className="toggle-label">极坐标网格</span>
                    </label>
                    
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={showLightHelper}
                        onChange={(e) => onLightHelperChange?.(e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                      <span className="toggle-label">方向光辅助</span>
                    </label>
                    
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={showCameraHelper}
                        onChange={(e) => onCameraHelperChange?.(e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                      <span className="toggle-label">相机辅助</span>
                    </label>
                    
                    <div className="option-description">
                      切换各种辅助工具的显示，帮助理解场景结构
                    </div>
                  </div>
                )}
              </div>
              
              {onReset && (
                <div className="debug-section">
                  <h4>操作</h4>
                  <button 
                    className="debug-button" 
                    onClick={() => {
                      console.log('DebugPanel: 点击重置相机按钮');
                      onReset?.();
                    }}
                  >
                    重置相机
                  </button>
                  <div className="option-description">
                    将相机恢复到初始位置和角度
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
