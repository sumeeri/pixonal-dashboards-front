import { Box } from '@mui/material';
import { PieChart } from '@mui/x-charts';
import { useCallback, useMemo, useState } from 'react';

import style from './ExploreDataPieChart.module.scss';

const TOTAL_OFFSET_Y = 8;

const getPieChartGradient = () => {
  return ['#64C0B5', '#33ACA1', '#00988C', '#008378', '#006D64', '#005850', '#00433D'];
};

type PieChartData = { id: string; value: number; label: string };
type PieChartNormalizedData = { id: string; value: number; label: string; labelValue: number };

function normalizeData(data: PieChartData[]): PieChartNormalizedData[] {
  const totalValue = data.reduce((sum, { value }) => sum + value, 0);
  const scaledValues = data.map(({ value }) => Math.round((value / totalValue) * 100));

  let diff = 100 - scaledValues.reduce((sum, v) => sum + v, 0);

  const chartValues = scaledValues.map((v) => Math.max(v, 5));
  diff = 100 - chartValues.reduce((sum, v) => sum + v, 0);

  for (let i = 0; diff !== 0 && i < chartValues.length; i++) {
    if (diff > 0 && chartValues[i] > 5) {
      chartValues[i]++;
      diff--;
    } else if (diff < 0 && chartValues[i] > 5) {
      chartValues[i]--;
      diff++;
    }
  }

  return data.map((item, i) => ({ ...item, labelValue: scaledValues[i], value: chartValues[i] }));
}

type Props = {
  data: PieChartData[];
};

export const ExploreDataPieChart = ({ data }: Props) => {
  const recalculatedData = useMemo(() => normalizeData(data), [data]);

  const pieChartRef = useCallback(
    (node: HTMLElement) => {
      if (!node) {
        return;
      }

      const textElements = node.querySelectorAll('text');

      textElements.forEach((element) => {
        const [label, value] = element.innerHTML.split('|||');

        if (!(label || value)) return;

        const labelNode = label
          ? label
              .split(' ')
              .reverse()
              .map((it, index) => {
                const offset = -16 * index + TOTAL_OFFSET_Y;
                const word = it.charAt(0).toUpperCase() + it.slice(1);
                return `<tspan x="0" y="0" dy="${offset}" text-anchor="start">
                          ${word}
                        </tspan>`;
              })
              .join('')
          : '';

        const valueNode = value
          ? `<tspan x="0" y="0" dy="36px" text-anchor="start">
          ${value}%
        </tspan>`
          : '';

        element.innerHTML = `${labelNode} ${valueNode}`;

        const maxWidth = Math.max(...[...element.children].map((elem) => elem.getBoundingClientRect().width));
        const maxHeight = Math.max(...[...element.children].map((elem) => elem.getBoundingClientRect().height));

        const xOffset = maxWidth / 2;
        const yOffset = maxHeight / 2;

        [...element.children].forEach((elem) => {
          if (elem) {
            elem.setAttribute('x', `-${xOffset}`);
            elem.setAttribute('y', `-${yOffset}`);
          }
        });
      });
    },
    [recalculatedData]
  );

  const [centerLabel, setCenterLabel] = useState<PieChartNormalizedData | null>(null);

  return (
    <Box
      className={style.wrapper}
      sx={{
        position: 'relative',
        width: '368px',
        height: '368px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {centerLabel ? (
        <div className={style.centerLabel}>
          <span>{centerLabel.label}</span>
          <span>{centerLabel.labelValue > 0 ? centerLabel.labelValue : '<1'}%</span>
        </div>
      ) : null}
      <PieChart
        ref={pieChartRef}
        sx={{ '.MuiPieArc-root': { stroke: 'none' } }}
        colors={getPieChartGradient()}
        onHighlightChange={(item) => {
          if (item && item.dataIndex != null && recalculatedData[item.dataIndex].labelValue <= 7)
            setCenterLabel(recalculatedData[item.dataIndex]);
          else setCenterLabel(null);
        }}
        series={[
          {
            data: [...recalculatedData],
            innerRadius: 100 - 30,
            outerRadius: 100,
            paddingAngle: 5,
            arcLabelRadius: 100 + 30 + 10 + 5,
            arcLabelMinAngle: 25, // approx 7%
            cornerRadius: Infinity,
            cx: 368 / 2 - 5, // lib adds 5px to transform attribute, -5 to compensate it
            cy: 368 / 2 - 5,
            arcLabel: (item) => {
              // @ts-expect-error custom properties allowed but not typed
              return `${item.label}|||${item.labelValue}`;
            },
          },
        ]}
        tooltip={{ trigger: 'none' }}
        slotProps={{
          legend: {
            hidden: true,
          },
        }}
      />
    </Box>
  );
};
