import { CircularProgress, useTheme } from '@mui/material';
import { chartsTooltipClasses, LineChartProps } from '@mui/x-charts';
import { isSameMinute, parse, startOfHour } from 'date-fns';
import { observer } from 'mobx-react-lite';
import numeral from 'numeral';
import { useCallback, useEffect, useRef, useState } from 'react';
import { aggregateTimePoints } from 'shared/utils/aggregateTimePoints.ts';
import { convertTo12HourFormat } from 'shared/utils/convertTo12HourFormat.ts';
import { convertToDateFormat } from 'shared/utils/convertToDateFormat';
import { chartColors } from 'shared/utils/getChartInfoBySlide.ts';

import { useStore } from '../../app/providers/storeProvider/StoreProvider';
import contentLoadStoreInstance from '../../app/stores/contentLoadStore';
import infoPopupStoreInstance from '../../app/stores/infoPopupStore';
import { DataForTimeInterval, ITimePointsData, TimelineXDataType } from '../../entities/dashboard/types';
import { AnimationSlider, CustomSliderThumb } from './components';
import * as S from './CustomLineChart.styles';

const PADDING_X = 70;

const HOURS_MIN_STAMPCOUNT = 32;
const DAYS_MIN_STAMPCOUNT = 10;

const STEP_FOR_HOURS = 8;
const STEP_FOR_DAYS = 3;

interface IProps {
  timePointsData: DataForTimeInterval;
  step: number;
  height?: number;
}

