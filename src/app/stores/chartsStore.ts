import { makeAutoObservable, runInAction } from 'mobx';
import { formatDateFullCSharp } from 'shared/utils/date.ts';

import { CHARTS_CONFIG } from '../../entities/charts/config.ts';
import {
  ChartEnrichedOptionParams,
  ChartOption,
  Charts,
  ChartsRequestParams,
  ChartsResponse,
} from '../../entities/charts/types.ts';
import { fetchCharts } from '../../entities/dashboard/services.ts';
import { Slide } from '../../entities/dashboard/types.ts';
import { LocationType } from '../../entities/locationPanel/types.ts';
import locationPanelStore from './locationPanelStore.ts';
import mapDataValuesStore from './mapDataValuesStore.ts';

type ExploreCharts = {
  [k in Slide]?: { [id: string]: Charts | null } | null;
};

export class ChartsStore {
  exploreCharts: ExploreCharts = {};
  isFetching: boolean = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  public async fetchCharts(slide: Slide) {
    const config = CHARTS_CONFIG[slide];

    // TODO: fix initialValues
    runInAction(() => {
      const initialValues = config?.map((it) => [it.id, null]);

      if (initialValues) {
        this.exploreCharts[slide] = Object.fromEntries(initialValues);
      }
    });

    const getParamsWithConditions = (chart: ChartOption) => {
      const locations = chart.unavailableLocation;

      let params = chart.params;
      if (locations?.includes(locationPanelStore.currentLocation.locationType)) {
        params = [];
      }

      return params;
    };

    const enrichedConfig = config?.map((it) => ({
      ...it,
      params: this.getRequestParams(getParamsWithConditions(it) || []),
    }));

    if (enrichedConfig) {
      await this.loadCharts(slide, fetchCharts(enrichedConfig));
    }
  }

  public getChartsData(slide: Slide): { [k: string]: Charts | null } {
    return this.exploreCharts[slide] ?? {};
  }

  private async loadCharts(key: Slide, loader: () => Promise<ChartsResponse>) {
    this.isFetching = true;
    const isCorridors = locationPanelStore.currentLocationType === LocationType.CORRIDOR;

    const data = isCorridors ? null : await loader();

    runInAction(() => {
      this.exploreCharts[key] = data || null;
      this.isFetching = false;
    });
  }

  private getRequestParams(keys: ChartsRequestParams[] | ChartsRequestParams[][]) {
    let keysCopy: ChartsRequestParams[][];
    if (!Array.isArray(keys[0])) {
      keysCopy = [keys as ChartsRequestParams[]];
    } else {
      keysCopy = keys as ChartsRequestParams[][];
    }
    return keysCopy!.map((x) =>
      x.reduce((params, key) => {
        if (key === 'location') {
          params.location =
            locationPanelStore.currentLocation.location == 'AD ISLAND'
              ? 'Abu Dhabi Island'
              : locationPanelStore.currentLocation.location;
        }

        if (key === 'locationType') {
          params.locationType = locationPanelStore.currentLocation.locationType;
        }

        if (key === 'quarter') {
          const { from, to } = mapDataValuesStore.getLastFinishedQuarter();

          params.startDate = formatDateFullCSharp(from);
          params.endDate = formatDateFullCSharp(to);
        }

        if (key === 'horizon') {
          params.horizon = mapDataValuesStore.getClosestHorizonInFuture();
        }

        if (key === 'horizonInPast') {
          params.horizon = mapDataValuesStore.getClosetHorizonInPast();
        }

        if (key === 'horizon2025') {
          params.horizon = 2025;
        }

        if (key === 'year') {
          params.year = mapDataValuesStore.getLastFinishedYear();
        }

        if (key === 'quartersForCurrentPeriod') {
          const { from, to } = mapDataValuesStore.getQuartersForCurrentPeriod();

          params.startDate = formatDateFullCSharp(from);
          params.endDate = formatDateFullCSharp(to);
        }

        if (key === 'firstMonthOfCurrentQuarter') {
          const { from, to } = mapDataValuesStore.getFirstMonthOfCurrentQuarter();

          params.startDate = formatDateFullCSharp(from);
          params.endDate = formatDateFullCSharp(to);
        }

        if (key === 'lastMonthOfQuarter') {
          const { from, to } = mapDataValuesStore.getLastMonthOfCurrentQuarter();

          params.startDate = formatDateFullCSharp(from);
          params.endDate = formatDateFullCSharp(to);
        }

        if (key === 'rangeOfLastYearBeforeHorizon') {
          const { from, to } = mapDataValuesStore.getLastFinishedYearBeforeSelectedHorizon();

          params.startDate = formatDateFullCSharp(from);
          params.endDate = formatDateFullCSharp(to);
        }

        if (key === 'allMonthsOfPeriod') {
          const { from, to } = mapDataValuesStore.getAllMonthsOfCurrentPeriod();

          params.startDate = formatDateFullCSharp(from);
          params.endDate = formatDateFullCSharp(to);
        }

        return params;
      }, {} as ChartEnrichedOptionParams)
    );
  }
}

const chartsStoreInstance = new ChartsStore();
export default chartsStoreInstance;
