import React from 'react';

import style from './ColorBars.module.scss';

type Props = {
  items: { label: string; color: string }[];
};

export const ColorBars = ({ items }: Props) => {
  return (
    <div className={style.wrapper}>
      {items.map((it) => {
        return (
          <div key={it.label} className={style.row}>
            {it.label}
            <span style={{ backgroundColor: it.color }} />
          </div>
        );
      })}
    </div>
  );
};
