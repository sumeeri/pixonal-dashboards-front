import { BufferGeometry, MathUtils, Vector3 } from 'three';
import { DynamicDrawUsage, StaticDrawUsage } from 'three/src/constants';
import { BufferAttribute as BA } from 'three/src/core/BufferAttribute';

import { RenderOrder } from '../../RenderOrderEnum.ts';
import { FenceId } from '../data/CongestionDataTypes.ts';
import { Fence } from '../data/Fence.ts';
import IFenceParamFormula from '../fenceParamFormulas/IFenceParamFormula.ts';
import { FenceMaterial, fenceMaterial } from '../materials/FenceMaterial.ts';
import FenceMeshBase from './FenceMeshBase.ts';

class FenceMesh<TParam> extends FenceMeshBase<TParam> {
  public material: FenceMaterial; // override material type

  protected paramFormula: IFenceParamFormula<TParam>;

  constructor(paramFormula: IFenceParamFormula<TParam>) {
    super(new BufferGeometry(), fenceMaterial);
    this.material = fenceMaterial;

    this.name = 'Fences';
    this.castShadow = true;
    this.renderOrder = RenderOrder.Fences;

    this.paramFormula = paramFormula;
  }

  protected copyTargetToCurrentParams() {
    const currentAttr = this.geometry.getAttribute('current');
    if (!currentAttr) return;
    const targetAttr = this.geometry.getAttribute('target');
    if (!targetAttr) return;
    const currentColorAttr = this.geometry.getAttribute('currentColor');
    if (!currentColorAttr) return;
    const targetColorAttr = this.geometry.getAttribute('targetColor');
    if (!targetColorAttr) return;

    currentAttr.array.set(targetAttr.array);
    currentColorAttr.array.set(targetColorAttr.array);

    currentAttr.needsUpdate = true;
    currentColorAttr.needsUpdate = true;
    this.material.animationK = 0;
  }

  protected getIndexStartInBuffer(fence: Fence): number {
    return fence.startVertexIndex;
  }

  protected getIndexCountInBuffer(fence: Fence): number {
    return fence.vertexIndexCount;
  }

  private updateCPUPositionBuffer(params: Map<FenceId, TParam>) {
    if (!this.fenceList) return;

    // Change positions on CPU only (for Shadow and Ray-casting)
    if (params) {
      const positions = this.geometry.getAttribute('position') as BA;
      for (const [key, param] of params) {
        const fence = this.fenceList.get(key);
        if (!fence) continue;
        const height = this.paramFormula.calculateHeight(param, fence);
        for (let i = 1; i < fence.vertexIndexCount; i += 2) {
          const index = fence.startVertexIndex + i;
          positions.setZ(index, height);
        }
      }
      // Upload to GPU for proper shadows
      positions.needsUpdate = true;
    }
  }

  setParams(paramFormula: IFenceParamFormula<TParam>, current: Map<FenceId, TParam>, target: Map<FenceId, TParam>) {
    super.setParams(paramFormula, current, target);

    this.updateCPUPositionBuffer(target);
  }

  protected initGeometryInternal(fenceList: Map<number, Fence>) {
    const positions: number[] = [];
    const heights: number[] = [];
    const indexes: number[] = [];
    const fenceIndexes: number[] = [];

    let vertexIndex: number = 0;

    for (const fence of fenceList.values()) {
      const startVertexIndex = vertexIndex;

      const curve = fence.getCurvePath();
      const length = curve.getLength();
      const steps = Math.max(1, Math.round(length / this.resolution));

      for (let i = 0; i <= steps; i += 1) {
        const pos: Vector3 = fence.getPoint(MathUtils.clamp(this.easeInOutSine(i / steps), 0, 1));
        positions.push(pos.x, pos.y, 0); // Ground
        positions.push(pos.x, pos.y, 1); // Top

        heights.push(0, 0);
        fenceIndexes.push(fence.id, fence.id);

        vertexIndex += 2;

        if (i > 0) {
          indexes.push(
            vertexIndex - 1,
            vertexIndex - 3,
            vertexIndex - 4,
            vertexIndex - 1,
            vertexIndex - 4,
            vertexIndex - 2
          );
        }
      }

      fence.startVertexIndex = startVertexIndex;
      fence.vertexIndexCount = vertexIndex - startVertexIndex;
    }

    const positionsAttr = new BA(new Float32Array(positions), 3);
    positionsAttr.setUsage(DynamicDrawUsage);

    const heightAttr = new BA(new Float32Array(heights), 1, true);
    heightAttr.setUsage(DynamicDrawUsage);

    const colorAttr = new BA(new Uint8Array(heights), 1);
    colorAttr.setUsage(DynamicDrawUsage);

    const fenceIndexesAttr = new BA(new Int32Array(fenceIndexes), 1);
    fenceIndexesAttr.setUsage(StaticDrawUsage);

    const bg: BufferGeometry = new BufferGeometry();
    bg.setIndex(indexes);
    bg.setAttribute('position', positionsAttr);
    bg.setAttribute('fenceIndex', fenceIndexesAttr);
    bg.setAttribute('current', heightAttr);
    bg.setAttribute('target', heightAttr.clone());
    bg.setAttribute('currentColor', colorAttr);
    bg.setAttribute('targetColor', colorAttr.clone());
    bg.computeVertexNormals();

    return bg;
  }

