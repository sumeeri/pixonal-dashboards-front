import axios, { Axios, AxiosProgressEvent } from 'axios';
import { setupCache } from 'axios-cache-interceptor';
import { addMinutes, endOfDay, startOfDay } from 'date-fns';
import { axiosCachingInstance } from 'shared/constants/axiosInstance.ts';
import { DataType, MapDataAggregationTimeType, MapDataAggregationType } from 'shared/constants/mapDataParams.ts';
import { formatDate, formatDateFullCSharp } from 'shared/utils/date.ts';

import { getCurrentAggregationType, getDateRangeByCurrentRangeAndIndex } from '../../app/helpers/serviceDatesUtils.ts';
import { AccidentData, AccidentTooltipData } from '../../app/stores/3d/accidents/AccidentsDataTypes.ts';
import {
  AviationConnectivityParamsData,
  AviationTransferDataType,
} from '../../app/stores/3d/aviation/AviationDataTypes.ts';
import {
  BusLineUtilizationParamsData,
  BusLocationParamsData,
  BusStopTooltipData,
  BusWithinParamsData,
  TaxiWithinTripsParamsData,
} from '../../app/stores/3d/busAndTaxi/BusAndTaxiDataTypes.ts';
import {
  CongestionFenceData,
  CongestionParamsData,
  CongestionTooltipData,
} from '../../app/stores/3d/congestion/data/CongestionDataTypes.ts';
import { IFenceGeometryData } from '../../app/stores/3d/congestion/data/IFenceGeometryData.ts';
import { JunctionData, JunctionParamsData } from '../../app/stores/3d/failingJunctions/JunctionDataTypes.ts';
import IBuilding from '../../app/stores/3d/IBuilding.ts';
import {
  ConsumptionGood,
  Consumptor,
  LandUseConsumptionPillarData,
  LandUseConsumptionPlotData,
  LandUsePlotData,
  LandUseZoneData,
} from '../../app/stores/3d/landUse/LandUseDataTypes.ts';
import {
  MaritimeFacilitiesDataType,
  MaritimeGeometryData,
  MaritimeTripsFetchArgs,
} from '../../app/stores/3d/maritime/MaritimesTypes.ts';
import { PopulationMoveParamsData } from '../../app/stores/3d/population/PopulationDataTypes.ts';
import { IPeopleCountParamsData } from '../../app/stores/3d/populationCount/PopulationCountTypes.ts';
import {
  AviationTransferFetchArgs,
  BusLineUtilizationFetchArgs,
  BusLineUtilizationTooltipArgs,
  BusStopsFetchArgs,
  CongestionTooltipArgs,
  ConsumptionFetchArgs,
  ConsumptorToResedentialOrCommercial,
  LandUseFetchArgs,
  LandUseFetchArgsWithHorizon,
  LocationAndDateFetchArgs,
  LocationAndDateRangeFetchArgs,
  LocationAndDateRangeWithRangeTypeFetchArgs,
  LocationFetchArgs,
  PeopleMovementFetchArgs,
  RoadTrafficFetchArgs,
  StudentCountFetchArgs,
} from '../../app/stores/3d/stores/FetchParams.ts';
import { StudentsdataType } from '../../app/stores/3d/students/StudentsDataTypes.ts';
import abortControllerStoreInstance from '../../app/stores/AbortControllerStore.ts';
import contentLoadStoreInstance from '../../app/stores/contentLoadStore.ts';
import downloadStoreInstance from '../../app/stores/DownloadStore.ts';
import mapDataValuesStoreInstance from '../../app/stores/mapDataValuesStore.ts';
import { ChartEnrichedConfig, ChartsResponse } from '../charts/types.ts';
import { KpiEnrichedConfig, MainKpiResponse } from '../kpi/types.ts';
import { ILocation, LocationType, LocationWithGeometry } from '../locationPanel/types.ts';
import { populationMovementSlides } from './config.ts';
import {
  DataForTimeInterval,
  MainKpi,
  PatternsData,
  Slide,
  TimelineData,
  TimelineDataResponse,
  TimelineXDataType,
} from './types.ts';

// export const s3bucket = 'https://storage.yandexcloud.net/rubius-pixonal-dashboards-data-001';
export const s3bucket = '/s3-mock';
export const s3assets = `${s3bucket}/assets`;

const prepareTimelineData = (data: TimelineDataResponse): TimelineData => {
  return {
    values: data.values,
    xData: data.time ?? data.date,
    xDataType: data.time ? TimelineXDataType.Time : TimelineXDataType.Date,
  };
};

/** We are filtering all incoming jsons with this function,
 * because sometimes properties are lowcase character
 * and sometimes properties are capitalcase character.
 */

// TODO: Remove this hack
const objectKeysToLowerCase = (obj: any): any => {
  if (obj === null) {
    return obj;
  }
  if (typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      const value = objectKeysToLowerCase(obj[key]);
      delete obj[key];
      obj[key.toLowerCase()] = value;
    }
  } else if (Array.isArray(obj)) {
    for (const value of obj) {
      objectKeysToLowerCase(value);
    }
  }
  return obj;
};

const getWithProgress = async <T>(_axiosInstance: Axios, url: string, params?: any): Promise<T> => {
  const startTime = Date.now();

  const response = await _axiosInstance
    .get<T>(url, {
      params: params,
      signal: abortControllerStoreInstance.controller.signal,
      onDownloadProgress: (event: AxiosProgressEvent) => {
        const time = Date.now() - startTime;
        const progress = event.progress ?? 0;
        if (time >= downloadStoreInstance.time && progress >= downloadStoreInstance.progress) {
          downloadStoreInstance.setTime(time);
          downloadStoreInstance.setProgress(progress);
          if (progress > 0.9) {
            downloadStoreInstance.setTime(0);
            downloadStoreInstance.setProgress(0);
          }
        }
      },
    })
    .catch((err) => {
      if (err.name === 'CanceledError') {
        contentLoadStoreInstance.setIsTimelineDataLoading(true);
      } else {
        contentLoadStoreInstance.setIsTimelineDataLoading(false);
        contentLoadStoreInstance.setIsKpiLoading(false);
      }
      return err;
    });

  return response?.data;
};

