// 定义网格节点接口
interface GridNode {
  x: number;
  y: number;
  f: number; // f = g + h (总成本)
  g: number; // 从起点到当前节点的成本
  h: number; // 从当前节点到终点的估计成本 (启发式)
  walkable: boolean;
  parent: GridNode | null;
}

// 基于坐标创建唯一的键
const keyFromCoords = (x: number, y: number): string => `${x},${y}`;

/**
 * A*寻路算法实现
 * @param startX 起点X坐标
 * @param startY 起点Y坐标
 * @param endX 终点X坐标
 * @param endY 终点Y坐标
 * @param gridWidth 网格宽度
 * @param gridHeight 网格高度
 * @param unwalkable 不可行走的格子数组 [[x1,y1], [x2,y2], ...]
 * @returns 从起点到终点的路径数组，如果没有路径则返回空数组
 */
export function findPath(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  gridWidth: number,
  gridHeight: number,
  unwalkable: [number, number][] = []
): [number, number][] {
  // 创建网格
  const grid = createGrid(gridWidth, gridHeight, unwalkable);
  
  // 起点和终点节点
  const startNode = grid.get(keyFromCoords(startX, startY));
  const endNode = grid.get(keyFromCoords(endX, endY));
  
  // 如果起点或终点不存在，或者起点/终点是障碍物，则返回空路径
  if (!startNode || !endNode || !startNode.walkable || !endNode.walkable) {
    return [];
  }
  
  // 打开和关闭的节点集
  const openSet = new Map<string, GridNode>();
  const closedSet = new Map<string, GridNode>();
  
  // 初始化起点
  startNode.g = 0;
  startNode.h = heuristic(startNode, endNode);
  startNode.f = startNode.g + startNode.h;
  
  // 将起点加入到开放集
  openSet.set(keyFromCoords(startNode.x, startNode.y), startNode);
  
  // 开始A*寻路
  while (openSet.size > 0) {
    // 找到开放集中f值最小的节点
    let currentKey = '';
    let lowestF = Infinity;
    
    for (const [key, node] of openSet.entries()) {
      if (node.f < lowestF) {
        lowestF = node.f;
        currentKey = key;
      }
    }
    
    const current = openSet.get(currentKey)!;
    
    // 如果当前节点是终点，则构建并返回路径
    if (current.x === endNode.x && current.y === endNode.y) {
      return reconstructPath(current);
    }
    
    // 将当前节点从开放集移到关闭集
    openSet.delete(currentKey);
    closedSet.set(currentKey, current);
    
    // 遍历当前节点的邻居
    const neighbors = getNeighbors(current, grid, gridWidth, gridHeight);
    
    for (const neighbor of neighbors) {
      const neighborKey = keyFromCoords(neighbor.x, neighbor.y);
      
      // 如果邻居在关闭集中或不可行走，则跳过
      if (closedSet.has(neighborKey) || !neighbor.walkable) {
        continue;
      }
      
      // 计算从起点经过当前节点到邻居的成本
      // 对角线移动的成本为1.414(根号2)，直线移动为1
      const isDiagonal = Math.abs(current.x - neighbor.x) === 1 && Math.abs(current.y - neighbor.y) === 1;
      const moveCost = isDiagonal ? 1.414 : 1;
      const tentativeG = current.g + moveCost;
      
      // 如果邻居不在开放集中，或者找到了更好的路径
      const inOpenSet = openSet.has(neighborKey);
      if (!inOpenSet || tentativeG < neighbor.g) {
        // 更新邻居节点
        neighbor.parent = current;
        neighbor.g = tentativeG;
        neighbor.h = heuristic(neighbor, endNode);
        neighbor.f = neighbor.g + neighbor.h;
        
        // 如果邻居不在开放集中，则加入
        if (!inOpenSet) {
          openSet.set(neighborKey, neighbor);
        }
      }
    }
  }
  
  // 没有找到路径
  return [];
}

// 创建网格
function createGrid(
  width: number,
  height: number,
  unwalkable: [number, number][] = []
): Map<string, GridNode> {
  const grid = new Map<string, GridNode>();
  
  // 创建不可行走格子的集合，便于快速查找
  const unwalkableSet = new Set<string>();
  for (const [x, y] of unwalkable) {
    unwalkableSet.add(keyFromCoords(x, y));
  }
  
  // 初始化网格
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const key = keyFromCoords(x, y);
      grid.set(key, {
        x,
        y,
        f: 0,
        g: 0,
        h: 0,
        walkable: !unwalkableSet.has(key),
        parent: null
      });
    }
  }
  
  return grid;
}

// 获取节点的邻居
function getNeighbors(
  node: GridNode,
  grid: Map<string, GridNode>,
  gridWidth: number,
  gridHeight: number
): GridNode[] {
  const neighbors: GridNode[] = [];
  const { x, y } = node;
  
  // 八个方向的邻居 (上、右上、右、右下、下、左下、左、左上)
  const directions = [
    [0, -1], [1, -1], [1, 0], [1, 1], 
    [0, 1], [-1, 1], [-1, 0], [-1, -1]
  ];
  
  for (let i = 0; i < directions.length; i++) {
    const [dx, dy] = directions[i];
    const newX = x + dx;
    const newY = y + dy;
    
    // 检查是否在网格范围内
    if (newX >= 0 && newX < gridWidth && newY >= 0 && newY < gridHeight) {
      const key = keyFromCoords(newX, newY);
      const neighbor = grid.get(key);
      
      if (neighbor) {
        // 对于对角线移动，检查相邻两个直线方向是否有障碍物
        // 如果是对角线移动(索引为1,3,5,7)
        if (i % 2 === 1) {
          // 检查两个相邻的直线方向是否可走
          // 例如：右上对角线(1,-1)需要检查上(0,-1)和右(1,0)方向
          // 正确获取相邻的直线方向索引
          const verticalIdx = i === 1 ? 0 : (i === 3 ? 2 : (i === 5 ? 4 : 6));
          const horizontalIdx = i === 1 ? 2 : (i === 3 ? 4 : (i === 5 ? 6 : 0));
          
          const verticalDir = directions[verticalIdx]; 
          const horizontalDir = directions[horizontalIdx];
          
          const verticalX = x + verticalDir[0];
          const verticalY = y + verticalDir[1];
          const horizontalX = x + horizontalDir[0];
          const horizontalY = y + horizontalDir[1];
          
          // 获取相邻节点
          const verticalKey = keyFromCoords(verticalX, verticalY);
          const horizontalKey = keyFromCoords(horizontalX, horizontalY);
          
          const verticalNeighbor = grid.get(verticalKey);
          const horizontalNeighbor = grid.get(horizontalKey);
          
          // 只有当两个相邻方向都可行走时，才允许对角线移动
          if (verticalNeighbor && horizontalNeighbor && 
              verticalNeighbor.walkable && horizontalNeighbor.walkable) {
            neighbors.push(neighbor);
          }
        } else {
          // 直线移动，直接添加邻居
          neighbors.push(neighbor);
        }
      }
    }
  }
  
  return neighbors;
}

// 启发式函数 - 使用欧几里得距离(直线距离)替代曼哈顿距离，更适合八方向移动
function heuristic(a: GridNode, b: GridNode): number {
  // 欧几里得距离
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

// 从目标节点回溯构建路径
function reconstructPath(endNode: GridNode): [number, number][] {
  const path: [number, number][] = [];
  let current: GridNode | null = endNode;
  
  while (current) {
    path.unshift([current.x, current.y]);
    current = current.parent;
  }
  
  return path;
} 