import React, { useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { BigArrowIcon } from 'shared/icons';

import { AvailablePages } from '../../../../entities/navigation/types.ts';
import { HeaderActions } from '../../../../features/headerActions/HeaderActions.tsx';
import style from './AdminLayout.module.scss';

export const AdminLayout = () => {
  const navigate = useNavigate();

  const handleBack = useCallback(() => {
    navigate(AvailablePages.ROOT);
  }, [navigate]);

  return (
    <div className={style.wrapper}>
      <div className={style.header}>
        <button className={style.back} onClick={handleBack}>
          <BigArrowIcon /> Back to home
        </button>
        <HeaderActions />
      </div>
      <Outlet />
    </div>
  );
};
