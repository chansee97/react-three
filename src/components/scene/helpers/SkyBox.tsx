import React from 'react';
import { Sky } from '@react-three/drei';

interface SkyBoxProps {
  sunPosition?: [number, number, number];
  turbidity?: number;
  rayleigh?: number;
  mieCoefficient?: number;
  mieDirectionalG?: number;
  inclination?: number;
  azimuth?: number;
}

/**
 * 天空盒组件 - 使用drei的Sky组件创建逼真的天空效果
 */
export function SkyBox({
  sunPosition = [1, 2, 3],
  turbidity = 10,
  rayleigh = 0.5,
  mieCoefficient = 0.005,
  mieDirectionalG = 0.8,
  inclination = 0.49,
  azimuth = 0.25
}: SkyBoxProps) {
  return (
    <Sky
      distance={450000}
      sunPosition={sunPosition}
      turbidity={turbidity}
      rayleigh={rayleigh}
      mieCoefficient={mieCoefficient}
      mieDirectionalG={mieDirectionalG}
      inclination={inclination}
      azimuth={azimuth}
    />
  );
} 