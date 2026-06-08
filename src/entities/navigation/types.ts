import { ReactNode, SVGProps } from 'react';

import { UserPermissions } from '../admin/users/types';
import { Slide } from '../dashboard/types';

export enum AvailablePages {
  AUTHORIZATION = 'login',
  ACCESS = 'access',
  MAINTENANCE = 'maintenance',
  NOT_FOUND = '*',
  INTERNAL_SERVER_ERROR = '500',
  FORBIDDEN = '403',
  ROOT = '/',
  ADMIN = 'admin',
}

export enum AdminPages {
  USERS = 'users',
}

export enum Chapter {
  PeopleBehavior = 'PeopleBehavior',
  LandUse = 'LandUse',
  Mobility = 'Mobility',
  Traffic = 'Traffic',
}

export enum NavigationGroup {
  PeopleMovement = 'PeopleMovement',
  Classification = 'Classification',
  Consumption = 'Consumption',
  PlannedGrowth = 'PlannedGrowth',
  MobilityTrips = 'MobilityTrips',
  MobilityBus = 'MobilityBus',
  MobilityTaxi = 'MobilityTaxi',
  MobilitySchool = 'MobilitySchool',
  MobilityAviation = 'MobilityAviation',
  MobilityMaritime = 'MobilityMaritime',
}

export type NavigationChildren = {
  id: NavigationGroup | Slide;
  label: string;
  children?: NavigationChildren[];
};

export type NavigationChapter = {
  id: Chapter;
  label: string;
  permission: UserPermissions;
  children: NavigationChildren[];
  icon: (props: SVGProps<SVGSVGElement>) => ReactNode;
};

export type NavigationConfig = NavigationChapter[];
