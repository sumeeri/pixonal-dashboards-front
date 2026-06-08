import { observer } from 'mobx-react-lite';
import { MouseEvent } from 'react';
import { DownloadIcon } from 'shared/icons/DownloadIcon.tsx';
import { ExpandAccordionIcon } from 'shared/icons/ExpandAccordionIcon.tsx';
import { ProgressBarWithIcon } from 'shared/ui/progressBarWithIcon/ProgressBarWithIcon.tsx';
import { convertTo12HourFormat } from 'shared/utils/convertTo12HourFormat.ts';

import { useStore } from '../../../app/providers/storeProvider/StoreProvider.tsx';
import { DataForTimeInterval, TimelineXDataType } from '../../../entities/dashboard/types.ts';
import AggregateBySelect from './AggregateBySelect/AggregateBySelect.tsx';
import style from './Summary.module.scss';

interface SummaryProps {
  data: DataForTimeInterval;
  step: number;
  isExpanded: boolean;
}

export const Summary = observer(({ data, step, isExpanded }: SummaryProps) => {
  const { slidesStore, exportMediaStore, timeIntervalsStore } = useStore();
  const { activeIndex } = timeIntervalsStore;

  const openDownloadMenu = (_event: MouseEvent<HTMLButtonElement>) => {
    exportMediaStore.setIsModalOpen(true);
  };

  const onExpandHandler = () => {
    slidesStore.setIsTimeIntervalExpanded(!slidesStore.isTimeIntervalExpanded);
  };

  return (
    <div className={style.wrapper}>
      <div className={style.header}>
        <h2 className={style.title}>Timepoints</h2>
        <div className={style.headerActions}>
          <div className={style.delimiter} />

          <div className={style.delimiter} />

          <div className={style.headerButton}>
            <button onClick={openDownloadMenu}>
              <DownloadIcon />
            </button>
          </div>

          <div className={style.delimiter} />

          <div className={style.headerButton}>
            <button onClick={onExpandHandler}>
              <ExpandAccordionIcon style={{ rotate: `${isExpanded ? '180' : '0'}deg` }} />
            </button>
          </div>
        </div>
      </div>

      <div className={style.row}>
        <ProgressBarWithIcon variant="determinate" dataset={data} step={step} />

        <div className={style.delimiter} />

        <AggregateBySelect />

        <div className={style.delimiter} />

        <div className={style.interval}>
          <span className={style.intervalLabel}>Current interval</span>
          <span>
            {data.xDataType === TimelineXDataType.Time
              ? convertTo12HourFormat(data.xData?.at(activeIndex) ?? '00:00')
              : data.xData.at(activeIndex)}
          </span>
        </div>
      </div>
    </div>
  );
});
