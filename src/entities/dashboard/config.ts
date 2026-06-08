import { DataType, PatternsTypes } from 'shared/constants/mapDataParams.ts';
import { generateUUID } from 'shared/utils/generateUUID.ts';

import { LocationType } from '../locationPanel/types.ts';
import { DashboardConfig, LandUseSlides, Slide } from './types.ts';

export const typesOfMostUsed = [DataType.MOST_USED_ENTRY_POINTS, DataType.MOST_USED_EXIT_POINTS];

export const slidesWithoutTypicalDayType = [
  Slide.AVIATION_CONNECTIVITY,
  Slide.AVIATION_INBOUND,
  Slide.AVIATION_OUTBOUND,
  Slide.MARITIME_FACILITIES,
  Slide.MARITIME_TRIPS,
  Slide.LAND_USE_WATER_CONSUMPTION,
  Slide.LAND_USE_ELECTRICITY_CONSUMPTION,
  Slide.ACCIDENTS,
];

export const typesOfBusStops = [
  DataType.BUS_STOPS,
  DataType.TRANSFERS_BUS_STOPS,
  DataType.BOARDING_BUS_STOPS,
  DataType.ALIGHTINGS_BUS_STOPS,
  DataType.END_TO_END_TRIPS_BUS_STOPS,
];

export const overviewSlides = [
  Slide.PEOPLE_BEHAVIOR_OVERVIEW,
  Slide.LAND_USE_OVERVIEW,
  Slide.MOBILITY_OVERVIEW,
  Slide.TRAFFIC_OVERVIEW,
  Slide.SUMMARY,
];

export const inaccessibleSlidesForEmirates = [
  Slide.POPULATION_MOVEMENT_INBOUND,
  Slide.POPULATION_MOVEMENT_OUTBOUND,
  Slide.BUS_TRIPS_INBOUND,
  Slide.TAXI_TRIPS_INBOUND,
  Slide.TAXI_TRIPS_OUTBOUND,
  Slide.BUS_TRIPS_OUTBOUND,
  Slide.STUDENTS_TRIPS_INBOUND,
  Slide.STUDENTS_TRIPS_OUTBOUND,
  Slide.MOBILITY_TRIPS_INBOUND,
  Slide.MOBILITY_TRIPS_OUTBOUND,
];

export const inaccessibleSlidesForZonesWhileSwitching = [
  Slide.BUS_TRIPS_WITHIN,
  Slide.BUS_LINE_UTILIZATION,
  Slide.TAXI_TRIPS_WITHIN,
  Slide.STUDENTS_TRIPS_WITHIN,
  Slide.POPULATION_MOVEMENT_WITHIN,
  Slide.JUNCTIONS,
  Slide.LANDING,
];

export const inaccessibleSlidesForZones = [
  Slide.BUS_TRIPS_WITHIN,
  Slide.BUS_LINE_UTILIZATION,
  Slide.TAXI_TRIPS_WITHIN,
  Slide.STUDENTS_TRIPS_WITHIN,
  Slide.POPULATION_MOVEMENT_WITHIN,
  Slide.JUNCTIONS,
  Slide.LANDING,
];

const slidesForAllLevels = [
  Slide.PEOPLE_BEHAVIOR_OVERVIEW,
  Slide.LAND_USE_OVERVIEW,
  Slide.MOBILITY_OVERVIEW,
  Slide.TRAFFIC_OVERVIEW,
  Slide.SUMMARY,
  Slide.POPULATION_COUNT,
  Slide.STUDENTS_COUNT,
  Slide.ACCIDENTS,
  Slide.BUS_LINE_UTILIZATION,
  ...LandUseSlides,
];

export const populationMovementSlides = [
  Slide.POPULATION_MOVEMENT_INBOUND,
  Slide.POPULATION_MOVEMENT_OUTBOUND,
  Slide.POPULATION_MOVEMENT_WITHIN,
];

export const populationDensitySlides = [Slide.POPULATION_COUNT];

