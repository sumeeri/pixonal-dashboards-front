import { MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useCallback } from 'react';
import { mapDataHorizons } from 'shared/constants/mapDataParams.ts';
import { SelectTimeChevronDownIcon } from 'shared/icons';

import { HorizonValue, ValuesTypes } from '../../../entities/dashboard/types.ts';
import { CustomValue } from '../renderValue/CustomValue.tsx';
import style from './HorizonSelect.module.scss';

export const HorizonSelect = ({
  horizonValue,
  horizons = mapDataHorizons,
  selectHorizon,
}: {
  horizonValue: HorizonValue;
  horizons?: HorizonValue[];
  selectHorizon: (value: HorizonValue) => void;
}) => {
  const handleChange = useCallback(
    (e: SelectChangeEvent<HorizonValue>) => {
      selectHorizon(e.target.value as HorizonValue);
    },
    [selectHorizon]
  );

  return (
    <div className={style.wrapper}>
      <Select
        id="select_horizon"
        IconComponent={SelectTimeChevronDownIcon}
        onChange={handleChange}
        value={horizonValue}
        variant="outlined"
        renderValue={(value) => <CustomValue type={ValuesTypes.HORIZON} value={value} />}
      >
        {horizons.map((horizon) => (
          // @ts-expect-error - necessary to load object into value
          <MenuItem key={horizon.id} value={horizon}>
            {horizon.name}
          </MenuItem>
        ))}
      </Select>
    </div>
  );
};
