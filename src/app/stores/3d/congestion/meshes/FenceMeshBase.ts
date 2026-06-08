import { BufferGeometry, Mesh } from 'three';

import { FenceId } from '../data/CongestionDataTypes.ts';
import { Fence } from '../data/Fence.ts';
import IFenceParamFormula from '../fenceParamFormulas/IFenceParamFormula.ts';

export default abstract class FenceMeshBase<TParam> extends Mesh {
  protected resolution = 0.00005;

  public abstract material: any;

  protected fenceList: Map<number, Fence> | undefined;
  protected abstract paramFormula: IFenceParamFormula<TParam>;
  private lastTarget?: Map<FenceId, TParam>;

  initGeometry(fenceList: Map<number, Fence>) {
    this.fenceList = fenceList;
    this.geometry = this.initGeometryInternal(fenceList);
  }

  protected abstract getIndexStartInBuffer(fence: Fence): number;
  protected abstract getIndexCountInBuffer(fence: Fence): number;

  protected abstract copyTargetToCurrentParams(): void;

  protected abstract applyCurrentParams(params: Map<FenceId, TParam>): void;

  protected abstract applyTargetParams(params: Map<FenceId, TParam>): void;

  setParams(paramFormula: IFenceParamFormula<TParam>, current: Map<FenceId, TParam>, target: Map<FenceId, TParam>) {
    this.paramFormula = paramFormula;

    if (current === target) {
      this.applyTargetParams(target);
      this.copyTargetToCurrentParams();
    } else if (current === this.lastTarget) {
      this.copyTargetToCurrentParams();
      this.applyTargetParams(target);
    } else {
      this.applyCurrentParams(current);
      this.applyTargetParams(target);
    }

    this.lastTarget = target;
  }

  protected abstract initGeometryInternal(fenceList: Map<number, Fence>): BufferGeometry;

  protected easeInOutSine(x: number): number {
    return -(Math.cos(Math.PI * x) - 1) / 2;
  }
}
