import { MathUtils } from 'three';

import { CongestionFenceData, CongestionParamsData } from '../data/CongestionDataTypes';
import { FenceFormulaBase } from './FenceFormulaBase';

export class VolumeFormula extends FenceFormulaBase {
  calculateColorByteEncoded(param: CongestionParamsData, _: CongestionFenceData): number {
    // very few parameters have f parameter
    return Math.floor(110 + MathUtils.clamp((param.value ?? 0) / 500, 0, 1) * 100);
  }
}
