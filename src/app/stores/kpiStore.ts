import { makeAutoObservable, runInAction } from 'mobx';
import { formatDate, formatDateFullCSharp } from 'shared/utils/date.ts';

import { fetchMainKpis } from '../../entities/dashboard/services.ts';
import { MainKpi, Slide } from '../../entities/dashboard/types.ts';
import { KPI_CONFIG } from '../../entities/kpi/config.ts';
import { MainKpiEnrichedConfig, MainKpiRequestParams, MainKpiResponse } from '../../entities/kpi/types.ts';
import { MOBILITY_OVERVIEW_CONFIG } from '../../entities/mobilityOverviewPanel/config.ts';
import { getDateRangeForKpi } from '../helpers';
import landUseConsumptionPillar3DStoreInstance from './3d/stores/LandUseConsumptionPillar3DStore.ts';
import authStoreInstance from './authStore.ts';
import locationPanelStore from './locationPanelStore.ts';
import mapDataValuesStore from './mapDataValuesStore.ts';
import slidesStoreInstance from './slidesStore.ts';

type MainKpis = {
  [k in Slide]?: { [id: string]: MainKpi | null };
};

type MobilityOverviewKpis = { [id: string]: MainKpi | null };

export class KPIStore {
  mobilityOverviewKpis: MobilityOverviewKpis = {};
  mainKpis: MainKpis = {};
  isFetching: boolean = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  public async fetchMainKpis(slide: Slide) {
    const config = KPI_CONFIG[slide];

    runInAction(() => {
      const initialValues = config?.map((it) => [it.id, null]);

      if (initialValues) {
        this.mainKpis[slide] = Object.fromEntries(initialValues);
      }
    });

    let enrichedConfig;

    if (config) {
      enrichedConfig = await Promise.all(
        config?.map(async (it) => ({
          ...it,
          params: await this.getRequestParams(it.params || []),
        }))
      );
    }

    if (enrichedConfig) {
      await this.loadMainKpi(slide, fetchMainKpis(enrichedConfig));
    }
  }

  public async fetchMobilityOverviewKpis() {
    const config = Object.values(MOBILITY_OVERVIEW_CONFIG).flatMap((it) =>
      it.kpis.map((kpi) => ({
        permission: it.permission,
        ...kpi,
      }))
    );

    runInAction(() => {
      const initialValues = config?.map((it) => [it.id, null]);

      if (initialValues) {
        this.mobilityOverviewKpis = Object.fromEntries(initialValues);
      }
    });

    const permissions = authStoreInstance.permissions;

    const getParams = (kpi: (typeof config)[0]) => {
      let params = kpi.params;
      if (!permissions?.includes(kpi.permission)) {
        params = [];
      }
      return params;
    };

    const enrichedConfig = await Promise.all(
      config.map(async (it) => ({
        ...it,
        params: await this.getRequestParams(getParams(it) || [], it.id),
      }))
    );

    if (enrichedConfig) {
      await this.loadMobilityOverviewKpi(fetchMainKpis(enrichedConfig));
    }
  }

  public getMainKpi(slide: Slide): { [k: string]: MainKpi | null } {
    return this.mainKpis[slide] ?? {};
  }

  public getMobilityOverviewKpis(id: string) {
    return this.mobilityOverviewKpis?.[id as keyof typeof this.mobilityOverviewKpis]?.mainKpi;
  }

  private async loadMainKpi(key: Slide, loader: () => Promise<MainKpiResponse>) {
    const data = await loader();

    runInAction(() => {
      this.mainKpis[key] = data || null;
    });
  }

  private async loadMobilityOverviewKpi(loader: () => Promise<MainKpiResponse>) {
    this.isFetching = true;
    const data = await loader();

    runInAction(() => {
      this.mobilityOverviewKpis = data || {};
      this.isFetching = false;
    });
  }

  private async getRequestParams(keys: MainKpiRequestParams[], id?: string) {
    const isRoadSlide = slidesStoreInstance.currentSlide === Slide.ROAD_TRAFFIC;

    const { startDate, endDate } = getDateRangeForKpi(
      mapDataValuesStore.time.currentRange.from!,
      mapDataValuesStore.time.currentRange.to!,
      isRoadSlide
    );

    const params = {} as MainKpiEnrichedConfig['params'];

    for (const key of keys) {
      if (key === 'RegionLocationAndLocationType') {
        const parentRegion = await slidesStoreInstance.getParentRegionForCurrentLocation();
        const location = parentRegion.location;

        params.location = location === 'AD ISLAND' ? 'Abu Dhabi Island' : location;
        params.locationType = parentRegion.locationType;
      }

      if (key === 'location') {
        params.location =
          locationPanelStore.currentLocation.location === 'AD ISLAND'
            ? 'Abu Dhabi Island'
            : locationPanelStore.currentLocation.location;
      }

      if (key === 'locationType') {
        params.locationType = locationPanelStore.currentLocation.locationType;
      }

      if (key === 'startDate') {
        params.startDate = formatDate(startDate);
      }

      if (key === 'quarter') {
        const { from, to } = mapDataValuesStore.getLastFinishedQuarter();

        params.startDate = formatDateFullCSharp(from);
        params.endDate = formatDateFullCSharp(to);
      }

      if (key === 'defaultQuarter') {
        const { from, to } = mapDataValuesStore.getLastFinishedQuarter(true, id);

        params.startDate = formatDateFullCSharp(from);
        params.endDate = formatDateFullCSharp(to);
      }

      if (key === 'year') {
        params.year = mapDataValuesStore.getLastFinishedYear();
      }

      if (key === 'defaultYear') {
        params.year = mapDataValuesStore.getLastFinishedYear(true);
      }

      if (key === 'horizon') {
        params.horizon = mapDataValuesStore.getClosestHorizonInFuture();
      }

      if (key === 'defaultHorizon') {
        params.horizon = mapDataValuesStore.getClosestHorizonInFuture(true);
      }

      if (key === 'endDate') {
        params.endDate = formatDate(endDate);
      }

      if (key === 'quartersForCurrentPeriod') {
        const { from, to } = mapDataValuesStore.getQuartersForCurrentPeriod();

        params.startDate = formatDate(from);
        params.endDate = formatDate(to);
      }

      if (key === 'allMonthOfCurrentPeriod') {
        const { from, to } = mapDataValuesStore.getAllMonthsOfCurrentPeriod();

        params.startDate = formatDate(from);
        params.endDate = formatDate(to);
      }

      if (key === 'consumptor') {
        params.consumptor = landUseConsumptionPillar3DStoreInstance.consumptor;
      }
    }

    return params;
  }
}

const kpiStoreInstance = new KPIStore();
export default kpiStoreInstance;
