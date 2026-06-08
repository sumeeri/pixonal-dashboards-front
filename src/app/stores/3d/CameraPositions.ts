import { Slide } from '../../../entities/dashboard/types';
import { LocationType } from '../../../entities/locationPanel/types';

export interface ICameraLocation {
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
}

// Region-specific zoom levels
// Maps location type + location name (+ optional slide) to custom zoom levels
// Key formats:
//   - "locationType:locationName:slideId" for slide-specific zoom
//   - "locationType:locationName" for all slides
// This prevents conflicts when regions, districts, or zones have the same name
export const regionZoomLevels: Record<string, number> = {
  // Abu Dhabi - Traffic slides only
  [`${LocationType.REGION}:Abu Dhabi:${Slide.TRAFFIC_OVERVIEW}`]: 11.71,
  [`${LocationType.REGION}:Abu Dhabi:${Slide.ROAD_TRAFFIC}`]: 11.71,
  [`${LocationType.REGION}:Abu Dhabi:${Slide.JUNCTIONS}`]: 11.71,
  [`${LocationType.REGION}:Abu Dhabi:${Slide.ACCIDENTS}`]: 11.71,

  // Al Ain - Traffic slides only
  [`${LocationType.REGION}:Al Ain:${Slide.TRAFFIC_OVERVIEW}`]: 12.47,
  [`${LocationType.REGION}:Al Ain:${Slide.ROAD_TRAFFIC}`]: 12.47,
  [`${LocationType.REGION}:Al Ain:${Slide.JUNCTIONS}`]: 12.47,
  [`${LocationType.REGION}:Al Ain:${Slide.ACCIDENTS}`]: 12.47,

  // Al Dahfra - Traffic slides only
  [`${LocationType.REGION}:Western Region:${Slide.TRAFFIC_OVERVIEW}`]: 11.81,
  [`${LocationType.REGION}:Western Region:${Slide.ROAD_TRAFFIC}`]: 11.81,
  [`${LocationType.REGION}:Western Region:${Slide.JUNCTIONS}`]: 11.81,
  [`${LocationType.REGION}:Western Region:${Slide.ACCIDENTS}`]: 11.81,
};

/**
 * Gets custom zoom level for a location with hierarchical lookup
 * 1. First checks for slide-specific zoom: "locationType:locationName:slideId"
 * 2. Falls back to location-only zoom: "locationType:locationName"
 * 3. Returns undefined if no custom zoom is configured
 */
export function getCustomZoomForLocation(
  locationType: LocationType,
  locationName: string,
  slide?: Slide
): number | undefined {
  // Try slide-specific zoom first
  if (slide) {
    const slideSpecificKey = `${locationType}:${locationName}:${slide}`;
    if (regionZoomLevels[slideSpecificKey] !== undefined) {
      return regionZoomLevels[slideSpecificKey];
    }
  }

  // Fall back to location-only zoom
  const locationKey = `${locationType}:${locationName}`;
  return regionZoomLevels[locationKey];
}

