import { observer } from 'mobx-react-lite';

import { useStore } from '../../../../app/providers/storeProvider/StoreProvider.tsx';
import { LegendWidget } from '../../../../features/dashboard/legendWidget/LegendWidget.tsx';
import { useMapDataConfig } from '../../../../features/dashboard/legendWidget/useMapDataConfig.tsx';
import style from './WidgetItems.module.scss';

export const WidgetItems = observer(() => {
  const { mapDataValuesStore, slidesStore } = useStore();
  const { dataType } = mapDataValuesStore;

  const config = useMapDataConfig(slidesStore.currentSlide);

  if (config.size === 0 || !dataType || !config.has(dataType)) return null;

  const props = config.get(dataType as string);

  return (
    <div className={style.wrapper}>
      <LegendWidget icon={props.icon} label={props.label}>
        {props.legend}
      </LegendWidget>
    </div>
  );
});
