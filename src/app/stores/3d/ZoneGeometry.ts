import { Vector2 } from 'three';

import { PolygonWithHoles } from '../../../entities/locationPanel/types';
import MapUtils from './MapUtils';

export function prepareGeometry(polygonWithHoles: PolygonWithHoles) {
  const { shape, holes } = polygonWithHoles;
  const pointsVector2: Vector2[] = [];
  const pointsFlat: number[] = [];

  for (let i = 0; i < shape.length; i += 2) {
    const lng = shape[i];
    const lat = shape[i + 1];
    const point = MapUtils.getPositionFromWgs(lng, lat);
    pointsVector2.push(new Vector2(point.x, point.y));
    pointsFlat.push(point.x, point.y, 0);
  }

  const holesPointsVector2: Vector2[][] = [];
  const holesPointsFlat3: number[][] = [];

  for (const hole of holes) {
    const flat3: number[] = [];
    const vector2: Vector2[] = [];
    for (let i = 0; i < hole.length; i += 2) {
      const lng = hole[i];
      const lat = hole[i + 1];
      const point = MapUtils.getPositionFromWgs(lng, lat);
      vector2.push(new Vector2(point.x, point.y));
      flat3.push(point.x, point.y, 0);
    }
    holesPointsFlat3.push(flat3);
    holesPointsVector2.push(vector2);
  }
  return { pointsVector2, pointsFlat, holesPointsVector2, holesPointsFlat3 };
}
