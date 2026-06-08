import { Button, Modal, Tab, Tabs } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { CloseIcon } from 'shared/icons/CloseIcon.tsx';
import { HorizonIcon } from 'shared/icons/HorizonIcon.tsx';
import { PatternIcon } from 'shared/icons/PatternIcon.tsx';
import { RangeIcon } from 'shared/icons/RangeIcon.tsx';

import { useStore } from '../../app/providers/storeProvider/StoreProvider.tsx';
import patternsStoreInstance from '../../app/stores/patternsStore.ts';
import { HorizonValue, Pattern, Periods, TimelineAggregation, ValuesTypes } from '../../entities/dashboard/types.ts';
import { ModalRangePicker } from '../rangePicker/ModalRangePicker.tsx';
import { RangeSelect } from '../rangePicker/RangeSelect/RangeSelect.tsx';
import { HorizonSelect } from './horizonSelect/HorizonSelect.tsx';
import { PatternSelect } from './patternSelect/PatternSelect.tsx';
import style from './SelectTimeModal.module.scss';
import { CustomTabPanel } from './tabPanel/CustomTabPanel.tsx';

const tabsSx = {
  '& .MuiTabs-indicator': {
    display: 'none',
  },
};

const tabSx = {
  padding: '6px 34px',
  minHeight: 'auto',
  background: '#242A65',
  borderRadius: '20px',
  gap: '12px',
  textTransform: 'capitalize',

  '&.Mui-disabled': {
    svg: {
      path: {
        stroke: 'grey',
      },
    },
  },

  '&.Mui-selected': {
    background: '#4D5EFF',

    svg: {
      path: {
        stroke: 'white',
      },
    },
  },
  svg: {
    path: {
      stroke: '#9DA3DC',
    },
  },
};

