import React, { memo } from 'react';
import { Grid as DreiGrid } from '@react-three/drei';
import type { SceneConfig } from '../types';

export interface GridProps {
  config: SceneConfig;
  size?: number;
  color?: string;
  secondaryColor?: string;
}

/**
 * 网格组件 - 在高度0处显示标准网格
 */
function Grid({ 
  config,
  size,
  color = '#888888',
  secondaryColor = '#444444'
}: GridProps) {
  // 使用配置中的值或提供的默认值
  const gridSize = size || config.groundSize[0] || 20;
  
  return (
    <DreiGrid 
      args={[gridSize, gridSize]} 
      position={[0, 0, 0]}
      cellColor={color}
      sectionColor={secondaryColor}
      infiniteGrid
    />
  );
}

// 使用memo包装Grid组件，避免不必要的重新渲染
export const MemoizedGrid = memo(Grid);
export { MemoizedGrid as GridsHelper };
