import { Button, Tab, Tabs } from '@mui/material';
import { observer } from 'mobx-react-lite';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LocationHomeIcon } from 'shared/icons';

import { useStore } from '../../app/providers/storeProvider/StoreProvider';
import { UserPermissions } from '../../entities/admin/users/types.ts';
import { Slide } from '../../entities/dashboard/types';
import { NAVIGATION_CONFIG } from '../../entities/navigation/config.ts';
import { Chapter, NavigationGroup } from '../../entities/navigation/types.ts';
import { getFirstSlideByChapter, getFirstSlideById, getSlidePath } from '../../entities/navigation/utils.ts';
import { HeaderActions } from '../../features/headerActions/HeaderActions';
import LocationSelector from '../dashboardLocationSelector/LocationSelector';
import style from './TopPanel.module.scss';

export const TopPanel = observer(() => {
  const { slidesStore, authStore } = useStore();
  const navigate = useNavigate();

  const handleChapterChange = useCallback(
    (_: React.SyntheticEvent, chapterId: Chapter) => {
      const targetSlide = getFirstSlideByChapter(chapterId);
      if (targetSlide) {
        navigate(`/${targetSlide}`);
      }
    },
    [navigate]
  );

  const handleGroupChange = useCallback(
    (_: React.SyntheticEvent, groupOrSlideId: Slide | NavigationGroup) => {
      const targetSlide = getFirstSlideById(groupOrSlideId);
      if (targetSlide) {
        navigate(`/${targetSlide}`);
      }
    },
    [navigate]
  );

  const openHomePage = () => {
    navigate('/');
  };

  const path = getSlidePath(slidesStore.currentSlide as Slide);
  const [currentChapter, currentGroup] = path;

  return (
    <div className={style.wrapper}>
      <div className={style.home}>
        <Button onClick={openHomePage} className={style.homeIcon} variant="outlined" endIcon={<LocationHomeIcon />} />

        <LocationSelector />
      </div>

      <div className={style.dashboard}>
        <Tabs
          sx={{
            '.MuiTabs-flexContainer': { gap: '32px' },
          }}
          value={currentChapter}
          onChange={handleChapterChange}
          aria-label="Chapter Navigation"
        >
          {NAVIGATION_CONFIG.map((chapter) => {
            const isUserHaveChapterPermission = (authStore.permissions ?? []).includes(
              chapter.permission as UserPermissions
            );

            const Icon = chapter.icon;
            return (
              <Tab
                key={chapter.id}
                value={chapter.id}
                icon={Icon && <Icon />}
                className={style.tab}
                label={chapter.label}
                disabled={!isUserHaveChapterPermission}
              />
            );
          })}
        </Tabs>

        <div className={style.innerWrapper}>
          <Tabs
            sx={{
              '.MuiTabs-flexContainer': { gap: '12px' },
              '.MuiTabs-indicator': { display: 'none' },
              '.Mui-selected': {
                background: '#4D5EFF',
              },
            }}
            indicatorColor="secondary"
            value={currentGroup}
            onChange={handleGroupChange}
            aria-label="Sub-Chapter Navigation"
          >
            {NAVIGATION_CONFIG.find((it) => it.id === currentChapter)?.children.map((it) => {
              return <Tab key={it.id} value={it.id} className={style.innerTab} label={it.label} />;
            })}
          </Tabs>
        </div>
      </div>

      <HeaderActions />
    </div>
  );
});
