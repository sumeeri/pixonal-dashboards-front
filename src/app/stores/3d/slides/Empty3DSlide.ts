import { Scene } from 'three';

import { I3DSlide, SelectData } from './I3DSlide.ts';

export default class Empty3DSlide implements I3DSlide {
  init(): void {
    // Empty
  }
  install(_: Scene): void {
    // Empty
  }
  uninstall(_: Scene): void {
    // Empty
  }
  onCameraMove(): void {
    // Empty
  }

  raycast(_: SelectData): void {
    // Empty
  }
  deselect(): void {
    // Empty
  }
  setVisible(_: boolean): void {
    // Empty
  }

  clearMap(): void {
    // Empty
  }
}
