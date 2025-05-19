import { useState, useEffect, useCallback, useMemo } from 'react'
import * as THREE from 'three'
import { findPath } from '../utils/pathfinding'

// 网格单元格的状态类型
type TileStatus = 'default' | 'start' | 'end' | 'path' | 'obstacle'

// 定义颜色映射
const STATUS_COLORS = {
  default: "#444444",
  start: "#ff0000",  // 红色 - 起点
  end: "#ffff00",    // 黄色 - 终点
  path: "#ff69b4",   // 粉色 - 路径
  obstacle: "#222222" // 深灰色 - 障碍物
}

// 坐标转换为 key - 移到组件外部避免重新创建
const coordsToKey = (x: number, y: number): string => `${x},${y}`

interface TileProps {
  position: [number, number, number]
  size: number
  color: string
  hoverColor: string
  status: TileStatus
  gridCoords: [number, number] // 网格坐标
  onClick: (position: [number, number, number], coords: [number, number]) => void
  onRightClick: (position: [number, number, number], coords: [number, number]) => void
}

// 单个网格块组件
function Tile({ 
  position, 
  size, 
  color, 
  hoverColor, 
  status, 
  gridCoords, 
  onClick, 
  onRightClick 
}: TileProps) {
  const [hovered, setHovered] = useState(false)
  
  // 根据状态确定颜色
  const tileColor = useMemo(() => {
    if (hovered && status === 'default') return hoverColor
    return STATUS_COLORS[status] || color
  }, [hovered, status, hoverColor, color])
  
  return (
    <mesh 
      position={position}
      rotation={[-Math.PI / 2, 0, 0]} 
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation()
        onClick(position, gridCoords)
      }}
      onContextMenu={(e) => {
        e.stopPropagation()
        onRightClick(position, gridCoords)
      }}
    >
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial 
        color={tileColor} 
        transparent={true}
        opacity={0.8}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

interface GridTilesProps {
  gridSize?: number  // 网格总尺寸
  divisions?: number // 网格分割数量
  height?: number    // 网格高度
  baseColor?: string // 网格基础颜色
  hoverColor?: string // 悬停时的颜色
  onTileClick?: (position: [number, number, number], gridCoords: [number, number]) => void
}

export function GridTiles({ 
  gridSize = 20, 
  divisions = 20, 
  height = 0.01,
  baseColor = "#444444", 
  hoverColor = "#00aaff",
  onTileClick
}: GridTilesProps) {
  // 网格状态
  const [tileStatus, setTileStatus] = useState<Map<string, TileStatus>>(new Map())
  const [startTile, setStartTile] = useState<[number, number] | null>(null)
  const [endTile, setEndTile] = useState<[number, number] | null>(null)
  const [obstacles] = useState<[number, number][]>([]) // 可选的障碍物
  
  // 计算单个网格的尺寸
  const tileSize = gridSize / divisions
  
  // 设置随机起点 - 仅在组件挂载时执行一次
  useEffect(() => {
    // 随机选择起点
    const randomX = Math.floor(Math.random() * divisions)
    const randomY = Math.floor(Math.random() * divisions)
    
    // 设置起点和初始状态
    setStartTile([randomX, randomY])
    
    const initialStatus = new Map<string, TileStatus>()
    initialStatus.set(coordsToKey(randomX, randomY), 'start')
    
    // 设置障碍物（如果有）
    obstacles.forEach(([x, y]) => {
      initialStatus.set(coordsToKey(x, y), 'obstacle')
    })
    
    setTileStatus(initialStatus)
  }, [divisions]) // 仅依赖 divisions
  
  // 计算路径的函数 - 使用 useCallback 避免重新创建
  const calculatePath = useCallback(() => {
    if (!startTile || !endTile) return

    const [startX, startY] = startTile
    const [endX, endY] = endTile
    
    // 计算路径
    const newPath = findPath(
      startX, startY, 
      endX, endY, 
      divisions, divisions, 
      obstacles
    )
    
    // 移除起点和终点，它们有自己的状态
    const pathWithoutEnds = newPath.filter(([x, y]) => {
      return (
        (x !== startX || y !== startY) && 
        (x !== endX || y !== endY)
      )
    })
    
    // 更新路径状态
    setTileStatus(prevStatus => {
      const newStatus = new Map(prevStatus)
      
      // 首先清除之前的路径
      for (const [key, status] of [...newStatus.entries()]) {
        if (status === 'path') {
          newStatus.delete(key)
        }
      }
      
      // 确保起点和终点仍然存在
      if (startTile) {
        newStatus.set(coordsToKey(startTile[0], startTile[1]), 'start')
      }
      
      if (endTile) {
        newStatus.set(coordsToKey(endTile[0], endTile[1]), 'end')
      }
      
      // 然后设置新路径
      pathWithoutEnds.forEach(([x, y]) => {
        newStatus.set(coordsToKey(x, y), 'path')
      })
      
      return newStatus
    })
  }, [startTile, endTile, divisions, obstacles])
  
  // 当起点或终点变化时，计算路径
  useEffect(() => {
    calculatePath()
  }, [calculatePath])
  
  // 处理左键点击 - 输出坐标
  const handleClick = useCallback((position: [number, number, number], gridCoords: [number, number]) => {
    if (onTileClick) {
      onTileClick(position, gridCoords)
    }
  }, [onTileClick])
  
  // 处理右键点击 - 设置终点
  const handleRightClick = useCallback((position: [number, number, number], gridCoords: [number, number]) => {
    const [x, y] = gridCoords
    
    // 如果点击的是起点，则忽略
    if (startTile && startTile[0] === x && startTile[1] === y) {
      return
    }
    
    // 设置新的终点
    setEndTile([x, y])
    
    // 更新状态 - 直接在这里只更新终点状态，路径将由 useEffect 负责更新
    setTileStatus(prevStatus => {
      const newStatus = new Map(prevStatus)
      
      // 如果存在之前的终点，清除它
      for (const [key, status] of [...newStatus.entries()]) {
        if (status === 'end') {
          newStatus.delete(key)
        }
      }
      
      // 设置新的终点
      newStatus.set(coordsToKey(x, y), 'end')
      
      return newStatus
    })
    
    console.log(`设置终点: (${x}, ${y})`)
  }, [startTile])
  
  // 生成网格 - 使用 useMemo 避免不必要的重新计算
  const tiles = useMemo(() => {
    const tileElements = []
    
    // 计算网格的起始坐标（使网格中心与坐标原点对齐）
    const start = -gridSize / 2 + tileSize / 2
    
    // 创建网格
    for (let x = 0; x < divisions; x++) {
      for (let z = 0; z < divisions; z++) {
        // 计算当前网格的位置
        const xPos = start + x * tileSize
        const zPos = start + z * tileSize
        
        // 获取网格状态
        const status = tileStatus.get(coordsToKey(x, z)) || 'default'
        
        tileElements.push(
          <Tile 
            key={`tile-${x}-${z}`}
            position={[xPos, height, zPos]}
            size={tileSize * 0.98} // 稍微缩小一点，形成网格间隙
            color={baseColor}
            hoverColor={hoverColor}
            status={status}
            gridCoords={[x, z]}
            onClick={handleClick}
            onRightClick={handleRightClick}
          />
        )
      }
    }
    
    return tileElements
  }, [divisions, gridSize, tileSize, height, baseColor, hoverColor, tileStatus, handleClick, handleRightClick])
  
  return <group>{tiles}</group>
} 