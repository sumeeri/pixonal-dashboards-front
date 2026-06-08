import { Box } from '@mui/material';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';

import style from './ExploreDataTable.module.scss';

type Props = {
  data: {
    id: string;
    value?: number;
    label: string;
  }[];
  keyLabel: string;
  valueLabel: string;
};

export const ExploreDataTable = ({ data, keyLabel, valueLabel }: Props) => {
  return (
    <Box
      sx={{
        paddingRight: '4px',
        height: '368px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <OverlayScrollbarsComponent defer>
        <div className={style.content}>
          {keyLabel || valueLabel ? (
            <div className={style.labels}>
              <span>{keyLabel}</span>
              <span>{valueLabel}</span>
            </div>
          ) : null}
          <div className={style.rows}>
            {data.map((row) => (
              <div className={style.row} key={row.id}>
                <span>{row.label?.toLowerCase()}</span>
                {row.value !== undefined ? <span>{Math.round(row.value).toLocaleString('en-US')}</span> : null}
              </div>
            ))}
          </div>
        </div>
      </OverlayScrollbarsComponent>
    </Box>
  );
};
