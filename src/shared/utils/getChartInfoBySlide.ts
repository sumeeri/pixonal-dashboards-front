enum chartColor {
  Blue = '#4F5BD4',
  Green = '#FBE418',
  Yellow = '#18FBC5',
}

export const chartColors = [
  chartColor.Blue,
  chartColor.Green,
  chartColor.Yellow,
  chartColor.Blue,
  chartColor.Green,
  chartColor.Yellow,
];

/*
export const getChartKey = (color: chartColor) => {
  return Object.values(chartColor).indexOf(color);
};

export const chartInfoData: Record<Slide, { colors: chartColor[] }> = {
  [Slide.POPULATION_COUNT]: { colors: [] },
  [Slide.LAND_USE_CONSTRUCTION]: { colors: [] },
  [Slide.LAND_USE_RESIDENTIAL]: { colors: [] },
  [Slide.LAND_USE_MOSQUES]: { colors: [] },
  [Slide.LAND_USE_SCHOOLS]: { colors: [] },
  [Slide.LAND_USE_MEDICAL]: { colors: [] },
  [Slide.LAND_USE_OFFICES]: { colors: [] },
  [Slide.LAND_USE_RETAIL]: { colors: [] },
  [Slide.LAND_USE_WATER_CONSUMPTION]: { colors: [] },
  [Slide.LAND_USE_ELECTRICITY_CONSUMPTION]: { colors: [] },
  [Slide.BUS_AND_TAXI_BUS_TRIPS_INBOUND]: { colors: [] },
  [Slide.ROAD_TRAFFIC]: {
    colors: [chartColor.Blue, chartColor.Green, chartColor.Yellow],
  },
  [Slide.JUNCTIONS]: {
    colors: [chartColor.Yellow],
  },
  [Slide.ACCIDENTS]: {
    colors: [chartColor.Blue],
  },
  [Slide.POPULATION_MOVEMENT_INBOUND]: {
    colors: [chartColor.Blue],
  },
  [Slide.POPULATION_MOVEMENT_OUTBOUND]: {
    colors: [chartColor.Blue],
  },
  [Slide.POPULATION_MOVEMENT_WITHIN]: {
    colors: [chartColor.Blue],
  },
};
*/
