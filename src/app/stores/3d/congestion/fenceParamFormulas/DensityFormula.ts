import { CongestionFenceData, CongestionParamsData } from '../data/CongestionDataTypes';
import { FenceFormulaBase } from './FenceFormulaBase';

export class DensityFormula extends FenceFormulaBase {
  calculateColorByteEncoded(param: CongestionParamsData, _: CongestionFenceData): number {
    const value = param.value > 1 ? 1 : param.value;
    return 220 + Math.ceil(value * 3);
  }
}
