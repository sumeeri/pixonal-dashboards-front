import { useMemo } from 'react';
import { DataType } from 'shared/constants/mapDataParams.ts';
import {
  AlertIcon,
  ArrowArcIcon,
  BarChartIcon,
  CubeIcon,
  DiskIcon,
  PerspectiveIcon,
  WarnYellowIcon,
} from 'shared/icons';

import { Slide } from '../../../entities/dashboard/types';
import { BarsRange } from './_components/BarsRange/BarsRange.tsx';
import { ColorBars } from './_components/ColorBars/ColorBars.tsx';
import { ColorCircles } from './_components/ColorCircles/ColorCircles.tsx';
import { ColorRange } from './_components/ColorRange/ColorRange.tsx';
import { DiskSize } from './_components/DiskSize/DiskSize.tsx';
import { FadeRange } from './_components/FadeRange/FadeRange.tsx';
import { GradientRange } from './_components/GradientRange/GradientRange.tsx';
import { HeightRange } from './_components/HeightRange/HeightRange.tsx';
import { WidgetBuilder } from './_components/WidgetBuilder.tsx';
import { Consumption } from './legends/Consumption.tsx';
import { LandUseTypePlot } from './legends/LandUseTypePlot.tsx';

export const useMapDataConfig = (slide?: Slide) => {
  const config = useMemo(() => {
    switch (slide) {
      case Slide.POPULATION_COUNT:
        return {
          [DataType.POPULATION_DENSITY]: {
            label: 'Population Density',
            icon: <CubeIcon />,
            legend: (
              <WidgetBuilder
                items={[
                  {
                    label: 'Population Density',
                    content: (
                      <GradientRange
                        gradient={{ from: '#1520541A', to: '#00ac9eFF' }}
                        startLabel={`Low`}
                        endLabel={`High`}
                      />
                    ),
                  },
                  {
                    label: 'Unusual',
                    content: <WarnYellowIcon />,
                  },
                ]}
              />
            ),
          },
        };

      case Slide.POPULATION_MOVEMENT_INBOUND:
      case Slide.POPULATION_MOVEMENT_OUTBOUND:
        return {
          [DataType.TRIPS]: {
            label: 'Trips',
            icon:
              slide === Slide.POPULATION_MOVEMENT_INBOUND ? (
                <ArrowArcIcon style={{ transform: 'scaleX(-1)' }} />
              ) : (
                <ArrowArcIcon />
              ),
            legend: (
              <WidgetBuilder
                items={[
                  {
                    label: 'Trip Status',
                    content: (
                      <ColorBars
                        items={[
                          { label: 'Usual', color: '#00DAFE' },
                          { label: 'Unusual', color: '#EDC16B' },
                        ]}
                      />
                    ),
                  },
                  'divider',
                  { label: 'Capacity', content: <DiskSize startLabel={`Low`} endLabel={`High`} /> },
                ]}
              />
            ),
          },
        };

      case Slide.POPULATION_MOVEMENT_WITHIN:
        return {
          [DataType.ORIGIN]: {
            label: 'Trips',
            icon: <CubeIcon />,
            legend: (
              <WidgetBuilder
                items={[
                  {
                    label: 'No. of Trips',
                    content: (
                      <GradientRange
                        gradient={{ from: '#1520541a', to: '#00ac9eff' }}
                        startLabel={`Low`}
                        endLabel={`High`}
                      />
                    ),
                  },
                  { label: 'Unusual', content: <WarnYellowIcon /> },
                ]}
              />
            ),
          },
          [DataType.DESTINATIONS]: {
            label: 'Trips',
            icon: <CubeIcon />,
            legend: (
              <WidgetBuilder
                items={[
                  {
                    label: 'No. of Trips',
                    content: (
                      <GradientRange
                        gradient={{ from: '#1520541a', to: '#00ac9eff' }}
                        startLabel={`Low`}
                        endLabel={`High`}
                      />
                    ),
                  },
                  { label: 'Unusual', content: <WarnYellowIcon /> },
                ]}
              />
            ),
          },
        };

      case Slide.LAND_USE_RESIDENTIAL:
      case Slide.LAND_USE_RETAIL:
      case Slide.LAND_USE_OFFICES:
      case Slide.LAND_USE_EDUCATION:
      case Slide.LAND_USE_INDUSTRY:
      case Slide.LAND_USE_MEDICAL:
      case Slide.LAND_USE_HOSPITALITY:
      case Slide.LAND_USE_OTHERS:
        return {
          [DataType.LAND_USE_TYPE_PLOT]: {
            label: 'Land Use',
            icon: <PerspectiveIcon />,
            legend: <LandUseTypePlot slide={slide as Slide} />,
          },
          [DataType.LAND_USE_TYPE_ZONE]: {
            label: 'Land Use',
            icon: <PerspectiveIcon />,
            legend: (
              <WidgetBuilder
                items={[
                  {
                    label: 'GFA',
                    content: (
                      <GradientRange
                        gradient={{ from: '#00ac9e1A', to: '#00ac9eE6' }}
                        startLabel={`Low`}
                        endLabel={`High`}
                      />
                    ),
                  },
                ]}
              />
            ),
          },
        };

      case Slide.LAND_USE_WATER_CONSUMPTION:
        return {
          [DataType.RESIDENTIAL]: {
            label: 'Water Consumption',
            icon: <CubeIcon />,
            legend: <Consumption />,
          },
          [DataType.COMMERCIAL]: {
            label: 'Water Consumption',
            icon: <CubeIcon />,
            legend: <Consumption />,
          },
          // [DataType.APARTMENTS]: {
          //   label: 'Water Consumption',
          //   icon: <CubeIcon />,
          //   legend: <Consumption />,
          // },
          // [DataType.VILLAS]: { label: 'Water Consumption', icon: <CubeIcon />, legend: <Consumption /> },
          // [DataType.SHOPS]: { label: 'Water Consumption', icon: <CubeIcon />, legend: <Consumption /> },
          // [DataType.OFFICES]: { label: 'Water Consumption', icon: <CubeIcon />, legend: <Consumption /> },
          // [DataType.UTILIZATION]: {
          //   label: 'Land Use',
          //   icon: <PerspectiveIcon />,
          //   legend: (
          //     <WidgetBuilder
          //       items={[
          //         {
          //           label: 'Type',
          //           content: (
          //             <ColorCircles
          //               items={[
          //                 { label: 'Over Utilized', color: '#7E53FF' },
          //                 { label: 'Under Utilized', color: '#FFCDA7' },
          //                 { label: 'Typical', color: '#008399' },
          //               ]}
          //             />
          //           ),
          //         },
          //       ]}
          //     />
          //   ),
          // },
        };

      case Slide.LAND_USE_ELECTRICITY_CONSUMPTION:
        return {
          [DataType.RESIDENTIAL]: {
            label: 'Electricity Consumption',
            icon: <CubeIcon />,
            legend: <Consumption />,
          },
          [DataType.COMMERCIAL]: {
            label: 'Electricity Consumption',
            icon: <CubeIcon />,
            legend: <Consumption />,
          },
          // [DataType.APARTMENTS]: {
          //   label: 'Electricity Consumption',
          //   icon: <CubeIcon />,
          //   legend: <Consumption />,
          // },
          // [DataType.VILLAS]: { label: 'Electricity Consumption', icon: <CubeIcon />, legend: <Consumption /> },
          // [DataType.SHOPS]: { label: 'Electricity Consumption', icon: <CubeIcon />, legend: <Consumption /> },
          // [DataType.OFFICES]: { label: 'Electricity Consumption', icon: <CubeIcon />, legend: <Consumption /> },
        };

      case Slide.LAND_USE_PLANNED_DEVELOPER:
      case Slide.LAND_USE_PLANNED_OFFICIAL:
        return {
          [DataType.LAND_USE_TYPE_ZONE]: {
            label: 'Land Use',
            icon: <PerspectiveIcon />,
            legend: (
              <WidgetBuilder
                items={[
                  {
                    label: 'GFA',
                    content: (
                      <GradientRange
                        gradient={{ from: '#00ac9e1A', to: '#00ac9eE6' }}
                        startLabel={`Low`}
                        endLabel={`High`}
                      />
                    ),
                  },
                ]}
              />
            ),
          },
        };

      case Slide.MOBILITY_TRIPS_INBOUND:
        return {
          [DataType.TRIPS]: {
            label: 'Inbound Trips',
            icon: <ArrowArcIcon style={{ transform: 'scaleX(-1)' }} />,
            legend: (
              <WidgetBuilder
                items={[{ label: 'Capacity', content: <DiskSize startLabel={`Low`} endLabel={`High`} /> }]}
              />
            ),
          },
        };

      case Slide.MOBILITY_TRIPS_OUTBOUND:
        return {
          [DataType.TRIPS]: {
            label: 'Outbound Trips',
            icon: <ArrowArcIcon />,
            legend: (
              <WidgetBuilder
                items={[{ label: 'Capacity', content: <DiskSize startLabel={`Low`} endLabel={`High`} /> }]}
              />
            ),
          },
        };

      case Slide.BUS_TRIPS_INBOUND:
        return {
          [DataType.END_TO_END_TRIPS_LOCATIONS]: {
            label: 'Inbound Trips',
            icon: <ArrowArcIcon style={{ transform: 'scaleX(-1)' }} />,
            legend: (
              <WidgetBuilder
                items={[
                  {
                    label: 'Trip Status',
                    content: (
                      <ColorBars
                        items={[
                          { label: 'Usual', color: '#00DAFE' },
                          { label: 'Unusual', color: '#EDC16B' },
                        ]}
                      />
                    ),
                  },
                  'divider',
                  {
                    label: 'Capacity',
                    content: <DiskSize startLabel={`Low`} endLabel={`High`} />,
                  },
                ]}
              />
            ),
          },
          [DataType.END_TO_END_TRIPS_BUS_STOPS]: {
            label: 'Inbound Trips',
            icon: <CubeIcon />,
            legend: (
              <WidgetBuilder
                items={[
                  {
                    label: 'Bus Stops',
                    content: (
                      <GradientRange
                        gradient={{ from: '#3a097bff', to: '#25c1e6ff' }}
                        startLabel={`Low`}
                        endLabel={`High`}
                      />
                    ),
                  },
                ]}
              />
            ),
          },
          [DataType.TRANSFERS_BUS_STOPS]: {
            label: 'Inbound Trips',
            icon: <CubeIcon />,
            legend: (
              <WidgetBuilder
                items={[
                  {
                    label: 'Bus Stops',
                    content: (
                      <GradientRange
                        gradient={{ from: '#3a097bff', to: '#25c1e6ff' }}
                        startLabel={`Low`}
                        endLabel={`High`}
                      />
                    ),
                  },
                ]}
              />
            ),
          },
        };

      case Slide.BUS_TRIPS_OUTBOUND:
        return {
          [DataType.END_TO_END_TRIPS_LOCATIONS]: {
            label: 'Inbound Trips',
            icon: <ArrowArcIcon style={{ transform: 'scaleX(-1)' }} />,
            legend: (
              <WidgetBuilder
                items={[
                  {
                    label: 'Trip Status',
                    content: (
                      <ColorBars
                        items={[
                          { label: 'Usual', color: '#00DAFE' },
                          { label: 'Unusual', color: '#EDC16B' },
                        ]}
                      />
                    ),
                  },
                  'divider',
                  {
                    label: 'Capacity',
                    content: <DiskSize startLabel={`Low`} endLabel={`High`} />,
                  },
                ]}
              />
            ),
          },
          [DataType.END_TO_END_TRIPS_BUS_STOPS]: {
            label: 'Inbound Trips',
            icon: <CubeIcon />,
            legend: (
              <WidgetBuilder
                items={[
                  {
                    label: 'Bus Stops',
                    content: (
                      <GradientRange
                        gradient={{ from: '#3a097bff', to: '#25c1e6ff' }}
                        startLabel={`Low`}
                        endLabel={`High`}
                      />
                    ),
                  },
                ]}
              />
            ),
          },
          [DataType.TRANSFERS_BUS_STOPS]: {
            label: 'Inbound Trips',
            icon: <CubeIcon />,
            legend: (
              <WidgetBuilder
                items={[
                  {
                    label: 'Bus Stops',
                    content: (
                      <GradientRange
                        gradient={{ from: '#3a097bff', to: '#25c1e6ff' }}
                        startLabel={`Low`}
                        endLabel={`High`}
                      />
                    ),
                  },
                ]}
              />
            ),
          },
        };

      case Slide.BUS_TRIPS_WITHIN:
        return {
          [DataType.BOARDING_BUS_STOPS]: {
            label: 'Ridership',
            icon: <CubeIcon />,
            legend: (
              <WidgetBuilder
                items={[
                  {
                    label: 'Bus Stops',
                    content: (
                      <GradientRange
                        gradient={{ from: '#3a097bff', to: '#25c1e6ff' }}
                        startLabel={`Low`}
                        endLabel={`High`}
                      />
                    ),
                  },
                ]}
              />
            ),
          },
          [DataType.ALIGHTINGS_BUS_STOPS]: {
            label: 'Ridership',
            icon: <CubeIcon />,
            legend: (
              <WidgetBuilder
                items={[
                  {
                    label: 'Bus Stops',
                    content: (
                      <GradientRange
                        gradient={{ from: '#3a097bff', to: '#25c1e6ff' }}
                        startLabel={`Low`}
                        endLabel={`High`}
                      />
                    ),
                  },
                ]}
              />
            ),
          },
          [DataType.TRANSFERS_BUS_STOPS]: {
            label: 'Ridership',
            icon: <CubeIcon />,
            legend: (
              <WidgetBuilder
                items={[
                  {
                    label: 'Bus Stops',
                    content: (
                      <GradientRange
                        gradient={{ from: '#3a097bff', to: '#25c1e6ff' }}
                        startLabel={`Low`}
                        endLabel={`High`}
                      />
                    ),
                  },
                ]}
              />
            ),
          },
        };

      case Slide.BUS_LINE_UTILIZATION:
        return {
          [DataType.TRANSIT_LINES_BOTH_DIRECTIONS]: {
            label: 'Bus Line Utilisation',
            icon: <BarChartIcon />,
            legend: (
              <WidgetBuilder
                items={[
                  {
                    label: 'VC',
                    content: (
                      <ColorRange
                        items={[
                          { label: '0.2', color: '#08641E' },
                          { label: '0.6', color: '#FEE400' },
                          { label: '0.8', color: '#F14646' },
                          { label: '1.0', color: '#721E1E' },
                        ]}
                      />
                    ),
                  },
                ]}
              />
            ),
          },
          [DataType.TRANSIT_LINES_DIRECTION_1]: {
            label: 'Bus Line Utilisation',
            icon: <BarChartIcon />,
            legend: (
              <WidgetBuilder
                items={[
                  {
                    label: 'VC',
                    content: (
                      <ColorRange
                        items={[
                          { label: '0.2', color: '#08641E' },
                          { label: '0.6', color: '#FEE400' },
                          { label: '0.8', color: '#F14646' },
                          { label: '1.0', color: '#721E1E' },
                        ]}
                      />
                    ),
                  },
                ]}
              />
            ),
          },
          [DataType.TRANSIT_LINES_DIRECTION_2]: {
            label: 'Bus Line Utilisation',
            icon: <BarChartIcon />,
            legend: (
              <WidgetBuilder
                items={[
                  {
                    label: 'VC',
                    content: (
                      <ColorRange
                        items={[
                          { label: '0.2', color: '#08641E' },
                          { label: '0.6', color: '#FEE400' },
                          { label: '0.8', color: '#F14646' },
                          { label: '1.0', color: '#721E1E' },
                        ]}
                      />
                    ),
                  },
                ]}
              />
            ),
          },
          [DataType.BUS_STOPS]: {
            label: 'Ridership',
            icon: <CubeIcon />,
            legend: (
              <WidgetBuilder
                items={[
                  {
                    label: 'Bus Stops',
                    content: (
                      <GradientRange
                        gradient={{ from: '#3a097bff', to: '#25c1e6ff' }}
                        startLabel={`Low`}
                        endLabel={`High`}
                      />
                    ),
                  },
                ]}
              />
            ),
          },
        };

      case Slide.TAXI_TRIPS_INBOUND:
        return {
          [DataType.TAXI_TRIPS]: {
            label: 'Inbound Trips',
            icon: <ArrowArcIcon style={{ transform: 'scaleX(-1)' }} />,
            legend: (
              <WidgetBuilder
                items={[
                  {
                    label: 'Trip Status',
                    content: (
                      <ColorBars
                        items={[
                          { label: 'Usual', color: '#00DAFE' },
                          { label: 'Unusual', color: '#EDC16B' },
                        ]}
                      />
                    ),
                  },
                  'divider',
                  { label: 'Capacity', content: <DiskSize startLabel={`Low`} endLabel={`High`} /> },
                ]}
              />
            ),
          },
        };

      case Slide.TAXI_TRIPS_OUTBOUND:
        return {
          [DataType.TAXI_TRIPS]: {
            label: 'Outbound Trips',
            icon: <ArrowArcIcon />,
            legend: (
              <WidgetBuilder
                items={[
                  {
                    label: 'Trip Status',
                    content: (
                      <ColorBars
                        items={[
                          { label: 'Usual', color: '#00DAFE' },
                          { label: 'Unusual', color: '#EDC16B' },
                        ]}
                      />
                    ),
                  },
                  'divider',
                  { label: 'Capacity', content: <DiskSize startLabel={`Low`} endLabel={`High`} /> },
                ]}
              />
            ),
          },
        };

      case Slide.TAXI_TRIPS_WITHIN:
        return {
          [DataType.PICKUPS]: {
            label: 'Ridership',
            icon: <CubeIcon />,
            legend: (
              <WidgetBuilder
                items={[
                  {
                    label: 'No of Trips',
                    content: (
                      <GradientRange
                        gradient={{ from: '#1520541A', to: '#00ac9eFF' }}
                        startLabel={`Low`}
                        endLabel={`High`}
                      />
                    ),
                  },
                ]}
              />
            ),
          },
          [DataType.DROPOFFS]: {
            label: 'Ridership',
            icon: <CubeIcon />,
            legend: (
              <WidgetBuilder
                items={[
                  {
                    label: 'No of Trips',
                    content: (
                      <GradientRange
                        gradient={{ from: '#1520541A', to: '#00ac9eFF' }}
                        startLabel={`Low`}
                        endLabel={`High`}
                      />
                    ),
                  },
                ]}
              />
            ),
          },
        };

      case Slide.STUDENTS_COUNT:
        return {
          [DataType.STUDENT_DENSITY]: {
            label: 'Student Density',
            icon: <CubeIcon />,
            legend: (
              <WidgetBuilder
                items={[
                  {
                    label: 'Student Density',
                    content: (
                      <GradientRange
                        gradient={{ from: '#1520541A', to: '#00ac9eFF' }}
                        startLabel={`Low`}
                        endLabel={`High`}
                      />
                    ),
                  },
                  {
                    label: 'Unusual',
                    content: <WarnYellowIcon />,
                  },
                ]}
              />
            ),
          },
          [DataType.STUDENT_PLACES]: {
            label: 'Student Places',
            icon: <CubeIcon />,
            legend: (
              <WidgetBuilder
                items={[
                  {
                    label: 'Places',
                    content: (
                      <GradientRange
                        gradient={{ from: '#1520541A', to: '#00ac9eFF' }}
                        startLabel={`Low`}
                        endLabel={`High`}
                      />
                    ),
                  },
                  {
                    label: 'Unusual',
                    content: <WarnYellowIcon />,
                  },
                ]}
              />
            ),
          },
        };

      case Slide.STUDENTS_TRIPS_INBOUND:
      case Slide.STUDENTS_TRIPS_OUTBOUND:
        return {
          [DataType.TRIPS]: {
            label: 'Trips',
            icon:
              slide === Slide.STUDENTS_TRIPS_INBOUND ? (
                <ArrowArcIcon style={{ transform: 'scaleX(-1)' }} />
              ) : (
                <ArrowArcIcon />
              ),
            legend: (
              <WidgetBuilder
                items={[
                  {
                    label: 'Trip Status',
                    content: (
                      <ColorBars
                        items={[
                          { label: 'Usual', color: '#00DAFE' },
                          { label: 'Unusual', color: '#EDC16B' },
                        ]}
                      />
                    ),
                  },
                  'divider',
                  { label: 'Capacity', content: <DiskSize startLabel={`Low`} endLabel={`High`} /> },
                ]}
              />
            ),
          },
        };

      case Slide.STUDENTS_TRIPS_WITHIN:
        return {
          [DataType.STUDENT_RESIDENCES]: {
            label: 'Student Residences',
            icon: <CubeIcon />,
            legend: (
              <WidgetBuilder
                items={[
                  {
                    label: 'No. of Trips',
                    content: (
                      <GradientRange
                        gradient={{ from: '#1520541A', to: '#00ac9eFF' }}
                        startLabel={`Low`}
                        endLabel={`High`}
                      />
                    ),
                  },
                  { label: 'Unusual', content: <WarnYellowIcon /> },
                ]}
              />
            ),
          },
          [DataType.STUDENT_LOCATIONS]: {
            label: 'School Locations',
            icon: <CubeIcon />,
            legend: (
              <WidgetBuilder
                items={[
                  {
                    label: 'No. of Trips',
                    content: (
                      <GradientRange
                        gradient={{ from: '#1520541A', to: '#00ac9eFF' }}
                        startLabel={`Low`}
                        endLabel={`High`}
                      />
                    ),
                  },
                  { label: 'Unusual', content: <WarnYellowIcon /> },
                ]}
              />
            ),
          },
        };

      case Slide.AVIATION_INBOUND:
        return {
          [DataType.AVIATION_TRANSFERS]: {
            label: 'Inbound Trips',
            icon: <ArrowArcIcon style={{ transform: 'scaleX(-1)' }} />,
            legend: (
              <WidgetBuilder
                items={[
                  {
                    label: 'Capacity',
                    content: <DiskSize startLabel={`Low`} endLabel={`High`} />,
                  },
                ]}
              />
            ),
          },
          [DataType.AVIATION_ARRIVALS]: {
            label: 'Inbound Trips',
            icon: <ArrowArcIcon style={{ transform: 'scaleX(-1)' }} />,
            legend: (
              <WidgetBuilder
                items={[
                  {
                    label: 'Capacity',
                    content: <DiskSize startLabel={`Low`} endLabel={`High`} />,
                  },
                ]}
              />
            ),
          },
        };

      case Slide.AVIATION_OUTBOUND:
        return {
          [DataType.AVIATION_TRANSFERS]: {
            label: 'Outbound Trips',
            icon: <ArrowArcIcon />,
            legend: (
              <WidgetBuilder
                items={[
                  {
                    label: 'Capacity',
                    content: <DiskSize startLabel={`Low`} endLabel={`High`} />,
                  },
                ]}
              />
            ),
          },
          [DataType.AVIATION_DEPARTURES]: {
            label: 'Outbound Trips',
            icon: <ArrowArcIcon />,
            legend: (
              <WidgetBuilder
                items={[
                  {
                    label: 'Capacity',
                    content: <DiskSize startLabel={`Low`} endLabel={`High`} />,
                  },
                ]}
              />
            ),
          },
        };

      case Slide.AVIATION_CONNECTIVITY:
        return {
          [DataType.AVIATION_CONNECTIVITY]: {
            label: 'Connectivity',
            icon: <CubeIcon />,
            legend: (
              <WidgetBuilder
                items={[
                  {
                    label: 'Connectivity',
                    content: (
                      <GradientRange
                        gradient={{ from: '#1520541A', to: '#00ac9eFF' }}
                        startLabel={`Low`}
                        endLabel={`High`}
                      />
                    ),
                  },
                ]}
              />
            ),
          },
        };

      case Slide.MARITIME_FACILITIES:
        return {
          [DataType.FACILITY_USAGE]: {
            label: 'Facility Usage',
            icon: <ArrowArcIcon />,
            legend: (
              <WidgetBuilder
                items={[
                  {
                    label: 'Density',
                    content: <DiskSize startLabel={`Low`} endLabel={`High`} />,
                  },
                ]}
              />
            ),
          },
        };

      case Slide.MARITIME_TRIPS:
        return {
          [DataType.VEHICLES_TRIPS]: {
            label: 'Trips',
            icon: <CubeIcon />,
            legend: (
              <WidgetBuilder
                items={[
                  {
                    label: 'Number of Trips',
                    content: (
                      <GradientRange
                        gradient={{ from: '#3a097bff', to: '#25c1e6ff' }}
                        startLabel={`Low`}
                        endLabel={`High`}
                      />
                    ),
                  },
                ]}
              />
            ),
          },
          [DataType.PASSENGER_TRIPS]: {
            label: 'Trips',
            icon: <CubeIcon />,
            legend: (
              <WidgetBuilder
                items={[
                  {
                    label: 'Number of Trips',
                    content: (
                      <GradientRange
                        gradient={{ from: '#3a097bff', to: '#25c1e6ff' }}
                        startLabel={`Low`}
                        endLabel={`High`}
                      />
                    ),
                  },
                ]}
              />
            ),
          },
        };

      case Slide.ROAD_TRAFFIC:
        return {
          [DataType.RELATIVE_SPEED]: {
            label: 'Road Traffic',
            icon: <BarChartIcon />,
            legend: (
              <WidgetBuilder
                items={[
                  {
                    label: 'Relative Speed',
                    content: (
                      <ColorRange
                        items={[
                          { label: '0.7', color: '#F14646' },
                          { label: '0.85', color: '#FEE400' },
                          { label: '1.0', color: '#08641E' },
                        ]}
                      />
                    ),
                  },
                  'divider',
                  {
                    label: 'Delay',
                    content: <HeightRange startLabel={`Low`} endLabel={`High`} />,
                  },
                  'divider',
                  {
                    label: 'Unusual',
                    content: <WarnYellowIcon />,
                  },
                ]}
              />
            ),
          },
          [DataType.SPEED]: {
            label: 'Road Traffic',
            icon: <BarChartIcon />,
            legend: (
              <WidgetBuilder
                items={[
                  {
                    label: 'Speed',
                    content: (
                      <ColorRange
                        items={[
                          { label: '120+', color: '#08641E' },
                          { label: '120-101', color: '#2CF65C' },
                          { label: '100-81', color: '#FEE400' },
                          { label: '80-61', color: '#F5B719' },
                          { label: '60-41', color: '#F14646' },
                          { label: '40-0', color: '#721E1E' },
                        ]}
                        multirow
                      />
                    ),
                  },
                  'divider',
                  {
                    label: 'Delay',
                    content: <HeightRange startLabel={`Low`} endLabel={`High`} />,
                  },
                  'divider',
                  {
                    label: 'Unusual',
                    content: <WarnYellowIcon />,
                  },
                ]}
              />
            ),
          },
          [DataType.DENSITY]: {
            label: 'Road Traffic',
            icon: <BarChartIcon />,
            legend: (
              <WidgetBuilder
                items={[
                  {
                    label: 'Density',
                    content: (
                      <ColorRange
                        items={[
                          { label: '0.2', color: '#4FD6FF' },
                          { label: '0.6', color: '#439FE5' },
                          { label: '0.9', color: '#3C83D9' },
                          { label: '1.0', color: '#304CBF' },
                        ]}
                      />
                    ),
                  },
                  'divider',
                  {
                    label: 'Delay',
                    content: <HeightRange startLabel={`Low`} endLabel={`High`} />,
                  },
                  'divider',
                  {
                    label: 'Unusual',
                    content: <WarnYellowIcon />,
                  },
                ]}
              />
            ),
          },
          [DataType.VOLUME]: {
            label: 'Road Traffic',
            icon: <BarChartIcon />,
            legend: (
              <WidgetBuilder
                items={[
                  {
                    label: 'Volume',
                    content: (
                      <GradientRange
                        gradient={{ from: '#3a097b', to: '#25c1e6' }}
                        startLabel={`Low`}
                        endLabel={`High`}
                      />
                    ),
                  },
                  'divider',
                  {
                    label: 'Delay',
                    content: <HeightRange startLabel={`Low`} endLabel={`High`} />,
                  },
                ]}
              />
            ),
          },
          [DataType.MOST_USED_ENTRY_POINTS]: {
            label: 'Entry Points',
            icon: <BarChartIcon />,
            legend: (
              <WidgetBuilder
                items={[
                  {
                    label: 'Ranking',
                    content: (
                      <GradientRange
                        gradient={{ from: '#3a097b', to: '#25c1e6' }}
                        startLabel={`Low`}
                        endLabel={`High`}
                      />
                    ),
                  },
                  {
                    label: 'Direction',
                    content: <FadeRange />,
                  },
                ]}
              />
            ),
          },
          [DataType.MOST_USED_EXIT_POINTS]: {
            label: 'Exit Points',
            icon: <BarChartIcon />,
            legend: (
              <WidgetBuilder
                items={[
                  {
                    label: 'Ranking',
                    content: (
                      <GradientRange
                        gradient={{ from: '#3a097b', to: '#25c1e6' }}
                        startLabel={`Low`}
                        endLabel={`High`}
                      />
                    ),
                  },
                  {
                    label: 'Direction',
                    content: <FadeRange />,
                  },
                ]}
              />
            ),
          },
        };
      case Slide.JUNCTIONS:
        return {
          [DataType.JUNCTION_LEVEL_OF_SERVICE]: {
            label: 'Junction Level of Service',
            icon: <DiskIcon />,
            legend: (
              <WidgetBuilder
                items={[
                  {
                    label: 'Delay Portion',
                    content: <DiskSize startLabel={`Low`} endLabel={`High`} />,
                  },
                  'divider',
                  {
                    label: 'LOS',
                    content: <BarsRange colors={['#2CF65C', '#F5B719', '#F14646']} startLabel={`A-D`} endLabel={`F`} />,
                  },
                  'divider',
                  {
                    label: 'Unusual',
                    content: <WarnYellowIcon />,
                  },
                ]}
              />
            ),
          },
        };
      case Slide.ACCIDENTS:
        return {
          [DataType.ACCIDENTS]: {
            label: 'Accidents',
            icon: <DiskIcon />,
            legend: (
              <WidgetBuilder
                items={[
                  {
                    label: 'Injury Level',
                    content: (
                      <ColorRange
                        items={[
                          { label: 'NONE', color: '#F1464633' },
                          { label: 'LOW', color: '#F1464666' },
                          { label: 'MED', color: '#F1464699' },
                          { label: 'HIGH', color: '#F14646CC' },
                          { label: 'FATAL', color: '#F14646' },
                        ]}
                      />
                    ),
                  },
                  {
                    label: 'People Affected',
                    content: <DiskSize startLabel={`Low`} endLabel={`High`} />,
                  },
                  {
                    label: 'Fatal',
                    content: <AlertIcon />,
                  },
                ]}
              />
            ),
          },
        };

      default:
        return {};
    }
  }, [slide]);

  return useMemo(() => new Map(Object.entries(config)), [config]);
};
