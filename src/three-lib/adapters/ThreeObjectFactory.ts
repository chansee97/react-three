import * as THREE from 'three';
import { ObjectFactory } from '../interfaces';

type LightOptions = {
  color?: number;
  intensity?: number;
  position?: { x?: number; y?: number; z?: number };
};

export class ThreeObjectFactory implements ObjectFactory {
  createLight(type: string, options?: LightOptions): THREE.Light {
    switch (type) {
      case 'ambient': {
        return new THREE.AmbientLight(
          options?.color || 0x404040, 
          options?.intensity || 1
        );
      }
      case 'directional': {
        const dirLight = new THREE.DirectionalLight(
          options?.color || 0xffffff, 
          options?.intensity || 1
        );
        if (options?.position) {
          dirLight.position.set(
            options.position.x || 0,
            options.position.y || 0,
            options.position.z || 0
          );
        }
        return dirLight;
      }
      default:
        return new THREE.AmbientLight();
    }
  }

  createAxesHelper(size?: number): THREE.AxesHelper {
    return new THREE.AxesHelper(size || 5);
  }

  createGridHelper(size?: number, divisions?: number, colorCenterLine?: number, colorGrid?: number): THREE.GridHelper {
    return new THREE.GridHelper(
      size || 10,
      divisions || 10,
      colorCenterLine || 0x444444,
      colorGrid || 0x888888
    );
  }

  createPolarGridHelper(radius?: number, sectors?: number, rings?: number, divisions?: number): THREE.PolarGridHelper {
    return new THREE.PolarGridHelper(
      radius || 10,
      sectors || 16,
      rings || 8,
      divisions || 64
    );
  }

  createBoxHelper(object: THREE.Object3D, color?: number): THREE.BoxHelper {
    return new THREE.BoxHelper(object, color || 0xffff00);
  }

  createCameraHelper(camera: THREE.Camera): THREE.CameraHelper {
    return new THREE.CameraHelper(camera);
  }

  createDirectionalLightHelper(light: THREE.DirectionalLight, size?: number): THREE.DirectionalLightHelper {
    return new THREE.DirectionalLightHelper(light, size || 1);
  }

  createSpotLightHelper(light: THREE.SpotLight): THREE.SpotLightHelper {
    return new THREE.SpotLightHelper(light);
  }
} 