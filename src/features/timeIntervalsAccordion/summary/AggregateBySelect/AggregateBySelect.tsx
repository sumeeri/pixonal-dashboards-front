import { InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { ClockIcon, ExpandAccordionIcon } from 'shared/icons';

import { useStore } from '../../../../app/providers/storeProvider/StoreProvider.tsx';
import contentLoadStoreInstance from '../../../../app/stores/contentLoadStore.ts';
import infoPopupStoreInstance from '../../../../app/stores/infoPopupStore.ts';
import timeIntervalsStoreInstance from '../../../../app/stores/timeIntervalsStore.ts';
import { slidesWithoutTypicalDayType } from '../../../../entities/dashboard/config.ts';
import { Slide, TimelineAggregation } from '../../../../entities/dashboard/types.ts';
import style from './AggregateBySelect.module.scss';
import { TIMEPOINTS_AGGREGATIONS, TIMEPOINTS_AGGREGATIONS_VALUES } from './constants.ts';

const AggregateBySelect = observer(() => {
  const { slidesStore, current3DStore, timeIntervalsStore } = useStore();
  const { currentSlide } = slidesStore;

  const [selectedAggregation, setSelectedAggregation] = useState(
    TIMEPOINTS_AGGREGATIONS_VALUES[timeIntervalsStore.typeOfRange]
  );

  useEffect(() => {
    setSelectedAggregation(TIMEPOINTS_AGGREGATIONS_VALUES[timeIntervalsStore.typeOfRange]);
  }, [timeIntervalsStore.typeOfRange]);

  const handleSelectedType = async (event: SelectChangeEvent<string>) => {
    const value = event.target.value;

    timeIntervalsStoreInstance.setTypeOfRange(
      value === TIMEPOINTS_AGGREGATIONS_VALUES[0] ? TimelineAggregation.ENTIRE : TimelineAggregation.TYPICAL
    );

    current3DStore.stopPreloadData();

    timeIntervalsStoreInstance.setDefaultState();

    contentLoadStoreInstance.setIsSelectedTimePointLoading(true);
    await current3DStore.fetchParams(
      timeIntervalsStoreInstance.activeIndex,
      timeIntervalsStoreInstance.activeIndex + 1
    );
    contentLoadStoreInstance.setIsSelectedTimePointLoading(false);
    infoPopupStoreInstance.isShown = false;

    setSelectedAggregation(value);
  };

  const isDisabled = slidesWithoutTypicalDayType.includes(currentSlide as Slide);

  return (
    <div className={style.wrapper} onClick={(e) => e.stopPropagation()}>
      <InputLabel variant="standard" htmlFor="aggregate_by">
        <ClockIcon />
        Aggregate Timepoints by
      </InputLabel>

      <div className={style.delimiter} />

      {isDisabled ? (
        <span className={style.value}>{TIMEPOINTS_AGGREGATIONS[0].label}</span>
      ) : (
        <Select
          onChange={handleSelectedType}
          value={selectedAggregation}
          IconComponent={ExpandAccordionIcon}
          variant="outlined"
          inputProps={{ name: 'aggregate_by', id: 'aggregate_by' }}
          className={style.select}
        >
          {TIMEPOINTS_AGGREGATIONS.map((it) => (
            <MenuItem value={it.value} key={it.value}>
              {it.label}
            </MenuItem>
          ))}
        </Select>
      )}
    </div>
  );
});

export default AggregateBySelect;
