import { useRef } from 'react'
import { useHelper } from '@react-three/drei'
import * as THREE from 'three'

interface LightsProps {
  showHelpers?: boolean
}

export function Lights({ showHelpers = false }: LightsProps) {
  // 创建灯光引用，用于辅助显示
  const spotLightRef = useRef<THREE.SpotLight>(null!)
  const directionalLightRef = useRef<THREE.DirectionalLight>(null!)
  // const pointLightRef1 = useRef<THREE.PointLight>(null!)
  // const pointLightRef2 = useRef<THREE.PointLight>(null!)
  
  // 添加灯光辅助器
  useHelper(showHelpers && spotLightRef, THREE.SpotLightHelper, 'cyan')
  useHelper(showHelpers && directionalLightRef, THREE.DirectionalLightHelper, 1, 'white')
  // useHelper(showHelpers && pointLightRef1, THREE.PointLightHelper, 0.3, 'red')
  // useHelper(showHelpers && pointLightRef2, THREE.PointLightHelper, 0.3, 'blue')
  
  return (
    <>
      {/* 基础环境光 */}
      <ambientLight intensity={1} />
      
      {/* 主方向光 - 模拟太阳光 */}
      <directionalLight 
        ref={directionalLightRef}
        position={[5, 8, 5]} 
        intensity={0.8} 
        color="#ffffff" 
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      
      {/* 添加聚光灯 - 从上方照射 */}
      <spotLight 
        ref={spotLightRef}
        position={[0, 8, 0]} 
        angle={0.3} 
        penumbra={0.8} 
        intensity={0.8} 
        color="#00ffff" 
        castShadow
        distance={15}
      />
      
      {/* 添加点光源 - 红色 */}
      {/* <pointLight 
        ref={pointLightRef1}
        position={[-3, 0, 0]} 
        intensity={0.5} 
        color="#ff0000" 
        distance={6}
      /> */}
      
      {/* 添加点光源 - 蓝色 */}
      {/* <pointLight 
        ref={pointLightRef2}
        position={[3, 0, 2]} 
        intensity={0.5} 
        color="#0000ff" 
        distance={6}
      /> */}
      
      {/* 添加半球光 - 模拟天空和地面的反射光 */}
      <hemisphereLight 
        color="#b1e1ff" 
        groundColor="#000000" 
        intensity={0.3} 
      />
    </>
  )
} 