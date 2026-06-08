export enum Slide {
  LANDING = 'landing',
  // People
  PEOPLE_BEHAVIOR_OVERVIEW = 'people-behavior-overview',
  POPULATION_COUNT = 'population',
  POPULATION_MOVEMENT_INBOUND = 'population-movement-inbound',
  POPULATION_MOVEMENT_OUTBOUND = 'population-movement-outbound',
  POPULATION_MOVEMENT_WITHIN = 'population-movement-within',

  // Land Use
  LAND_USE_OVERVIEW = 'land-use-overview',
  SUMMARY = 'summary',
  LAND_USE_RESIDENTIAL = 'land-use-residential',
  LAND_USE_RETAIL = 'land-use-retail',
  LAND_USE_OFFICES = 'land-use-offices',
  LAND_USE_EDUCATION = 'land-use-education',
  LAND_USE_INDUSTRY = 'land-use-industry',
  LAND_USE_MEDICAL = 'land-use-medical',
  LAND_USE_HOSPITALITY = 'land-use-hospitality',
  LAND_USE_OTHERS = 'land-use-others',
  LAND_USE_WATER_CONSUMPTION = 'land-use-water-consumption',
  LAND_USE_ELECTRICITY_CONSUMPTION = 'land-use-electricity-consumption',
  LAND_USE_PLANNED_OFFICIAL = 'land-use-planned-official',
  LAND_USE_PLANNED_DEVELOPER = 'land-use-planned-developer',

  // Mobility
  MOBILITY_OVERVIEW = 'mobility-overview',
  MOBILITY_TRIPS_INBOUND = 'mobility-trips-inbound',
  MOBILITY_TRIPS_OUTBOUND = 'mobility-trips-outbound',
  BUS_TRIPS_INBOUND = 'bus-and-taxi-bus-trips-inbound',
  BUS_TRIPS_OUTBOUND = 'bus-and-taxi-bus-trips-outbound',
  BUS_TRIPS_WITHIN = 'bus-and-taxi-bus-trips-within',
  BUS_LINE_UTILIZATION = 'bus-and-taxi-bus-line-utilisation',
  TAXI_TRIPS_INBOUND = 'bus-and-taxi-taxi-trips-inbound',
  TAXI_TRIPS_OUTBOUND = 'bus-and-taxi-taxi-trips-outbound',
  TAXI_TRIPS_WITHIN = 'bus-and-taxi-taxi-trips-within',
  STUDENTS_COUNT = 'students-count',
  STUDENTS_COUNT_DENSITY = 'students-count-density',
  STUDENTS_COUNT_PLACES = 'students-count-places',
  STUDENTS_TRIPS_INBOUND = 'students-trips-inbound',
  STUDENTS_TRIPS_OUTBOUND = 'students-trips-outbound',
  STUDENTS_TRIPS_WITHIN = 'students-trips-within',
  AVIATION_INBOUND = 'aviation-inbound',
  AVIATION_OUTBOUND = 'aviation-outbound',
  AVIATION_CONNECTIVITY = 'aviation-connectivity',
  MARITIME_FACILITIES = 'maritime-facilities',
  MARITIME_TRIPS = 'maritime-trips',

  // Traffic
  TRAFFIC_OVERVIEW = 'traffic-overview',
  ROAD_TRAFFIC = 'road-traffic',
  JUNCTIONS = 'junctions',
  ACCIDENTS = 'accidents',

  // TODO: remove these slides later from all usages
  // Utils or deprecated
  LAND_USE_CONSTRUCTION = 'land-use-construction',
  LAND_USE_SCHOOLS = 'land-use-schools',
  LAND_USE_HOTELS = 'land-use-hotels',
}

export const PeopleSlides = [
  Slide.PEOPLE_BEHAVIOR_OVERVIEW,
  Slide.POPULATION_COUNT,
  Slide.POPULATION_MOVEMENT_INBOUND,
  Slide.POPULATION_MOVEMENT_OUTBOUND,
  Slide.POPULATION_MOVEMENT_WITHIN,
];

