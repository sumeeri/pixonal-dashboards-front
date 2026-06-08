import Box from '@mui/material/Box';
import CircularProgress, { CircularProgressProps } from '@mui/material/CircularProgress';
import cn from 'classnames';
import { observer } from 'mobx-react-lite';
import { PauseIcon, PlayIcon } from 'shared/icons';

import { useStore } from '../../../app/providers/storeProvider/StoreProvider.tsx';
import contentLoadStoreInstance from '../../../app/stores/contentLoadStore.ts';
import { DataForTimeInterval } from '../../../entities/dashboard/types.ts';
import style from './ProgressBarWithIcon.module.scss';

export const ProgressBarWithIcon = observer(
  (props: CircularProgressProps & { dataset: DataForTimeInterval; step: number }) => {
    const { dataset, step } = props;
    const { timeIntervalsStore } = useStore();

    const interactionWithAnimation = (event: any) => {
      event.stopPropagation();
      timeIntervalsStore.isAnimationPlaying
        ? timeIntervalsStore.handleStop()
        : timeIntervalsStore.handlePlay(dataset.xData?.length, step);
    };

    const value = (timeIntervalsStore.sliderValue / (dataset.xData?.length - 1)) * 100;

    return (
      <Box
        sx={{ position: 'relative', display: 'inline-flex', pointerEvents: 'all' }}
        onClick={interactionWithAnimation}
      >
        <CircularProgress
          variant="determinate"
          {...props}
          size={26}
          value={100}
          sx={{ color: '#5A5F93', position: 'absolute' }}
        />
        <CircularProgress size={26} variant="determinate" value={value} />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div className={cn(style.playButton, contentLoadStoreInstance.isSelectedTimePointLoading && style.disabled)}>
            {timeIntervalsStore.isAnimationPlaying ? <PauseIcon /> : <PlayIcon />}
          </div>
        </Box>
      </Box>
    );
  }
);
