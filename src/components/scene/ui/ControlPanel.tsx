import React from 'react';
import './ControlPanel.css';

export interface ControlPanelProps {
  showLights: boolean;
  showAxes: boolean;
  showGrid: boolean;
  toggleLights: () => void;
  toggleAxes: () => void;
  toggleGrid: () => void;
  clearPath: () => void;
  clearAll: () => void;
  removeAllComponents: () => void;
}

/**
 * 控制面板组件 - 提供场景控制功能，固定在左上角，浅色风格
 */
export function ControlPanel({
  showLights,
  showAxes,
  showGrid,
  toggleLights,
  toggleAxes,
  toggleGrid,
  clearPath,
  clearAll,
  removeAllComponents
}: ControlPanelProps) {
  return (
    <div className="controls-panel">
      {/* 辅助工具切换 */}
      <div className="controls-section">
        <label className="control-checkbox">
          <input
            type="checkbox"
            checked={showLights}
            onChange={toggleLights}
          />
          显示光源
        </label>
        
        <label className="control-checkbox">
          <input
            type="checkbox"
            checked={showAxes}
            onChange={toggleAxes}
          />
          显示坐标轴
        </label>
        
        <label className="control-checkbox">
          <input
            type="checkbox"
            checked={showGrid}
            onChange={toggleGrid}
          />
          显示网格
        </label>
      </div>
      
      {/* 操作按钮 */}
      <div className="controls-section">
        <button onClick={clearPath} className="control-button">
          清除路径
        </button>
        <button onClick={clearAll} className="control-button">
          清除所有
        </button>
        <button onClick={removeAllComponents} className="control-button">
          移除所有组件
        </button>
      </div>
    </div>
  );
} 