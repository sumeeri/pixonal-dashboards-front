import { Box, CircularProgress } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { ReactNode } from 'react';

import chartsStore from '../../app/stores/chartsStore';
import locationPanelStoreInstance from '../../app/stores/locationPanelStore';
import { ChartOption, Charts } from '../../entities/charts/types';
import { Slide } from '../../entities/dashboard/types';
import { LocationType } from '../../entities/locationPanel/types';
import { ExploreDataBarChart } from '../../features/exploreDataCharts/exploreDataBarChart/ExploreDataBarChart';
import { ExploreDataPieChart } from '../../features/exploreDataCharts/exploreDataPieChart/ExploreDataPieChart';
import { ExploreDataProgressChart } from '../../features/exploreDataCharts/exploreDataProgressChart/ExploreDataProgressChart';
import ExploreDataRingChart from '../../features/exploreDataCharts/exploreDataRingChart/ExploreDataRingChart';
import { ExploreDataTable } from '../../features/exploreDataCharts/exploreDataTable/ExploreDataTable';
import { ExploreDataValue } from '../../features/exploreDataCharts/exploreDataValue/ExploreDataValue';
import { COUNTRY_CODES, ZONES_BY_ID } from '../../shared/constants/lookups';
import style from './ExploreDataChart.module.scss';

type WrapperProps = {
  id: string;
  name?: string;
  children: ReactNode;
  isOverview?: boolean;
  type?: ChartOption['type'];
};

const Wrapper = ({ id, name, children, isOverview, type }: WrapperProps) => {
  if (isOverview)
    return (
      <div className={style.chartOverviewWrapper} style={{ zoom: type === 'pie' ? 430 / 368 : 1 }}>
        {children}
      </div>
    );

  return (
    <div key={id} className={style.chartWrapper}>
      {name && (
        <div className={style.chartHeader}>
          <span className={style.chartHeaderText}>{name}</span>
        </div>
      )}
      {children}
    </div>
  );
};

const mapCountryCodeToName = (countryCode: string | undefined): string => {
  if (!countryCode) return '';

  // Check if it's already a full country name by searching in values
  const isFullName = Object.values(COUNTRY_CODES).includes(countryCode);
  if (isFullName) return countryCode;

  // Try to map country code to full name
  const upperCaseCode = countryCode.toUpperCase();
  return COUNTRY_CODES[upperCaseCode] || countryCode;
};

const mapZoneIdToName = (zoneId: string | undefined): string => {
  if (!zoneId) return '';

  // Check if it's already a zone name by searching in values
  const isFullName = Object.values(ZONES_BY_ID).includes(zoneId);
  if (isFullName) return zoneId;

  // Try to map zone ID to zone name
  const zoneIdNumber = parseInt(zoneId, 10);
  if (isNaN(zoneIdNumber)) return zoneId;

  const zoneName = ZONES_BY_ID[zoneIdNumber];
  // If zone name exists, return "ID - Name", otherwise return just the ID
  if (zoneName) {
    return `${zoneIdNumber} - ${zoneName}`;
  }

  // Return just the zone ID (as string) if no name found
  return String(zoneIdNumber);
};

const ZONE_LOCATION_CHART_IDS = [
  'toporiginsbylocations',
  'top5destinationslocations',
  'topOriginsRidership',
  'topDestinationsRidership',
];

function formatValueChartDisplay(value: number | string, fractionDigits: number): number | string {
  const n = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(n)) return value;
  const factor = 10 ** fractionDigits;
  return Math.round(n * factor) / factor;
}

