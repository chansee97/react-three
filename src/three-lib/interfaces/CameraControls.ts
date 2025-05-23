export interface CameraControls {
  update(): void;
  setEnableDamping(value: boolean): void;
  dispose(): void;
  reset(): void;
  saveState(): void;
} 