  clearParams(valueAttr: string, colorAttr: string) {
    const valueAttrBuffer = this.geometry.getAttribute(valueAttr);
    if (!valueAttrBuffer) return;
    const colorAttrBuffer = this.geometry.getAttribute(colorAttr);
    if (!colorAttrBuffer) return;

    valueAttrBuffer.array.fill(0);
    colorAttrBuffer.array.fill(0);

    valueAttrBuffer.needsUpdate = true;
    colorAttrBuffer.needsUpdate = true;
  }

  private applyParams(params: Map<FenceId, TParam>, valueAttr: string, colorAttr: string) {
    if (!this.fenceList) throw new Error('this.fenceList is undefined');

    const valueAttrBuffer = this.geometry.getAttribute(valueAttr);
    if (!valueAttrBuffer) return;
    const colorAttrBuffer = this.geometry.getAttribute(colorAttr);
    if (!colorAttrBuffer) return;

    valueAttrBuffer.array.fill(0);
    colorAttrBuffer.array.fill(0);

    for (const [fenceId, fence] of this.fenceList) {
      const prevFence = this.fenceList.get(fence.previousId[0]);
      const nextFence = this.fenceList.get(fence.nextId[0]);

      const param = params.get(fenceId);
      const prevParam = params.get(fence.previousId[0]);
      const nextParam = params.get(fence.nextId[0]);

      if (!param) continue;

      const value = this.paramFormula.calculateHeightAsByte(param, fence);
      const prevValue = prevFence && prevParam && this.paramFormula.calculateHeightAsByte(prevParam, prevFence);
      const nextValue = nextFence && nextParam && this.paramFormula.calculateHeightAsByte(nextParam, nextFence);

      const color = this.paramFormula.calculateColorByteEncoded(param, fence);
      // const prevColor = prevFence && prevParam && this.paramFormula.calculateColorByteEncoded(prevParam, prevFence);
      // const nextColor = nextFence && nextParam && this.paramFormula.calculateColorByteEncoded(nextParam, nextFence);

      const start = this.getIndexStartInBuffer(fence);
      const count = this.getIndexCountInBuffer(fence);

      for (let i = 0; i < count; i += 1) {
        const f = i / count;
        if (f < 0.5) {
          const k = MathUtils.clamp(f + 0.5, 0.5, 1);
          valueAttrBuffer.array[start + i] = MathUtils.lerp(prevValue ?? value, value, k);
          // colorAttrBuffer.array[start + i] = MathUtils.lerp(prevColor ?? color, color, k);
        } else {
          const k = MathUtils.clamp(f - 0.5, 0, 0.5);
          valueAttrBuffer.array[start + i] = MathUtils.lerp(value, nextValue ?? value, k);
          // colorAttrBuffer.array[start + i] = MathUtils.lerp(color, nextColor ?? color, k);
        }
        colorAttrBuffer.array[start + i] = color;
      }
    }

    valueAttrBuffer.needsUpdate = true;
    colorAttrBuffer.needsUpdate = true;
  }

  protected applyCurrentParams(params: Map<FenceId, TParam>) {
    this.applyParams(params, 'current', 'currentColor');
  }

  protected applyTargetParams(params: Map<FenceId, TParam>) {
    this.applyParams(params, 'target', 'targetColor');
  }
}

export { FenceMesh };
