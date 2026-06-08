import {
  Color,
  Group,
  Intersection,
  Mesh,
  Object3D,
  Object3DEventMap,
  Path,
  Raycaster,
  Shape,
  ShapeGeometry,
} from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';

import { LocationWithGeometry } from '../../../entities/locationPanel/types.ts';
import { BetterLineMaterial } from './BetterLineMaterial.ts';
import { prepareGeometry } from './ZoneGeometry.ts';

export class ZoneObject3D extends Group {
  public static readonly lineMaterial = new BetterLineMaterial({
    color: new Color().setHex(0x5f76d3, 'srgb-linear'),
    transparent: true,
    opacity: 0.9,
    linewidth: 1.5,
    dashed: true,
  });

  constructor(public lacationWithGeometry: LocationWithGeometry) {
    super();

    for (const polygonWithHoles of lacationWithGeometry.geometry) {
      const { pointsVector2, pointsFlat, holesPointsVector2, holesPointsFlat3 } = prepareGeometry(polygonWithHoles);

      // Fill mesh (not visible, needs for raycasting)
      const shape = new Shape(pointsVector2);
      shape.holes = holesPointsVector2.map((x) => new Path(x));
      const geometry = new ShapeGeometry(shape);
      const mesh = new Mesh(geometry, undefined);
      mesh.position.set(0, 0, 5);
      mesh.visible = false;
      this.add(mesh);

      // Border mesh
      for (const points of [pointsFlat, ...holesPointsFlat3]) {
        const geometry = new LineGeometry().setPositions(points);
        const curveObject = new Line2(geometry, ZoneObject3D.lineMaterial);
        curveObject.layers.disableAll();
        curveObject.layers.enable(1);
        curveObject.position.set(0, 0, 5);
        this.add(curveObject);
      }
    }
  }

  raycast(raycaster: Raycaster, intersects: Intersection<Object3D<Object3DEventMap>>[]): void {
    const intersections = raycaster.intersectObjects(this.children);
    intersections.forEach((x) => (x.object = this));
    intersects.push(...intersections);
  }
}
