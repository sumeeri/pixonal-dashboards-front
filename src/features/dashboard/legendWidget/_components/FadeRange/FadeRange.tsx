import React from 'react';

import style from './FadeRange.module.scss';

export const FadeRange = () => {
  return (
    <div className={style.range}>
      <div className={style.gradient} />
    </div>
  );
};
