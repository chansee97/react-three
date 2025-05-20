import React from 'react';

interface AxesHelperProps {
  size?: number;
}

/**
 * 坐标轴辅助器组件
 */
export function AxesHelper({ size = 5 }: AxesHelperProps) {
  return <axesHelper args={[size]} />;
}
