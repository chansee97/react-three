import * as THREE from 'three';
import { ObjectFactory } from '../interfaces';

type LightOptions = {
  color?: number;
  intensity?: number;
  position?: { x?: number; y?: number; z?: number };
};

export class ThreeObjectFactory implements ObjectFactory {
  createCube(options?: { color?: number, size?: number }): THREE.Mesh {
    const size = options?.size || 1;
    const color = options?.color || 0x00ff00;
    
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshStandardMaterial({ 
      color: color 
    });
    
    return new THREE.Mesh(geometry, material);
  }

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
} 