export function getCameraLocationForSlide(slide?: Slide): ICameraLocation | undefined {
  function getFromList(id: string): ICameraLocation {
    return cameraPositions.find((x) => x.id === id)?.location as ICameraLocation;
  }
  switch (slide) {
    case Slide.POPULATION_COUNT:
      return getFromList('Population');
    case Slide.POPULATION_MOVEMENT_INBOUND:
      return getFromList('PopulationMovementInbound');
    case Slide.POPULATION_MOVEMENT_OUTBOUND:
      return getFromList('PopulationMovementOutbound');
    case Slide.POPULATION_MOVEMENT_WITHIN:
      return getFromList('PopulationMovementWithin');
    case Slide.STUDENTS_COUNT:
      return getFromList('Population');
    case Slide.MOBILITY_TRIPS_INBOUND:
    case Slide.STUDENTS_TRIPS_INBOUND:
      return getFromList('PopulationMovementInbound');
    case Slide.MOBILITY_TRIPS_OUTBOUND:
    case Slide.STUDENTS_TRIPS_OUTBOUND:
      return getFromList('PopulationMovementOutbound');
    case Slide.STUDENTS_TRIPS_WITHIN:
      return getFromList('PopulationMovementWithin');
    // case Slide.LAND_USE_CONSTRUCTION:
    //   return getFromList('Construction');
    // case Slide.LAND_USE_RESIDENTIAL:
    //   return getFromList('Residential');
    // case Slide.LAND_USE_MOSQUES:
    //   return getFromList('MosquesParks');
    // case Slide.LAND_USE_SCHOOLS:
    //   return getFromList('Schools');
    // case Slide.LAND_USE_MEDICAL:
    //   return getFromList('Medical');
    // case Slide.LAND_USE_OFFICES:
    //   return getFromList('Offices');
    // case Slide.LAND_USE_RETAIL:
    //   return getFromList('Retail');
    // case Slide.LAND_USE_HOTELS:
    //   return getFromList('Construction');
    case Slide.LAND_USE_CONSTRUCTION:
    case Slide.LAND_USE_RESIDENTIAL:
    case Slide.LAND_USE_SCHOOLS:
    case Slide.LAND_USE_EDUCATION:
    case Slide.LAND_USE_INDUSTRY:
    case Slide.LAND_USE_MEDICAL:
    case Slide.LAND_USE_OFFICES:
    case Slide.LAND_USE_RETAIL:
    case Slide.LAND_USE_HOTELS:
    case Slide.LAND_USE_OTHERS:
    case Slide.LAND_USE_PLANNED_OFFICIAL:
    case Slide.LAND_USE_PLANNED_DEVELOPER:
      return getFromList('Population');
    case Slide.LAND_USE_WATER_CONSUMPTION:
      return getFromList('WaterConumption');
    case Slide.LAND_USE_ELECTRICITY_CONSUMPTION:
      return getFromList('ElecrConumption');
    case Slide.BUS_TRIPS_INBOUND:
    case Slide.BUS_LINE_UTILIZATION:
      return getFromList('BusTripsInbound');
    case Slide.BUS_TRIPS_OUTBOUND:
      return getFromList('BusTripsOutbound');
    case Slide.BUS_TRIPS_WITHIN:
      return getFromList('BusTripsWithin');
    case Slide.TAXI_TRIPS_INBOUND:
      return getFromList('TaxiTripsInbound');
    case Slide.TAXI_TRIPS_OUTBOUND:
      return getFromList('TaxiTripsOutbound');
    case Slide.TAXI_TRIPS_WITHIN:
      return getFromList('TaxiTripsWithin');
    case Slide.ROAD_TRAFFIC:
      return getFromList('RoadTraffic');
    case Slide.JUNCTIONS:
      return getFromList('JunctionLOS');
    case Slide.ACCIDENTS:
      return getFromList('Accidents');
    case Slide.AVIATION_INBOUND:
    case Slide.AVIATION_OUTBOUND:
    case Slide.AVIATION_CONNECTIVITY:
      return { bearing: 0, center: [53.89452, 24.57744], pitch: 45, zoom: 2 };
    case Slide.MARITIME_FACILITIES:
    case Slide.MARITIME_TRIPS:
      return { bearing: 0, center: [53.89452, 24.57744], pitch: 48, zoom: 8.5 };
    case Slide.PEOPLE_BEHAVIOR_OVERVIEW:
    case Slide.LAND_USE_OVERVIEW:
    case Slide.TRAFFIC_OVERVIEW:
    case Slide.MOBILITY_OVERVIEW:
      return getFromList('overview');

    default:
      return undefined;
  }
}

