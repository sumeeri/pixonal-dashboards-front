import { MathUtils } from 'three';

import { CongestionFenceData, CongestionParamsData } from '../data/CongestionDataTypes';
import { FenceFormulaBase } from './FenceFormulaBase';

export class RelativeSpeedFormula extends FenceFormulaBase {
  calculateColorByteEncoded(param: CongestionParamsData, _fence: CongestionFenceData): number {
    const relativeSpeed = MathUtils.clamp(param.value ?? 0, 0, 1);

    // if (relativeSpeed <= 0.5) return 6;     // dark red
    if (relativeSpeed <= 0.7) return 5; // red
    if (relativeSpeed <= 0.85) return 3; // yellow
    return 1; // green
  }
}
