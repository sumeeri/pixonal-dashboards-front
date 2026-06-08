import React from 'react';

import style from './GradientRange.module.scss';

type Props = {
  gradient: {
    from: string;
    to: string;
  };
  startLabel: string;
  endLabel: string;
};

export const GradientRange = ({ gradient, startLabel, endLabel }: Props) => {
  return (
    <div className={style.range}>
      <div
        className={style.gradient}
        style={{ background: `linear-gradient(90deg, ${gradient.from}, ${gradient.to})` }}
      />
      <div className={style.rangeLabels}>
        <span>{startLabel}</span>
        <span>{endLabel}</span>
      </div>
    </div>
  );
};
