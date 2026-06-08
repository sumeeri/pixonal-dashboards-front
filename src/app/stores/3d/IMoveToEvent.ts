import { PointLike } from 'mapbox-gl';
import { Vector3 } from 'three';

export interface IMoveToEvent {
  pointOfInterest: Vector3;
  zoom: number;
  resetRotation: boolean;
  offset: PointLike;
}