export const fetchCharts = (charts: ChartEnrichedConfig): (() => Promise<ChartsResponse>) => {
  return async () => {
    const data = (
      await Promise.allSettled(
        charts.map(async ({ url, params, ...rest }) => {
          if (!url) return Promise.resolve(null);

          if (Object.keys(params[0]).length === 0) return Promise.resolve(null);

          if (Array.isArray(url)) {
            return (
              await Promise.allSettled(
                url.map(async (_url, index) => {
                  if (!_url) return Promise.resolve(null);
                  return await getWithProgress(axiosCachingInstance, `/${_url}`, params[index]);
                })
              )
            ).map((it, index) => {
              if (it.status !== 'fulfilled') return null;

              // @ts-expect-error it should be here
              if (!it.value?.type) {
                // @ts-expect-error it should be here
                const labels = rest.urlLabelsMapping;

                return { ...(it.value ?? { value: 0 }), type: labels[index] };
              }

              return it.value;
            });
          } else return await getWithProgress(axiosCachingInstance, `/${url}`, params[0]);
        })
      )
    ).map((it) => (it.status === 'fulfilled' ? it.value : null));

    return Object.fromEntries(
      charts.map(({ id, mock }, index) => {
        const isBackendData = !!data[index];
        const mockedData = mock && objectKeysToLowerCase(mock);

        const _data = isBackendData ? data[index] : mockedData;

        return [id, _data];
      })
    );
  };
};

/* export const fetchMainKpis = (config: KpiEnrichedConfig): (() => Promise<MainKpiResponse>) => {
  return async () => {
    const data = (
      await Promise.allSettled(
        config.map(async ({ url, params }) => {
          if (!url) return Promise.resolve(null);

          if (Object.keys(params).length === 0) return Promise.resolve(null);

          // TODO: fix api and move consumptor to params
          let _url = url;
          if (params.consumptor) {
            _url = `${url}/${params.consumptor}`;
          }

          return await getWithProgress(axiosCachingInstance, `/${_url}`, params);
        })
      )
    ).map((it) => (it.status === 'fulfilled' ? it.value : null)) as MainKpi[];

    return Object.fromEntries(
      config.map(({ id }, index) => {
        const _data = data[index] ?? null;

        return [id, _data];
      })
    );
  };
}; */

// Fix for mobility overview citizen percentage fix
export const fetchMainKpis = (config: KpiEnrichedConfig): (() => Promise<MainKpiResponse>) => {
  return async () => {
    const data = (
      await Promise.allSettled(
        config.map(async ({ url, params }) => {
          if (!url) return Promise.resolve(null);
          if (Object.keys(params).length === 0) return Promise.resolve(null);

          let _url = url;
          if (params.consumptor) {
            _url = `${url}/${params.consumptor}`;
          }

          return await getWithProgress(axiosCachingInstance, `/${_url}`, params);
        })
      )
    ).map((it) => (it.status === 'fulfilled' ? it.value : null)) as MainKpi[];

    return Object.fromEntries(
      config.map(({ id }, index) => {
        let _data = data[index] ?? null;

        // If response is an array with type/value pairs
        if (Array.isArray(_data)) {
          const citizen = _data.find((x) => x.type === 'Citizen')?.value ?? 0;
          const nonCitizen = _data.find((x) => x.type === 'NonCitizen')?.value ?? 0;
          const total = citizen + nonCitizen;
          const citizenPercentage = total > 0 ? (citizen / total) * 100 : 0;

          // 🧠 If percentage exists, override; else keep original data
          if (citizenPercentage > 0) {
            _data = { mainKpi: citizenPercentage } as MainKpi;
          } else {
            // just keep _data as-is (already set above)
          }
        }

        return [id, _data];
      })
    );
  };
};

export const fetchPatterns = async (): Promise<PatternsData[]> => {
  const url = `patterns`;

  const result = (await axiosCachingInstance.get(url)).data;

  return result;
};

export const fetchBusUtilizationTimeline = async (fetchParam: LocationAndDateRangeFetchArgs): Promise<TimelineData> => {
  const url: string = `BusLineUtilization/timeline`;
  const currentAggregationType = getCurrentAggregationType(fetchParam.startDate, fetchParam.endDate);

  const isAggregatedByMinutes = currentAggregationType === MapDataAggregationType.AVERAGE_DAY;

  const result = await getWithProgress<TimelineDataResponse>(axiosCachingInstance, url, {
    startDate: isAggregatedByMinutes ? formatDateFullCSharp(fetchParam.startDate) : formatDate(fetchParam.startDate),
    endDate: isAggregatedByMinutes ? formatDateFullCSharp(fetchParam.endDate) : formatDate(fetchParam.endDate),
    aggregationType: currentAggregationType,
    location: fetchParam.location.location == 'AD ISLAND' ? 'Abu Dhabi Island' : fetchParam.location.location,
    locationType: fetchParam.location.locationType,
  });

  return prepareTimelineData(result);
};

export const fetchPopulationCountParams = async (
  fetchParam: LocationAndDateRangeWithRangeTypeFetchArgs,
  timeSliceIndex: number
): Promise<IPeopleCountParamsData[]> => {
  const url: string = `peoplecount/map/populationdensity`;

  const currentDateRange = getDateRangeByCurrentRangeAndIndex(fetchParam.startDate, fetchParam.endDate, timeSliceIndex);

  const aggregationType = getCurrentAggregationType(fetchParam.startDate, fetchParam.endDate);

  return getWithProgress(axiosCachingInstance, url, {
    location: fetchParam.location.location,
    locationType: fetchParam.location.locationType,
    startDate: formatDateFullCSharp(currentDateRange.from),
    endDate: formatDateFullCSharp(currentDateRange.to),
    aggregationType: aggregationType,
  });
};

export const fetchAviationInboundOutboundParams = async (
  fetchParam: AviationTransferFetchArgs,
  timeSliceIndex: number
): Promise<AviationTransferDataType[]> => {
  const currentDateRange = getDateRangeByCurrentRangeAndIndex(fetchParam.startDate, fetchParam.endDate, timeSliceIndex);

  const type = (() => {
    switch (fetchParam.dataType) {
      case DataType.AVIATION_TRANSFERS:
        return 'transfers';
      case DataType.AVIATION_ARRIVALS:
        return 'arrivals';
      case DataType.AVIATION_DEPARTURES:
        return 'departures';
      default:
        throw new Error(`unknown url mapping for ${fetchParam.dataType}`);
    }
  })();

  const url: string = `${fetchParam.tripDirection}aviation/map/${type}`;
  return getWithProgress(axiosCachingInstance, url, {
    startDate: formatDateFullCSharp(currentDateRange.from),
    endDate: formatDateFullCSharp(currentDateRange.to),
  });
};