export const SelectTimeModal = observer(({ isOpenModal, onClose }: { isOpenModal: boolean; onClose: () => void }) => {
  const { mapDataValuesStore, timeIntervalsStore, current3DStore, slidesStore } = useStore();
  const { timeType, calendarPattern, horizon, allowedTimeTypes } = mapDataValuesStore;
  const horizonOptions = slidesStore.getHorizonOptionsForSlide();
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<ValuesTypes>(ValuesTypes.RANGE);
  const [selectedPattern, setSelectedPattern] = useState<Pattern | undefined>(mapDataValuesStore.pattern);
  const [selectedHorizon, setSelectedHorizon] = useState<HorizonValue>(horizon);
  const [data, setData] = useState<any>(null);
  const [rangePeriod, setRangePeriod] = useState<Periods | null>(null);

  useEffect(() => {
    if (isOpenModal) {
      current3DStore.stopPreloadData();
      timeIntervalsStore.handleStop();

      const allowed = slidesStore.getHorizonOptionsForSlide();
      const nextHorizon = allowed.find((h) => h.id === horizon.id) ?? allowed[0];
      setSelectedHorizon(nextHorizon);

      const currentPeriod = slidesStore.getCurrentPeriod();
      if (timeType === ValuesTypes.HORIZON) {
        setData(nextHorizon);
        setRangePeriod(currentPeriod);
      } else if (timeType === ValuesTypes.PATTERN) {
        setSelectedPattern(mapDataValuesStore.pattern);
        setData(mapDataValuesStore.pattern);
        setRangePeriod(Periods.Patterns);
      } else {
        setData({ value: calendarPattern });
        setRangePeriod(currentPeriod);
      }
    }
  }, [isOpenModal]);

  useEffect(() => {
    setData({ value: calendarPattern });
  }, []);

  useEffect(() => {
    setValue(timeType);
  }, [timeType]);

  const selectPattern = (value: Pattern) => {
    const selected = patternsStoreInstance.patternsMap
      .get(mapDataValuesStore.currentPatternType)!
      .find((pattern) => pattern.name === value.name);

    if (selected) {
      setSelectedPattern(selected);
      setData(selected);
    }
  };
  const selectHorizon = (value: HorizonValue) => {
    const selected = horizonOptions.find((h) => h.id === value.id);
    if (selected) {
      setSelectedHorizon(selected);
      setData(selected);
    }
  };

  const submitTimePick = async () => {
    mapDataValuesStore.setHorizon(selectedHorizon);
    mapDataValuesStore.setTimeType(value);
    mapDataValuesStore.setTimeName(data.name);
    mapDataValuesStore.setPeriod(rangePeriod ?? slidesStore.getCurrentPeriod());

    if (value === ValuesTypes.PATTERN) {
      mapDataValuesStore.setTime({ from: new Date(data.date), to: new Date(data.date) });
      mapDataValuesStore.setPattern(selectedPattern);
    }
    if (value === ValuesTypes.RANGE) {
      mapDataValuesStore.setTime(data.value);
    }

    timeIntervalsStore.setTypeOfRange(TimelineAggregation.ENTIRE);

    onClose();

    mapDataValuesStore.setActiveIndex(0);
    await current3DStore.fetchParams(0, 1);
    current3DStore.startPreloadData(0, 1);
  };

  const handleClose = () => {
    mapDataValuesStore.resetCalendarPattern();

    onClose();
  };

  const changeTab = (value: ValuesTypes) => {
    setValue(value);

    const currentRangePeriod = slidesStore.getCurrentPeriod();

    switch (value) {
      case ValuesTypes.RANGE:
        setData({ value: calendarPattern });
        setRangePeriod(currentRangePeriod);
        break;

      case ValuesTypes.PATTERN:
        setData(selectedPattern);
        setRangePeriod(Periods.Patterns);
        break;

      case ValuesTypes.HORIZON:
        setData(selectedHorizon);
        setRangePeriod(Periods.Horizons);
        break;
    }
  };

  const isRangeDisabled = !allowedTimeTypes.includes(ValuesTypes.RANGE);
  const isPatternDisabled = !allowedTimeTypes.includes(ValuesTypes.PATTERN);
  const isHorizonDisabled = !allowedTimeTypes.includes(ValuesTypes.HORIZON);

  return (
    <Modal open={isOpenModal} onClose={handleClose}>
      <>
        <div className={style.wrapper}>
          <div className={style.content}>
            <div className={style.header}>
              <p>Select Time</p>
              <button className={style.closeButton} onClick={handleClose}>
                <CloseIcon />
              </button>
            </div>
            <div>
              <Tabs
                className={style.tabs}
                sx={tabsSx}
                value={value}
                onChange={(_e, newValue) => changeTab(newValue)}
                aria-label="select time tabs"
              >
                <Tab
                  label="Range"
                  sx={tabSx}
                  icon={<RangeIcon />}
                  iconPosition="start"
                  value={'range'}
                  disabled={isRangeDisabled}
                />
                <Tab
                  label="Pattern"
                  sx={tabSx}
                  icon={<PatternIcon />}
                  iconPosition="start"
                  value={'pattern'}
                  disabled={isPatternDisabled}
                />
                <Tab
                  label="Horizon"
                  sx={tabSx}
                  icon={<HorizonIcon />}
                  iconPosition="start"
                  value={'horizon'}
                  disabled={isHorizonDisabled}
                />
              </Tabs>
              <CustomTabPanel value={value} index={'range'}>
                <RangeSelect
                  onClick={() => setOpen(true)}
                  startDate={mapDataValuesStore.calendarPattern.from as Date}
                  endDate={mapDataValuesStore.calendarPattern?.to}
                />
              </CustomTabPanel>
              <CustomTabPanel value={value} index={'pattern'}>
                <PatternSelect selectPattern={selectPattern} />
              </CustomTabPanel>
              <CustomTabPanel value={value} index={'horizon'}>
                <HorizonSelect horizons={horizonOptions} horizonValue={selectedHorizon} selectHorizon={selectHorizon} />
              </CustomTabPanel>
            </div>
            <div className={style.footer}>
              <Button variant="outlined" size="small" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color="secondary"
                size="small"
                type="submit"
                disabled={!data}
                onClick={submitTimePick}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
        <ModalRangePicker open={open} onClose={() => setOpen(false)} setData={setData} />
      </>
    </Modal>
  );
});
