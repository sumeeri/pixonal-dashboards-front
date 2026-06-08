import { observer } from 'mobx-react-lite';

import { useStore } from '../../app/providers/storeProvider/StoreProvider.tsx';
import { Slide, TrafficSlides } from '../../entities/dashboard/types.ts';
import style from './DashboardMapControls.module.scss';
import { Layers } from './layers/Layers.tsx';
import { NavigationControl } from './navigationControl/NavigationControl.tsx';
import { RealWorldEngineButton } from './realWorldEngineButton/RealWorldEngineButton.tsx';
import { ZoomPanel } from './zoomPanel/ZoomPanel.tsx';

export const DashboardMapControls = observer(() => {
  const { slidesStore } = useStore();
  const isTrafficSlide = TrafficSlides.includes(slidesStore.currentSlide as Slide);

  return (
    <div className={style.wrapper}>
      {isTrafficSlide && <RealWorldEngineButton />}
      <NavigationControl />
      <ZoomPanel />
      <Layers />
    </div>
  );
});
