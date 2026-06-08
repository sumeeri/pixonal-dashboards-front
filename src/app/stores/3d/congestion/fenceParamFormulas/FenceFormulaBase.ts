import { MathUtils } from 'three';

import { CongestionFenceData, CongestionParamsData } from '../data/CongestionDataTypes';
import IFenceParamFormula from './IFenceParamFormula';

export abstract class FenceFormulaBase implements IFenceParamFormula<CongestionParamsData> {
  abstract calculateColorByteEncoded(param: CongestionParamsData, fence: CongestionFenceData): number;

  calculateHeightNormalized(param: CongestionParamsData, _: CongestionFenceData): number {
    return MathUtils.clamp((param.delayProportion ?? 0) / 10, 0, 1);
  }

  calculateHeight(param: CongestionParamsData, fence: CongestionFenceData): number {
    const height = this.calculateHeightNormalized(param, fence);
    return height * 200;
  }

  calculateHeightAsByte(param: CongestionParamsData, fence: CongestionFenceData): number {
    const height = this.calculateHeightNormalized(param, fence);
    return height * 255;
  }
}
