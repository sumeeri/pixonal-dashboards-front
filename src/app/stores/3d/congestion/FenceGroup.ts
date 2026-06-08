import { BufferAttribute, Group, Intersection, Mesh, Raycaster, Vector3 } from 'three';

import { IDataModelDisplayGroup } from '../IDataModelDisplayGroup';
import { FenceId } from './data/CongestionDataTypes';
import { Fence } from './data/Fence';
import IFenceParamFormula from './fenceParamFormulas/IFenceParamFormula';
import { FenceLineMesh } from './meshes/FenceLineMesh';
import { FenceMesh } from './meshes/FenceMesh';

export default class FenceGroup<TParam>
  extends Group
  implements IDataModelDisplayGroup<FenceId, Fence, TParam, IFenceParamFormula<TParam>>
{
  private readonly fenceMesh: FenceMesh<TParam>;
  private readonly fenceLineMesh: FenceLineMesh<TParam>;
  private paramFormula: IFenceParamFormula<TParam>;
  private fenceList: Map<number, Fence>;

  public getFenceMesh(): FenceMesh<TParam> {
    return this.fenceMesh;
  }

  public getFenceLineMesh(): FenceLineMesh<TParam> {
    return this.fenceLineMesh;
  }

  constructor(paramFormula: IFenceParamFormula<TParam>) {
    super();

    this.fenceList = new Map<number, Fence>();
    this.paramFormula = paramFormula;

    this.fenceMesh = new FenceMesh(this.paramFormula);
    this.fenceLineMesh = new FenceLineMesh(this.paramFormula);
    this.add(this.fenceMesh);
    this.add(this.fenceLineMesh);
  }

  clearMapDisplay(): void {
    this.fenceMesh.clearParams('current', 'currentColor');
    this.fenceLineMesh.clearParams();
  }

  create(fences: Map<number, Fence>): void {
    this.fenceList = fences;

    this.fenceMesh.initGeometry(fences);
    this.fenceLineMesh.initGeometry(fences);
  }

  setData(current: Map<FenceId, TParam>, target: Map<FenceId, TParam>, paramFormula: IFenceParamFormula<TParam>): void {
    this.paramFormula = paramFormula;
    this.fenceMesh.setParams(this.paramFormula, current, target);
    this.fenceLineMesh.setParams(this.paramFormula, current, target);
  }

  raycast(raycaster: Raycaster): [FenceId, Intersection] | undefined {
    // First try to intersect with the line mesh (has visual thickness and easier to click)
    const lineIntersects: Intersection[] = raycaster.intersectObject(this.fenceLineMesh, true);

    if (lineIntersects.length > 0) {
      const nearestIntersection: Intersection = lineIntersects[0];
      const lineMesh = nearestIntersection.object as Mesh;
      const fenceIndexAttr = lineMesh.geometry.getAttribute('fenceIndex') as BufferAttribute;
      if (fenceIndexAttr) {
        const fenceIndex: number = fenceIndexAttr.array[nearestIntersection.index ?? 0];
        const fence = this.fenceList.get(fenceIndex);
        if (fence) {
          return [fence.id, nearestIntersection];
        }
      }
    }

    // Fallback to the main fence mesh
    const intersects: Intersection[] = raycaster.intersectObject(this.fenceMesh, true);

    if (intersects.length === 0) {
      this.deselect();
      return undefined;
    }

    const nearestIntersection: Intersection = intersects[0];
    const mesh = nearestIntersection.object as Mesh;
    const face = nearestIntersection.face;
    if (!face) {
      this.deselect();
      return undefined;
    }

    const faceIndex = Math.min(face.a, face.b, face.c);
    const fenceIndexAttr = mesh.geometry.getAttribute('fenceIndex') as BufferAttribute;
    const fenceIndex: number = fenceIndexAttr.array[faceIndex];
    const fence = this.fenceList.get(fenceIndex);
    if (!fence) {
      this.deselect();
      return undefined;
    }

    return [fence.id, nearestIntersection];
  }

  select(id: FenceId): void {
    this.fenceMesh.material.fenceIndexSelected = id;
    this.fenceLineMesh.material.fenceIndexSelected = id;
  }

  deselect(): void {
    this.fenceMesh.material.fenceIndexSelected = -1;
    this.fenceLineMesh.material.fenceIndexSelected = -1;
  }

  updateAnimation(k: number): void {
    this.fenceMesh.material.animationK = k;
    this.fenceLineMesh.material.animationK = k;
  }

  onCameraMove(cameraPosition: Vector3, pitchAngle: number): void {
    this.fenceMesh.material.cameraPos = cameraPosition;
    this.fenceLineMesh.material.pitchAngle = pitchAngle;
    this.fenceLineMesh.material.cameraPos = cameraPosition;
  }
}
