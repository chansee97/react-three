import * as THREE from 'three';

type LightOptions = {
  color?: number;
  intensity?: number;
  position?: { x?: number; y?: number; z?: number };
};

export interface ObjectFactory {
  createCube(options?: { color?: number; size?: number }): THREE.Mesh;
  createLight(type: string, options?: LightOptions): THREE.Light;
  createAxesHelper(size?: number): THREE.AxesHelper;
}