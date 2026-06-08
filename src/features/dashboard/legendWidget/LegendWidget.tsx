import cn from 'classnames';
import { observer } from 'mobx-react-lite';
import { ReactNode } from 'react';
import { ClosedEyeIcon, OpenEyeIcon } from 'shared/icons';

import { useStore } from '../../../app/providers/storeProvider/StoreProvider.tsx';
import styles from './LegendWidget.module.scss';

type Props = {
  children: ReactNode;
  icon?: ReactNode;
  label?: string;
};

export const LegendWidget = observer((props: Props) => {
  const { mapDataValuesStore, map3DStore } = useStore();
  const { children, icon, label } = props;
  const { isDataTypeActive } = mapDataValuesStore;

  const toggleVisibility = () => {
    mapDataValuesStore.setIsDataTypeActive(!isDataTypeActive);
    map3DStore.set3DSlideVisible(!isDataTypeActive);
  };

  return (
    <div className={cn(styles.wrapper, !isDataTypeActive && styles.deactivated)}>
      <div className={styles.header}>
        <span className={styles.title}>
          {icon}
          <span>{label}</span>
        </span>

        <button className={styles.button} onClick={toggleVisibility}>
          {isDataTypeActive ? <OpenEyeIcon /> : <ClosedEyeIcon />}
        </button>
      </div>

      <div className={styles.delimiter} />

      <div>{children}</div>
    </div>
  );
});
