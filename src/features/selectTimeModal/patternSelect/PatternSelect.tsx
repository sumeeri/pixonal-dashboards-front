import { MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useCallback } from 'react';
import { SelectTimeChevronDownIcon } from 'shared/icons';

import mapDataValuesStoreInstance from '../../../app/stores/mapDataValuesStore.ts';
import patternsStoreInstance from '../../../app/stores/patternsStore.ts';
import { Pattern, ValuesTypes } from '../../../entities/dashboard/types.ts';
import { CustomValue } from '../renderValue/CustomValue.tsx';
import style from './PatternSelect.module.scss';

export const PatternSelect = ({ selectPattern }: { selectPattern: (value: Pattern) => void }) => {
  const handleChange = useCallback(
    (e: SelectChangeEvent<Pattern>) => {
      selectPattern(e.target.value as Pattern);
    },
    [selectPattern]
  );

  const patterns = patternsStoreInstance.patternsMap.get(mapDataValuesStoreInstance.currentPatternType);

  return (
    <div className={style.wrapper}>
      <Select
        id="select_pattern"
        IconComponent={SelectTimeChevronDownIcon}
        onChange={handleChange}
        defaultValue={mapDataValuesStoreInstance.pattern ?? patterns?.[0]}
        variant="outlined"
        renderValue={(value) => <CustomValue type={ValuesTypes.PATTERN} value={value} />}
      >
        {patterns &&
          patterns.map((pattern) => (
            // @ts-expect-error - necessary to load object into value
            <MenuItem key={pattern.name} value={pattern}>
              {pattern.name}
            </MenuItem>
          ))}
      </Select>
    </div>
  );
};
