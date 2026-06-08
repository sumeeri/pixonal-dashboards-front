import { LandUseIcon, MobilityIcon, PeopleIcon, TrafficIcon } from 'shared/icons';

import { UserPermissions } from '../admin/users/types.ts';
import { Slide } from '../dashboard/types.ts';
import { Chapter, NavigationConfig, NavigationGroup } from './types.ts';

export const NAVIGATION_CONFIG: NavigationConfig = [
  {
    id: Chapter.PeopleBehavior,
    label: 'People',
    permission: UserPermissions.PEOPLE,
    icon: PeopleIcon,
    children: [
      { id: Slide.PEOPLE_BEHAVIOR_OVERVIEW, label: 'Overview' },
      { id: Slide.POPULATION_COUNT, label: 'Population' },
      {
        id: NavigationGroup.PeopleMovement,
        label: 'People Movement',
        children: [
          { id: Slide.POPULATION_MOVEMENT_INBOUND, label: 'Trips-In' },
          { id: Slide.POPULATION_MOVEMENT_OUTBOUND, label: 'Trips-Out' },
          { id: Slide.POPULATION_MOVEMENT_WITHIN, label: 'Trips-Within' },
        ],
      },
    ],
  },
  {
    id: Chapter.LandUse,
    label: 'Land Use',
    permission: UserPermissions.LAND_USE,
    icon: LandUseIcon,
    children: [
      { id: Slide.LAND_USE_OVERVIEW, label: 'Overview' },
      {
        id: NavigationGroup.Classification,
        label: 'Classification',
        children: [
          { id: Slide.SUMMARY, label: 'Summary' },
          { id: Slide.LAND_USE_RESIDENTIAL, label: 'Residential' },
          { id: Slide.LAND_USE_RETAIL, label: 'Retail' },
          { id: Slide.LAND_USE_OFFICES, label: 'Offices' },
          { id: Slide.LAND_USE_EDUCATION, label: 'Education' },
          { id: Slide.LAND_USE_INDUSTRY, label: 'Industry' },
          { id: Slide.LAND_USE_MEDICAL, label: 'Medical' },
          { id: Slide.LAND_USE_HOSPITALITY, label: 'Hotel Rooms' },
          { id: Slide.LAND_USE_OTHERS, label: 'Others' },
        ],
      },
      {
        id: NavigationGroup.Consumption,
        label: 'Consumption',
        children: [
          { id: Slide.LAND_USE_WATER_CONSUMPTION, label: 'Water' },
          { id: Slide.LAND_USE_ELECTRICITY_CONSUMPTION, label: 'Electricity' },
        ],
      },
      {
        id: NavigationGroup.PlannedGrowth,
        label: 'Planned Growth',
        children: [
          { id: Slide.LAND_USE_PLANNED_OFFICIAL, label: 'Official Land Use' },
          { id: Slide.LAND_USE_PLANNED_DEVELOPER, label: 'Developer Land Use' },
        ],
      },
    ],
  },
  {
    id: Chapter.Mobility,
    label: 'Mobility',
    permission: UserPermissions.MOBILITY,
    icon: MobilityIcon,
    children: [
      { id: Slide.MOBILITY_OVERVIEW, label: 'Overview' },
      {
        id: NavigationGroup.MobilityTrips,
        label: 'Trips',
        children: [
          { id: Slide.MOBILITY_TRIPS_INBOUND, label: 'Inbound' },
          { id: Slide.MOBILITY_TRIPS_OUTBOUND, label: 'Outbound' },
        ],
      },
      {
        id: NavigationGroup.MobilityBus,
        label: 'Bus',
        children: [
          { id: Slide.BUS_TRIPS_INBOUND, label: 'Trips-In' },
          { id: Slide.BUS_TRIPS_OUTBOUND, label: 'Trips-Out' },
          { id: Slide.BUS_TRIPS_WITHIN, label: 'Trips-Within' },
          { id: Slide.BUS_LINE_UTILIZATION, label: 'Route Utilisation' },
        ],
      },
      {
        id: NavigationGroup.MobilityTaxi,
        label: 'Taxi',
        children: [
          { id: Slide.TAXI_TRIPS_INBOUND, label: 'Trips-In' },
          { id: Slide.TAXI_TRIPS_OUTBOUND, label: 'Trips-Out' },
          { id: Slide.TAXI_TRIPS_WITHIN, label: 'Trips-Within' },
        ],
      },
      {
        id: NavigationGroup.MobilitySchool,
        label: 'School',
        children: [
          { id: Slide.STUDENTS_COUNT, label: 'School' },
          { id: Slide.STUDENTS_TRIPS_INBOUND, label: 'Trips-In' },
          { id: Slide.STUDENTS_TRIPS_OUTBOUND, label: 'Trips-Out' },
          { id: Slide.STUDENTS_TRIPS_WITHIN, label: 'Trips-Within' },
        ],
      },
      {
        id: NavigationGroup.MobilityAviation,
        label: 'Aviation',
        children: [
          { id: Slide.AVIATION_INBOUND, label: 'Trips-In' },
          { id: Slide.AVIATION_OUTBOUND, label: 'Trips-Out' },
          { id: Slide.AVIATION_CONNECTIVITY, label: 'Trips-Connectivity' },
        ],
      },
      {
        id: NavigationGroup.MobilityMaritime,
        label: 'Maritime',
        children: [
          { id: Slide.MARITIME_FACILITIES, label: 'Facilities' },
          { id: Slide.MARITIME_TRIPS, label: 'Trips' },
        ],
      },
    ],
  },
  {
    id: Chapter.Traffic,
    label: 'Traffic',
    permission: UserPermissions.TRAFFIC,
    icon: TrafficIcon,
    children: [
      { id: Slide.TRAFFIC_OVERVIEW, label: 'Overview' },
      { id: Slide.ROAD_TRAFFIC, label: 'Roads' },
      { id: Slide.JUNCTIONS, label: 'Junctions' },
      { id: Slide.ACCIDENTS, label: 'Accidents' },
    ],
  },
];
