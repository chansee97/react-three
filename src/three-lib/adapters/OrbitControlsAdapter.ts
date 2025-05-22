import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CameraControls } from '../interfaces';
import * as THREE from 'three';

export class OrbitControlsAdapter implements CameraControls {
  private controls: OrbitControls;

  constructor(camera: THREE.Camera, domElement: HTMLElement) {
    this.controls = new OrbitControls(camera, domElement);
  }

  update(): void {
    this.controls.update();
  }

  setEnableDamping(value: boolean): void {
    this.controls.enableDamping = value;
  }

  dispose(): void {
    this.controls.dispose();
  }
} 