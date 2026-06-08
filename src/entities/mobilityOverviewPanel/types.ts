import { ReactNode, SVGProps } from 'react';

import { UserPermissions } from '../admin/users/types.ts';
import { MainKpiRequestParams } from '../kpi/types.ts';

export type MobilityOverviewCard = {
  permission: UserPermissions;
  title: string;
  kpis: {
    id: string;
    name: string;
    valueUnit?: string;

    url: string;
    params?: MainKpiRequestParams[];
    mock?: number;
  }[];
  icon: (props: SVGProps<SVGSVGElement>) => ReactNode;
};
