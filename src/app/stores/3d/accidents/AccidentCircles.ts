import * as TWEEN from '@tweenjs/tween.js';
import { Color, Group, Intersection, MathUtils, Raycaster, Vector3 } from 'three';

import { CircleObject3D, DiskStyle } from '../CircleObject3D';
import { IDataModelDisplayGroup } from '../IDataModelDisplayGroup';
import { AccidentData, AccidentId } from './AccidentsDataTypes';
import IAccidentsParamFormula from './IAccidentsParamFormula';

const stylePalette: DiskStyle[] = [
  {
    fillColor: new Color(0xf14646).convertLinearToSRGB(),
    fillOpacity: 0.3,
    borderColor: new Color(0xf14646).convertLinearToSRGB(),
    borderDashed: false,
  },
  {
    fillColor: new Color(0xf14646).convertLinearToSRGB(),
    fillOpacity: 0.5,
    borderColor: new Color(0xf14646).convertLinearToSRGB(),
    borderDashed: false,
  },
  {
    fillColor: new Color(0xf14646).convertLinearToSRGB(),
    fillOpacity: 0.75,
    borderColor: new Color(0xf14646).convertLinearToSRGB(),
    borderDashed: false,
  },
  {
    fillColor: new Color(0xf14646).convertLinearToSRGB(),
    fillOpacity: 1,
    borderColor: new Color(0xf14646).convertLinearToSRGB(),
    borderDashed: false,
  },
];

export default class AccidentCircles
  extends Group
  implements IDataModelDisplayGroup<AccidentId, AccidentData, AccidentData, IAccidentsParamFormula>
{
  private circlesMap = new Map<AccidentId, CircleObject3D<AccidentId>>();

  create(_models: Map<number, AccidentData>): void {
    // Empty
  }

  clearMapDisplay() {
    this.clear();
    this.circlesMap.clear();
  }

  setData(
    current: Map<number, AccidentData>,
    _target: Map<number, AccidentData>,
    _paramFormula: IAccidentsParamFormula
  ): void {
    // Remove old circles through animation

    for (const [key, circle] of this.circlesMap) {
      new TWEEN.Tween({ value: 1 })
        .to({ value: 0 }, 2000)
        .onUpdate((o) => circle.setOpacity(o.value))
        .easing(TWEEN.Easing.Quadratic.In)
        .onComplete(() => this.remove(circle))
        .start();
      this.circlesMap.delete(key);
    }

    // Create new circles
    for (const [key, accident] of current) {
      const style = stylePalette[MathUtils.clamp(accident.injureLevel, 0, stylePalette.length - 1)];
      const maxRadius = 1500;
      const d = (MathUtils.clamp(accident.affectedPeopleCount, 1, 10) / 10) * maxRadius;

      const circle = new CircleObject3D<AccidentId>(key, accident.point, style);

      circle.setDiameter(d);
      this.circlesMap.set(key, circle);
      this.add(circle);

      const to = circle.scale.clone();
      circle.scale.set(0, 0, 0);
      new TWEEN.Tween(circle.scale).to(to, 250).easing(TWEEN.Easing.Quadratic.Out).start();
    }

    this.updateAnimation(0);
  }

  raycast(raycaster: Raycaster): [AccidentId, Intersection] | undefined {
    const intersects: Intersection[] = raycaster.intersectObjects(this.children, true);

    if (intersects.length === 0) {
      this.deselect();
      return undefined;
    }

    const nearestObject = intersects[0].object;

    const sprite = nearestObject as CircleObject3D<number>;
    const accidentId = sprite.objectId;
    if (!accidentId) {
      this.deselect();
      return undefined;
    }

    return [accidentId, intersects[0]];
  }

  select(selectId: AccidentId): void {
    for (const [id, circle] of this.circlesMap) {
      circle.setDimm(id != selectId);
      circle.deselect();
    }
    this.circlesMap.get(selectId)?.select();
  }

  deselect(): void {
    for (const [, circle] of this.circlesMap) {
      circle.setDimm(false);
      circle.deselect();
    }
  }

  updateAnimation(_k: number): void {
    // Empty
  }

  onCameraMove(_cameraPosition: Vector3, _pitchAngle: number): void {
    // Empty
  }
}
