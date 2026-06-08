import React from 'react';

import style from './DiskSize.module.scss';

type Props = {
  startLabel: string;
  endLabel: string;
};

export const DiskSize = ({ startLabel, endLabel }: Props) => {
  return (
    <div className={style.range}>
      <div className={style.disks}>
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
