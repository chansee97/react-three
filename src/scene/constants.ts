/**
 * 场景颜色配置
 */
export const COLORS = {
  start: "#ff5555",    // 鲜艳的红色起点
  end: "#ffdd00",      // 明亮的黄色终点
  obstacle: "#444444", // 深灰色障碍物
  path: "#ff69b4",     // 粉色路径线
  ground: "#999999",   // 灰色地面
  background: "#cccccc", // 背景色
};

/**
 * 默认场景配置
 */
export const DEFAULT_CONFIG = {
  groundSize: [20, 20] as [number, number],
  groundPosition: [0, -0.01, 0] as [number, number, number],
};

/**
 * 网格相关常量
 */
export const GRID = {
  cellSize: 1,  // 基准单元格大小
  tileScale: 0.95, // 瓦片相对于单元格的缩放比例
};

/**
 * 材质相关常量
 */
export const MATERIALS = {
  groundRoughness: 0.8,
  groundMetalness: 0.2,
}; 