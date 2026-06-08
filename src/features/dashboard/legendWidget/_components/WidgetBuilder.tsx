import React from 'react';

import style from './WidgetBuilder.module.scss';

type Item =
  | {
      label: string;
      content: React.ReactNode;
    }
  | 'divider';

type Props = {
  items: Item[];
};

export const WidgetBuilder = ({ items }: Props) => {
  return (
    <div className={style.wrapper}>
      {items.map((it, index) => {
        if (it === 'divider') {
          // eslint-disable-next-line react/no-array-index-key
          return <div key={index} className={style.delimiter} />;
        }

        return (
          <React.Fragment key={it.label}>
            <span className={style.label}>{it.label}</span>
            <div className={style.item}>{it.content}</div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
