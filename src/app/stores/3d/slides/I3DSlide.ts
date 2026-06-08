import { Camera, Raycaster, Scene, Vector2 } from 'three';

import { IMoveToEvent } from '../IMoveToEvent';

export type SelectData = {
  raycaster: Raycaster;
  pointer: Vector2;
  mouse: Vector2;
  size: Vector2;
};

export interface I3DSlide {
  stopTimelineEvent?: () => void;
  moveToEvent?: (selectResult: IMoveToEvent) => void;

  install(scene: Scene): void;
  uninstall(scene: Scene): void;
  onCameraMove(camera: Camera, zoomLevel: number): void;
  raycast(data: SelectData): void;
  deselect(): void;
  hover?(raycaster: Raycaster): void;
  setVisible(visible: boolean): void;
  clearMap(): void;
}
