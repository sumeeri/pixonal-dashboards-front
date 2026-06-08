import { Box } from '@mui/material';
import chunk from 'lodash/chunk';

import style from './ExploreDataBarChart.module.scss';

type Props = {
  data: {
    id: string;
    value: number;
    label: string;
  }[];

  maxValue?: number;
  columnSize?: number;
  unit?: string;
};

export const ExploreDataBarChart = ({ data, maxValue, unit, columnSize }: Props) => {
  const max = Math.max(...data.map((it) => it.value), maxValue ?? 0);

  const chunkedData = columnSize ? chunk(data, columnSize) : [data];

  return (
    <>
      {chunkedData.map((chunk, index) => (
        <Box
          /* eslint-disable-next-line react/no-array-index-key */
          key={index}
          sx={{
            height: '368px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div className={style.content}>
            {chunk.map((item) => (
              <div className={style.barItem} key={item.id}>
                <div className={style.barLabels}>
                  <span>{item.label?.toLowerCase()}</span>
                  <span>{`${Math.round(item.value).toLocaleString('en-US')}${unit ?? ''}`}</span>
                </div>
                <div className={style.chart}>
                  <div className={style.track} />
                  <div className={style.thumb} style={{ width: `${Math.max(0.04, item.value / max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Box>
      ))}
    </>
  );
};
