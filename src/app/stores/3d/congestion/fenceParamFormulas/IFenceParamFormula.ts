import { CongestionFenceData } from '../data/CongestionDataTypes';

interface IFenceParamFormula<TParam> {
  calculateHeight(param: TParam, fence: CongestionFenceData): number;
  calculateHeightAsByte(param: TParam, fence: CongestionFenceData): number;
  calculateColorByteEncoded(param: TParam, fence: CongestionFenceData): number;
}

export default IFenceParamFormula;
