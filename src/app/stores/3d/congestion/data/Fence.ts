import { CurvePath, LineCurve, Vector2, Vector3 } from 'three';

import MapUtils from '../../MapUtils';
import IFenceParamFormula from '../fenceParamFormulas/IFenceParamFormula';
import { CongestionFenceData, FenceId } from './CongestionDataTypes';

export class Fence implements CongestionFenceData {
  // TODO: pack into Fence field
  // rethink IFence being interface
  id: FenceId; // Camera id
  speed: number; // Max speed
  capacity: number; // Capacity
  geometry: number[]; // Coords [lat, lng, ... ]
  location: number; // Zone
  nextId: number[];
  previousId: number[];

  // Calculated parameters
  faceIndex: number;

  startVertexIndex: number = 0;
  vertexIndexCount: number = 0;

  startLineIndex: number = 0;
  lineIndexCount: number = 0;

  private cachedPath?: CurvePath<Vector2>;

  constructor(id: number, data: CongestionFenceData, faceIndex: number) {
    this.id = id;
    this.faceIndex = faceIndex;

    this.id = data.id;
    this.speed = data.speed;
    this.capacity = data.capacity;
    this.geometry = data.geometry;
    this.location = data.location;
    this.nextId = data.nextId;
    this.previousId = data.previousId;
  }

  public getPopupPoint<TParam>(paramFormula: IFenceParamFormula<TParam>, param: TParam): Vector3 {
    const centerPos = this.getPoint(0.5);
    centerPos.z = paramFormula.calculateHeight(param, this);
    return centerPos;
  }

  public getCurvePath(): CurvePath<Vector2> {
    if (!this.cachedPath) {
      this.cachedPath = new CurvePath();
      for (let i = 0; i < this.geometry.length - 2; i += 2) {
        this.cachedPath.add(
          new LineCurve(
            new Vector2(this.geometry[i], this.geometry[i + 1]),
            new Vector2(this.geometry[i + 2], this.geometry[i + 3])
          )
        );
      }
    }
    return this.cachedPath;
  }

  /**
   * Returns a vector for a given position on the curve
   */
  public getPoint(t: number): Vector3 {
    this.cachedPath = this.getCurvePath();
    const wgsPos = this.cachedPath.getPoint(t);
    return MapUtils.getPositionFromWgs(wgsPos.x, wgsPos.y);
  }
}
