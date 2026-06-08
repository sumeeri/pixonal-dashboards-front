import * as TWEEN from '@tweenjs/tween.js';
import {
  BufferGeometry,
  CircleGeometry,
  Color,
  EllipseCurve,
  Group,
  Intersection,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Object3DEventMap,
  Raycaster,
} from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';

import { BetterLineMaterial } from './BetterLineMaterial';
import MapUtils from './MapUtils';

export type DiskStyle = {
  fillColor: Color;
  fillOpacity: number;
  borderColor: Color;
  borderDashed: boolean;
};

const circleFillMaterial = new MeshBasicMaterial({ transparent: true, opacity: 0.3, depthWrite: false });

const circleBorderMaterial = new BetterLineMaterial({
  linewidth: 3,
  depthWrite: false,
});

export class CircleObject3D<TKey> extends Group {
  static extrudeHeight: number = 0;

  private static antiZFightingElevation = 10;
  private static circleGeometry: BufferGeometry = new CircleGeometry(1, 32);

  private readonly circleGroup: Group;
  private readonly circleBottomGroup: Group;

  private readonly circleFillMaterial: MeshBasicMaterial;
  private readonly circleBorderMaterial: BetterLineMaterial;
  private readonly circleBottomBorderMaterial: BetterLineMaterial;

  constructor(
    public objectId: TKey,
    location: [number, number],
    style?: DiskStyle
  ) {
    super();

    const [lng, lat] = location;

    this.circleGroup = new Group();
    this.circleBottomGroup = new Group();

    // Fill circle
    {
      const geometry = CircleObject3D.circleGeometry;
      this.circleFillMaterial = circleFillMaterial.clone();
      const circle = new Mesh(geometry, this.circleFillMaterial);
      circle.renderOrder = 0;
      this.circleGroup.add(circle);
    }

    const curve = new EllipseCurve(0, 0, 1, 1);
    const points = curve.getPoints(32);
    const flatPoints = [];
    for (const point of points) {
      flatPoints.push(point.x, point.y, 0);
    }

    // Circle border line
    {
      const geometry = new LineGeometry().setPositions(flatPoints);
      this.circleBorderMaterial = circleBorderMaterial.clone();
      this.circleBorderMaterial.dashed = true;
      const curveObject = new Line2(geometry, this.circleBorderMaterial);

      curveObject.renderOrder = 2;
      curveObject.position.set(0, 0, CircleObject3D.extrudeHeight);
      this.circleGroup.add(curveObject);
    }

    // Circle border bottom line
    {
      const geometry = new LineGeometry().setPositions(flatPoints);
      this.circleBottomBorderMaterial = circleBorderMaterial.clone();
      this.circleBottomBorderMaterial.dashed = true;
      this.circleBottomBorderMaterial.transparent = true;
      this.circleBottomBorderMaterial.opacity = 0.25;
      const curveObject = new Line2(geometry, this.circleBottomBorderMaterial);
      curveObject.renderOrder = 1;
      curveObject.position.set(0, 0, CircleObject3D.extrudeHeight);
      this.circleBottomGroup.add(curveObject);
    }

    const pos = MapUtils.getPositionFromWgs(lng, lat);

    this.position.set(pos.x, pos.y, CircleObject3D.antiZFightingElevation);
    this.add(this.circleGroup);
    this.add(this.circleBottomGroup);

    if (style) {
      this.setStyle(style);
    }
  }

  setDiameter(diameter: number) {
    const d = diameter;
    this.scale.set(d, d, 1);
  }

  setStyle(diskStyle: DiskStyle) {
    this.circleFillMaterial.color = diskStyle.fillColor;
    this.circleFillMaterial.opacity = diskStyle.fillOpacity;
    this.circleBorderMaterial.color = this.circleBottomBorderMaterial.color = diskStyle.borderColor;
    this.circleBorderMaterial.dashSize = diskStyle.borderDashed ? 0.1 : 0;
    this.circleBorderMaterial.gapSize = diskStyle.borderDashed ? 0.1 : 0;
  }

  select() {
    new TWEEN.Tween(this.circleGroup.position)
      .to(this.circleGroup.position.clone().setZ(70))
      .duration(250)
      .easing(TWEEN.Easing.Quadratic.Out)
      .start();
  }

  deselect() {
    new TWEEN.Tween(this.circleGroup.position)
      .to(this.circleGroup.position.clone().setZ(0))
      .duration(250)
      .easing(TWEEN.Easing.Quadratic.Out)
      .start();
  }

  setOpacity(value: number) {
    this.circleFillMaterial.opacity = 0.3 * value;
    this.circleBorderMaterial.dashed = value < 1;
    this.circleBorderMaterial.transparent = value < 1;
    this.circleBorderMaterial.opacity = value;
  }

  setDimm(dimm: boolean): void {
    const mul = dimm ? 0.2 : 1;
    this.circleFillMaterial.opacity = 0.3 * mul;
    this.circleBorderMaterial.dashed = dimm;
    this.circleBorderMaterial.transparent = dimm;
    this.circleBorderMaterial.opacity = mul;
  }

  raycast(raycaster: Raycaster, intersects: Intersection<Object3D<Object3DEventMap>>[]): void {
    const intersections = raycaster.intersectObjects(this.children);
    intersections.forEach((x) => (x.object = this));
    intersects.push(...intersections);
  }
}
