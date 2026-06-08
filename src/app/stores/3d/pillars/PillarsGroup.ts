import { Group, Intersection, PerspectiveCamera, Raycaster, Vector3, WebGLRenderer } from 'three';

import { IDataModelDisplayGroup } from '../IDataModelDisplayGroup';
import MapUtils from '../MapUtils';
import { PillarsSettings } from '../SettingsState';
import { SelectData } from '../slides/I3DSlide';
import { PillarsMesh } from './PillarsMesh';

export class PillarsGroup extends Group implements IDataModelDisplayGroup<number, [number, number], number> {
  private readonly pillars: PillarsMesh;

  constructor(pillarsSettings: PillarsSettings) {
    super();
    this.pillars = new PillarsMesh(pillarsSettings);
    this.add(this.pillars);
  }

  clearMapDisplay(): void {
    this.pillars.clearAttributes();
  }

  create(models: Map<number, [number, number]>): void {
    const positions: number[] = [];
    for (const [, data] of models) {
      const pos = MapUtils.getPositionFromWgs(data[0], data[1]);
      positions.push(pos.x, pos.y, pos.z);
    }
    this.pillars.setPositions(positions);
  }

  setData(current: Map<number, number>, target: Map<number, number>, _paramFormula: undefined = undefined): void {
    this.pillars.setHeights(
      Array.from(current.values()).map((x) => x * 255),
      Array.from(target.values()).map((x) => x * 255)
    );
  }

  raycast(_raycaster: Raycaster): [number, Intersection] | undefined {
    // Use raycastSelectData instead
    return undefined;
  }

  raycastSelectData(data: SelectData, renderer: WebGLRenderer, camera: PerspectiveCamera): number | undefined {
    const pillarID = this.pillars.pick(data.mouse, renderer, camera, data.size);
    return pillarID >= 0 ? pillarID : undefined;
  }

  select(id: number): void {
    this.pillars.material.uniforms.selectedInstance.value = id;
  }

  deselect(): void {
    this.pillars.material.uniforms.selectedInstance.value = -1;
  }

  updateAnimation(k: number): void {
    this.pillars.material.animationK = k;
  }

  onCameraMove(_cameraPosition: Vector3, _pitchAngle: number): void {
    // Empty
  }
}
