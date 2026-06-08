import { CongestionFenceData, CongestionParamsData } from '../data/CongestionDataTypes';
import { FenceFormulaBase } from './FenceFormulaBase';

export class SpeedFormula extends FenceFormulaBase {
  calculateColorByteEncoded(param: CongestionParamsData, _: CongestionFenceData): number {
    const speed = param.value ?? 0;

    if (speed >= 120) return 1; // 120+ → #08641E (dark green)
    if (speed >= 101) return 2; // 120-101 → #2CF65C (light green)
    if (speed >= 81) return 3; // 100-81 → #FEE400 (yellow)
    if (speed >= 61) return 4; // 80-61 → #F5B719 (orange)
    if (speed >= 41) return 5; // 60-41 → #F14646 (red)
    return 6; // 40-0 → #721E1E (dark red)
  }
}
