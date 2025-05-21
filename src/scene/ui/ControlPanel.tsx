import React, { useState, useEffect, useCallback } from 'react';
import type { SceneAPI } from '../types';
import './ControlPanel.css';

interface ControlPanelProps {
  sceneAPI: SceneAPI | null;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ sceneAPI }) => {
  // 辅助器状态
  const [helperStatus, setHelperStatus] = useState({
    axesHelper: false,
    lightHelper: false,
    gridHelper: false
  });

  // 更新状态的回调函数
  const updateStatus = useCallback(() => {
    if (sceneAPI) {
      const status = sceneAPI.getHelperStatus();
      setHelperStatus(status);
    }
  }, [sceneAPI]);

  // 处理切换事件 - 坐标轴
  const handleToggleAxes = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (sceneAPI) {
      sceneAPI.toggleAxesHelper();
      // 立即更新状态
      setTimeout(updateStatus, 0);
    }
  };

  // 处理切换事件 - 光源辅助
  const handleToggleLight = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (sceneAPI) {
      sceneAPI.toggleLightHelper();
      // 立即更新状态
      setTimeout(updateStatus, 0);
    }
  };

  // 处理切换事件 - 网格线
  const handleToggleGrid = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (sceneAPI) {
      sceneAPI.toggleGridHelper();
      // 立即更新状态
      setTimeout(updateStatus, 0);
    }
  };

  // 初始化状态
  useEffect(() => {
    if (sceneAPI) {
      updateStatus();
    }
  }, [sceneAPI, updateStatus]);

  // 如果没有sceneAPI，不渲染任何内容
  if (!sceneAPI) {
    return null;
  }

  return (
    <div className="control-panel" onClick={(e) => e.stopPropagation()}>
      <h3>显示控制</h3>
      <div className="control-options">
        <label className="control-label">
          <input 
            type="checkbox" 
            checked={helperStatus.axesHelper}
            onChange={handleToggleAxes}
            className="control-checkbox"
          />
          <span className="control-text">坐标轴</span>
        </label>
        <label className="control-label">
          <input 
            type="checkbox" 
            checked={helperStatus.lightHelper}
            onChange={handleToggleLight}
            className="control-checkbox"
          />
          <span className="control-text">光源辅助</span>
        </label>
        <label className="control-label">
          <input 
            type="checkbox" 
            checked={helperStatus.gridHelper}
            onChange={handleToggleGrid}
            className="control-checkbox"
          />
          <span className="control-text">网格线</span>
        </label>
      </div>
    </div>
  );
};

export default ControlPanel; 