export const ExploreDataChart = observer(
  ({
    type,
    id,
    name,
    slide,
    scale,
    isOverview = false,
    ...rest
  }: ChartOption & {
    slide: Slide;
    scale?: number;
    isOverview?: boolean;
  }) => {
    const getCurrentRawData = (dataKey: keyof Charts) => {
      return chartsStore.getChartsData(slide)?.[dataKey];
    };

    const isEmptyData = (data: Charts) => {
      return Array.isArray(data) && data.every((it) => it.value === 0);
    };

    const getCurrentData = (exploreDataKey: string) => {
      const rawData = getCurrentRawData(exploreDataKey);

      if (!rawData) return null;

      if (isEmptyData(rawData)) return [];
      const currentDataType = type;
      const isNationalityChart = exploreDataKey === 'nationality';

      if (currentDataType === 'pie' && Array.isArray(rawData)) {
        return rawData
          .map((it) => {
            const countryName = isNationalityChart ? mapCountryCodeToName(it.type) : it.type;
            return {
              id: isNationalityChart ? countryName.toUpperCase() : it.type?.toUpperCase(),
              value: it.value,
              label: countryName ?? '',
            };
          })
          .sort((a, b) => b.value - a.value);
      }

      if (currentDataType === 'ring' && Array.isArray(rawData)) {
        return rawData.map((it) => ({ id: it.type?.toUpperCase(), value: it.value, label: it.type ?? '' }));
      }

      if (currentDataType === 'bar' && Array.isArray(rawData)) {
        return rawData
          .map((it) => ({ id: it.type?.toUpperCase(), value: it.value, label: it.type ?? '' }))
          .sort((a, b) => b.value - a.value);
      }

      if (currentDataType === 'progress' && Array.isArray(rawData)) {
        return rawData
          .map((it) => ({ id: it.type?.toUpperCase(), value: it.value, label: it.type ?? '' }))
          .sort((a, b) => b.value - a.value);
      }

      if (currentDataType === 'table' && Array.isArray(rawData)) {
        const isZoneLocationChart = ZONE_LOCATION_CHART_IDS.includes(id);
        return rawData
          .map((it) => {
            const zoneName = isZoneLocationChart ? mapZoneIdToName(it.type) : it.type;
            return { id: zoneName?.toUpperCase(), value: it.value, label: zoneName ?? '' };
          })
          .sort((a, b) => b.value - a.value);
      }

      if (currentDataType === 'list' && Array.isArray(rawData)) {
        return rawData.map((it) => ({ id: it.value?.toUpperCase(), value: undefined, label: it.value ?? '' }));
      }

      if (currentDataType === 'value' && !Array.isArray(rawData)) {
        return rawData;
      }

      if (currentDataType === 'persquare' && !Array.isArray(rawData)) {
        return rawData;
      }

      if (currentDataType === 'percent' && !Array.isArray(rawData)) {
        return rawData;
      }

      return null;
    };

    const formattedData = getCurrentData(id);

    const isPieChartType = type === 'pie' && Array.isArray(formattedData);
    const isRingChartType = type === 'ring' && Array.isArray(formattedData);
    const isBarChartType = type === 'bar' && Array.isArray(formattedData);
    const isProgressChartType = type === 'progress' && Array.isArray(formattedData);
    const isTableType = type === 'table' && Array.isArray(formattedData);
    const isListType = type === 'list' && Array.isArray(formattedData);
    const isValueType = type === 'value' && !!formattedData;
    const isPerSquareValueType = type === 'persquare' && !!formattedData;
    const isPercentValueType = type === 'percent' && !!formattedData;

    // @ts-expect-error it does, when it needs to
    const { keyLabel, valueLabel, maxValue, unit, label, columnSize, valuePostfix, valueDecimals } = rest;

    const isLoading = chartsStore.isFetching && formattedData === null;
    const isMissingData = !formattedData || formattedData.length == 0;

    const messageNoData =
      locationPanelStoreInstance.currentLocationType === LocationType.CORRIDOR ? 'NO DATA FOR CORRIDORS' : 'NO DATA';

    const messageInChart = formattedData ? 'EMPTY SET' : messageNoData;

    return (
      <Wrapper id={id} name={name} isOverview={isOverview} type={type}>
        {isLoading || isMissingData ? (
          <Box
            data-id="fallback"
            sx={{
              padding: '16px',
              height: '368px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isLoading ? <CircularProgress size={64} sx={{ color: '#9da3dc80' }} /> : messageInChart}
          </Box>
        ) : (
          <>
            {isPieChartType && <ExploreDataPieChart key={id} data={formattedData} />}
            {isRingChartType && (
              <ExploreDataRingChart
                key={id}
                generalData={formattedData[0]}
                data={formattedData.filter((_, index) => index !== 0)}
                width={368}
                zoom={formattedData.length > 2 ? 1 : 1.2}
              />
            )}
            {isBarChartType && (
              <ExploreDataBarChart
                key={id}
                data={formattedData}
                maxValue={maxValue}
                unit={unit}
                columnSize={columnSize}
              />
            )}
            {isProgressChartType && <ExploreDataProgressChart key={id} data={formattedData} />}
            {(isTableType || isListType) && (
              <ExploreDataTable key={id} data={formattedData} keyLabel={keyLabel} valueLabel={valueLabel} />
            )}
            {isValueType && (
              <ExploreDataValue
                key={id}
                value={
                  valueDecimals !== undefined
                    ? formatValueChartDisplay(Object.values(formattedData)[0], valueDecimals)
                    : Object.values(formattedData)[0]
                }
                label={label}
                valuePostfix={valuePostfix}
              />
            )}
            {isPerSquareValueType && (
              <ExploreDataValue
                key={id}
                value={(Object.values(formattedData)[0] / locationPanelStoreInstance.currentLocation.area).toFixed(0)}
                label={label}
                valuePostfix={valuePostfix}
              />
            )}

            {isPercentValueType && (
              <ExploreDataValue
                key={id}
                value={Object.values(formattedData)[0] * 100}
                label={label}
                valuePostfix={valuePostfix}
              />
            )}
          </>
        )}
      </Wrapper>
    );
  }
);
