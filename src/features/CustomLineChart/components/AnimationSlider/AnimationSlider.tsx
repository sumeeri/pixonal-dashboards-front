import { Slider, SliderProps } from '@mui/material';
import { observer } from 'mobx-react-lite';
import React from 'react';

import timeIntervalsStore from '../../../../app/stores/timeIntervalsStore.ts';

type Props = SliderProps;

export const AnimationSlider = observer(({ ...props }: Props) => {
  const value = (props.value as number) + timeIntervalsStore.animatedSliderProgress;

  return <Slider {...props} value={value} />;
});
