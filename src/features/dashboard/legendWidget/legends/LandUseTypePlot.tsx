import React from 'react';

import { Slide } from '../../../../entities/dashboard/types.ts';
import { ColorCircles } from '../_components/ColorCircles/ColorCircles.tsx';
import { WidgetBuilder } from '../_components/WidgetBuilder.tsx';

const CONFIG = {
  [Slide.LAND_USE_RESIDENTIAL]: [
    { label: 'Villa', color: '#FFDE34' },
    { label: 'Apartment', color: '#E59902' },
    // { label: 'Planned', color: '#FFBEB3' },
  ],
  [Slide.LAND_USE_RETAIL]: [
    { label: 'Mall', color: '#B42179' },
    { label: 'Other', color: '#D6BCFF' },
  ],
  [Slide.LAND_USE_OFFICES]: [
    { label: 'Office', color: '#F79EFF' },
    // { label: 'Private', color: '#03C5FF' },
  ],
  [Slide.LAND_USE_EDUCATION]: [
    { label: 'Higher Education', color: '#FF644A' },
    { label: 'Nurseries', color: '#4FA126' },
    { label: 'Private', color: '#03C5FF' },
    { label: 'Public', color: '#5B6BFD' },
    { label: 'Charter Schools', color: '#F79EFF' },
    { label: 'POD Schools', color: '#E59902' },
    { label: 'Tolerance Schools', color: '#FFDE34' },
  ],
  [Slide.LAND_USE_INDUSTRY]: [{ label: 'Industry', color: '#03C5FF' }],
  [Slide.LAND_USE_MEDICAL]: [
    { label: 'Medical', color: '#4FA126' },
    // { label: 'Planned', color: '#F79EFF' },
  ],
  [Slide.LAND_USE_HOSPITALITY]: [
    // { label: 'Higher Education', color: '#FF644A' },
    { label: 'Hotels', color: '#4FA126' },
    // { label: 'Private', color: '#03C5FF' },
    // { label: 'Public', color: '#5B6BFD' },
  ],

  [Slide.LAND_USE_OTHERS]: [
    { label: 'Religious', color: '#cfb73c' },
    { label: 'Park', color: '#cf554e' },
    { label: 'Other', color: '#1775df' },
  ],
};

type Props = {
  slide: Slide;
};

export const LandUseTypePlot = ({ slide }: Props) => {
  const config = CONFIG[slide as keyof typeof CONFIG] || [];

  return (
    <WidgetBuilder
      items={[
        {
          label: 'Type',
          content: <ColorCircles items={config} />,
        },
      ]}
    />
  );
};
