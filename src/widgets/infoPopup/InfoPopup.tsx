import { Fade, Skeleton } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { type ReactNode, useEffect, useMemo, useRef } from 'react';
import { AlertIcon, CloseIcon, WarnYellowIcon } from 'shared/icons';

import { useStore } from '../../app/providers/storeProvider/StoreProvider.tsx';
import { InfoPopupIcon } from '../../app/stores/infoPopupStore.ts';
import style from './InfoPopup.module.scss';

const Translate = observer(({ children }: { children: ReactNode }) => {
  const { infoPopupStore } = useStore();
  const { screenPosition } = infoPopupStore;

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (wrapperRef.current) {
      const translateX = screenPosition.x - 60;
      const translateY = screenPosition.y;

      wrapperRef.current.style.transform = `translate(${translateX}px,${translateY}px)  translate(0, -100%)`;
    }
  }, [screenPosition]);

  return (
    <Fade in={infoPopupStore.isShown}>
      <div className={style.wrapper} ref={wrapperRef}>
        {children}
      </div>
    </Fade>
  );
});

export const InfoPopup = observer(() => {
  const { infoPopupStore, map3DStore } = useStore();
  const { icon: iconType, title, info, isFetching } = infoPopupStore;

  const icon = useMemo(() => {
    switch (iconType) {
      case InfoPopupIcon.WarnRed:
        return <AlertIcon />;
      case InfoPopupIcon.WarnYellow:
        return <WarnYellowIcon />;
    }
  }, [iconType]);

  const handleClose = () => {
    map3DStore.deselectCurrent3DSlide();
  };

  return (
    <Translate>
      <div className={style.content}>
        <div className={style.title}>
          {icon}
          {title}
          <button type="button" className={style.closeIcon} onClick={handleClose}>
            <CloseIcon />
          </button>
        </div>
        <div className={style.borderLine} />
        {info.map((x) => {
          if ((x.value === null || x.value === undefined || x.value === '') && !isFetching) return null;

          // Note: CSS Capitalize doesn't work on uppercased strings
          let formattedValue = x.value?.toLowerCase();
          // Ensure "IP" prefix is always uppercase for junction names
          if (formattedValue) {
            formattedValue = formattedValue.replace(/^ip/i, 'IP');
          }
          return (
            <div key={x.title} className={style.info}>
              <p>{x.title}</p>
              <p>{formattedValue ?? <Skeleton animation="wave" height={20} />}</p>
            </div>
          );
        })}
      </div>
      <div className={style.marker} />
    </Translate>
  );
});
