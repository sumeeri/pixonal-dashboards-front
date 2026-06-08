import * as S from './ExploreDataRingChart.styles';

interface IDataItem {
  value: number;
  label: string;
}

interface IProps {
  data: IDataItem[];
  generalData: IDataItem;
  width?: number;
  zoom?: number;
}

const BASE_RADIUS = 40;

const PROGRESS_WIDTH = 14;

const BORDER_WIDTH = 0.5;

const START_ANGLE = 0.01 * Math.PI - Math.PI / 2;

const COLORS = ['rgba(0, 131, 120, 1)', 'rgba(0, 88, 80, 1)', 'rgba(51, 172, 161, 1)', 'rgb(41, 214, 200)'];

function ExploreDataRingChart(props: IProps) {
  const { data, generalData, width = 500, zoom = 1 } = props;

  const ROUND_CENTER = 95 / zoom;

  const sortedData = [...data].sort((a, b) => b.value - a.value);

  const isOnlyValue = data.length === 1;

  return (
    <>
      <div style={{ width: width, height: width, margin: 'auto auto' }}>
        <svg viewBox={`0 0 ${ROUND_CENTER * 2} ${ROUND_CENTER * 2}`} xmlns="http://www.w3.org/2000/svg">
          <g>
            <circle
              cx={ROUND_CENTER}
              cy={ROUND_CENTER}
              r={BASE_RADIUS}
              stroke="rgba(0, 0, 0, 0.4)"
              strokeWidth={PROGRESS_WIDTH}
              fill="none"
            />

            <circle
              cx={ROUND_CENTER}
              cy={ROUND_CENTER}
              r={BASE_RADIUS - 7}
              stroke="rgba(157, 163, 220, 0.2)"
              strokeWidth={BORDER_WIDTH}
              fill="none"
            />

            <circle
              cx={ROUND_CENTER}
              cy={ROUND_CENTER}
              r={BASE_RADIUS + 7}
              stroke="rgba(157, 163, 220, 0.2)"
              strokeWidth={BORDER_WIDTH}
              fill="none"
            />

            <foreignObject x={ROUND_CENTER - 31} y={ROUND_CENTER - 31} width="62" height="62">
              <S.CenterContentWrapper>
                {isOnlyValue ? (
                  <>
                    <S.CenterContentTopLabel>{data[0].label}</S.CenterContentTopLabel>

                    <S.CenterContentTopValue>{data[0].value.toLocaleString('en-US')}</S.CenterContentTopValue>

                    <S.CenterContentDivider />

                    <S.CenterContentBottomLabel>{generalData.label}</S.CenterContentBottomLabel>

                    <S.CenterContentBottomValue>{generalData.value.toLocaleString('en-US')}</S.CenterContentBottomValue>
                  </>
                ) : (
                  <>
                    <S.CenterContentOnlyLabel>{generalData.label}</S.CenterContentOnlyLabel>

                    <S.CenterContentOnlyValue>{generalData.value.toLocaleString('en-US')}</S.CenterContentOnlyValue>
                  </>
                )}
              </S.CenterContentWrapper>
            </foreignObject>

            {isOnlyValue && (
              <path
                d={`M ${ROUND_CENTER - 25},${ROUND_CENTER + 1} ${ROUND_CENTER + 25},${ROUND_CENTER + 1}`}
                fill="none"
                strokeWidth={BORDER_WIDTH}
                stroke={'rgba(255, 255, 255, 0.2)'}
              />
            )}
          </g>

          {sortedData?.map((item, index) => {
            const percentValue = item.value < generalData.value ? item.value / generalData.value : 1;

            const angle = percentValue * 2 * Math.PI - Math.PI / 2;

            const startX = ROUND_CENTER + BASE_RADIUS * Math.cos(START_ANGLE);

            const startY = ROUND_CENTER + BASE_RADIUS * Math.sin(START_ANGLE);

            const endX = ROUND_CENTER + BASE_RADIUS * Math.cos(angle);

            const endY = ROUND_CENTER + BASE_RADIUS * Math.sin(angle);

            const currentColor = COLORS[index];

            const bottomDelta = 15;

            const rightDelta = 16;

            const topDelta = isOnlyValue ? -16 : -34;

            const leftDelta = isOnlyValue ? -37 : -40;

            const onlyValueXDelta = percentValue < 0.5 ? rightDelta : leftDelta;

            const labelX = endX + onlyValueXDelta;

            const onlyValueYDelta = percentValue < 0.25 || percentValue > 0.75 ? topDelta : bottomDelta;

            const labelY = endY + onlyValueYDelta;

            return (
              <g key={`${item.value}-${currentColor}`}>
                <circle cx={startX} cy={startY} r={PROGRESS_WIDTH / 2} fill={currentColor} />

                <path
                  d={`M ${startX},${startY} A ${BASE_RADIUS},${BASE_RADIUS} 0 ${angle > Math.PI / 2 ? 1 : 0},1 ${endX},${endY}`}
                  fill="none"
                  strokeWidth={PROGRESS_WIDTH}
                  stroke={currentColor}
                />

                <circle cx={endX} cy={endY} r={PROGRESS_WIDTH / 2} fill={currentColor} />

                <circle cx={endX} cy={endY} r={PROGRESS_WIDTH / 3} fill="rgba(255, 255, 255, 1)" />

                <g>
                  <foreignObject x={labelX} y={labelY} width="35" height="30">
                    <S.ItemContentWrapper>
                      {!isOnlyValue && <S.ItemLabel>{item.label}</S.ItemLabel>}

                      <S.ItemValue>{(percentValue * 100).toFixed(0)}%</S.ItemValue>
                    </S.ItemContentWrapper>
                  </foreignObject>
                </g>
              </g>
            );
          })}
        </svg>
      </div>
    </>
  );
}

export default ExploreDataRingChart;
