import { HorizonValue, Pattern, ValuesTypes } from '../../../entities/dashboard/types.ts';
import style from './CustomValue.module.scss';

export const CustomValue = ({ type, value }: { type: ValuesTypes; value: Pattern | HorizonValue }) => {
  return (
    <div className={style.wrapper}>
      <span>{type}</span>
      <span>{value.name}</span>
    </div>
  );
};
