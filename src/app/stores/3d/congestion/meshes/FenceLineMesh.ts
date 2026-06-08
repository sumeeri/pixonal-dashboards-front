import { DynamicDrawUsage, InstancedInterleavedBuffer, InterleavedBufferAttribute, MathUtils, Vector3 } from 'three';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';

import { RenderOrder } from '../../RenderOrderEnum.ts';
import { FenceId } from '../data/CongestionDataTypes.ts';
import { Fence } from '../data/Fence.ts';
import IFenceParamFormula from '../fenceParamFormulas/IFenceParamFormula.ts';
import { FenceLineMaterial, fenceLineMaterial } from '../materials/FenceLineMaterial.ts';
import FenceMeshBase from './FenceMeshBase.ts';

class FenceLineMesh<TParam> extends FenceMeshBase<TParam> {
  public material: FenceLineMaterial; // override material type

  protected paramFormula: IFenceParamFormula<TParam>;

  constructor(paramFormula: IFenceParamFormula<TParam>) {
    super(new LineSegmentsGeometry(), fenceLineMaterial);
    this.material = fenceLineMaterial;

    this.name = 'FencesLines';
    this.renderOrder = RenderOrder.FencesLines;

    this.paramFormula = paramFormula;
  }

  protected copyTargetToCurrentParams() {
    const currentStartAttr = this.geometry.getAttribute('currentStartValue');
    if (!currentStartAttr) return;
    const currentEndAttr = this.geometry.getAttribute('currentEndValue');
    if (!currentEndAttr) return;
    const targetStartAttr = this.geometry.getAttribute('targetStartValue');
    if (!targetStartAttr) return;
    const targetEndAttr = this.geometry.getAttribute('targetEndValue');
    if (!targetEndAttr) return;
    const currentColorAttr = this.geometry.getAttribute('currentColor');
    if (!currentColorAttr) return;
    const targetColorAttr = this.geometry.getAttribute('targetColor');
    if (!targetColorAttr) return;

    currentStartAttr.array.set(targetStartAttr.array);
    currentEndAttr.array.set(targetEndAttr.array);
    currentColorAttr.array.set(targetColorAttr.array);

    currentStartAttr.needsUpdate = true;
    currentEndAttr.needsUpdate = true;
    currentColorAttr.needsUpdate = true;
    this.material.animationK = 0;
  }

  protected getIndexStartInBuffer(fence: Fence): number {
    return fence.startLineIndex;
  }

  protected getIndexCountInBuffer(fence: Fence): number {
    return fence.lineIndexCount;
  }

  protected initGeometryInternal(fenceList: Map<number, Fence>): LineSegmentsGeometry {
    const verticesLine: number[] = [];
    const fenceIndexes: number[] = [];

    let lineIndex = 0;

    for (const fence of fenceList.values()) {
      let lineIndexCount = 0;

      const curve = fence.getCurvePath();
      const length = curve.getLength();
      const steps = Math.max(1, Math.round(length / this.resolution)) - 1;

      for (let i = 0; i < steps; i += 1) {
        const from: Vector3 = fence.getPoint(MathUtils.clamp(this.easeInOutSine(i / steps), 0, 1));
        const to: Vector3 = fence.getPoint(MathUtils.clamp(this.easeInOutSine((i + 1) / steps), 0, 1));

        verticesLine.push(from.x, from.y, 0);
        verticesLine.push(to.x, to.y, 0);

        fenceIndexes.push(fence.id);

        lineIndexCount += 1;
      }

      fence.startLineIndex = lineIndex;
      fence.lineIndexCount = lineIndexCount;

      lineIndex += lineIndexCount;
    }

    const geometry = new LineSegmentsGeometry();
    geometry.setPositions(verticesLine);

    geometry.setAttribute(
      'currentStartValue',
      new InterleavedBufferAttribute(
        new InstancedInterleavedBuffer(new Float32Array(verticesLine.length).fill(0), 1, 1).setUsage(DynamicDrawUsage),
        1,
        0
      )
    );

    geometry.setAttribute(
      'currentEndValue',
      new InterleavedBufferAttribute(
        new InstancedInterleavedBuffer(new Float32Array(verticesLine.length).fill(0), 1, 1).setUsage(DynamicDrawUsage),
        1,
        0
      )
    );

    geometry.setAttribute(
      'targetStartValue',
      new InterleavedBufferAttribute(
        new InstancedInterleavedBuffer(new Float32Array(verticesLine.length).fill(0), 1, 1).setUsage(DynamicDrawUsage),
        1,
        0
      )
    );

    geometry.setAttribute(
      'targetEndValue',
      new InterleavedBufferAttribute(
        new InstancedInterleavedBuffer(new Float32Array(verticesLine.length).fill(0), 1, 1).setUsage(DynamicDrawUsage),
        1,
        0
      )
    );

    geometry.setAttribute(
      'currentColor',
      new InterleavedBufferAttribute(
        new InstancedInterleavedBuffer(new Uint8Array(verticesLine.length).fill(0), 1, 1).setUsage(DynamicDrawUsage),
        1,
        0
      )
    );

    geometry.setAttribute(
      'targetColor',
      new InterleavedBufferAttribute(
        new InstancedInterleavedBuffer(new Uint8Array(verticesLine.length).fill(0), 1, 1).setUsage(DynamicDrawUsage),
        1,
        0
      )
    );

    geometry.setAttribute(
      'fenceIndex',
      new InterleavedBufferAttribute(new InstancedInterleavedBuffer(new Int32Array(fenceIndexes), 1, 1), 1, 0)
    );

    return geometry;
  }

