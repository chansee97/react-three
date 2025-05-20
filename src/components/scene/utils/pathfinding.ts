/**
 * 寻路算法实现
 */

// 坐标转换为键值
export function coordsToKey(x: number, y: number): string {
  return `${x},${y}`;
}

// 键值转换为坐标
export function keyToCoords(key: string): [number, number] {
  const [x, y] = key.split(',').map(Number);
  return [x, y];
}

// 获取相邻节点
function getNeighbors(
  x: number, 
  y: number, 
  maxX: number, 
  maxY: number, 
  obstacles: [number, number][]
): [number, number][] {
  const directions = [
    [0, 1],  // 上
    [1, 0],  // 右
    [0, -1], // 下
    [-1, 0], // 左
    [1, 1],  // 右上
    [1, -1], // 右下
    [-1, 1], // 左上
    [-1, -1] // 左下
  ];
  
  const neighbors: [number, number][] = [];
  
  for (const [dx, dy] of directions) {
    const nx = x + dx;
    const ny = y + dy;
    
    // 检查边界
    if (nx < 0 || nx >= maxX || ny < 0 || ny >= maxY) {
      continue;
    }
    
    // 检查障碍物
    if (obstacles.some(([ox, oy]) => ox === nx && oy === ny)) {
      continue;
    }
    
    neighbors.push([nx, ny]);
  }
  
  return neighbors;
}

// 计算两点之间的距离（曼哈顿距离）
function heuristic(x1: number, y1: number, x2: number, y2: number): number {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

// A*寻路算法
export function findPath(
  startX: number, 
  startY: number, 
  endX: number, 
  endY: number, 
  maxX: number, 
  maxY: number, 
  obstacles: [number, number][]
): [number, number][] {
  // 如果起点或终点是障碍物，则无法找到路径
  if (obstacles.some(([x, y]) => (x === startX && y === startY) || (x === endX && y === endY))) {
    return [];
  }
  
  // 开放列表和关闭列表
  const openSet = new Set<string>();
  const closedSet = new Set<string>();
  
  // 记录每个节点的父节点
  const cameFrom = new Map<string, string>();
  
  // g值：从起点到当前节点的实际代价
  const gScore = new Map<string, number>();
  
  // f值：g值 + 启发式估计值
  const fScore = new Map<string, number>();
  
  // 初始化起点
  const startKey = coordsToKey(startX, startY);
  openSet.add(startKey);
  gScore.set(startKey, 0);
  fScore.set(startKey, heuristic(startX, startY, endX, endY));
  
  while (openSet.size > 0) {
    // 找到f值最小的节点
    let currentKey = '';
    let lowestFScore = Infinity;
    
    for (const key of openSet) {
      const score = fScore.get(key) || Infinity;
      if (score < lowestFScore) {
        lowestFScore = score;
        currentKey = key;
      }
    }
    
    // 如果找到终点，则构建路径并返回
    if (currentKey === coordsToKey(endX, endY)) {
      const path: [number, number][] = [];
      let current = currentKey;
      
      while (current) {
        path.unshift(keyToCoords(current));
        current = cameFrom.get(current) || '';
      }
      
      return path;
    }
    
    // 将当前节点从开放列表移到关闭列表
    openSet.delete(currentKey);
    closedSet.add(currentKey);
    
    // 处理相邻节点
    const [currentX, currentY] = keyToCoords(currentKey);
    const neighbors = getNeighbors(currentX, currentY, maxX, maxY, obstacles);
    
    for (const [nx, ny] of neighbors) {
      const neighborKey = coordsToKey(nx, ny);
      
      // 如果节点已经在关闭列表中，则跳过
      if (closedSet.has(neighborKey)) {
        continue;
      }
      
      // 计算从起点经过当前节点到相邻节点的代价
      const tentativeGScore = (gScore.get(currentKey) || 0) + 
        (nx !== currentX && ny !== currentY ? 1.4 : 1); // 对角线移动代价更高
      
      // 如果相邻节点不在开放列表中，或者找到了更好的路径，则更新信息
      if (!openSet.has(neighborKey) || tentativeGScore < (gScore.get(neighborKey) || Infinity)) {
        cameFrom.set(neighborKey, currentKey);
        gScore.set(neighborKey, tentativeGScore);
        fScore.set(neighborKey, tentativeGScore + heuristic(nx, ny, endX, endY));
        
        if (!openSet.has(neighborKey)) {
          openSet.add(neighborKey);
        }
      }
    }
  }
  
  // 如果无法找到路径，则返回空数组
  return [];
}