export const accessibleTypesOfLocationForSlide = (slide: Slide) => {
  if (slidesForAllLevels.includes(slide)) {
    return [
      LocationType.EMIRATE,
      LocationType.REGION,
      LocationType.DISTRICT,
      LocationType.SPECIAL_DISTRICT,
      LocationType.ZONE,
    ];
  }

  if (inaccessibleSlidesForEmirates.includes(slide)) {
    return [LocationType.REGION, LocationType.DISTRICT, LocationType.SPECIAL_DISTRICT, LocationType.ZONE];
  }

  if (inaccessibleSlidesForZones.includes(slide)) {
    return [LocationType.REGION, LocationType.EMIRATE, LocationType.DISTRICT, LocationType.SPECIAL_DISTRICT];
  }

  return Object.values(LocationType);
};

export const patternTypeForSlide = (slide: Slide): PatternsTypes => {
  switch (slide) {
    case Slide.BUS_LINE_UTILIZATION:
    case Slide.BUS_TRIPS_INBOUND:
    case Slide.BUS_TRIPS_OUTBOUND:
    case Slide.BUS_TRIPS_WITHIN:
      return PatternsTypes.BUS;
    case Slide.TAXI_TRIPS_INBOUND:
    case Slide.TAXI_TRIPS_OUTBOUND:
    case Slide.TAXI_TRIPS_WITHIN:
      return PatternsTypes.TAXI;
    case Slide.ROAD_TRAFFIC:
      return PatternsTypes.TRAFFIC;
    case Slide.POPULATION_COUNT:
      return PatternsTypes.PEOPLE_DENSITY;
    case Slide.POPULATION_MOVEMENT_INBOUND:
    case Slide.POPULATION_MOVEMENT_OUTBOUND:
    case Slide.POPULATION_MOVEMENT_WITHIN:
    default:
      return PatternsTypes.PEOPLE_MOVEMENT;
  }
};

