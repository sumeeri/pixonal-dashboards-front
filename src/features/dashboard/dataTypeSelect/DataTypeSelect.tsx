import { InputLabel, MenuItem, Select } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo } from 'react';
import { DataType } from 'shared/constants/mapDataParams.ts';
import { DiagramIcon, ExpandAccordionIcon } from 'shared/icons';

import { useStore } from '../../../app/providers/storeProvider/StoreProvider.tsx';
import map3d from '../../../app/stores/3d/Map3d.ts';
import locationPanelStoreInstance from '../../../app/stores/locationPanelStore.ts';
import { typesOfMostUsed } from '../../../entities/dashboard/config.ts';
import { LocationType } from '../../../entities/locationPanel/types.ts';
import { useMapDataConfig } from '../legendWidget/useMapDataConfig.tsx';
import style from './DataType.module.scss';

export const DataTypeSelect = observer(() => {
  const { mapDataValuesStore, slidesStore, timeIntervalsStore } = useStore();

  const config = useMapDataConfig(slidesStore.currentSlide);

  const currentTypes = useMemo(() => [...config.keys()] as DataType[], [config]);

  useEffect(() => {
    timeIntervalsStore.handleStop();
  }, [slidesStore.currentSlide, currentTypes]);

  const changeDataType = (e: any) => {
    timeIntervalsStore.handleStop();

    const isCorridors = locationPanelStoreInstance.currentLocationType === LocationType.CORRIDOR;

    if (typesOfMostUsed.includes(e.target.value) && isCorridors) {
      locationPanelStoreInstance.setCurrentLocationToBeforeLocation();
    }

    map3d.setDefaultCameraPosition();
    mapDataValuesStore.setDataType(e.target.value);
  };

  const isSingleValue = currentTypes.length === 1;

  if (!mapDataValuesStore.dataType) return null;

  return (
    <div className={style.wrapper} onClick={(e) => e.stopPropagation()}>
      <InputLabel variant="standard" htmlFor="data_type">
        <DiagramIcon />
        Data Type
      </InputLabel>

      <div className={style.delimiter} />

      {isSingleValue ? (
        <span className={style.value}>{mapDataValuesStore.dataType}</span>
      ) : (
        <Select
          value={mapDataValuesStore.dataType}
          onChange={changeDataType}
          IconComponent={ExpandAccordionIcon}
          variant="outlined"
          inputProps={{ name: 'data_type', id: 'data_type' }}
          className={style.select}
          MenuProps={{
            anchorOrigin: {
              vertical: 'bottom',
              horizontal: 64,
            },
          }}
        >
          {currentTypes.map((type) => (
            <MenuItem value={type} key={type} className={style.menuItem}>
              {type}
            </MenuItem>
          ))}
        </Select>
      )}
    </div>
  );
});