export const fetchAviationConnectivityParams = async (
  fetchParam: LocationAndDateRangeFetchArgs,
  timeSliceIndex: number
): Promise<AviationConnectivityParamsData[]> => {
  const currentDateRange = getDateRangeByCurrentRangeAndIndex(fetchParam.startDate, fetchParam.endDate, timeSliceIndex);

  const url: string = `connectivityAviation/map`;
  return getWithProgress(axiosCachingInstance, url, {
    startDate: formatDateFullCSharp(currentDateRange.from),
    endDate: formatDateFullCSharp(currentDateRange.to),
  });
};

export const fetchCongestionGeometry = async (fetchParam: LocationFetchArgs): Promise<IFenceGeometryData> => {
  const url: string = `geometrydata/sections`;
  const data: CongestionFenceData[] = await getWithProgress<CongestionFenceData[]>(axiosCachingInstance, url, {
    location: fetchParam.location.location == 'AD ISLAND' ? 'Abu Dhabi Island' : fetchParam.location.location,
    locationType: fetchParam.location.locationType,
  });

  return { fenceList: data };
};

export const fetchCongestionParams = async (
  fetchParam: RoadTrafficFetchArgs,
  timeSliceIndex: number
): Promise<CongestionParamsData[]> => {
  const currentDateRange = getDateRangeByCurrentRangeAndIndex(fetchParam.startDate, fetchParam.endDate, timeSliceIndex);

  const aggregationType = getCurrentAggregationType(fetchParam.startDate, fetchParam.endDate);

  const type = (() => {
    switch (fetchParam.dataType) {
      case DataType.RELATIVE_SPEED:
        return 'relativespeed';
      case DataType.SPEED:
        return 'speed';
      case DataType.VOLUME:
        return 'volume';
      case DataType.DENSITY:
        return 'density';
      default:
        return 'relativespeed';
    }
  })();
  const url: string = `/roadtraffic/map/${type}`;
  return await getWithProgress(axiosCachingInstance, url, {
    startDate: formatDateFullCSharp(currentDateRange.from),
    endDate: formatDateFullCSharp(currentDateRange.to),
    location: fetchParam.location.location == 'AD ISLAND' ? 'Abu Dhabi Island' : fetchParam.location.location,
    locationType: fetchParam.location.locationType,
    aggregationType: aggregationType,
  });
};

export const fetchCongestionMostUsedParams = async (
  fetchParam: RoadTrafficFetchArgs
): Promise<CongestionParamsData[]> => {
  const type = (() => {
    switch (fetchParam.dataType) {
      case DataType.MOST_USED_ENTRY_POINTS:
        return 'mostusedentrypoints';
      case DataType.MOST_USED_EXIT_POINTS:
        return 'mostusedexitpoints';
    }
  })();
  const url: string = `/roadtraffic/map/${type}`;
  return await getWithProgress(axiosCachingInstance, url, {
    location: fetchParam.location.location == 'AD ISLAND' ? 'Abu Dhabi Island' : fetchParam.location.location,
    locationType: fetchParam.location.locationType,
  });
};

export const fetchBusUtilizationTooltip = async (
  fetchParam: BusLineUtilizationTooltipArgs,
  timeSliceIndex: number
): Promise<BusStopTooltipData> => {
  const url = `/BusLineUtilization/map/tooltip`;

  const currentDateRange = getDateRangeByCurrentRangeAndIndex(fetchParam.startDate, fetchParam.endDate, timeSliceIndex);

  const currentAggregationType = getCurrentAggregationType(fetchParam.startDate, fetchParam.endDate);

  let startTimeStamp: Date;
  let endTimeStamp: Date;

  switch (currentAggregationType) {
    case MapDataAggregationType.AVERAGE_DAY:
      startTimeStamp = new Date(currentDateRange.from);

      endTimeStamp = addMinutes(currentDateRange.to, 15);
      break;
    case MapDataAggregationType.TYPICAL_DAY:
      startTimeStamp = currentDateRange.from;
      endTimeStamp = currentDateRange.to;
      break;
    default:
      startTimeStamp = startOfDay(currentDateRange.from);
      endTimeStamp = endOfDay(currentDateRange.to);
  }

  return await getWithProgress(axiosCachingInstance, url, {
    sensorId: fetchParam.id,
    startDate: formatDateFullCSharp(startTimeStamp),
    endDate: formatDateFullCSharp(endTimeStamp),
    aggregationType: currentAggregationType,
  });
};

export const fetchCongestionTooltip = async (
  fetchParam: CongestionTooltipArgs,
  timeSliceIndex: number
): Promise<CongestionTooltipData> => {
  const url = `/roadtraffic/map/tooltip`;

  const currentDateRange = getDateRangeByCurrentRangeAndIndex(fetchParam.startDate, fetchParam.endDate, timeSliceIndex);

  const currentAggregationType = getCurrentAggregationType(fetchParam.startDate, fetchParam.endDate);

  let startTimeStamp: Date;
  let endTimeStamp: Date;

  switch (currentAggregationType) {
    case MapDataAggregationType.AVERAGE_DAY:
      startTimeStamp = new Date(currentDateRange.from);

      endTimeStamp = addMinutes(currentDateRange.to, 15);
      break;
    case MapDataAggregationType.TYPICAL_DAY:
      startTimeStamp = currentDateRange.from;
      endTimeStamp = currentDateRange.to;
      break;
    default:
      startTimeStamp = startOfDay(currentDateRange.from);
      endTimeStamp = endOfDay(currentDateRange.to);
  }

  return await getWithProgress(axiosCachingInstance, url, {
    sensorId: fetchParam.id,
    location: fetchParam.location.location == 'AD ISLAND' ? 'Abu Dhabi Island' : fetchParam.location.location,
    locationType: fetchParam.location.locationType,
    startDate: formatDateFullCSharp(startTimeStamp),
    endDate: formatDateFullCSharp(endTimeStamp),
    typicalDay: currentAggregationType === 4 ? true : false,
  });
};

