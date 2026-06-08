import cn from 'classnames';
import React from 'react';

import style from './ColorRange.module.scss';

type Props = {
  items: { label: string; color: string }[];
  multirow?: boolean;
};

export const ColorRange = ({ items, multirow }: Props) => {
  return (
    <div className={cn(style.wrapper, multirow && style.multirow)}>
      {items.map((it) => {
        return (
          <div key={it.label} className={style.item}>
            <span style={{ backgroundColor: it.color }} />
            {it.label}
          </div>
        );
      })}
    </div>
  );
};
