import React from 'react';

import style from './ColorCircles.module.scss';

type Props = {
  items: { label: string; color: string }[];
};

export const ColorCircles = ({ items }: Props) => {
  return (
    <div className={style.wrapper}>
      {items.map((it) => (
        <span key={it.label} className={style.row}>
          <span style={{ border: `2px solid ${it.color}`, background: `${it.color}CC` }} />
          {it.label}
        </span>
      ))}
    </div>
  );
};
