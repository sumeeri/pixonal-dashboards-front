import { Color, Group, Intersection, MathUtils, Raycaster, Vector3 } from 'three';

import { CircleObject3D } from '../CircleObject3D';
import { IDataModelDisplayGroup } from '../IDataModelDisplayGroup';
import settingsState from '../SettingsState';
import IJunctionParamFormula from './IJunctionParamFormula';
import { JunctionData, JunctionId, JunctionParamsData, LevelOfServive } from './JunctionDataTypes';

export default class JunctionCircles
  extends Group
  implements IDataModelDisplayGroup<JunctionId, JunctionData, JunctionParamsData, IJunctionParamFormula>
{
  private circlesMap = new Map<JunctionId, CircleObject3D<JunctionId>>();
  private current = new Map<JunctionId, JunctionParamsData>();
  private target = new Map<JunctionId, JunctionParamsData>();

  create(models: Map<JunctionId, JunctionData>): void {
    this.circlesMap.clear();
    this.clear();

    for (const [key, junction] of models) {
      const circle = new CircleObject3D(key, junction.g);
      this.circlesMap.set(key, circle);
      this.add(circle);
    }
  }

  clearMapDisplay() {
    this.circlesMap.clear();
    this.clear();
  }

  setData(
    current: Map<JunctionId, JunctionParamsData>,
    target: Map<JunctionId, JunctionParamsData>,
    _paramFormula: IJunctionParamFormula
  ): void {
    this.current = current;
    this.target = target;
    this.updateAnimation(0);
  }

  raycast(raycaster: Raycaster): [JunctionId, Intersection] | undefined {
    const intersects: Intersection[] = raycaster.intersectObjects(this.children, true);

    if (intersects.length === 0) {
      this.deselect();
      return undefined;
    }

    const nearestObject = intersects[0].object;

    const sprite = nearestObject as CircleObject3D<string>;
    const objectId = sprite.objectId;

    if (!objectId) {
      this.deselect();
      return undefined;
    }

    return [objectId, intersects[0]];
  }

  select(selectId: JunctionId): void {
    for (const [, circle] of this.circlesMap) {
      // circle.setDimm(id != selectId);
      circle.deselect();
    }
    this.circlesMap.get(selectId)?.select();
  }

  deselect(): void {
    for (const [, circle] of this.circlesMap) {
      // circle.setDimm(false);
      circle.deselect();
    }
  }

  private getLevelOfServiceColor(level: LevelOfServive): Color {
    return new Color(
      settingsState.failingJunctions.LOScolors[Math.floor((level.charCodeAt(0) - 'A'.charCodeAt(0)) / 2)]
    );
  }

  updateAnimation(k: number): void {
    for (const [key, circle] of this.circlesMap) {
      const current = this.current.get(key);
      const target = this.target.get(key);
      if (current && target) {
        const maxDelay = 100;
        const maxRadius = 300;
        const d =
          (MathUtils.lerp(Math.min(current.delay, maxDelay), Math.min(target.delay, maxDelay), k) / maxDelay) *
          maxRadius;
        const currentColor = this.getLevelOfServiceColor(current.serviceLevel);
        const targetColor = this.getLevelOfServiceColor(target.serviceLevel);
        const color = currentColor.clone().lerp(targetColor, k);
        circle.visible = true;
        circle.setDiameter(d);
        circle.setDimm(!['E', 'F'].includes(current.serviceLevel));
        circle.setStyle({ borderColor: color, borderDashed: false, fillColor: color, fillOpacity: 0.25 });
      } else {
        circle.visible = false;
      }
    }
  }

  onCameraMove(_cameraPosition: Vector3, _pitchAngle: number): void {
    // Empty
  }
}