export const fetchConsumptionPillarParams = async (
  fetchParam: ConsumptionFetchArgs,
  timeSliceIndex: number
): Promise<LandUseConsumptionPillarData[]> => {
  const currentDateRange = getDateRangeByCurrentRangeAndIndex(fetchParam.startDate, fetchParam.endDate, timeSliceIndex);

  if (fetchParam.consumptor === Consumptor.Utilization) {
    return [];
  }

  const url: string =
    fetchParam.consumptionGood == ConsumptionGood.Water ? `/waterconsumption/map` : `/electricityconsumption/map`;
  const data: any[] = await getWithProgress(axiosCachingInstance, url, {
    location: fetchParam.location.location == 'AD ISLAND' ? 'Abu Dhabi Island' : fetchParam.location.location,
    locationType: fetchParam.location.locationType,
    startDate: formatDateFullCSharp(currentDateRange.from),
    endDate: formatDateFullCSharp(currentDateRange.to),
    customerClass: ConsumptorToResedentialOrCommercial(fetchParam.consumptor),
  });

  if (data.length === 0) {
    return data;
  }

  const max = data.map((x) => x.value).reduce((a, b) => Math.max(a, b)) || 1;

  return data
    .filter((x) => x.value !== 0)
    .map((x, i) => ({
      i: i,
      point: x.geometry,
      value: x.value,
      valueNormalized: Math.pow(x.value / max, 0.5),
      plotName: x.plotName,
      sectorName: x.sectorName,
    }));
};

export const fetchConsumptionPlotParams = async (
  fetchParam: LocationAndDateRangeFetchArgs,
  timeSliceIndex: number
): Promise<LandUseConsumptionPlotData[]> => {
  const currentDateRange = getDateRangeByCurrentRangeAndIndex(fetchParam.startDate, fetchParam.endDate, timeSliceIndex);

  const url: string = `waterconsumption/map/utilization`;
  return await getWithProgress(axiosCachingInstance, url, {
    location: fetchParam.location.location == 'AD ISLAND' ? 'Abu Dhabi Island' : fetchParam.location.location,
    locationType: fetchParam.location.locationType,
    startDate: formatDateFullCSharp(currentDateRange.from),
    endDate: formatDateFullCSharp(currentDateRange.to),
  });
};

export const fetchJunctionsParams = async (
  fetchParam: LocationAndDateRangeWithRangeTypeFetchArgs,
  timeSliceIndex: number
): Promise<JunctionParamsData[]> => {
  const currentDateRange = getDateRangeByCurrentRangeAndIndex(fetchParam.startDate, fetchParam.endDate, timeSliceIndex);

  const aggregationType = getCurrentAggregationType(fetchParam.startDate, fetchParam.endDate);

  const url: string = `junctionlevelofservice/map`;
  return await getWithProgress(axiosCachingInstance, url, {
    startDate: formatDateFullCSharp(currentDateRange.from),
    endDate: formatDateFullCSharp(currentDateRange.to),
    location: fetchParam.location.location == 'AD ISLAND' ? 'Abu Dhabi Island' : fetchParam.location.location,
    locationType: fetchParam.location.locationType,
    aggregationType: aggregationType,
  });
};

export const fetchAccidentsTimeline = async (fetchParam: LocationAndDateRangeFetchArgs): Promise<TimelineData> => {
  const url = `/accidents/timeline`;

  const currentAggregationType = getCurrentAggregationType(fetchParam.startDate, fetchParam.endDate);

  const isAggregatedByMinutes = currentAggregationType === MapDataAggregationType.AVERAGE_DAY;

  const startTimeStamp = startOfDay(fetchParam.startDate);
  const endTimeStamp = endOfDay(fetchParam.endDate);

  const result = await getWithProgress<TimelineDataResponse>(axiosCachingInstance, url, {
    startDate: isAggregatedByMinutes ? formatDateFullCSharp(startTimeStamp) : formatDate(fetchParam.startDate),
    endDate: isAggregatedByMinutes ? formatDateFullCSharp(endTimeStamp) : formatDate(fetchParam.endDate),
    aggregationType: currentAggregationType,
    location: fetchParam.location.location == 'AD ISLAND' ? 'Abu Dhabi Island' : fetchParam.location.location,
    locationType: fetchParam.location.locationType,
  });

  return prepareTimelineData(result);
};

export const fetchInboundAviationTimeline = async (
  startDate: Date,
  endDate: Date,
  dataType: DataType
): Promise<TimelineData> => {
  const url = `/InboundAviation/timeline/${dataType === DataType.AVIATION_TRANSFERS ? 'transfers' : 'arrivals'}`;

  const result = await getWithProgress<TimelineDataResponse>(axiosCachingInstance, url, {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    aggregationType: getCurrentAggregationType(startDate, endDate, true),
  });

  return prepareTimelineData(result);
};

export const fetchOutboundAviationTimeline = async (
  startDate: Date,
  endDate: Date,
  dataType: DataType
): Promise<TimelineData> => {
  const url = `/outboundAviation/timeline/${dataType === DataType.AVIATION_TRANSFERS ? 'transfers' : 'departures'}`;

  const result = await getWithProgress<TimelineDataResponse>(axiosCachingInstance, url, {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    aggregationType: getCurrentAggregationType(startDate, endDate, true),
  });

  return prepareTimelineData(result);
};

export const fetchConnectivityAviationTimeline = async (startDate: Date, endDate: Date): Promise<TimelineData> => {
  const url = `/connectivityAviation/timeline`;

  const result = await getWithProgress<TimelineDataResponse>(axiosCachingInstance, url, {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    aggregationType: getCurrentAggregationType(startDate, endDate, true),
  });

  return prepareTimelineData(result);
};

