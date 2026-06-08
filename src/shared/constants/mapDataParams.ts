import { HorizonValue } from '../../entities/dashboard/types.ts';

export const mapDataHorizons: HorizonValue[] = [
  { id: 2020, name: '2020' },
  { id: 2025, name: '2025' },
  { id: 2030, name: '2030' },
  // { id: 2035, name: '2035' },
  { id: 2040, name: '2040' },
  { id: 2050, name: '2050' },
];

/** Mobility → Trips (inbound/outbound) only exposes these planning horizons in the UI. */
export const mobilityTripsHorizons: HorizonValue[] = mapDataHorizons.filter(
  (h) => h.id === 2030 || h.id === 2040
);

export enum MapDataAggregationType {
  AVERAGE_DAY,
  DAILY,
  MONTHLY,
  QUARTERLY,
  TYPICAL_DAY,
}

export enum MapDataAggregationTimeType {
  MINUTES = 15,
  HOURS = 2,
}

export enum PatternsTypes {
  BUS = 'Bus',
  TAXI = 'Taxi',
  TRAFFIC = 'Traffic',
  PEOPLE_DENSITY = 'PeopleDensity',
  PEOPLE_MOVEMENT = 'PeopleMovements',
}

export enum DataType {
  POPULATION_DENSITY = 'Population Density',
  TRIPS = 'Trips',
  ORIGIN = 'Origin',
  DESTINATIONS = 'Destinations',
  LAND_USE_TYPE_PLOT = 'Land Use Type (Plot)',
  LAND_USE_TYPE_ZONE = 'Land Use Type (Zone)',
  RESIDENTIAL = 'Residential',
  COMMERCIAL = 'Commercial',
  APARTMENTS = 'Apartments',
  VILLAS = 'Villas',
  SHOPS = 'Shops',
  OFFICES = 'Offices',
  UTILIZATION = 'Utilisation',
  END_TO_END_TRIPS_LOCATIONS = 'End to End Trips (Locations)',
  END_TO_END_TRIPS_BUS_STOPS = 'End to End Trips (Bus Stops)',
  TRANSFERS_BUS_STOPS = 'Transfers (Bus Stops)',
  BOARDING_BUS_STOPS = 'Boarding (Bus Stops)',
  ALIGHTINGS_BUS_STOPS = 'Alightings (Bus Stops)',
  TRANSIT_LINES_BOTH_DIRECTIONS = 'Transit Lines (Both Directions)',
  TRANSIT_LINES_DIRECTION_1 = 'Transit Lines (Direction 1)',
  TRANSIT_LINES_DIRECTION_2 = 'Transit Lines (Direction 2)',
  BUS_STOPS = 'Bus Stops',
  TAXI_TRIPS = 'Taxi Trips',
  PICKUPS = 'Pickups',
  DROPOFFS = 'Dropoffs',
  STUDENT_COUNT = 'Student Count',
  STUDENT_DENSITY = 'Student Density',
  STUDENT_PLACES = 'Student Places',
  STUDENT_RESIDENCES = 'Student Residences',
  STUDENT_LOCATIONS = 'School Locations',

  AVIATION_TRANSFERS = 'Transfers',
  AVIATION_ARRIVALS = 'Arrivals',
  AVIATION_DEPARTURES = 'Departures',
  AVIATION_CONNECTIVITY = 'Connectivity',
  FACILITY_USAGE = 'Facility Usage',
  VEHICLES_TRIPS = 'Vehicles Trips',
  PASSENGER_TRIPS = 'Passenger Trips',

  RELATIVE_SPEED = 'Relative Speed',
  SPEED = 'Speed',
  DENSITY = 'Density',
  VOLUME = 'Volume',
  MOST_USED_ENTRY_POINTS = 'Most Used Entry Points',
  MOST_USED_EXIT_POINTS = 'Most Used Exit Points',

  JUNCTION_LEVEL_OF_SERVICE = 'Junction Level Of Service',
  ACCIDENTS = 'Accidents',
}
