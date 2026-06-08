import { Box } from '@mui/material';
import { useEffect, useRef } from 'react';

import style from './ExploreDataValue.module.scss';

type Props = {
  value: number | string;
  label?: string;
  valuePostfix?: string;
};

export const ExploreDataValue = ({ value, label, valuePostfix }: Props) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!wrapperRef.current || !valueRef.current) return;

    const wrapperWidth = wrapperRef.current.clientWidth;
    let valueWidth = valueRef.current.clientWidth;
    let fontSize = parseInt(window.getComputedStyle(valueRef.current).fontSize);

    while (valueWidth > wrapperWidth) {
      fontSize -= 1;
      valueRef.current.style.fontSize = fontSize + 'px';
      valueWidth = valueRef.current.scrollWidth;
    }
  }, [value]);

  return (
    <Box
      sx={{
        padding: '16px',
        height: '368px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <div ref={wrapperRef} className={style.content}>
        <span ref={valueRef} className={style.value}>
          {value.toLocaleString('en-US')}
          {valuePostfix}
        </span>
        {label && <div className={style.label}>{label}</div>}
      </div>
    </Box>
  );
};