export const fetchBusLocationsParams = async (
  fetchParam: PeopleMovementFetchArgs,
  timeSliceIndex: number
): Promise<BusLocationParamsData[]> => {
  const currentDateRange = getDateRangeByCurrentRangeAndIndex(fetchParam.startDate, fetchParam.endDate, timeSliceIndex);

  const url = `/bustrips${fetchParam.tripDirection}/map/locations`;

  const aggregationType = getCurrentAggregationType(fetchParam.startDate, fetchParam.endDate);

  return await getWithProgress(axiosCachingInstance, url, {
    startDate: formatDateFullCSharp(currentDateRange.from),
    endDate: formatDateFullCSharp(currentDateRange.to),
    location: fetchParam.location.location == 'AD ISLAND' ? 'Abu Dhabi Island' : fetchParam.location.location,
    locationType: fetchParam.location.locationType,
    aggregationType: aggregationType,
  });
};

export const fetchWithinBusTripsParams = async (
  fetchParam: BusStopsFetchArgs,
  timeSliceIndex: number
): Promise<BusWithinParamsData[]> => {
  const currentDateRange = getDateRangeByCurrentRangeAndIndex(fetchParam.startDate, fetchParam.endDate, timeSliceIndex);

  const aggregationType = getCurrentAggregationType(fetchParam.startDate, fetchParam.endDate);

  let url: string;
  switch (fetchParam.slide) {
    case Slide.BUS_TRIPS_INBOUND:
      url = `bustripsinbound/map/busStops/${fetchParam.type}`;
      break;
    case Slide.BUS_TRIPS_OUTBOUND:
      url = `bustripsoutbound/map/busStops/${fetchParam.type}`;
      break;
    case Slide.BUS_TRIPS_WITHIN:
      url = `bustripswithin/map/${fetchParam.type}`;
      break;
    case Slide.BUS_LINE_UTILIZATION:
      url = `BusLineUtilization/map/busstops`;
      break;
    default:
      throw new Error('Unknown slide');
  }

  const result = await getWithProgress<BusWithinParamsData[]>(axiosCachingInstance, url, {
    startDate: formatDateFullCSharp(currentDateRange.from),
    endDate: formatDateFullCSharp(currentDateRange.to),
    location: fetchParam.location.location == 'AD ISLAND' ? 'Abu Dhabi Island' : fetchParam.location.location,
    locationType: fetchParam.location.locationType,
    aggregationType: aggregationType,
  });

  return result.filter((x) => x.count !== 0);
};

export const fetchBusLineUtilizationParams = async (
  fetchParam: BusLineUtilizationFetchArgs,
  timeSliceIndex: number
): Promise<BusLineUtilizationParamsData[]> => {
  const currentDateRange = getDateRangeByCurrentRangeAndIndex(fetchParam.startDate, fetchParam.endDate, timeSliceIndex);

  const aggregationType = getCurrentAggregationType(fetchParam.startDate, fetchParam.endDate);

  const url = `/BusLineUtilization/map/${fetchParam.direction}direction${fetchParam.direction == 'both' ? 's' : ''}`;

  return await getWithProgress(axiosCachingInstance, url, {
    startDate: formatDateFullCSharp(currentDateRange.from),
    endDate: formatDateFullCSharp(currentDateRange.to),
    location: fetchParam.location.location == 'AD ISLAND' ? 'Abu Dhabi Island' : fetchParam.location.location,
    locationType: fetchParam.location.locationType,
    aggregationType: aggregationType,
  });
};

export const fetchTaxiTripsParams = async (
  fetchParam: PeopleMovementFetchArgs,
  timeSliceIndex: number
): Promise<BusLocationParamsData[]> => {
  const currentDateRange = getDateRangeByCurrentRangeAndIndex(fetchParam.startDate, fetchParam.endDate, timeSliceIndex);

  const aggregationType = getCurrentAggregationType(fetchParam.startDate, fetchParam.endDate);

  const url = `/taxitrips${fetchParam.tripDirection}/map`;
  const result = await getWithProgress<any>(axiosCachingInstance, url, {
    location: fetchParam.location.location == 'AD ISLAND' ? 'Abu Dhabi Island' : fetchParam.location.location,
    locationType: fetchParam.location.locationType,
    startDate: formatDateFullCSharp(currentDateRange.from),
    endDate: formatDateFullCSharp(currentDateRange.to),
    aggregationType: aggregationType,
  });

  return result.map((x: any) => {
    x.count = x.peopleCount;
    return x;
  });
};

export const fetchTaxiTripsWithinParams = async (
  fetchParam: AviationTransferFetchArgs,
  timeSliceIndex: number
): Promise<TaxiWithinTripsParamsData[]> => {
  const needDataType = (() => {
    switch (fetchParam.dataType) {
      case DataType.PICKUPS:
        return 'pickup';

      case DataType.DROPOFFS:
        return 'dropoff';
    }
  })();

  const currentDateRange = getDateRangeByCurrentRangeAndIndex(fetchParam.startDate, fetchParam.endDate, timeSliceIndex);

  const aggregationType = getCurrentAggregationType(fetchParam.startDate, fetchParam.endDate);

  const url = `/taxitrips${fetchParam.tripDirection}/map/${needDataType}`;

  const result = await getWithProgress<any>(axiosCachingInstance, url, {
    startDate: formatDateFullCSharp(currentDateRange.from),
    endDate: formatDateFullCSharp(currentDateRange.to),
    location: fetchParam.location.location == 'AD ISLAND' ? 'Abu Dhabi Island' : fetchParam.location.location,
    locationType: fetchParam.location.locationType,
    aggregationType: aggregationType,
  });

  return result.map((x: any) => {
    // Normalize backend casing differences
    const from = x.from ?? x.From ?? x.orig_location ?? x.Orig_Location ?? x.origLocation;
    const to = x.to ?? x.To ?? x.dest_location ?? x.Dest_Location ?? x.destLocation;
    const locationForType = needDataType === 'pickup' ? from : to;

    const peopleCount = x.peopleCount ?? x.PeopleCount ?? x.peoplecount ?? 0;
    const recurrency = x.recurrency ?? x.Recurrency ?? 0;
    const differenceWithTypical = x.differenceWithTypical ?? x.DifferenceWithTypical ?? 0;

    return {
      ...x,
      location: locationForType,
      locationType: LocationType.ZONE,
      peopleCount,
      recurrency,
      differenceWithTypical,
    } as TaxiWithinTripsParamsData;
  });
};

