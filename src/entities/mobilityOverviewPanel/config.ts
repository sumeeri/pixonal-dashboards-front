import { LandUseIcon, MobilityIcon, PeopleIcon, TrafficIcon } from 'shared/icons';

import { UserPermissions } from '../admin/users/types';
import { Slide } from '../dashboard/types';
import { MobilityOverviewCard } from './types';

export const MOBILITY_OVERVIEW_CONFIG: Partial<Record<Slide, MobilityOverviewCard>> = {
  [Slide.PEOPLE_BEHAVIOR_OVERVIEW]: {
    permission: UserPermissions.PEOPLE,
    title: 'People',
    icon: PeopleIcon,
    kpis: [
      {
        id: 'population',
        name: 'Population',
        url: 'peopleoverview/population',
        params: ['location', 'locationType', 'year'],
      },
      {
        id: 'percentageOfCitizens',
        name: 'Percentage of Citizens',
        valueUnit: '%',
        /* url: 'peopleoverview/percentageofcitizens',
        params: ['location', 'locationType', 'defaultQuarter'], */
        // Fix for citizen percentage
        url: 'peoplecount/charts/nationality',
        params: ['location', 'locationType', 'year'],
      },
      {
        id: 'carModeShare',
        name: 'Car Mode Share',
        valueUnit: '%',
        url: 'peopleoverview/carmodeshare',
        params: ['location', 'locationType'],
        mock: 64,
      },
    ],
  },
  [Slide.LAND_USE_OVERVIEW]: {
    permission: UserPermissions.LAND_USE,
    title: 'Land Use',
    icon: LandUseIcon,
    kpis: [
      {
        id: 'totalGFA',
        name: 'Total GFA',
        valueUnit: `\xa0SQM`,
        url: 'landuseoverview/totalgfa',
        params: ['location', 'locationType', 'defaultHorizon'],
        mock: 39690441,
      },
      {
        id: 'households',
        name: 'Households',
        url: 'landuseoverview/households',
        params: ['location', 'locationType', 'defaultHorizon'],
        mock: 106632,
      },
      {
        id: 'hotelRooms',
        name: 'Hotel Rooms',
        url: 'hotels/kpi',
        params: ['location', 'locationType', 'defaultHorizon'],
        mock: 21788,
      },
    ],
  },
  [Slide.MOBILITY_OVERVIEW]: {
    permission: UserPermissions.MOBILITY,
    title: 'Mobility',
    icon: MobilityIcon,
    kpis: [
      {
        id: 'noOfTrips',
        name: 'No of Trips',
        /* url: 'mobility/numberoftrips',
        params: ['location', 'locationType', 'defaultQuarter'], */
        // Fix for demo can be reverted once demo finished
        url: 'peopleoverview/population',
        params: ['location', 'locationType', 'year'],
        mock: 1720078,
      },
      {
        id: 'maritimeTrips',
        name: 'Maritime trips',
        url: 'MaritimeFacilities/kpi',
        params: ['defaultQuarter'],
        mock: 51620,
      },
      {
        id: 'airPassengers',
        name: 'Airport Passengers',
        url: 'mobility/aviation/numberofpassengers',
        params: ['defaultQuarter'],
        mock: 6288286,
      },
    ],
  },
  [Slide.TRAFFIC_OVERVIEW]: {
    permission: UserPermissions.TRAFFIC,
    title: 'Traffic',
    icon: TrafficIcon,
    kpis: [
      {
        id: 'congestedKms',
        name: 'Congested Kms',
        valueUnit: '\xa0Km',
        url: 'RoadTraffic/congestedkms',
        params: ['location', 'locationType', 'defaultQuarter'],
        mock: 16,
      },
      {
        id: 'noOfAccidents',
        name: 'No. of Accidents',
        url: 'accidents/kpi',
        params: ['location', 'locationType', 'defaultQuarter'],
        mock: 28,
      },
      {
        id: 'failingJunctions',
        name: 'No. of Failing Junctions',
        url: 'junctionlevelofservice/kpi',
        params: ['location', 'locationType', 'defaultQuarter'],
        mock: 30,
      },
    ],
  },
};
