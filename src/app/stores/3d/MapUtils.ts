import { LngLat, MercatorCoordinate } from 'mapbox-gl';
import { Camera, MathUtils, Mesh, Vector2, Vector3 } from 'three';
import { BufferAttribute as BA } from 'three/src/core/BufferAttribute';

import { IStartPoint } from './IStartPoint.ts';

export default class MapUtils {
  public static startPoint: IStartPoint;

  static getPositionFromWgsVector2(lng: number, lat: number): Vector2 {
    const objectCoords: MercatorCoordinate = MercatorCoordinate.fromLngLat([lng, lat], 0);
    const x: number = (this.startPoint.x - objectCoords.x) / this.startPoint.scale;
    const y: number = (this.startPoint.y - objectCoords.y) / this.startPoint.scale;
    return new Vector2(-x, y);
  }

  static getPositionFromWgs(lng: number, lat: number, z: number = 0): Vector3 {
    const position = this.getPositionFromWgsVector2(lng, lat);
    return new Vector3(position.x, position.y, z);
  }

  static getWgsFromPosition(position: Vector3): LngLat {
    const x = -(-position.x * this.startPoint.scale - this.startPoint.x);
    const y = -(position.y * this.startPoint.scale - this.startPoint.y);
    return new MercatorCoordinate(x, y).toLngLat();
  }

  static getScreenCoordinates(e: MouseEvent, width: number, height: number): Vector2 {
    return new Vector2((e.offsetX / width) * 2 - 1, -(e.offsetY / height) * 2 + 1);
  }

  static worldToScreen(position: Vector3, camera: Camera, width: number, height: number): Vector2 {
    const projected = position.clone().project(camera);
    return new Vector2(((projected.x + 1) * width) / 2, (-(projected.y - 1) * height) / 2);
  }

  static getZeroBA(mesh: Mesh, attrName: string): BA | null {
    if (!mesh) return null;

    const relativeSpeeds = mesh.geometry.getAttribute(attrName) as BA;
    const zeroArray = Array(relativeSpeeds.count).fill(0);
    relativeSpeeds.set(zeroArray, 0);

    return relativeSpeeds;
  }

  static fittingZoomLevel(distance: number, maxZoomLevel?: number): number {
    const plusMargin = 1.5;
    // https://docs.mapbox.com/help/glossary/zoom-level/
    const normalized = MathUtils.clamp(MathUtils.inverseLerp(18, 7355113, distance * plusMargin), 0, 1);
    const zoomLevel = MathUtils.lerp(22, 0, normalized ** 0.15);
    return MathUtils.clamp(zoomLevel, 0, maxZoomLevel ?? 22);
  }
}

const mc: MercatorCoordinate = MercatorCoordinate.fromLngLat([54.38820259957879, 24.472218482943372], 0);
MapUtils.startPoint = { x: mc.x, y: mc.y, z: mc.z, scale: mc.meterInMercatorCoordinateUnits() };
