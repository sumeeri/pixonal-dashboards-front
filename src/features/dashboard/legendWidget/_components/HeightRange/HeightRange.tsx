import React from 'react';

import style from './HeightRange.module.scss';

type Props = {
  startLabel: string;
  endLabel: string;
};

export const HeightRange = ({ startLabel, endLabel }: Props) => {
  return (
    <div className={style.range}>
      <div className={style.heights}>
        <span />
        <span />
        <span />
      </div>
      <div className={style.rangeLabels}>
        <span>{startLabel}</span>
        <span>{endLabel}</span>
      </div>
    </div>
  );
};
