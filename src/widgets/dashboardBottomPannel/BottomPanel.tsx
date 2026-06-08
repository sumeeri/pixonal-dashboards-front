import style from './BottomPanel.module.scss';
import { MapDataWidget } from './dashboardMapDataWidget/MapDataWidget.tsx';
import { HoursIntervalsControlPanel } from './dashbordHoursIntervalsControls/HoursIntervalsControlPanel.tsx';

export const BottomPanel = () => {
  return (
    <div className={style.wrapper}>
      <MapDataWidget />
      <HoursIntervalsControlPanel />
    </div>
  );
};