const CustomLineChart = observer((props: IProps) => {
  const { height, timePointsData, step } = props;

  const { timeIntervalsStore, current3DStore, contentLoadStore } = useStore();
  const { sliderValue, activeIndex } = timeIntervalsStore;
  const { isTimelineDataLoading, isSelectedTimePointLoading } = contentLoadStore;
  const [localSliderValue, setLocalSliderValue] = useState<number>(sliderValue);

  const theme = useTheme();

  const chartRef = useRef(null);

  useEffect(() => {
    setLocalSliderValue(sliderValue);
  }, [sliderValue]);

  const aggregatedTimePointsData = aggregateTimePoints(timePointsData);

  const getTimepointsStep = (countOfTimepointStamp: number) => {
    if (countOfTimepointStamp > HOURS_MIN_STAMPCOUNT) {
      return STEP_FOR_HOURS;
    }
    if (countOfTimepointStamp > DAYS_MIN_STAMPCOUNT) {
      return STEP_FOR_DAYS;
    }
    return 1;
  };

  const getSeriesData = useCallback(
    (timePointsData: ITimePointsData) => {
      return {
        xAxis: [
          {
            data: timePointsData.timestamps?.map((_, index: number) => {
              return index;
            }),
            valueFormatter: (index: number) => {
              if (!timePointsData.timestamps?.[index]) {
                return '';
              }

              if (timePointsData.xDataType === TimelineXDataType.Date) {
                return convertToDateFormat(timePointsData.timestamps[index]);
              }

              return timePointsData.xDataType === TimelineXDataType.Time
                ? convertTo12HourFormat(timePointsData.timestamps[index] ?? '00:00')
                : timePointsData.timestamps[index];
            },
            scaleType: 'point',
            tickInterval: (index: number) => {
              const timepointsStampsCount = timePointsData.timestamps.length;
              const timepointsStep = getTimepointsStep(timepointsStampsCount);

              if (index % timepointsStep !== 0) {
                return false;
              }

              const currentTimeStamp = timePointsData.timestamps[index];

              const currentDate = new Date();
              const parsedDate = parse(currentTimeStamp, 'HH:mm', currentDate);

              const parsedStartOfHour = startOfHour(parsedDate);

              const isTimeType = timePointsData.xDataType === TimelineXDataType.Time;

              if (usedTimeStamp === currentTimeStamp) {
                return false;
              }

              if (isTimeType && !isSameMinute(parsedDate, parsedStartOfHour)) {
                return false;
              }

              usedTimeStamp = currentTimeStamp;
              return true;
            },
            max: (timePointsData.timestamps?.length ?? 1) - 1,
          },
        ] as LineChartProps['xAxis'],
        yAxis: timePointsData.pointValues?.map((_, index) => ({
          id: index.toString(),
          scaleType: 'linear',
        })) as LineChartProps['yAxis'],
        series: timePointsData.pointValues?.map((item, index) => {
          const isOnlyElement = item.values.length === 1;

          return {
            series: item.values,
            data: item.values,
            color: chartColors[index],
            showMark: isOnlyElement,
            label: item.axisName,
            connectNulls: true,
            yAxisId: index.toString(),
          };
        }) as LineChartProps['series'],
      };
    },
    [theme, aggregatedTimePointsData.timestamps]
  );

  const changeSliderPosition = (_event: Event, value: number | number[]) => {
    if (timeIntervalsStore.isAnimationPlaying) {
      timeIntervalsStore.handleStop();
    }
    const newIndex = value as number;
    setLocalSliderValue(newIndex);

    infoPopupStoreInstance.isShown = false;
  };

  const setSliderValueToStore = async (value: number = localSliderValue) => {
    current3DStore.stopPreloadData();

    contentLoadStoreInstance.setIsSelectedTimePointLoading(true);

    timeIntervalsStore.setActiveIndex(Math.floor(value));
    timeIntervalsStore.setSliderValue(value);

    await current3DStore.fetchParams(Math.floor(value), Math.ceil(value));

    current3DStore.startPreloadData(Math.floor(value), timePointsData.xData.length);

    contentLoadStoreInstance.setIsSelectedTimePointLoading(false);
  };

  const handleChangeCommitted = () => {
    setSliderValueToStore();
  };

  let usedTimeStamp = '';

  const chartClickHandler = (event: Event, value: any) => {
    if (aggregatedTimePointsData.timestamps.length < 2) {
      return;
    }

    changeSliderPosition(event, value?.dataIndex ?? 0);
    setSliderValueToStore(value?.dataIndex ?? 0);
  };

  const isChartDataLoading = isSelectedTimePointLoading || isTimelineDataLoading;

  const lineChartData = getSeriesData(aggregatedTimePointsData);

  return (
    <S.ChartBlockWrapper disabled={isChartDataLoading}>
      <S.BottomBlock>
        {timePointsData.columns?.map((column, index) => {
          const unit = timePointsData.units?.[index];
          return (
            <S.Fragment key={column}>
              <S.ColorIndicator style={{ background: `${chartColors[index]}` }} />
              <S.ValueWrapper>
                {column}
                <S.ValueRow>
                  <div>{numeral(Math.round(timePointsData.values.at(activeIndex)?.at(index) ?? 0)).format('0,0')}</div>
                  {unit && <S.ValueUnit>{unit}</S.ValueUnit>}
                </S.ValueRow>
              </S.ValueWrapper>
            </S.Fragment>
          );
        })}
      </S.BottomBlock>

      <S.LineChartWrapper>
        <S.StyledLineChart
          {...lineChartData}
          ref={chartRef}
          height={height}
          series={lineChartData.series?.map((series) => ({
            ...series,
            showMark: true,
            valueFormatter: (v) => `${v?.toFixed()}`,
          }))}
          margin={{ top: 0, left: PADDING_X, right: PADDING_X, bottom: 60 }}
          onAxisClick={chartClickHandler}
          slotProps={{
            legend: { hidden: true },
            popper: {
              placement: 'right',
              sx: {
                [`&.${chartsTooltipClasses.root} .${chartsTooltipClasses.paper}`]: {
                  backgroundColor: 'rgba(30, 33, 58, 0.9)',
                  borderRadius: '20px',
                  border: '1px solid #3A3E5B',
                  padding: '5px 6px',
                  color: 'white',
                },
              },
            },
            axisTickLabel: { style: { fontSize: '18px' } },
          }}
          skipAnimation
        />

        <AnimationSlider
          onChangeCommitted={handleChangeCommitted}
          slots={{ thumb: CustomSliderThumb }}
          style={{
            width: `calc(100% - ${PADDING_X * 2}px)`,
            left: `${PADDING_X}px`,
            bottom: '44px',
            zIndex: 1,
          }}
          min={0}
          max={timePointsData.xData?.length - 1}
          value={localSliderValue}
          onChange={changeSliderPosition}
          step={step}
        />
      </S.LineChartWrapper>

      {isChartDataLoading && (
        <S.LoaderWrapper>
          <CircularProgress sx={{ color: '#9DA3DC' }} />
        </S.LoaderWrapper>
      )}
    </S.ChartBlockWrapper>
  );
});

export default CustomLineChart;