export const fetchElectricityConsumptionTimeline = async (
  startDate: Date,
  endDate: Date,
  consumptor: Consumptor,
  fetchParam: LocationAndDateFetchArgs
) => {
  const url = '/electricityconsumption/timeline';

  const result = await getWithProgress<TimelineDataResponse>(axiosCachingInstance, url, {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    aggregationType: getCurrentAggregationType(startDate, endDate, true),
    customerClass: ConsumptorToResedentialOrCommercial(consumptor),
    location: fetchParam.location.location == 'AD ISLAND' ? 'Abu Dhabi Island' : fetchParam.location.location,
    locationType: fetchParam.location.locationType,
  });

  return prepareTimelineData(result);
};

export const fetchWaterConsumptionTimeline = async (
  startDate: Date,
  endDate: Date,
  consumptor: Consumptor,
  fetchParam: LocationAndDateFetchArgs
) => {
  const url = '/waterconsumption/timeline';

  const result = await getWithProgress<TimelineDataResponse>(axiosCachingInstance, url, {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    aggregationType: getCurrentAggregationType(startDate, endDate, true),
    customerClass: ConsumptorToResedentialOrCommercial(consumptor),
    location: fetchParam.location.location == 'AD ISLAND' ? 'Abu Dhabi Island' : fetchParam.location.location,
    locationType: fetchParam.location.locationType,
  });

  return prepareTimelineData(result);
};

export const fetchWaterConsumptionUtilizationTimeline = async (fetchParam: LocationAndDateRangeFetchArgs) => {
  const url = '/waterconsumption/timeline/utilization';

  const result = await getWithProgress<TimelineDataResponse>(axiosCachingInstance, url, {
    startDate: formatDate(fetchParam.startDate),
    endDate: formatDate(fetchParam.endDate),
    aggregationType: getCurrentAggregationType(fetchParam.startDate, fetchParam.endDate, true),
    location: fetchParam.location.location == 'AD ISLAND' ? 'Abu Dhabi Island' : fetchParam.location.location,
    locationType: fetchParam.location.locationType,
  });

  return prepareTimelineData(result);
};

export const fetchAccidentsParams = async (
  fetchParam: LocationAndDateRangeFetchArgs,
  timeSliceIndex: number
): Promise<AccidentData[]> => {
  const url = `/accidents/map`;

  const currentDateRange = getDateRangeByCurrentRangeAndIndex(fetchParam.startDate, fetchParam.endDate, timeSliceIndex);

  return await getWithProgress(axiosCachingInstance, url, {
    startDate: formatDateFullCSharp(currentDateRange.from),
    endDate: formatDateFullCSharp(currentDateRange.to),
    location: fetchParam.location.location == 'AD ISLAND' ? 'Abu Dhabi Island' : fetchParam.location.location,
    locationType: fetchParam.location.locationType,
  });
};

export const fetchAccidentsTooltip = async (id: number): Promise<AccidentTooltipData> => {
  const url = `/accidents/tooltip`;
  return await getWithProgress(axiosCachingInstance, url, {
    accidentId: id,
  });
};

const getSlideUrl = (slide: Slide) => {
  switch (slide) {
    case Slide.STUDENTS_COUNT:
    case Slide.STUDENTS_TRIPS_INBOUND:
    case Slide.STUDENTS_TRIPS_OUTBOUND:
    case Slide.STUDENTS_TRIPS_WITHIN:
      return 'studenttrips';
    case Slide.POPULATION_COUNT:
      return 'peoplecount';
    case Slide.POPULATION_MOVEMENT_INBOUND:
    case Slide.POPULATION_MOVEMENT_OUTBOUND:
    case Slide.POPULATION_MOVEMENT_WITHIN:
      return 'peoplemovement';
    case Slide.BUS_TRIPS_INBOUND:
    case Slide.BUS_TRIPS_OUTBOUND:
    case Slide.BUS_TRIPS_WITHIN:
      return 'bustrips';
    case Slide.BUS_LINE_UTILIZATION:
      return 'buslineutilization';
    case Slide.TAXI_TRIPS_INBOUND:
    case Slide.TAXI_TRIPS_OUTBOUND:
    case Slide.TAXI_TRIPS_WITHIN:
      return 'taxitrips';

    case Slide.MOBILITY_TRIPS_INBOUND:
    case Slide.MOBILITY_TRIPS_OUTBOUND:
      return 'trips';

    case Slide.LAND_USE_RESIDENTIAL:
      return 'residential';
    case Slide.LAND_USE_RETAIL:
      return 'retail';
    case Slide.LAND_USE_OFFICES:
      return 'offices';
    case Slide.LAND_USE_EDUCATION:
      return 'schools';
    case Slide.LAND_USE_INDUSTRY:
      return 'industrial';
    case Slide.LAND_USE_MEDICAL:
      return 'medical';
    case Slide.LAND_USE_HOSPITALITY:
      return 'hotels';
    case Slide.LAND_USE_OTHERS:
      return 'MosquesAndParks';

    case Slide.LAND_USE_PLANNED_OFFICIAL:
      return 'OfficialPlannedGrowth';
    case Slide.LAND_USE_PLANNED_DEVELOPER:
      return 'DeveloperPlannedGrowth';
    case Slide.LAND_USE_WATER_CONSUMPTION:
      return 'waterconsumption';
    case Slide.LAND_USE_ELECTRICITY_CONSUMPTION:
      return 'residential';

    case Slide.JUNCTIONS:
      return 'junctionlevelofservice';

    case Slide.ROAD_TRAFFIC:
      return 'roadtraffic';
    case Slide.ACCIDENTS:
      return 'accidents';
    default:
      throw new Error(`unknown url mapping for ${slide}`);
  }
};

export const fetchLandUsePlots = async (fetchParam: LandUseFetchArgs): Promise<LandUsePlotData[]> => {
  if ([Slide.LAND_USE_PLANNED_OFFICIAL, Slide.LAND_USE_PLANNED_DEVELOPER].indexOf(fetchParam.slide) != -1) {
    return [];
  }

  const url = `${getSlideUrl(fetchParam.slide)}/map/plot`;
  return await getWithProgress(axiosCachingInstance, url, {
    location: fetchParam.location.location == 'AD ISLAND' ? 'Abu Dhabi Island' : fetchParam.location.location,
    locationType: fetchParam.location.locationType,
  });
};

