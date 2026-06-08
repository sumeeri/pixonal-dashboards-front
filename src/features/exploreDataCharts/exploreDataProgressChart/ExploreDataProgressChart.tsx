import { Box } from '@mui/material';

import style from './ExploreDataProgressChart.module.scss';

type Props = {
  data: {
    id: string;
    value: number;
    label: string;
  }[];
};

const MAX_VALUE_KEY = 'Total Demand';

export const ExploreDataProgressChart = ({ data }: Props) => {
  const total = data.find((it) => it.label === MAX_VALUE_KEY);

  return (
    <>
      <Box
        sx={{
          height: '368px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div className={style.content}>
          {data.map((item) => {
            const valuePercentage = `${Math.round((item.value / (total?.value || 1)) * 100)}%`;
            const barWidth = `${Math.max(0.04, item.value / (total?.value || 1)) * 100}%`;

            return (
              <div className={style.barItem} key={item.id}>
                <div className={style.barLabels}>
                  <span>{item.label?.toLowerCase()}</span>
                  <span>{`${valuePercentage} (${Math.round(item.value).toLocaleString('en-US')})`}</span>
                </div>
                <div className={style.chart}>
                  <div className={style.track} />
                  <div className={style.thumb} style={{ width: barWidth }} />
                </div>
              </div>
            );
          })}
        </div>
      </Box>
    </>
  );
};