export const LandUseSlides = [
  Slide.LAND_USE_OVERVIEW,
  Slide.SUMMARY,
  Slide.LAND_USE_RESIDENTIAL,
  Slide.LAND_USE_RETAIL,
  Slide.LAND_USE_OFFICES,
  Slide.LAND_USE_EDUCATION,
  Slide.LAND_USE_INDUSTRY,
  Slide.LAND_USE_MEDICAL,
  Slide.LAND_USE_HOSPITALITY,
  Slide.LAND_USE_OTHERS,
  Slide.LAND_USE_WATER_CONSUMPTION,
  Slide.LAND_USE_ELECTRICITY_CONSUMPTION,
  Slide.LAND_USE_PLANNED_OFFICIAL,
  Slide.LAND_USE_PLANNED_DEVELOPER,
];

export const MobilitySlides = [
  Slide.MOBILITY_OVERVIEW,
  Slide.MOBILITY_TRIPS_INBOUND,
  Slide.MOBILITY_TRIPS_OUTBOUND,
  Slide.BUS_TRIPS_INBOUND,
  Slide.BUS_TRIPS_OUTBOUND,
  Slide.BUS_TRIPS_WITHIN,
  Slide.BUS_LINE_UTILIZATION,
  Slide.TAXI_TRIPS_INBOUND,
  Slide.TAXI_TRIPS_OUTBOUND,
  Slide.TAXI_TRIPS_WITHIN,
  Slide.STUDENTS_COUNT,
  Slide.STUDENTS_TRIPS_INBOUND,
  Slide.STUDENTS_TRIPS_OUTBOUND,
  Slide.STUDENTS_TRIPS_WITHIN,
  Slide.AVIATION_INBOUND,
  Slide.AVIATION_OUTBOUND,
  Slide.AVIATION_CONNECTIVITY,
  Slide.MARITIME_FACILITIES,
  Slide.MARITIME_TRIPS,
];

export const TrafficSlides = [Slide.TRAFFIC_OVERVIEW, Slide.ROAD_TRAFFIC, Slide.JUNCTIONS, Slide.ACCIDENTS];

export const defaultSlide = Slide.PEOPLE_BEHAVIOR_OVERVIEW;

export enum LocationTabs {
  ALL_LOCATIONS = 'all locations',
  EMIRATES = 'emirates',
  REGIONS = 'regions',
  DISTRICTS = 'districts',
  ZONES = 'zones',
  CORRIDORS = 'corridors',
}

export type TimeValue = {
  name: string;
  date: Date;
};

export type HorizonValue = {
  id: number;
  name: string;
};

export enum ValuesTypes {
  RANGE = 'range',
  PATTERN = 'pattern',
  HORIZON = 'horizon',
}

export enum Periods {
  Days,
  Months,
  Patterns,
  Horizons,
}

export enum MarkerType {
  Top,
  BusStop,
  Location,
}

export type DataForTimeInterval = {
  columns: string[];
  types: string[];
  units?: string[];
} & TimelineData;

export type MultiPolygon = {
  s: number[];
  h: number[];
};

type OverviewBase = {
  key: string;
  title?: string;
  column?: string;
  row?: string;
};

export type OverviewChart = OverviewBase & {
  chartIds: string[];
};

export type OverviewValue = OverviewBase & {
  kpiKey: string;
  value?: string;
  valuePostfix?: string | string[];
  caption?: string;
  actions?: 'persquare' | 'camelcase';
  compare?: {
    value: string;
    text: string;
  };
  titleSize?: 'large' | 'default';
  valueSize?: 'large' | 'default';
};

export type OverviewKpi = OverviewValue | OverviewChart;

export interface DashboardConfig {
  kpis?: OverviewKpi[];
}

export interface ITimePoint {
  values: number[];
  axisName: string;
}

export interface ITimePointsData {
  timestamps: string[];
  xDataType: TimelineXDataType;
  pointValues: ITimePoint[];
}

export interface MainKpi {
  mainKpi: number;
  percent: number;
}

export interface TimelineData {
  values: number[][];
  xData: string[];
  xDataType: TimelineXDataType;
}

export interface TimelineDataResponse {
  values: number[][];
  time: string[];
  date: string[];
}

export enum TimelineXDataType {
  Time,
  Date,
}

export enum TimelineAggregation {
  ENTIRE = 0,
  TYPICAL = 4,
}

export type Pattern = {
  name: string;
  date: Date;
};

export interface PatternsData {
  type: string;
  patterns: Pattern[];
}
