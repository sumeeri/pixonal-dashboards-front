import { Slide } from '../dashboard/types.ts';
import { KpiConfig } from './types.ts';

export const KPI_CONFIG: { [k in Slide]?: KpiConfig } = {
  [Slide.PEOPLE_BEHAVIOR_OVERVIEW]: [
    {
      url: 'peopleoverview/population',
      id: 'population',
      params: ['location', 'locationType', 'year'],
    },
    {
      url: 'peopleoverview/charts/topdensearea',
      params: ['RegionLocationAndLocationType', 'quarter'],
      id: 'topDenseArea',
    },
    /* {
      url: 'peopleoverview/totaltripsPerday',
      id: 'totalTrips',
      params: ['location', 'locationType', 'quarter'],
    }, */
    {
      url: 'peopleoverview/population',
      id: 'totalTrips',
      params: ['location', 'locationType', 'year'],
    },
  ],

  [Slide.POPULATION_COUNT]: [
    {
      url: 'peopleoverview/population',
      id: 'population',
      params: ['location', 'locationType', 'year'],
    },
  ],

  [Slide.POPULATION_MOVEMENT_INBOUND]: [
    {
      url: 'peoplemovementinbound/kpi',
      id: 'population',
      params: ['location', 'locationType', 'quarter'],
    },
  ],

  [Slide.POPULATION_MOVEMENT_OUTBOUND]: [
    {
      url: 'peoplemovementoutbound/kpi',
      id: 'population',
      params: ['location', 'locationType', 'quarter'],
    },
  ],

  [Slide.POPULATION_MOVEMENT_WITHIN]: [
    {
      url: 'peoplemovementwithin/kpi',
      id: 'population',
      params: ['location', 'locationType', 'quarter'],
    },
  ],

  [Slide.LAND_USE_OVERVIEW]: [
    {
      url: 'landUseOverview/totalGfa',
      id: 'totalGFA',
      params: ['location', 'locationType', 'horizon'],
    },
  ],

  [Slide.SUMMARY]: [
    {
      url: 'landUseOverview/totalGfa',
      id: 'totalGFA',
      params: ['location', 'locationType', 'horizon'],
    },
    {
      url: 'residential/kpi',
      id: 'residential',
      params: ['location', 'locationType', 'horizon'],
    },
    {
      url: 'landUseOverview/households',
      id: 'households',
      params: ['location', 'locationType', 'horizon'],
    },
    {
      url: 'retail/kpi',
      id: 'retail',
      params: ['location', 'locationType', 'horizon'],
    },
    {
      url: 'offices/kpi',
      id: 'offices',
      params: ['location', 'locationType', 'horizon'],
    },
    {
      url: 'schools/kpi',
      id: 'schools',
      params: ['location', 'locationType', 'horizon'],
    },
    {
      url: 'industrial/kpi',
      id: 'industry',
      params: ['location', 'locationType', 'horizon'],
    },
    {
      url: 'medical/kpi',
      id: 'medical',
      params: ['location', 'locationType', 'horizon'],
    },
    {
      url: 'hotels/kpi',
      id: 'hospitality',
      params: ['location', 'locationType', 'horizon'],
    },
    {
      url: 'mosquesandparks/kpi',
      id: 'other',
      params: ['location', 'locationType', 'horizon'],
    },
  ],

  [Slide.LAND_USE_RESIDENTIAL]: [
    {
      url: 'residential/kpi',
      id: 'residential',
      params: ['location', 'locationType', 'horizon'],
    },
  ],

  [Slide.LAND_USE_RETAIL]: [
    {
      url: 'retail/kpi',
      id: 'retail',
      params: ['location', 'locationType', 'horizon'],
    },
  ],

  [Slide.LAND_USE_OFFICES]: [
    {
      url: 'offices/kpi',
      id: 'offices',
      params: ['location', 'locationType', 'horizon'],
    },
  ],

  [Slide.LAND_USE_EDUCATION]: [
    {
      url: 'schools/kpi',
      id: 'schools',
      params: ['location', 'locationType', 'horizon'],
    },
  ],

  [Slide.LAND_USE_INDUSTRY]: [
    {
      url: 'industrial/kpi',
      id: 'industry',
      params: ['location', 'locationType', 'horizon'],
    },
  ],

  [Slide.LAND_USE_PLANNED_OFFICIAL]: [
    {
      url: 'OfficialPlannedGrowth/kpi',
      id: 'officialPlannedGrowth',
      params: ['location', 'locationType', 'horizon'],
    },
  ],

  [Slide.LAND_USE_PLANNED_DEVELOPER]: [
    {
      url: 'DeveloperPlannedGrowth/kpi',
      id: 'developerPlannedGrowth',
      params: ['location', 'locationType', 'horizon'],
    },
  ],

  [Slide.LAND_USE_MEDICAL]: [
    {
      url: 'medical/kpi',
      id: 'medical',
      params: ['location', 'locationType', 'horizon'],
    },
  ],

  [Slide.LAND_USE_HOSPITALITY]: [
    {
      url: 'hotels/kpi',
      id: 'hospitality',
      params: ['location', 'locationType', 'horizon'],
    },
  ],

  [Slide.LAND_USE_OTHERS]: [
    {
      url: 'mosquesandparks/kpi',
      id: 'other',
      params: ['location', 'locationType', 'horizon'],
    },
  ],

  [Slide.LAND_USE_WATER_CONSUMPTION]: [
    {
      url: 'waterconsumption/kpi',
      id: 'water',
      params: ['location', 'locationType', 'quarter', 'consumptor'],
    },
  ],

  [Slide.LAND_USE_ELECTRICITY_CONSUMPTION]: [
    {
      url: 'electricityconsumption/kpi',
      id: 'electricity',
      params: ['location', 'locationType', 'quarter', 'consumptor'],
    },
  ],

  [Slide.MOBILITY_OVERVIEW]: [
    /* {
      url: 'mobility/numberoftrips',
      id: 'totalTrips',
      // TODO merenkov.vladislav: can not use year
      params: ['location', 'locationType', 'startDate', 'endDate'],
    } */
    {
      url: 'peopleoverview/population',
      id: 'totalTrips',
      params: ['location', 'locationType', 'year'],
    },
    {
      url: 'mobility/maritime/numberofpassengersperday',
      id: 'maritimePassengersPerDay',
      params: ['quarter'],
    },
    {
      url: 'mobility/aviation/numberofpassengersperday',
      id: 'aviationPassengersPerDay',
      params: ['quarter'],
    },
  ],

  [Slide.MOBILITY_TRIPS_INBOUND]: [
    {
      url: 'tripsinbound/kpi',
      id: 'totalTripsInbound',
      params: ['location', 'locationType', 'horizon'],
    },
  ],

  [Slide.MOBILITY_TRIPS_OUTBOUND]: [
    {
      url: 'tripsoutbound/kpi',
      id: 'totalTripsOutbound',
      params: ['location', 'locationType', 'horizon'],
    },
  ],

  [Slide.BUS_TRIPS_INBOUND]: [
    {
      url: 'bustripsinbound/kpi',
      id: 'totalRiders',
      params: ['location', 'locationType', 'quarter'],
    },
  ],

  [Slide.BUS_TRIPS_OUTBOUND]: [
    {
      url: 'bustripsoutbound/kpi',
      id: 'totalRiders',
      params: ['location', 'locationType', 'quarter'],
    },
  ],

  [Slide.BUS_TRIPS_WITHIN]: [
    {
      url: 'bustripswithin/kpi',
      id: 'totalRiders',
      params: ['location', 'locationType', 'quarter'],
    },
  ],

  [Slide.BUS_LINE_UTILIZATION]: [
    {
      url: 'BusLineUtilization/kpi',
      params: ['location', 'locationType', 'quarter'],
      id: 'busLineUtilization',
    },
  ],

  [Slide.TAXI_TRIPS_INBOUND]: [
    {
      url: 'taxitripsinbound/kpi',
      params: ['location', 'locationType', 'quarter'],
      id: 'totalRiders',
    },
  ],

  [Slide.TAXI_TRIPS_OUTBOUND]: [
    {
      url: 'taxitripsoutbound/kpi',
      params: ['location', 'locationType', 'quarter'],
      id: 'totalRiders',
    },
  ],

  [Slide.TAXI_TRIPS_WITHIN]: [
    {
      url: 'taxitripswithin/kpi',
      params: ['location', 'locationType', 'quarter'],
      id: 'totalRiders',
    },
  ],

  [Slide.STUDENTS_COUNT]: [
    {
      url: 'studentcount/kpi',
      id: 'totalStudents',
      params: ['location', 'locationType', 'quartersForCurrentPeriod'],
    },
  ],

  [Slide.STUDENTS_TRIPS_INBOUND]: [
    {
      url: 'studenttripsinbound/kpi',
      id: 'studenttripsinbound',
      params: ['location', 'locationType', 'quarter'],
    },
  ],

  [Slide.STUDENTS_TRIPS_OUTBOUND]: [
    {
      url: 'studenttripsoutbound/kpi',
      id: 'studenttripsoutbound',
      params: ['location', 'locationType', 'quarter'],
    },
  ],

  [Slide.STUDENTS_TRIPS_WITHIN]: [
    {
      url: 'studenttripswithin/kpi',
      id: 'studenttripswithin',
      params: ['location', 'locationType', 'quarter'],
    },
  ],

  [Slide.AVIATION_INBOUND]: [
    {
      url: 'InboundAviation/kpi',
      params: ['quarter'],
      id: 'passengers',
    },
  ],

  [Slide.AVIATION_OUTBOUND]: [
    {
      url: 'OutboundAviation/kpi',
      params: ['quarter'],
      id: 'passengers',
    },
  ],

  [Slide.AVIATION_CONNECTIVITY]: [
    {
      url: 'ConnectivityAviation/kpi',
      params: ['quarter'],
      id: 'connectivity',
    },
  ],

  [Slide.MARITIME_FACILITIES]: [
    {
      url: 'MaritimeFacilities/kpi',
      id: 'passengers',
      params: ['quarter'],
      mock: 51620,
    },
  ],

  [Slide.MARITIME_TRIPS]: [
    {
      url: 'MaritimeTrips/kpi',
      id: 'trips',
      params: ['quarter'],
      mock: 51620,
    },
  ],

  [Slide.TRAFFIC_OVERVIEW]: [
    {
      url: 'roadTraffic/kpi',
      id: 'congestionCost',
      params: ['location', 'locationType', 'quarter'],
    },
    {
      url: 'RoadTraffic/congestedkms',
      id: 'congestionKm',
      params: ['location', 'locationType', 'quarter'],
    },
    {
      url: 'junctionlevelofservice/kpi',
      id: 'failingJunctions',
      params: ['location', 'locationType', 'allMonthOfCurrentPeriod'],
    },
    {
      url: 'accidents/kpi',
      id: 'accidents',
      params: ['location', 'locationType', 'quarter'],
    },
    {
      url: 'accidents/kpi',
      id: 'accidentsPerKm',
      params: ['location', 'locationType', 'quarter'],
    },
  ],

  [Slide.ROAD_TRAFFIC]: [
    {
      url: 'roadTraffic/kpi',
      id: 'congestionCost',
      params: ['location', 'locationType', 'quarter'],
    },
  ],

  [Slide.JUNCTIONS]: [
    {
      url: 'junctionlevelofservice/kpi',
      id: 'failingJunctions',
      params: ['location', 'locationType', 'allMonthOfCurrentPeriod'],
    },
  ],

  [Slide.ACCIDENTS]: [
    {
      url: 'accidents/kpi',
      id: 'totalAccidents',
      params: ['location', 'locationType', 'quarter'],
    },
  ],
};
