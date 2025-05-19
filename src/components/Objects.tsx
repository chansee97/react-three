import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function Cube() {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (meshRef.current) {
      // 给立方体添加简单的旋转动画
      meshRef.current.rotation.y += 0.005
      meshRef.current.rotation.x += 0.002
    }
  })
  
  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial 
        color="#ff6b6b" 
        metalness={0.5} 
        roughness={0.3}
      />
    </mesh>
  )
}

interface GroundProps {
  size?: number | [number, number]
  color?: string
  position?: [number, number, number]
}

export function Ground({ 
  size = 15, 
  color = "#666",
  position = [0, 0, 0]
}: GroundProps) {
  // 处理尺寸参数，支持单一数值或指定 [宽度, 深度]
  const width = Array.isArray(size) ? size[0] : size
  const depth = Array.isArray(size) ? size[1] : size
  
  return (
    <mesh 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={position} 
      receiveShadow
    >
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
} 