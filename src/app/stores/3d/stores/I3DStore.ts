import { DataType } from 'shared/constants/mapDataParams.ts';

import { MainKpi, Slide, TimelineData } from '../../../../entities/dashboard/types';
import { ICaching3DStore } from './ICaching3DStore';

export interface I3DStore extends ICaching3DStore {
  fetchKpi?(): Promise<MainKpi>;
  timelineData?: TimelineData;
  fetchTimeline?(): Promise<void>;
  fetchStaticGeometry?(): Promise<void>;
  clearParams?(): void;
  fetchParams(currentId: number, targetId: number): Promise<void>;
  updateAnimation(k: number): void;
  setSlide?(slide: Slide | undefined): void;
  setDataType?(dataType: DataType): void;
}
