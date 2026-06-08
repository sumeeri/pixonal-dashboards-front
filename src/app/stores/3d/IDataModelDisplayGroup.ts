import { Intersection, Raycaster, Vector3 } from 'three';

export interface IDataModelDisplayGroup<TStaticId, TData, TParam, TParamFormula = undefined, TDynamicId = TStaticId> {
  create(models: Map<TStaticId, TData>): void;
  setData(current: Map<TStaticId, TParam>, target: Map<TStaticId, TParam>, paramFormula: TParamFormula): void;
  raycast(raycaster: Raycaster): [TDynamicId, Intersection] | undefined;
  select(id: TDynamicId): void;
  deselect(): void;
  updateAnimation(k: number): void;
  onCameraMove(cameraPosition: Vector3, pitchAngle: number): void;
  clearMapDisplay?(): void;
}
