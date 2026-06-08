import { Accordion, AccordionDetails, AccordionSummary, Box } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { ExpandAccordionIcon } from 'shared/icons';

import { useStore } from '../../../app/providers/storeProvider/StoreProvider.tsx';
import { DataTypeSelect } from '../../../features/dashboard/dataTypeSelect/DataTypeSelect.tsx';
import style from './MapDataWidget.module.scss';
import { WidgetItems } from './widgetItems/WidgetItems.tsx';

export const MapDataWidget = observer(() => {
  const { slidesStore } = useStore();
  const { isMapDataExpanded } = slidesStore;

  const onExpandHandler = () => {
    slidesStore.setIsMapDataExpanded(!isMapDataExpanded);
  };

  return (
    <Box width="420px">
      <Accordion
        style={{ pointerEvents: 'all' }}
        expanded={isMapDataExpanded}
        slotProps={{ transition: { unmountOnExit: true } }}
      >
        <AccordionSummary>
          <div className={style.wrapper}>
            <div className={style.header}>
              <h2 className={style.title}>Map Data</h2>

              <div className={style.headerActions}>
                <div className={style.delimiter} />
                <div className={style.headerButton}>
                  <button onClick={onExpandHandler}>
                    <ExpandAccordionIcon style={{ rotate: `${isMapDataExpanded ? '180' : '0'}deg` }} />
                  </button>
                </div>
              </div>
            </div>

            <DataTypeSelect />
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <WidgetItems />
        </AccordionDetails>
      </Accordion>
    </Box>
  );
});