export const fetchTripsParams = async (fetchParam: PeopleMovementFetchArgs): Promise<PopulationMoveParamsData[]> => {
  const url = `${getSlideUrl(fetchParam.slide!)}${fetchParam.tripDirection}/map`;
  return await getWithProgress(axiosCachingInstance, url, {
    location: fetchParam.location.location == 'AD ISLAND' ? 'Abu Dhabi Island' : fetchParam.location.location,
    locationType: fetchParam.location.locationType,
    horizon: fetchParam.horizon,
  });
};

export const fetchLandUseZones = async (fetchParam: LandUseFetchArgsWithHorizon): Promise<LandUseZoneData[]> => {
  const url = `${getSlideUrl(fetchParam.slide)}/map/zone`;
  return await getWithProgress(axiosCachingInstance, url, {
    location: fetchParam.location.location == 'AD ISLAND' ? 'Abu Dhabi Island' : fetchParam.location.location,
    locationType: fetchParam.location.locationType,
    horizon: fetchParam.horizon,
  });
};

export const fetchMaritimeLocations = async (): Promise<MaritimeGeometryData[]> => {
  const url = `geometrydata/maritimelocations`;
  return await getWithProgress(axiosCachingInstance, url);
};

export const fetchMaritimeFacilitiesTimeline = async (startDate: Date, endDate: Date): Promise<TimelineData> => {
  const url = `/MaritimeFacilities/timeline`;

  const result = await getWithProgress<TimelineDataResponse>(axiosCachingInstance, url, {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    aggregationType: getCurrentAggregationType(startDate, endDate, true),
  });

  return prepareTimelineData(result);
};

export const fetchMaritimeTripsTimeline = async (startDate: Date, endDate: Date): Promise<TimelineData> => {
  const url = `/MaritimeTrips/timeline`;

  const result = await getWithProgress<TimelineDataResponse>(axiosCachingInstance, url, {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    aggregationType: getCurrentAggregationType(startDate, endDate, true),
  });

  return prepareTimelineData(result);
};

export const fetchMaritimeFacilitiesParams = async (
  fetchParam: LocationAndDateRangeFetchArgs,
  timeSliceIndex: number
): Promise<MaritimeFacilitiesDataType[]> => {
  const currentDateRange = getDateRangeByCurrentRangeAndIndex(fetchParam.startDate, fetchParam.endDate, timeSliceIndex);

  const url: string = `MaritimeFacilities/map`;
  return getWithProgress(axiosCachingInstance, url, {
    startDate: formatDateFullCSharp(currentDateRange.from),
    endDate: formatDateFullCSharp(currentDateRange.to),
  });
};

export const fetchMaritimeTripsParams = async (
  fetchParam: MaritimeTripsFetchArgs,
  timeSliceIndex: number
): Promise<MaritimeFacilitiesDataType[]> => {
  const type = (() => {
    switch (fetchParam.dataType) {
      case DataType.VEHICLES_TRIPS:
        return 'vehicletrips';
      case DataType.PASSENGER_TRIPS:
        return 'passengertrips';
      default:
        throw new Error(`unknown url mapping for ${fetchParam.dataType}`);
    }
  })();

  const currentDateRange = getDateRangeByCurrentRangeAndIndex(fetchParam.startDate, fetchParam.endDate, timeSliceIndex);

  const url: string = `Maritimetrips/map/${type}`;
  return getWithProgress(axiosCachingInstance, url, {
    startDate: formatDateFullCSharp(currentDateRange.from),
    endDate: formatDateFullCSharp(currentDateRange.to),
  });
};

export const fetchTimelineWithDateAndLocation = async (fetchParam: PeopleMovementFetchArgs): Promise<TimelineData> => {
  const slideUrl = getSlideUrl(fetchParam.slide!);
  const url = `/${slideUrl}${fetchParam.tripDirection ?? ''}/timeline`;

  const currentAggregationType = getCurrentAggregationType(fetchParam.startDate, fetchParam.endDate);

  const isAggregatedByMinutes =
    currentAggregationType === MapDataAggregationType.AVERAGE_DAY ||
    currentAggregationType === MapDataAggregationType.TYPICAL_DAY;

  const startTimeStamp = startOfDay(fetchParam.startDate);
  const endTimeStamp = endOfDay(fetchParam.endDate);

  const result = await getWithProgress<TimelineDataResponse>(axiosCachingInstance, url, {
    startDate: isAggregatedByMinutes ? formatDateFullCSharp(startTimeStamp) : formatDate(fetchParam.startDate),
    endDate: isAggregatedByMinutes ? formatDateFullCSharp(endTimeStamp) : formatDate(fetchParam.endDate),
    aggregationType: currentAggregationType,
    location: fetchParam.location.location == 'AD ISLAND' ? 'Abu Dhabi Island' : fetchParam.location.location,
    locationType: fetchParam.location.locationType,
  });

  return prepareTimelineData(result);
};

export const fetchStudentCountParams = async (
  fetchParam: StudentCountFetchArgs,
  _timeSliceIndex: number
): Promise<StudentsdataType[]> => {
  const type = (() => {
    switch (mapDataValuesStoreInstance.dataType) {
      case DataType.STUDENT_DENSITY:
        return 'density';
      case DataType.STUDENT_PLACES:
        return 'places';
      default:
        throw new Error(`unknown url mapping for ${fetchParam.dataType}`);
    }
  })();

  const payload = (() => {
    switch (mapDataValuesStoreInstance.dataType) {
      case DataType.STUDENT_DENSITY:
        return {
          location: fetchParam.location.location,
          locationType: fetchParam.location.locationType,
          startDate: formatDateFullCSharp(fetchParam.startDate),
          endDate: formatDateFullCSharp(endOfDay(fetchParam.endDate)),
        };
      case DataType.STUDENT_PLACES:
        return {
          location: fetchParam.location.location,
          locationType: fetchParam.location.locationType,
          horizon: fetchParam.horizon,
        };
      default:
        throw new Error(`unknown url mapping for ${fetchParam.dataType}`);
    }
  })();

  const url: string = `studentcount/map/${type}`;
  const result = await getWithProgress<any[]>(axiosCachingInstance, url, payload);

  return result;
};