// The contents are copied from camera transition demo provided by Pixonal
// Birdseye Camera Transition\storytelling-main\src\config.js
const cameraPositions = [
  {
    id: 'Landing',
    alignment: 'right',
    hidden: false,
    title: 'Story Landing Page',
    image: '',
    description: '',
    location: {
      center: [54.37775, 24.44728],
      zoom: 11.89,
      pitch: 45.0,
      bearing: 0.0,
    },
    mapAnimation: 'flyTo',
    rotateAnimation: false,
    callback: '',
    onChapterEnter: [
      // {
      //     layer: 'layer-name',
      //     opacity: 1,
      //     duration: 5000
      // }
    ],
    onChapterExit: [
      // {
      //     layer: 'layer-name',
      //     opacity: 0
      // }
    ],
  },
  {
    id: 'Population',
    alignment: 'right',
    hidden: false,
    title: 'People Behavior / Population',
    image: '',
    description: '',
    location: {
      center: [54.38813, 24.44954],
      zoom: 12.3,
      pitch: 0.5,
      bearing: 0.0,
      speed: 2, // make the flying slow
      curve: 0.2, // change the speed at which it zooms out
    },
    mapAnimation: 'flyTo',
    rotateAnimation: false,
    callback: '',
    onChapterEnter: [
      // {
      //     layer: 'layer-name',
      //     opacity: 1,
      //     duration: 5000
      // }
    ],
    onChapterExit: [
      // {
      //     layer: 'layer-name',
      //     opacity: 0
      // }
    ],
  },
  {
    id: 'PopulationMovementInbound',
    alignment: 'right',
    hidden: false,
    title: 'People Behavior / Population Movement Inbound',
    image: '',
    description: ' .',
    location: {
      center: [54.41502, 24.43617],
      zoom: 11.2,
      pitch: 48.5,
      bearing: 7.82,
      speed: 2, // make the flying slow
      curve: 0.2, // change the speed at which it zooms out
    },
    mapAnimation: 'flyTo',
    rotateAnimation: false,
    callback: '',
    onChapterEnter: [],
    onChapterExit: [],
  },
  {
    id: 'PopulationMovementOutbound',
    alignment: 'right',
    hidden: false,
    title: 'People Behavior / Population Movement Outbound',
    image: '',
    description: ' .',
    location: {
      center: [54.41502, 24.43617],
      zoom: 11.2,
      pitch: 55.5,
      bearing: 0.0,
      speed: 2, // make the flying slow
      curve: 0.2, // change the speed at which it zooms out
    },
    mapAnimation: 'flyTo',
    rotateAnimation: false,
    callback: '',
    onChapterEnter: [],
    onChapterExit: [],
  },
  {
    id: 'PopulationMovementWithin',
    alignment: 'right',
    hidden: false,
    title: 'People Behavior / Population Movement Within',
    image: '',
    description: '',
    location: {
      center: [54.41293, 24.43632],
      zoom: 12.29,
      pitch: 59.0,
      bearing: -8.0,
      speed: 2, // make the flying slow
      curve: 0.2, // change the speed at which it zooms out
    },
    mapAnimation: 'flyTo',
    rotateAnimation: false,
    callback: '',
    onChapterEnter: [],
    onChapterExit: [],
  },
  {
    id: 'Construction',
    alignment: 'right',
    hidden: false,
    title: 'Landuse / Consturction',
    image: '',
    description: '',
    location: {
      center: [54.40205, 24.44543],
      zoom: 12.29,
      pitch: 29.54,
      bearing: 0.0,
      speed: 2, // make the flying slow
      curve: 0.2, // change the speed at which it zooms out
    },
    mapAnimation: 'flyTo',
    rotateAnimation: false,
    callback: '',
    onChapterEnter: [],
    onChapterExit: [],
  },
  {
    id: 'Residential',
    alignment: 'right',
    hidden: false,
    title: 'Landuse / Residential',
    image: '',
    description: '',
    location: {
      center: [54.40025, 24.43939],
      zoom: 12.78,
      pitch: 51.04,
      bearing: -12.0,
      speed: 2, // make the flying slow
      curve: 0.2, // change the speed at which it zooms out
    },
    mapAnimation: 'flyTo',
    rotateAnimation: false,
    callback: '',
    onChapterEnter: [],
    onChapterExit: [],
  },
  {
    id: 'MosquesParks',
    alignment: 'right',
    hidden: false,
    title: 'Landuse / Mosques, Parks and Others',
    image: '',
    description: '',
    location: {
      center: [54.40766, 24.43811],
      zoom: 12.78,
      pitch: 57.04,
      bearing: -22.4,
      speed: 2, // make the flying slow
      curve: 0.2, // change the speed at which it zooms out
    },
    mapAnimation: 'flyTo',
    rotateAnimation: false,
    callback: '',
    onChapterEnter: [],
    onChapterExit: [],
  },
  {
    id: 'Schools',
    alignment: 'right',
    hidden: false,
    title: 'Landuse / Schools',
    image: '',
    description: '',
    location: {
      center: [54.41068, 24.43776],
      zoom: 12.78,
      pitch: 62.54,
      bearing: -28.8,
      speed: 2, // make the flying slow
      curve: 0.2, // change the speed at which it zooms out
    },
    mapAnimation: 'flyTo',
    rotateAnimation: false,
    callback: '',
    onChapterEnter: [],
    onChapterExit: [],
  },
  {
    id: 'Medical',
    alignment: 'right',
    hidden: false,
    title: 'Landuse / Medical',
    image: '',
    description: '',
    location: {
      center: [54.41068, 24.43776],
      zoom: 12.78,
      pitch: 51.04,
      bearing: -9.6,
      speed: 2, // make the flying slow
      curve: 0.2, // change the speed at which it zooms out
    },
    mapAnimation: 'flyTo',
    rotateAnimation: false,
    callback: '',
    onChapterEnter: [],
    onChapterExit: [],
  },
  {
    id: 'Offices',
    alignment: 'right',
    hidden: false,
    title: 'Landuse / Offices',
    image: '',
    description: '',
    location: {
      center: [54.40588, 24.44005],
      zoom: 12.48,
      pitch: 49.54,
      bearing: 12.0,
      speed: 2, // make the flying slow
      curve: 0.2, // change the speed at which it zooms out
    },
    mapAnimation: 'flyTo',
    rotateAnimation: false,
    callback: '',
    onChapterEnter: [],
    onChapterExit: [],
  },
  {
    id: 'Retail',
    alignment: 'right',
    hidden: false,
    title: 'Landuse / Retail',
    image: '',
    description: '',
    location: {
      center: [54.40588, 24.44005],
      zoom: 12.48,
      pitch: 38.04,
      bearing: 0.0,
      speed: 2, // make the flying slow
      curve: 0.2, // change the speed at which it zooms out
    },
    mapAnimation: 'flyTo',
    rotateAnimation: false,
    callback: '',
    onChapterEnter: [],
    onChapterExit: [],
  },
  {
    id: 'WaterConumption',
    alignment: 'right',
    hidden: false,
    title: 'Landuse / Water Consumption',
    image: '',
    description: '',
    location: {
      center: [54.40315, 24.44126],
      zoom: 12.42,
      pitch: 61.54,
      bearing: 0.0,
      speed: 2, // make the flying slow
      curve: 0.2, // change the speed at which it zooms out
    },
    mapAnimation: 'flyTo',
    rotateAnimation: false,
    callback: '',
    onChapterEnter: [],
    onChapterExit: [],
  },
  {
    id: 'ElecrConumption',
    alignment: 'right',
    hidden: false,
    title: 'Landuse / Electricity Consumption',
    image: '',
    description: '',
    location: {
      center: [54.40315, 24.44126],
      zoom: 12.42,
      pitch: 64.04,
      bearing: -25.6,
      speed: 2, // make the flying slow
      curve: 0.2, // change the speed at which it zooms out
    },
    mapAnimation: 'flyTo',
    rotateAnimation: false,
    callback: '',
    onChapterEnter: [],
    onChapterExit: [],
  },
  {
    id: 'BusTripsInbound',
    alignment: 'right',
    hidden: false,
    title: 'Bus & Taxi / Bus Trips Inbound',
    image: '',
    description: ' .',
    location: {
      center: [54.41502, 24.43617],
      zoom: 11.2,
      pitch: 48.5,
      bearing: 7.82,
      speed: 2, // make the flying slow
      curve: 0.2, // change the speed at which it zooms out
    },
    mapAnimation: 'flyTo',
    rotateAnimation: false,
    callback: '',
    onChapterEnter: [],
    onChapterExit: [],
  },
  {
    id: 'BusTripsOutbound',
    alignment: 'right',
    hidden: false,
    title: 'Bus & Taxi / Bus Trips Outbound',
    image: '',
    description: ' .',
    location: {
      center: [54.41502, 24.43617],
      zoom: 11.2,
      pitch: 55.5,
      bearing: 0.0,
      speed: 2, // make the flying slow
      curve: 0.2, // change the speed at which it zooms out
    },
    mapAnimation: 'flyTo',
    rotateAnimation: false,
    callback: '',
    onChapterEnter: [],
    onChapterExit: [],
  },
  {
    id: 'BusTripsWithin',
    alignment: 'right',
    hidden: false,
    title: 'Bus & Taxi / Bus Trips Within',
    image: '',
    description: ' .',
    location: {
      center: [54.41533, 24.42992],
      zoom: 12.88,
      pitch: 60.54,
      bearing: -28.0,
      speed: 2, // make the flying slow
      curve: 0.2, // change the speed at which it zooms out
    },
    mapAnimation: 'flyTo',
    rotateAnimation: false,
    callback: '',
    onChapterEnter: [],
    onChapterExit: [],
  },
  {
    id: 'BusLineUtilization',
    alignment: 'right',
    hidden: false,
    title: 'Bus & Taxi / Bus Line Utilisation',
    image: '',
    description: ' .',
    location: {
      center: [54.43074, 24.44672],
      zoom: 13.15,
      pitch: 53.54,
      bearing: 7.82,
      speed: 2, // make the flying slow
      curve: 0.2, // change the speed at which it zooms out
    },
    mapAnimation: 'flyTo',
    rotateAnimation: false,
    callback: '',
    onChapterEnter: [],
    onChapterExit: [],
  },
  {
    id: 'TaxiTripsInbound',
    alignment: 'right',
    hidden: false,
    title: 'Bus & Taxi / Taxi Trips Inbound',
    image: '',
    description: ' .',
    location: {
      center: [54.41502, 24.43617],
      zoom: 11.2,
      pitch: 48.5,
      bearing: 7.82,
      speed: 2, // make the flying slow
      curve: 0.2, // change the speed at which it zooms out
    },
    mapAnimation: 'flyTo',
    rotateAnimation: false,
    callback: '',
    onChapterEnter: [],
    onChapterExit: [],
  },
  {
    id: 'TaxiTripsOutbound',
    alignment: 'right',
    hidden: false,
    title: 'Bus & Taxi / Taxi Trips Outbound',
    image: '',
    description: ' .',
    location: {
      center: [54.41502, 24.43617],
      zoom: 11.2,
      pitch: 55.5,
      bearing: 0.0,
      speed: 2, // make the flying slow
      curve: 0.2, // change the speed at which it zooms out
    },
    mapAnimation: 'flyTo',
    rotateAnimation: false,
    callback: '',
    onChapterEnter: [],
    onChapterExit: [],
  },
  {
    id: 'TaxiTripsWithin',
    alignment: 'right',
    hidden: false,
    title: 'Bus & Taxi / Taxi Trips Within',
    image: '',
    description: ' .',
    location: {
      center: [54.4267, 24.43096],
      zoom: 13.34,
      pitch: 55.54,
      bearing: -12.8,
      speed: 2, // make the flying slow
      curve: 0.2, // change the speed at which it zooms out
    },
    mapAnimation: 'flyTo',
    rotateAnimation: false,
    callback: '',
    onChapterEnter: [],
    onChapterExit: [],
  },
  {
    id: 'RoadTraffic',
    alignment: 'right',
    hidden: false,
    title: 'Congestion / Road Traffic',
    image: '',
    description: ' .',
    location: {
      center: [54.41001, 24.4383],
      zoom: 12.39,
      pitch: 52.54,
      bearing: 0.0,
      speed: 2, // make the flying slow
      curve: 0.2, // change the speed at which it zooms out
    },
    mapAnimation: 'flyTo',
    rotateAnimation: false,
    callback: '',
    onChapterEnter: [],
    onChapterExit: [],
  },
  {
    id: 'JunctionLOS',
    alignment: 'right',
    hidden: false,
    title: 'Congestion / Junction Level of Service',
    image: '',
    description: ' .',
    location: {
      center: [54.40812, 24.44677],
      zoom: 12.87,
      pitch: 41.04,
      bearing: 0.0,
      speed: 2, // make the flying slow
      curve: 0.2, // change the speed at which it zooms out
    },
    mapAnimation: 'flyTo',
    rotateAnimation: false,
    callback: '',
    onChapterEnter: [],
    onChapterExit: [],
  },
  {
    id: 'Accidents',
    alignment: 'right',
    hidden: false,
    title: 'Congestion / Accidents',
    image: '',
    description: ' .',
    location: {
      center: [54.40838, 24.44288],
      zoom: 12.75,
      pitch: 56.54,
      bearing: 0.0,
      speed: 2, // make the flying slow
      curve: 0.2, // change the speed at which it zooms out
    },
    mapAnimation: 'flyTo',
    rotateAnimation: false,
    callback: '',
    onChapterEnter: [],
    onChapterExit: [],
  },
  {
    id: 'overview',
    alignment: 'right',
    hidden: false,
    title: 'Congestion / Accidents',
    image: '',
    description: ' .',
    location: {
      center: [54.50255, 24.46914],
      zoom: 11,
      pitch: 60,
      bearing: 0.0,
      speed: 2, // make the flying slow
      curve: 0.2, // change the speed at which it zooms out
    },
    mapAnimation: 'flyTo',
    rotateAnimation: false,
    callback: '',
    onChapterEnter: [],
    onChapterExit: [],
  },
];
