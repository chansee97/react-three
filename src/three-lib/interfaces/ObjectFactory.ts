import * as THREE from 'three';

type LightOptions = {
  color?: number;
  intensity?: number;
  position?: { x?: number; y?: number; z?: number };
};

export interface ObjectFactory {
  createLight(type: string, options?: LightOptions): THREE.Light;
  createAxesHelper(size?: number): THREE.AxesHelper;
  createGridHelper(size?: number, divisions?: number, colorCenterLine?: number, colorGrid?: number): THREE.GridHelper;
  createPolarGridHelper(radius?: number, sectors?: number, rings?: number, divisions?: number): THREE.PolarGridHelper;
  createBoxHelper(object: THREE.Object3D, color?: number): THREE.BoxHelper;
  createCameraHelper(camera: THREE.Camera): THREE.CameraHelper;
  createDirectionalLightHelper(light: THREE.DirectionalLight, size?: number): THREE.DirectionalLightHelper;
  createSpotLightHelper(light: THREE.SpotLight): THREE.SpotLightHelper;
}