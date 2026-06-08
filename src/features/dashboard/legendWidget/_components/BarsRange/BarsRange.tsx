import React from 'react';

import style from './BarsRange.module.scss';

type Props = {
  colors: string[];
  startLabel: string;
  endLabel: string;
};

export const BarsRange = ({ colors, startLabel, endLabel }: Props) => {
  return (
    <div className={style.range}>
      <div className={style.bars}>
        {colors.map((color) => (
          <span key={color} style={{ background: color }} />
        ))}
      </div>
      <div className={style.rangeLabels}>
        <span>{startLabel}</span>
        <span>{endLabel}</span>
      </div>
    </div>
  );
};
