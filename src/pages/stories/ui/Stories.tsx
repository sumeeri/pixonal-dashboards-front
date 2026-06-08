import { Button } from '@mui/material';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BigArrowIcon } from 'shared/icons';

import { useStore } from '../../../app/providers/storeProvider/StoreProvider';
import { UserPermissions } from '../../../entities/admin/users/types';
import { Slide } from '../../../entities/dashboard/types';
import { MOBILITY_OVERVIEW_CONFIG } from '../../../entities/mobilityOverviewPanel/config';
import { HeaderActions } from '../../../features/headerActions/HeaderActions';
import { InfoCard } from '../../../features/mobilityOverview/infoCard/InfoCard';
import LocationSelector from '../../../widgets/dashboardLocationSelector/LocationSelector';
import style from './Stories.module.scss';

const Stories = observer(() => {
  const { kpiStore, locationPanelStore, map3DStore, slidesStore, authStore } = useStore();

  const availableDefaultSlide: Slide | null = useMemo(() => {
    let defaultSlide: Slide | null = null;

    Object.entries(MOBILITY_OVERVIEW_CONFIG).forEach(([slide, config]) => {
      if ((authStore.permissions ?? []).includes(config.permission) && !defaultSlide) {
        defaultSlide = slide as Slide;
      }
    });

    return defaultSlide;
  }, [authStore.permissions]);

  const navigate = useNavigate();

  useEffect(() => {
    if (map3DStore.isInitialized && !!availableDefaultSlide) {
      slidesStore.setCurrentSlide(Slide.LANDING);
    }
  }, [map3DStore.isInitialized]);

  useEffect(() => {
    kpiStore.fetchMobilityOverviewKpis().finally();
  }, [locationPanelStore.currentLocation.location, locationPanelStore.currentLocation.locationType]);

  const handleNavigateClick = () => {
    if (availableDefaultSlide) {
      navigate(availableDefaultSlide);
    }
  };

  const infoCards = Object.entries(MOBILITY_OVERVIEW_CONFIG).map(([slide, config]) => {
    const isUserHaveSlidePermission = (authStore.permissions ?? []).includes(config.permission as UserPermissions);
    const Icon = config.icon;

    return (
      <InfoCard
        key={slide}
        onClick={() => navigate(slide)}
        title={config.title}
        icon={<Icon />}
        items={config.kpis}
        isLoading={kpiStore.isFetching}
        disabled={!isUserHaveSlidePermission}
      />
    );
  });

  const shouldRenderUI = !locationPanelStore.isLocationPanelOpen;

  if (!shouldRenderUI) return null;

  return (
    <div className={style.wrapper}>
      <div className={style.header}>
        <HeaderActions />
      </div>

      <div className={style.content}>
        <div>
          <div className={style.title}>Mobility Overview</div>
          <LocationSelector />
        </div>

        <div className={style.cards}>{infoCards}</div>

        <div className={style.actions}>
          <Button
            sx={{
              padding: '12px 24px',
              gap: '136px',
              fontSize: '20px',
              fontWeight: 400,
              lineHeight: '22px',
            }}
            onClick={handleNavigateClick}
            variant="contained"
            endIcon={<BigArrowIcon />}
            disabled={!availableDefaultSlide}
          >
            Navigate
          </Button>
        </div>
      </div>
    </div>
  );
});

export default Stories;
