import { MultiPolygonGeometry, PolygonWithHoles } from '../../../../entities/locationPanel/types';

export type LandUsePlotId = number;

export type PlotConstructionStatus =
  | 'Hidden'
  | 'Constructed'
  | 'Not Constructed'
  | 'Only Boundary Wall'
  | 'Under Construction'
  | 'RESIDENTIAL - Villa'
  | 'RESIDENTIAL - Apartment'
  | 'RESIDENTIAL - Planned'
  | 'SCHOOLS - Higher Education'
  | 'SCHOOLS - Nurseries'
  | 'SCHOOLS - Private'
  | 'SCHOOLS - Public'
  | 'SCHOOLS - Charter Schools'
  | 'SCHOOLS - POD Schools'
  | 'SCHOOLS - Tolerance Schools'
  | 'INDUSTRY - Default'
  | 'MEDICAL - Active'
  | 'MEDICAL - Planned'
  | 'OFFICES - Public'
  | 'OFFICES - Private'
  | 'RETAIL - Mall'
  | 'RETAIL - Other'
  | 'HOTELS - Hotels'
  | 'HOTELS - Resorts'
  | 'OTHERS - Religious'
  | 'OTHERS - Park'
  | 'OTHERS - Other'
  | 'ZONE - 1'
  | 'ZONE - 2'
  | 'ZONE - 3'
  | 'ZONE - 4'
  | 'ZONE - 5';

export type LandUseGeometryBase = {
  geometry: MultiPolygonGeometry;
};

export type LandUsePlotData = LandUseGeometryBase &
  LandUseEducationData & {
    sensorId: LandUsePlotId;
    state: PlotConstructionStatus;
    type: string;
    plotName: string;
    sectorName: string;
  };

export type LandUseTooltipData = {
  plotName: string;
  sector: string;
};

export type LandUseEducationData = {
  school: string;
  type: string;
  noOfStudents: number;
  noOfStaff: number;
};

export type LandUseZoneId = string;

export type LandUseZoneData = LandUseGeometryBase & {
  zone: LandUseZoneId;
  gfa: number;
  totalGfa: number;
  district: string;
};

export type LandUseConsumptionPillarData = {
  i: number;
  point: [number, number];
  value: number;
  valueNormalized: number;
  sectorName: string;
  plotName: string;
};

export type LandUseConsumptionPlotData = {
  value: number;
  sectorName: string;
  plotName: string;
  geometry: PolygonWithHoles[];
};

export enum ConsumptionGood {
  Water,
  Electricity,
}

export enum Consumptor {
  Residential = 'Residential',
  Commercial = 'Commercial',
  Apartment = 'Apartment',
  Villa = 'Villa',
  Shop = 'Shop',
  Office = 'Office',
  Utilization = 'utilization',
}
