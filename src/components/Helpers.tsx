import { Grid } from '@react-three/drei'

interface AxesHelperProps {
  size?: number
  visible?: boolean
}

export function AxesHelper({ size = 5, visible = false }: AxesHelperProps) {
  if (!visible) return null
  
  return (
    <axesHelper args={[size]} />
  )
}

interface GridHelperProps {
  visible?: boolean
}

export function GridHelper({ visible = false }: GridHelperProps) {
  if (!visible) return null
  
  return (
    <group>
      <Grid 
        infiniteGrid 
        cellSize={1}
        cellThickness={0.5}
        sectionSize={3}
        sectionThickness={1}
        sectionColor="#2080ff"
        fadeDistance={30}
      />
    </group>
  )
} 