// TODO: compare is percent from kpi request, need more refactoring later
export const DASHBOARD_CONFIG: Partial<Record<Slide, DashboardConfig>> = {
  [Slide.PEOPLE_BEHAVIOR_OVERVIEW]: {
    kpis: [
      {
        kpiKey: 'population',
        key: generateUUID(),
        title: 'Population',
        titleSize: 'large',
        valueSize: 'large',
      },
      {
        kpiKey: 'topDenseArea',
        key: generateUUID(),
        title: 'Top Dense Area',
        titleSize: 'large',
        actions: 'camelcase',
      },
      {
        kpiKey: 'totalTrips',
        key: generateUUID(),
        title: 'People Movement',
        titleSize: 'large',
        caption: 'Trips/Day',
      },
    ],
  },

  [Slide.POPULATION_COUNT]: {
    kpis: [
      {
        kpiKey: 'population',
        key: generateUUID(),
        title: 'Population',
      },
    ],
  },

  [Slide.POPULATION_MOVEMENT_INBOUND]: {
    kpis: [
      {
        kpiKey: 'population',
        key: generateUUID(),
        title: 'Trips/Day',
      },
    ],
  },

  [Slide.POPULATION_MOVEMENT_OUTBOUND]: {
    kpis: [
      {
        kpiKey: 'population',
        key: generateUUID(),
        title: 'Trips/Day',
      },
    ],
  },

  [Slide.POPULATION_MOVEMENT_WITHIN]: {
    kpis: [
      {
        kpiKey: 'population',
        key: generateUUID(),
        title: 'Trips/Day',
      },
    ],
  },

  [Slide.LAND_USE_OVERVIEW]: {
    kpis: [
      {
        kpiKey: 'totalGFA',
        key: generateUUID(),
        title: 'GFA',
        titleSize: 'large',
        valueSize: 'large',
        caption: 'SQM',
      },
      {
        key: generateUUID(),
        title: 'General Status',
        titleSize: 'large',
        chartIds: ['generalstatus'],
        column: '1/2',
        row: '2/3',
      },
      {
        key: generateUUID(),
        title: 'Classification',
        titleSize: 'large',
        chartIds: ['classification'],
        column: '2/4',
        row: '2/3',
      },
    ],
  },

  [Slide.SUMMARY]: {
    kpis: [
      {
        kpiKey: 'totalGFA',
        key: generateUUID(),
        title: 'GFA',
        titleSize: 'large',
        caption: 'SQM',
      },
      {
        kpiKey: 'residential',
        key: generateUUID(),
        title: 'Residential',
        titleSize: 'large',
        caption: 'SQM',
      },
      {
        kpiKey: 'households',
        key: generateUUID(),
        title: 'Households',
        titleSize: 'large',
        caption: 'SQM',
      },
      {
        kpiKey: 'retail',
        key: generateUUID(),
        title: 'Retail',
        titleSize: 'large',
        caption: 'SQM',
      },
      {
        kpiKey: 'offices',
        key: generateUUID(),
        title: 'Office',
        titleSize: 'large',
        caption: 'SQM',
      },
      {
        kpiKey: 'schools',
        key: generateUUID(),
        title: 'School',
        titleSize: 'large',
        caption: 'SQM',
      },
      {
        kpiKey: 'industry',
        key: generateUUID(),
        title: 'Industry',
        titleSize: 'large',
        caption: 'SQM',
      },
      {
        kpiKey: 'medical',
        key: generateUUID(),
        title: 'Medical',
        titleSize: 'large',
        caption: 'SQM',
      },
      {
        kpiKey: 'hospitality',
        key: generateUUID(),
        title: 'Hotel Rooms',
        titleSize: 'large',
        caption: 'Rooms',
      },
      {
        kpiKey: 'other',
        key: generateUUID(),
        title: 'Other',
        titleSize: 'large',
        caption: 'SQM',
      },
    ],
  },

  [Slide.LAND_USE_RESIDENTIAL]: {
    kpis: [
      {
        kpiKey: 'residential',
        key: generateUUID(),
        title: 'GFA',
        valuePostfix: 'SQM',
      },
    ],
  },

  [Slide.LAND_USE_RETAIL]: {
    kpis: [
      {
        kpiKey: 'retail',
        key: generateUUID(),
        title: 'GFA',
        valuePostfix: 'SQM',
      },
    ],
  },

  [Slide.LAND_USE_OFFICES]: {
    kpis: [
      {
        kpiKey: 'offices',
        key: generateUUID(),
        title: 'GFA',
        valuePostfix: 'SQM',
      },
    ],
  },

  [Slide.LAND_USE_EDUCATION]: {
    kpis: [
      {
        kpiKey: 'schools',
        key: generateUUID(),
        title: 'GFA',
        valuePostfix: 'SQM',
      },
    ],
  },

  [Slide.LAND_USE_INDUSTRY]: {
    kpis: [
      {
        kpiKey: 'industry',
        key: generateUUID(),
        title: 'GFA',
        valuePostfix: 'SQM',
      },
    ],
  },

  [Slide.LAND_USE_MEDICAL]: {
    kpis: [
      {
        kpiKey: 'medical',
        key: generateUUID(),
        title: 'GFA',
        valuePostfix: 'SQM',
      },
    ],
  },

  [Slide.LAND_USE_HOSPITALITY]: {
    kpis: [
      {
        kpiKey: 'hospitality',
        key: generateUUID(),
        title: 'GFA',
        valuePostfix: 'Rooms',
      },
    ],
  },

  [Slide.LAND_USE_OTHERS]: {
    kpis: [
      {
        kpiKey: 'other',
        key: generateUUID(),
        title: 'GFA',
        valuePostfix: 'SQM',
      },
    ],
  },

  [Slide.LAND_USE_WATER_CONSUMPTION]: {
    kpis: [
      {
        kpiKey: 'water',
        key: generateUUID(),
        title: 'Consumption',
        valuePostfix: 'm3',
      },
    ],
  },

  [Slide.LAND_USE_ELECTRICITY_CONSUMPTION]: {
    kpis: [
      {
        kpiKey: 'electricity',
        key: generateUUID(),
        title: 'Consumption',
        valuePostfix: 'Kw/h',
      },
    ],
  },

  [Slide.LAND_USE_PLANNED_OFFICIAL]: {
    kpis: [
      {
        kpiKey: 'officialPlannedGrowth',
        key: generateUUID(),
        title: 'Current Status',
        valuePostfix: '% Completed',
      },
    ],
  },

  [Slide.LAND_USE_PLANNED_DEVELOPER]: {
    kpis: [
      {
        kpiKey: 'developerPlannedGrowth',
        key: generateUUID(),
        title: 'Average Consumption',
        valuePostfix: '% Completed',
      },
    ],
  },

  [Slide.MOBILITY_OVERVIEW]: {
    kpis: [
      {
        kpiKey: 'totalTrips',
        key: generateUUID(),
        title: 'Trips/Day',
        titleSize: 'large',
        valueSize: 'large',
      },
      {
        key: generateUUID(),
        title: 'Mode Share',
        titleSize: 'large',
        chartIds: ['modeShare'],
        column: '1/2',
        row: '2/4',
      },
      {
        kpiKey: 'maritimePassengersPerDay',
        key: generateUUID(),
        title: 'Maritime',
        titleSize: 'large',
        caption: 'Trips/Day',
        column: '2/3',
        row: '2/3',
      },
      {
        kpiKey: 'aviationPassengersPerDay',
        key: generateUUID(),
        title: 'Aviation',
        titleSize: 'large',
        caption: 'Passengers/Day',
        column: '2/3',
        row: '3/4',
      },
    ],
  },

  [Slide.MOBILITY_TRIPS_INBOUND]: {
    kpis: [
      {
        kpiKey: 'totalTripsInbound',
        key: generateUUID(),
        title: 'Trips/Day',
      },
    ],
  },

  [Slide.MOBILITY_TRIPS_OUTBOUND]: {
    kpis: [
      {
        kpiKey: 'totalTripsOutbound',
        key: generateUUID(),
        title: 'Trips/Day',
      },
    ],
  },

  [Slide.BUS_TRIPS_INBOUND]: {
    kpis: [
      {
        kpiKey: 'totalRiders',
        key: generateUUID(),
        title: 'Average Trips/Day',
      },
    ],
  },

  [Slide.BUS_TRIPS_OUTBOUND]: {
    kpis: [
      {
        kpiKey: 'totalRiders',
        key: generateUUID(),
        title: 'Average Trips/Day',
      },
    ],
  },

  [Slide.BUS_TRIPS_WITHIN]: {
    kpis: [
      {
        kpiKey: 'totalRiders',
        key: generateUUID(),
        title: 'Average Trips/Day',
      },
    ],
  },

  [Slide.BUS_LINE_UTILIZATION]: {
    kpis: [
      {
        kpiKey: 'busLineUtilization',
        key: generateUUID(),
        title: 'Average Trips/Day',
      },
    ],
  },

  [Slide.TAXI_TRIPS_INBOUND]: {
    kpis: [
      {
        kpiKey: 'totalRiders',
        key: generateUUID(),
        title: 'Trips/Day',
      },
    ],
  },

  [Slide.TAXI_TRIPS_OUTBOUND]: {
    kpis: [
      {
        kpiKey: 'totalRiders',
        key: generateUUID(),
        title: 'Trips/Day',
      },
    ],
  },

  [Slide.TAXI_TRIPS_WITHIN]: {
    kpis: [
      {
        kpiKey: 'totalRiders',
        key: generateUUID(),
        title: 'Trips/Day',
      },
    ],
  },

  [Slide.STUDENTS_COUNT]: {
    kpis: [
      {
        kpiKey: 'totalStudents',
        key: generateUUID(),
        title: 'Students',
      },
    ],
  },

  [Slide.STUDENTS_TRIPS_INBOUND]: {
    kpis: [
      {
        kpiKey: 'studenttripsinbound',
        key: generateUUID(),
        title: 'Average Trips/Day',
      },
    ],
  },

  [Slide.STUDENTS_TRIPS_OUTBOUND]: {
    kpis: [
      {
        kpiKey: 'studenttripsoutbound',
        key: generateUUID(),
        title: 'Average Trips/Day',
      },
    ],
  },

  [Slide.STUDENTS_TRIPS_WITHIN]: {
    kpis: [
      {
        kpiKey: 'studenttripswithin',
        key: generateUUID(),
        title: 'Average Trips/Day',
      },
    ],
  },

  [Slide.AVIATION_INBOUND]: {
    kpis: [
      {
        kpiKey: 'passengers',
        key: generateUUID(),
        title: 'Total Number of Passengers',
      },
    ],
  },

  [Slide.AVIATION_OUTBOUND]: {
    kpis: [
      {
        kpiKey: 'passengers',
        key: generateUUID(),
        title: 'Total Number of Passengers',
      },
    ],
  },

  [Slide.AVIATION_CONNECTIVITY]: {
    kpis: [
      {
        kpiKey: 'connectivity',
        key: generateUUID(),
        title: 'Percentage of everyday connectivity',
        valuePostfix: '%',
      },
    ],
  },

  [Slide.MARITIME_FACILITIES]: {
    kpis: [
      {
        kpiKey: 'passengers',
        key: generateUUID(),
        title: 'Number of Passengers',
      },
    ],
  },

  [Slide.MARITIME_TRIPS]: {
    kpis: [
      {
        kpiKey: 'trips',
        key: generateUUID(),
        title: 'Number of Trips',
      },
    ],
  },

  [Slide.TRAFFIC_OVERVIEW]: {
    kpis: [
      {
        kpiKey: 'congestionCost',
        key: generateUUID(),
        title: 'Congestion Cost',
        titleSize: 'large',
        valueSize: 'large',
        caption: 'AED/Week',
      },
      {
        kpiKey: 'congestionKm',
        key: generateUUID(),
        title: 'Congested Km',
        titleSize: 'large',
      },
      {
        kpiKey: 'failingJunctions',
        key: generateUUID(),
        title: 'No. of Failing Junctions',
        titleSize: 'large',
      },
      {
        key: generateUUID(),
        title: 'Most Congested Streets',
        titleSize: 'large',
        chartIds: ['mostcongestedstreets'],
        column: '2/3',
        row: '2/4',
      },
      {
        kpiKey: 'accidents',
        key: generateUUID(),
        title: 'Accidents',
        titleSize: 'large',
        column: '3/4',
        row: '2/3',
      },
      {
        kpiKey: 'accidentsPerKm',
        key: generateUUID(),
        title: 'Number of Accidents Per Sq.Km',
        titleSize: 'large',
        caption: 'Accidents / km²',
        column: '3/4',
        row: '3/4',
        actions: 'persquare',
      },
      {
        key: generateUUID(),
        title: 'Injury Types',
        titleSize: 'large',
        chartIds: ['injurytypes'],
        column: '4/5',
        row: '2/4',
      },
    ],
  },

  /* [Slide.ROAD_TRAFFIC]: {
    kpis: [
      {
        kpiKey: 'congestionCost',
        key: generateUUID(),
        title: 'Cost of Congestion',
        valuePostfix: ['AED', '/WEEK'],
      },
    ],
  }, */

  [Slide.JUNCTIONS]: {
    kpis: [
      {
        kpiKey: 'failingJunctions',
        key: generateUUID(),
        title: 'No. of Failing Junctions',
      },
    ],
  },

  [Slide.ACCIDENTS]: {
    kpis: [
      {
        kpiKey: 'totalAccidents',
        key: generateUUID(),
        title: 'Average Accidents/Day',
      },
    ],
  },
};
