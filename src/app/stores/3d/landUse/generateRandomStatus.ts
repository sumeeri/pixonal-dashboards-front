import sample from 'lodash/sample';
import { DataType } from 'shared/constants/mapDataParams.ts';

import { Slide } from '../../../../entities/dashboard/types';
import { PlotConstructionStatus } from './LandUseDataTypes';

export function generateRandomStatus(slide: Slide, dataType: DataType | undefined) {
  let overrideBuildingStatus: PlotConstructionStatus | undefined;

  if (dataType === DataType.LAND_USE_TYPE_ZONE) {
    // overrideBuildingStatus = sample<BuildingConstructionStatus>([
    //   'ZONE - 1',
    //   'ZONE - 2',
    //   'ZONE - 3',
    //   'ZONE - 4',
    //   'ZONE - 5',
    // ]);
  } else {
    switch (slide) {
      case Slide.LAND_USE_RESIDENTIAL:
        overrideBuildingStatus = sample<PlotConstructionStatus>([
          'Hidden',
          'RESIDENTIAL - Villa',
          'RESIDENTIAL - Apartment',
          'RESIDENTIAL - Planned',
        ]);
        break;
      case Slide.LAND_USE_SCHOOLS:
      case Slide.LAND_USE_EDUCATION:
        overrideBuildingStatus = sample<PlotConstructionStatus>([
          // .._.fill(Array(5), 'Hidden'),
          'Hidden',
          'Hidden',
          'Hidden',
          'Hidden',
          'Hidden',
          'SCHOOLS - Higher Education',
          'SCHOOLS - Nurseries',
          'SCHOOLS - Private',
          'SCHOOLS - Public',
          'SCHOOLS - Public',
        ]);
        break;
      case Slide.LAND_USE_MEDICAL:
        overrideBuildingStatus = sample<PlotConstructionStatus>([
          // .._.fill(Array(5), 'Hidden'),
          'Hidden',
          'Hidden',
          'Hidden',
          'Hidden',
          'Hidden',
          'MEDICAL - Active',
          'MEDICAL - Planned',
        ]);
        break;
      case Slide.LAND_USE_OFFICES:
        overrideBuildingStatus = sample<PlotConstructionStatus>([
          // .._.fill(Array(5), 'Hidden'),
          'Hidden',
          'Hidden',
          'Hidden',
          'Hidden',
          'Hidden',
          'OFFICES - Public',
          'OFFICES - Private',
        ]);
        break;
      case Slide.LAND_USE_RETAIL:
        overrideBuildingStatus = sample<PlotConstructionStatus>([
          // .._.fill(Array(5), 'Hidden'),
          'Hidden',
          'Hidden',
          'Hidden',
          'Hidden',
          'Hidden',
          'RETAIL - Mall',
          'RETAIL - Other',
        ]);
        break;
      case Slide.LAND_USE_HOTELS:
        overrideBuildingStatus = sample<PlotConstructionStatus>([
          // .._.fill(Array(5), 'Hidden'),
          'Hidden',
          'Hidden',
          'Hidden',
          'Hidden',
          'Hidden',
          'HOTELS - Hotels',
          'HOTELS - Resorts',
        ]);
        break;
    }
  }

  return overrideBuildingStatus;
}
