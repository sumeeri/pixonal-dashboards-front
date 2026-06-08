import { Vector3 } from 'three';

import { LocationWithGeometry, PolygonWithHoles } from '../../../../entities/locationPanel/types';
import MapUtils from '../MapUtils';

export type PopulationZoneId = string;

export type PopulationZoneData = {
  id: PopulationZoneId; // sensor_id
  geometry: PolygonWithHoles[]; // geometry
  center: [number, number]; // centroid
  area: number;
};

export class PopulationData {
  public objectId: number | null = null;
}

export const PopulationZoneUtils = {
  getPopupPoint: (zoneData: PopulationZoneData, height: number): Vector3 => {
    const centerPos = PopulationZoneUtils.getPoint(zoneData);
    centerPos.z = height;
    return centerPos;
  },

  getPoint: (zoneData: PopulationZoneData): Vector3 => {
    return MapUtils.getPositionFromWgs(...zoneData.center);
  },
};

export type ZoneHierarchyId = string;

export type PopulationMoveParamsData = {
  from: ZoneHierarchyId;
  to: ZoneHierarchyId;
  peopleCount: number;
  count?: number;
  recurrency: number;
  differenceWithTypical: number;
};

export type PopulationWithinData = { location: string; peopleCount: number; recurrency: boolean };

export type PopulationMoveZone = {
  peopleMoveParamsData: PopulationMoveParamsData;
  location: LocationWithGeometry;
};

export type BusLineUtilizationTooltipData = {
  averageTripsPerDay?: number;
  averageTravelTime?: number;
  averageTravelDistance?: number;
  busModeShare?: number;
  averageOperatingSpeed?: number;
  noOfBusStops?: number;
  averageUtilization?: number;
  transfers?: number;
};
