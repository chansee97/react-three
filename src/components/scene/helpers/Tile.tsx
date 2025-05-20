import { useState } from 'react';
import type { TileStatus } from '../types';

interface TileProps {
  position: [number, number, number];
  size: number;
  color: string;
  hoverColor: string;
  status: TileStatus | string;
  onClick: () => void;
  onRightClick: () => void;
  onMiddleClick: () => void;
}

/**
 * 网格瓦片组件
 */
export function Tile({ 
  position, 
  size, 
  color, 
  hoverColor, 
  status,
  onClick, 
  onRightClick,
  onMiddleClick
}: TileProps) {
  const [hovered, setHovered] = useState(false);
  
  // 根据状态确定颜色
  let tileColor = color;
  if (hovered) {
    tileColor = hoverColor;
  } else if (status === 'start') {
    tileColor = '#ff0000'; // 红色起点
  } else if (status === 'end') {
    tileColor = '#ffff00'; // 黄色终点
  } else if (status === 'path') {
    // 路径点不再显示为粉色方格，而是使用透明度使其不可见
    tileColor = color;
  } else if (status === 'obstacle') {
    tileColor = '#222222'; // 深灰色障碍物
  }
  
  // 设置透明度 - 路径点完全透明，其他正常显示
  const opacity = status === 'path' ? 0 : 0.8;
  
  return (
    <mesh 
      position={position}
      // 旋转网格使其在x-z平面上水平排列
      rotation={[-Math.PI/2, 0, 0]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onContextMenu={(e) => {
        e.stopPropagation();
        // 调用右键点击处理函数
        onRightClick();
      }}
      onPointerDown={(e) => {
        if (e.button === 1) { // 中键
          e.stopPropagation();
          onMiddleClick();
        }
      }}
    >
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial 
        color={tileColor} 
        transparent={true}
        opacity={opacity}
      />
    </mesh>
  );
}