export const fetchStudentTripsWithinParams = async (
  fetchParam: StudentCountFetchArgs,
  timeSliceIndex: number
): Promise<StudentsdataType[]> => {
  const currentDateRange = getDateRangeByCurrentRangeAndIndex(fetchParam.startDate, fetchParam.endDate, timeSliceIndex);

  const aggregationType = getCurrentAggregationType(fetchParam.startDate, fetchParam.endDate);

  const type = (() => {
    switch (mapDataValuesStoreInstance.dataType) {
      case DataType.STUDENT_RESIDENCES:
        return 'studentResidences';
      case DataType.STUDENT_LOCATIONS:
        return 'schoollocations';
      default:
        throw new Error(`unknown url mapping for ${fetchParam.dataType}`);
    }
  })();

  const url: string = `studenttripswithin/map/${type}`;

  const result = await getWithProgress<any[]>(axiosCachingInstance, url, {
    location: fetchParam.location.location,
    locationType: fetchParam.location.locationType,
    startDate: formatDateFullCSharp(currentDateRange.from),
    endDate: formatDateFullCSharp(currentDateRange.to),
    aggregationType: aggregationType,
  });

  return result;
};

export const fetchPopulationMovementParams = async (
  fetchParam: PeopleMovementFetchArgs,
  timeSliceIndex: number
): Promise<PopulationMoveParamsData[]> => {
  const aggregationTimeType = (() => {
    if (fetchParam.slide === Slide.STUDENTS_TRIPS_INBOUND || fetchParam.slide === Slide.STUDENTS_TRIPS_OUTBOUND) {
      return MapDataAggregationTimeType.MINUTES;
    }
    return MapDataAggregationTimeType.HOURS;
  })();

  const currentDateRange = getDateRangeByCurrentRangeAndIndex(
    fetchParam.startDate,
    fetchParam.endDate,
    timeSliceIndex,
    false,
    aggregationTimeType
  );

  const aggregationType = getCurrentAggregationType(fetchParam.startDate, fetchParam.endDate);

  const url =
    fetchParam.tripDirection != 'within'
      ? `${getSlideUrl(fetchParam.slide!)}${fetchParam.tripDirection}/map`
      : `${getSlideUrl(fetchParam.slide!)}${fetchParam.tripDirection}/map/${fetchParam.withinType}`;

  const result = await getWithProgress<PopulationMoveParamsData[]>(axiosCachingInstance, url, {
    startDate: formatDateFullCSharp(currentDateRange.from),
    endDate: formatDateFullCSharp(currentDateRange.to),
    location: fetchParam.location.location,
    locationType: fetchParam.location.locationType,
    aggregationType: aggregationType,
  });

  for (const obj of result) {
    obj.from = obj.from == 'AD ISLAND' ? 'Abu Dhabi Island' : obj.from;
    obj.to = obj.to == 'AD ISLAND' ? 'Abu Dhabi Island' : obj.to;
  }

  return result;
};

export const fetchAllLocationsByType = async (type: LocationType, slide?: Slide): Promise<LocationWithGeometry[]> => {
  let url: string;

  url =
    type == LocationType.ALL_LOCATIONS
      ? `geometrydata/speciallocations`
      : type == LocationType.SPECIAL_DISTRICT
        ? `geometrydata/districts`
        : `geometrydata/${type}s`;

  if (type === LocationType.ZONE && slide && populationMovementSlides.includes(slide)) {
    url = `geometrydata/populationMovementZones`;
  }

  const result = await getWithProgress<LocationWithGeometry[]>(axiosCachingInstance, url);

  return result;
};

const axiosCachingMockDataInstance = setupCache(axios.create({}));

axiosCachingMockDataInstance.interceptors.response.use((response) => {
  return response;
});

axiosCachingMockDataInstance.interceptors.response.use((response) => {
  response.data = objectKeysToLowerCase(response.data);
  return response;
});

const getCorrectedLocationName = (name: string) => {
  switch (name) {
    case 'Russian Federation': {
      return 'Russia';
    }

    case 'United States of America': {
      return 'United States';
    }

    case 'U.K. of Great Britain and Northern Ireland': {
      return 'United Kingdom';
    }

    default: {
      return name;
    }
  }
};

export const fetchCountriesGeometry = async (): Promise<LocationWithGeometry[]> => {
  const url: string = `${s3bucket}/map/world-administrative-boundaries.json`;
  const featureCollection = await getWithProgress<any>(axiosCachingMockDataInstance, url);
  return featureCollection.map((x: any) => {
    return {
      location: getCorrectedLocationName(x.name),
      boundingBox: [0, 0, 0, 0],
      center: [x.geo_point_2d.lon, x.geo_point_2d.lat],
      locationType: LocationType.ZONE,
      area: 0,
      geometry:
        x.geo_shape.geometry.type === 'Polygon'
          ? [
              {
                shape: x.geo_shape.geometry.coordinates[0].flat(),
                holes: [],
              },
            ]
          : x.geo_shape.geometry.coordinates.map((poly: any) => {
              return {
                shape: poly[0].flat(),
                holes: [],
              };
            }),
    };
  });
};

export const fetchJunctions = async (fetchParam: LocationFetchArgs): Promise<JunctionData[]> => {
  const url: string = `geometrydata/junctions`;
  const junctionsRawData = await getWithProgress<{ id: string; geometry: [number, number] }[]>(
    axiosCachingInstance,
    url,
    {
      location: fetchParam.location.location == 'AD ISLAND' ? 'Abu Dhabi Island' : fetchParam.location.location,
      locationType: fetchParam.location.locationType,
    }
  );

  const junctionsData = junctionsRawData.map((item) => new JunctionData(item.id, item.geometry));

  return junctionsData;
};

export const fetchBuildingsList = async (): Promise<IBuilding[]> => {
  const url = `${s3bucket}/map/buildings.json`;
  return await getWithProgress(axiosCachingMockDataInstance, url);
};

export const fetchTimeInterval = async (
  story: string,
  location: ILocation,
  selectedDate: string
): Promise<DataForTimeInterval> => {
  const url: string = `${s3bucket}/stories/${story}/timeIntervals/${location.location}_${selectedDate.padStart(2, '0')}.json`;

  return await getWithProgress(axiosCachingMockDataInstance, url);
};