  private applyParams(params: Map<FenceId, TParam>, startValueAttr: string, endValueAttr: string, colorAttr: string) {
    if (!this.fenceList) throw new Error('this.fenceList is undefined');

    const startValueAttrBuffer = this.geometry.getAttribute(startValueAttr);
    if (!startValueAttrBuffer) return;
    const endValueAttrBuffer = this.geometry.getAttribute(endValueAttr);
    if (!startValueAttrBuffer) return;
    const colorAttrBuffer = this.geometry.getAttribute(colorAttr);
    if (!colorAttrBuffer) return;

    startValueAttrBuffer.array.fill(0);
    endValueAttrBuffer.array.fill(0);
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
        let f = i / count;
        if (f < 0.5) {
          const k = MathUtils.clamp(f + 0.5, 0.5, 1);
          startValueAttrBuffer.array[start + i] = MathUtils.lerp(prevValue ?? value, value, k);
        } else {
          const k = MathUtils.clamp(f - 0.5, 0, 0.5);
          startValueAttrBuffer.array[start + i] = MathUtils.lerp(value, nextValue ?? value, k);
        }

        f = (i + 1) / count;
        if (f < 0.5) {
          const k = MathUtils.clamp(f + 0.5, 0.5, 1);
          endValueAttrBuffer.array[start + i] = MathUtils.lerp(prevValue ?? value, value, k);
        } else {
          const k = MathUtils.clamp(f - 0.5, 0, 0.5);
          endValueAttrBuffer.array[start + i] = MathUtils.lerp(value, nextValue ?? value, k);
        }

        colorAttrBuffer.array[start + i] = color;
      }
    }

    startValueAttrBuffer.needsUpdate = true;
    endValueAttrBuffer.needsUpdate = true;
    colorAttrBuffer.needsUpdate = true;
  }

  clearParams() {
    const startValueAttrBuffer = this.geometry.getAttribute('currentStartValue');
    if (!startValueAttrBuffer) return;
    const endValueAttrBuffer = this.geometry.getAttribute('currentEndValue');
    if (!startValueAttrBuffer) return;
    const colorAttrBuffer = this.geometry.getAttribute('currentColor');
    if (!colorAttrBuffer) return;

    startValueAttrBuffer.array.fill(0);
    endValueAttrBuffer.array.fill(0);
    colorAttrBuffer.array.fill(0);

    startValueAttrBuffer.needsUpdate = true;
    endValueAttrBuffer.needsUpdate = true;
    colorAttrBuffer.needsUpdate = true;
  }

  protected applyCurrentParams(params: Map<FenceId, TParam>) {
    this.applyParams(params, 'currentStartValue', 'currentEndValue', 'currentColor');
  }

  protected applyTargetParams(params: Map<FenceId, TParam>) {
    this.applyParams(params, 'targetStartValue', 'targetEndValue', 'targetColor');
  }
}

export { FenceLineMesh };
