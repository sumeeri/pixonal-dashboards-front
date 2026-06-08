import { Accordion, AccordionDetails, AccordionSummary, Box } from '@mui/material';
import assign from 'lodash/assign';
import clone from 'lodash/clone';
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useState } from 'react';

import { aviationConnectivityTimeIntervalData } from '../../../../public/mock/aviationConnectivityTimeintervalData.ts';
import { aviationTimeIntervalData } from '../../../../public/mock/aviationTimeIntervalData.ts';
import { busAndTripsTimeIntervalData } from '../../../../public/mock/busAndTripsTimeIntervalData.ts';
import { busUtilizationTimeIntervalData } from '../../../../public/mock/busUtilizationTimeIntervalData.ts';
import { maritimeFacilitiesTimeintervalData } from '../../../../public/mock/maritimeFacilitiesTimeintervalData.ts';
import { simpleAccidentsTimeIntervalData } from '../../../../public/mock/simpleAccidentsTimeIntervalData.ts';
import { simpleConsumptionTimeIntervalData } from '../../../../public/mock/simpleConsumptionTimeIntervalData.ts';
import { simpleJunctionsTimeIntervalData } from '../../../../public/mock/simpleJunctionsTimeIntervalData.ts';
import { simplePopulationCountTimeIntervalData } from '../../../../public/mock/simplePopulationCountTimeIntervalData.ts';
import { simpleTimeIntervalData } from '../../../../public/mock/simpleTimeIntervalData.ts';
import { simpleTwoHourRangeTimeIntervalData } from '../../../../public/mock/simpleTwoHourRangeTimeIntervalData.ts';
import { taxiAndTripsTimeIntervalData } from '../../../../public/mock/taxiAndTripsTimeIntervalData.ts';
import { useStore } from '../../../app/providers/storeProvider/StoreProvider.tsx';
import mapDataValuesStoreInstance from '../../../app/stores/mapDataValuesStore.ts';
import { typesOfMostUsed } from '../../../entities/dashboard/config.ts';
import { DataForTimeInterval, Slide } from '../../../entities/dashboard/types.ts';
import CustomLineChart from '../../../features/CustomLineChart/CustomLineChart.tsx';
import { Summary } from '../../../features/timeIntervalsAccordion/summary/Summary.tsx';

const step = 0.01;

export const HoursIntervalsControlPanel = observer(() => {
  const { slidesStore, current3DStore } = useStore();
  const { currentSlide, isTimeIntervalExpanded } = slidesStore;
  const { timelineData } = current3DStore;

  const [assignedData, setAssignedData] = useState<DataForTimeInterval | null>();

  const data: DataForTimeInterval | null = useMemo(() => {
    switch (currentSlide) {
      case Slide.ROAD_TRAFFIC: {
        if (typesOfMostUsed.includes(mapDataValuesStoreInstance.dataType!)) {
          return null;
        }
        return simpleTimeIntervalData;
      }
      case Slide.JUNCTIONS:
        return simpleJunctionsTimeIntervalData;

      case Slide.ACCIDENTS:
        return simpleAccidentsTimeIntervalData;

      case Slide.POPULATION_COUNT:
        return simplePopulationCountTimeIntervalData;

      case Slide.POPULATION_MOVEMENT_INBOUND:
        return simpleTwoHourRangeTimeIntervalData;

      case Slide.POPULATION_MOVEMENT_OUTBOUND:
        return simpleTwoHourRangeTimeIntervalData;

      case Slide.POPULATION_MOVEMENT_WITHIN:
        return simpleTwoHourRangeTimeIntervalData;

      case Slide.LAND_USE_WATER_CONSUMPTION:
        return simpleConsumptionTimeIntervalData;

      case Slide.LAND_USE_ELECTRICITY_CONSUMPTION:
        return simpleConsumptionTimeIntervalData;

      case Slide.STUDENTS_TRIPS_INBOUND:
      case Slide.STUDENTS_TRIPS_OUTBOUND:
      case Slide.STUDENTS_TRIPS_WITHIN:
      case Slide.AVIATION_INBOUND:
      case Slide.AVIATION_OUTBOUND:
      case Slide.MARITIME_TRIPS:
        return aviationTimeIntervalData;

      case Slide.AVIATION_CONNECTIVITY:
        return aviationConnectivityTimeIntervalData;

      case Slide.MARITIME_FACILITIES:
        return maritimeFacilitiesTimeintervalData;

      case Slide.TAXI_TRIPS_INBOUND:
      case Slide.TAXI_TRIPS_OUTBOUND:
      case Slide.TAXI_TRIPS_WITHIN:
        return taxiAndTripsTimeIntervalData;

      case Slide.BUS_TRIPS_INBOUND:
      case Slide.BUS_TRIPS_OUTBOUND:
      case Slide.BUS_TRIPS_WITHIN:
        return busAndTripsTimeIntervalData;

      case Slide.BUS_LINE_UTILIZATION:
        return busUtilizationTimeIntervalData;

      default:
        return null;
    }
  }, [currentSlide, mapDataValuesStoreInstance.dataType]);

  useEffect(() => {
    if (!assignedData && !timelineData) {
      setAssignedData(data);
    }

    if (timelineData) {
      setAssignedData(assign(clone(data), timelineData));
    }
  }, [data, timelineData]);

  if (!assignedData || !data) return null;

  return (
    <Box flex="1" id="interval">
      <Accordion
        style={{ pointerEvents: 'all' }}
        expanded={isTimeIntervalExpanded}
        slotProps={{ transition: { unmountOnExit: true } }}
      >
        <AccordionSummary>
          <Summary data={assignedData} step={step} isExpanded={isTimeIntervalExpanded} />
        </AccordionSummary>
        <AccordionDetails>
          <CustomLineChart timePointsData={assignedData} step={step} height={165} />
        </AccordionDetails>
      </Accordion>
      {/* {screenshotStore.isModalOpen && <ScreenshotModal />} */}
    </Box>
  );
});
