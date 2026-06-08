import { makeAutoObservable, reaction } from 'mobx';
import { DataType } from 'shared/constants/mapDataParams.ts';
import { Vector2, Vector3 } from 'three';

import { typesOfMostUsed } from '../../entities/dashboard/config';
import {
  fetchAccidentsTooltip,
  fetchBusUtilizationTooltip,
  fetchCongestionTooltip,
} from '../../entities/dashboard/services';
import { Slide } from '../../entities/dashboard/types';
import { AccidentData, AccidentTooltipData } from './3d/accidents/AccidentsDataTypes';
import { AviationConnectivityParamsData, AviationTransferDataType } from './3d/aviation/AviationDataTypes';
import {
  BusLineUtilizationParamsData,
  BusLocationParamsData,
  BusStopTooltipData,
  BusWithinParamsData,
  TaxiWithinTripsZone,
} from './3d/busAndTaxi/BusAndTaxiDataTypes';
import { CongestionParamsData, CongestionTooltipData } from './3d/congestion/data/CongestionDataTypes';
import { Fence } from './3d/congestion/data/Fence';
import { JunctionData, JunctionParamsData } from './3d/failingJunctions/JunctionDataTypes';
import {
  LandUseConsumptionPillarData,
  LandUseConsumptionPlotData,
  LandUseEducationData,
  LandUsePlotData,
  LandUseTooltipData,
  LandUseZoneData,
} from './3d/landUse/LandUseDataTypes';
import map3d from './3d/Map3d';
import MapUtils from './3d/MapUtils';
import { MaritimeFacilitiesDataType } from './3d/maritime/MaritimesTypes';
import { PopulationData, PopulationMoveParamsData, PopulationWithinData } from './3d/population/PopulationDataTypes';
import { IPeopleCountParamsData, PopulationCountZone } from './3d/populationCount/PopulationCountTypes';
import { StudentCountZone } from './3d/students/StudentsDataTypes';
import locationPanelStoreInstance from './locationPanelStore';
import mapDataValuesStoreInstance from './mapDataValuesStore';
import timeIntervalsStoreInstance from './timeIntervalsStore';

export enum InfoPopupIcon {
  None,
  WarnYellow,
  WarnRed,
}

export type InfoPopupInfo = {
  title: string;
  value?: string;
};

export class InfoPopupStore {
  constructor() {
    makeAutoObservable(this);

    reaction(
      () => locationPanelStoreInstance.isLocationPanelOpen,
      () => {
        this.isShown = false;
      }
    );

    reaction(
      () => mapDataValuesStoreInstance.dataType,
      () => {
        this.isShown = false;
      }
    );
  }

  private _data:
    | undefined
    | {
        slideGroup: 'main';
        slide: Slide.ROAD_TRAFFIC;
        param: CongestionParamsData;
        dataType: DataType;
        fence?: Fence;
        tooltipData?: CongestionTooltipData;
      }
    | {
        slideGroup: 'main';
        slide: Slide.BUS_LINE_UTILIZATION;
        dataType: DataType;
        fence?: Fence;
        tooltipData?: BusStopTooltipData;
        paramFence?: BusLineUtilizationParamsData;
        paramPillars?: BusWithinParamsData;
      }
    | { slideGroup: 'main'; slide: Slide.ACCIDENTS; accident: AccidentData; tooltipData?: AccidentTooltipData }
    | { slideGroup: 'main'; slide: Slide.JUNCTIONS; junction: JunctionData; param: JunctionParamsData }
    | { slideGroup: 'main'; slide: Slide.POPULATION_MOVEMENT_INBOUND; param: PopulationMoveParamsData }
    | {
        slideGroup: 'main';
        slide: Slide.POPULATION_MOVEMENT_WITHIN;
        dataType: DataType;
        population: PopulationData;
        tooltipData?: PopulationWithinData;
      }
    | {
        slideGroup: 'main';
        slide: Slide.POPULATION_COUNT;
        param: IPeopleCountParamsData;
        zone: PopulationCountZone;
      }
    | {
        slideGroup: 'main';
        slide: Slide.BUS_TRIPS_INBOUND;
        param: BusLocationParamsData;
      }
    | {
        slideGroup: 'main';
        slide: Slide.TAXI_TRIPS_WITHIN;
        param: IPeopleCountParamsData;
        zone: TaxiWithinTripsZone;
      }
    | {
        slideGroup: 'main';
        slide: Slide.BUS_TRIPS_WITHIN;
        dataType: DataType;
        param: BusWithinParamsData;
      }
    | {
        slideGroup: 'main';
        slide: Slide.LAND_USE_WATER_CONSUMPTION;
        paramPillar?: LandUseConsumptionPillarData;
        paramPlot?: LandUseConsumptionPlotData;
      }
    | {
        slideGroup: 'main';
        slide: Slide.LAND_USE_ELECTRICITY_CONSUMPTION;
        paramPillar?: LandUseConsumptionPillarData;
        paramPlot?: LandUseConsumptionPlotData;
      }
    | {
        slideGroup: 'landuse plot';
        slide: Slide;
        param: LandUsePlotData;
        tooltipData?: LandUseTooltipData;
      }
    | {
        slideGroup: 'main';
        slide: Slide.LAND_USE_EDUCATION;
        param: LandUseEducationData;
        tooltipData?: LandUseEducationData;
      }
    | { slideGroup: 'landuse zone'; slide: Slide; param: LandUseZoneData }
    | {
        slideGroup: 'main';
        slide: Slide.AVIATION_INBOUND;
        datatype: DataType.AVIATION_TRANSFERS | DataType.AVIATION_ARRIVALS | DataType.AVIATION_DEPARTURES;
        param: AviationTransferDataType;
      }
    | {
        slideGroup: 'main';
        slide: Slide.AVIATION_OUTBOUND;
        datatype: DataType.AVIATION_TRANSFERS | DataType.AVIATION_ARRIVALS | DataType.AVIATION_DEPARTURES;
        param: AviationTransferDataType;
      }
    | {
        slideGroup: 'main';
        slide: Slide.AVIATION_CONNECTIVITY;
        datatype: DataType.AVIATION_CONNECTIVITY;
        param: AviationConnectivityParamsData;
      }
    | {
        slideGroup: 'main';
        slide: Slide.MARITIME_FACILITIES;
        datatype: DataType.FACILITY_USAGE;
        param: MaritimeFacilitiesDataType;
      }
    | {
        slideGroup: 'main';
        slide: Slide.MARITIME_TRIPS;
        datatype: DataType.VEHICLES_TRIPS;
        param: MaritimeFacilitiesDataType;
      }
    | {
        slideGroup: 'main';
        slide: Slide.MARITIME_TRIPS;
        datatype: DataType.PASSENGER_TRIPS;
        param: MaritimeFacilitiesDataType;
      }
    | {
        slideGroup: 'main';
        slide: Slide.STUDENTS_TRIPS_WITHIN;
        datatype: DataType.STUDENT_RESIDENCES;
        param: StudentCountZone;
      }
    | {
        slideGroup: 'main';
        slide: Slide.STUDENTS_TRIPS_WITHIN;
        datatype: DataType.STUDENT_LOCATIONS;
        param: StudentCountZone;
      }
    | {
        slideGroup: 'main';
        slide: Slide.STUDENTS_COUNT_DENSITY;
        datatype: DataType.STUDENT_DENSITY;
        param: StudentCountZone;
      }
    | {
        slideGroup: 'main';
        slide: Slide.STUDENTS_COUNT_PLACES;
        datatype: DataType.STUDENT_PLACES;
        param: StudentCountZone;
      }
    | {
        slideGroup: 'main';
        slide: Slide.MOBILITY_TRIPS_INBOUND;
        param: PopulationMoveParamsData;
      };

  public get data() {
    return this._data;
  }
  public set data(value: typeof this._data) {
    this._data = value;
    this.loadTooltipData();
  }

  private async loadTooltipData() {
    this._isFetching = true;

    const { from, to } = mapDataValuesStoreInstance.getLastFinishedQuarter();

    if (this._data) {
      switch (this._data.slideGroup) {
        case 'main':
          switch (this._data.slide) {
            case Slide.ACCIDENTS:
              this._data.tooltipData = undefined;
              this._data.tooltipData = await fetchAccidentsTooltip(this._data.accident.accidentId);
              break;
            case Slide.BUS_LINE_UTILIZATION:
              if (this._data.dataType === DataType.BUS_STOPS && this._data.paramPillars) {
                this._data.tooltipData = undefined;
                this._data.tooltipData = await fetchBusUtilizationTooltip(
                  {
                    id: this._data.paramPillars.busStop.id,
                    startDate: from,
                    endDate: to,
                  },
                  timeIntervalsStoreInstance.activeIndex
                );
              }
              break;
            case Slide.ROAD_TRAFFIC:
              if (!typesOfMostUsed.includes(this._data.dataType)) {
                this._data.tooltipData = undefined;
                this._data.tooltipData = await fetchCongestionTooltip(
                  {
                    id: this._data.param.sensorId,
                    location: locationPanelStoreInstance.currentLocation,
                    startDate: from,
                    endDate: to,
                  },
                  timeIntervalsStoreInstance.activeIndex
                );
              }
              break;
          }
          break;
      }
    }
    this._isFetching = false;
  }

  private _isFetching = false;
  public get isFetching() {
    return this._isFetching;
  }

  private _isShown = false;
  public get isShown() {
    return (
      this._isShown &&
      !locationPanelStoreInstance.isLocationPanelOpen &&
      !mapDataValuesStoreInstance.isDateRangePanelOpen
    );
  }
  public set isShown(value) {
    this._isShown = value;
  }

  public get title(): string {
    if (this._data) {
      switch (this._data.slideGroup) {
        case 'main':
          switch (this._data.slide) {
            case Slide.AVIATION_CONNECTIVITY:
              return 'Connectivity';
            case Slide.STUDENTS_TRIPS_WITHIN:
              switch (this._data.datatype) {
                case DataType.STUDENT_RESIDENCES:
                  return 'Students Residence Location';
                case DataType.STUDENT_LOCATIONS:
                default:
                  return 'School Location';
              }
            case Slide.LAND_USE_EDUCATION:
              return 'Plot Details';
            case Slide.MARITIME_TRIPS:
              return 'Facility';
            case Slide.MARITIME_FACILITIES:
              return 'Facility';
            case Slide.ROAD_TRAFFIC:
              switch (this._data.dataType) {
                case DataType.MOST_USED_ENTRY_POINTS:
                  return 'Entry Point Details';
                case DataType.MOST_USED_EXIT_POINTS:
                  return 'Exit Point Details';
                default:
                  return this._data.param.recurrency == 2 ? 'Unusual Congestion' : 'Usual Congestion';
              }
            case Slide.ACCIDENTS:
              return 'Accident Details';
            case Slide.JUNCTIONS:
              return 'Junction Details';
            case Slide.POPULATION_MOVEMENT_INBOUND:
            case Slide.MOBILITY_TRIPS_INBOUND:
              return 'Trips';
            case Slide.POPULATION_COUNT:
              return 'Population Density';
            case Slide.POPULATION_MOVEMENT_WITHIN:
              if (this._data.dataType === DataType.ORIGIN) {
                return 'Origin';
              } else {
                return 'Destination';
              }
            case Slide.BUS_TRIPS_INBOUND:
              return 'End to End Trips';
            case Slide.TAXI_TRIPS_WITHIN:
              return this._data.param.differenceWithTypical == 0 ? 'Trips' : 'Non-Recurrent Trips';
            case Slide.BUS_TRIPS_WITHIN:
              switch (this._data.dataType) {
                case DataType.BOARDING_BUS_STOPS:
                  return this._data.param.differenceWithTypical == 0 ? 'Boardings' : 'Non-Recurrent Boardings';
                case DataType.ALIGHTINGS_BUS_STOPS:
                  return this._data.param.differenceWithTypical == 0 ? 'Alightings' : 'Non-Recurrent Alightings';
                case DataType.TRANSFERS_BUS_STOPS:
                  return this._data.param.differenceWithTypical == 0 ? 'Transfers' : 'Non-Recurrent Transfers';
              }
              return 'End To End Trips';

            case Slide.LAND_USE_WATER_CONSUMPTION:
            case Slide.LAND_USE_ELECTRICITY_CONSUMPTION:
              return 'Plot Details';
            case Slide.AVIATION_INBOUND:
              switch (this._data.datatype) {
                case DataType.AVIATION_TRANSFERS:
                  return 'Inbound Transfers';
                case DataType.AVIATION_ARRIVALS:
                default:
                  return 'Origin';
              }
            case Slide.AVIATION_OUTBOUND:
              switch (this._data.datatype) {
                case DataType.AVIATION_TRANSFERS:
                  return 'Outbound Transfers';
                case DataType.AVIATION_DEPARTURES:
                default:
                  return 'Destination';
              }
            case Slide.BUS_LINE_UTILIZATION:
              if (this._data.dataType === DataType.BUS_STOPS) {
                return 'Bus Stops';
              }
              return 'Line Utilisation Details';
            case Slide.STUDENTS_COUNT_DENSITY:
              return 'Students Density';
            case Slide.STUDENTS_COUNT_PLACES:
              return 'Students Places';
          }
        case 'landuse plot':
          return 'Plot Details';
        case 'landuse zone':
          return 'Zone Details';
      }
    }
    return 'Title test';
  }

  public get icon(): InfoPopupIcon {
    if (this._data) {
      switch (this._data.slideGroup) {
        case 'main':
          switch (this._data.slide) {
            case Slide.ROAD_TRAFFIC:
              return this._data.param.recurrency == 2 ? InfoPopupIcon.WarnYellow : InfoPopupIcon.None;
            case Slide.ACCIDENTS:
              return InfoPopupIcon.WarnRed;
            case Slide.JUNCTIONS:
              return InfoPopupIcon.WarnYellow;
            case Slide.POPULATION_MOVEMENT_INBOUND:
              return this._data.param.recurrency == 2 ? InfoPopupIcon.WarnYellow : InfoPopupIcon.None;
            case Slide.POPULATION_COUNT:
              return InfoPopupIcon.None;
          }
      }
    }
    return InfoPopupIcon.None;
  }

  public get info(): InfoPopupInfo[] {
    if (this._data) {
      switch (this._data.slideGroup) {
        case 'main':
          switch (this._data.slide) {
            case Slide.ROAD_TRAFFIC:
              if (typesOfMostUsed.includes(this._data.dataType)) {
                return [
                  {
                    title: 'Road',
                    value: `${this._data.param.streetName ?? '—'}`,
                  },
                ];
              } else {
                return [
                  {
                    title: 'Delay Time',
                    value: this._data.tooltipData && `${(this._data.tooltipData.delayTime ?? 0).toFixed(2)} Seconds`,
                  },
                  {
                    title: 'Delay Cost',
                    value: this._data.tooltipData && `${(this._data.tooltipData.delayCost ?? 0).toFixed(2)} AED/Hour`,
                  },
                  ...(this._data.param.recurrency != 2
                    ? [
                        {
                          title: 'No. of Lanes',
                          value: this._data.tooltipData && `${this._data.tooltipData.lanes ?? 0}`,
                        },
                        {
                          title: 'Relative Speed',
                          value:
                            this._data.tooltipData &&
                            `${((this._data.tooltipData.speed ?? 0) / (this._data.fence!.speed ?? 1)).toFixed(2)}`,
                        },
                        {
                          title: 'Speed',
                          value:
                            this._data.tooltipData && `${(this._data.tooltipData.speed ?? 0).toFixed(2) ?? 0} km/h`,
                        },
                        {
                          title: 'Volume',
                          value: this._data.tooltipData && `${(this._data.tooltipData.volume ?? 0).toFixed(2) ?? 0}`,
                        },
                        {
                          title: 'Density',
                          value:
                            this._data.tooltipData &&
                            `${(this._data.tooltipData.density ?? 0).toFixed(2) ?? 0 / this._data.fence!.capacity}`,
                        },
                      ]
                    : []),
                ];
              }
            case Slide.ACCIDENTS:
              return [
                {
                  title: 'Whereabout',
                  value: this._data.tooltipData?.whereabout && `${this._data.tooltipData.whereabout}`,
                },
                {
                  title: 'No. Of Affected',
                  value: this._data.tooltipData?.noOfAffected ? `${this._data.tooltipData.noOfAffected}` : '',
                },
                {
                  title: 'Injury Type',
                  value: this._data.tooltipData?.injuryType && `${this._data.tooltipData.injuryType}`,
                },
                {
                  title: 'Description',
                  value: this._data.tooltipData?.description && `${this._data.tooltipData.description}`,
                },
              ];
            case Slide.JUNCTIONS:
              return [
                { title: 'Junction name', value: `${this._data.junction.i}` },
                { title: 'LOS Ranking', value: `${this._data.param.serviceLevel}` },
                { title: 'Delay', value: `${this._data.param.delay.toFixed(2)} Seconds` },
              ];
            case Slide.POPULATION_MOVEMENT_INBOUND:
              return [
                { title: 'From', value: `${this._data.param.from}` },
                { title: 'To', value: `${this._data.param.to}` },
                { title: 'No. of Trips', value: `${Math.round(this._data.param.peopleCount)}` },
              ];

            case Slide.MOBILITY_TRIPS_INBOUND:
              return [
                { title: 'From', value: `${this._data.param.from}` },
                { title: 'To', value: `${this._data.param.to}` },
                { title: 'No. of Trips', value: `${Math.round(this._data.param.count ?? 0)}` },
              ];

            case Slide.POPULATION_MOVEMENT_WITHIN:
              return [
                { title: 'Location', value: this._data.tooltipData && `${this._data.tooltipData?.location}` },
                {
                  title: 'No. of Trips',
                  value: this._data.tooltipData && `${this._data.tooltipData?.peopleCount}`,
                },
              ];
            case Slide.STUDENTS_TRIPS_WITHIN:
              return [
                {
                  title: 'Location',
                  value: `${this._data.param.countParamsData.locationType} - ${this._data.param.countParamsData.location}`,
                },
                {
                  title: 'No. of Trips',
                  value: `${Math.round(this._data.param.countParamsData.count)}`,
                },
              ];

            case Slide.POPULATION_COUNT:
              return [
                { title: 'Location', value: `${this._data.param.locationType} ${this._data.param.location}` },
                {
                  title: 'Density',
                  value: `${(this._data.param.peopleCount / this._data.zone.location.area).toFixed(2)} / km²`,
                },
              ];
            case Slide.LAND_USE_WATER_CONSUMPTION:
              return [
                { title: 'Sector', value: `${this._data.paramPillar?.sectorName ?? this._data.paramPlot?.sectorName}` },
                { title: 'Plot Name', value: `${this._data.paramPillar?.plotName ?? this._data.paramPlot?.plotName}` },
                {
                  title: 'Water Consumption',
                  value: `${(this._data.paramPillar?.value ?? 0).toFixed(2) ?? (this._data.paramPlot?.value ?? 0).toFixed(2)} m³`,
                },
              ];
            case Slide.LAND_USE_ELECTRICITY_CONSUMPTION:
              return [
                { title: 'Sector', value: `${this._data.paramPillar?.sectorName ?? this._data.paramPlot?.sectorName}` },
                { title: 'Plot Name', value: `${this._data.paramPillar?.plotName ?? this._data.paramPlot?.plotName}` },
                {
                  title: 'Electricity Consumption',
                  value: `${(this._data.paramPillar?.value ?? 0).toFixed(2) ?? (this._data.paramPlot?.value ?? 0).toFixed(2)} Kwh`,
                },
              ];
            case Slide.AVIATION_INBOUND:
              return [
                { title: 'Origin Country', value: `${this._data.param.country}` },
                { title: 'Number of Trips', value: `${Math.round(this._data.param.count)} Trips` },
                { title: 'Average Load Factor', value: `${Math.round(this._data.param.loadFactor)}%` },
              ];

            case Slide.AVIATION_OUTBOUND:
              return [
                { title: 'Destination Country', value: `${this._data.param.country}` },
                { title: 'Number of Trips', value: `${Math.round(this._data.param.count)} Trips` },
                { title: 'Average Load Factor', value: `${Math.round(this._data.param.loadFactor)}%` },
              ];

            case Slide.AVIATION_CONNECTIVITY:
              return [
                { title: 'Country', value: `${this._data.param.country}` },
                { title: 'Count', value: `${this._data.param.count}` },
              ];
            case Slide.MARITIME_FACILITIES:
              return [
                { title: 'Facility Name', value: `${this._data.param.harbourName}` },
                { title: 'Number Of Usage', value: `${this._data.param.tripsCount}` },
              ];
            case Slide.MARITIME_TRIPS:
              return [
                { title: 'Facility Name', value: `${this._data.param.harbourName}` },
                { title: 'Number Of Trips', value: `${this._data.param.tripsCount}` },
              ];
            case Slide.BUS_LINE_UTILIZATION:
              if (this._data.dataType === DataType.BUS_STOPS) {
                return [
                  { title: 'Bus Stop', value: this._data.tooltipData && `${this._data.tooltipData?.stopName}` },
                  {
                    title: 'Share of Congested Trips',
                    value:
                      this._data.tooltipData && `${(this._data.tooltipData?.shareOfCongestedTrips ?? 0).toFixed(2)}%`,
                  },
                ];
              }
              return [
                { title: 'No. of Lines', value: `${this._data.paramFence?.count ?? 1}` },
                { title: '% AVG Load Factor', value: `${(this._data.paramFence?.loadFactor ?? 0).toFixed(2)}` },
                { title: 'Occupancy (Avg. No. of riders)', value: `${this._data.paramFence?.passengers}` },
              ];
            case Slide.BUS_TRIPS_INBOUND:
              return [
                { title: 'From', value: `${this._data.param.from}` },
                { title: 'To', value: `${this._data.param.to}` },
                { title: 'No. of Trips', value: `${Math.round(this._data.param.count)}` },
              ];
            case Slide.TAXI_TRIPS_WITHIN:
              return this._data.param.differenceWithTypical === 0
                ? [
                    {
                      title: 'Location',
                      value: `${this._data.zone.location.locationType} - ${this._data.zone.location.location}`,
                    },
                    { title: 'No. of Trips', value: `${Math.round(this._data.param.peopleCount)}` },
                  ]
                : [
                    {
                      title: 'Location',
                      value: `${this._data.zone.location.locationType} - ${this._data.zone.location.location}`,
                    },
                    { title: 'No. of Trips', value: `${Math.round(this._data.param.peopleCount)}` },
                    {
                      title: `${this._data.param.differenceWithTypical < 0 ? 'Less' : 'More'} than Typical`,
                      value: `${Math.round(this._data.param.differenceWithTypical)}%`,
                    },
                  ];
            case Slide.BUS_TRIPS_WITHIN:
              const dataType = (() => {
                switch (this._data.dataType) {
                  case DataType.BOARDING_BUS_STOPS:
                    return 'Boardings';
                  case DataType.TRANSFERS_BUS_STOPS:
                    return 'Transfers';
                  case DataType.ALIGHTINGS_BUS_STOPS:
                    return 'Alightings';

                  default:
                    return 'Trips';
                }
              })();
              return this._data.param.differenceWithTypical === 0
                ? [
                    {
                      title: 'Bus Stop',
                      value: `${this._data.param.busStop.name}`,
                    },
                    {
                      title: `No. of ${dataType}`,
                      value: `${Math.round(this._data.param.count)}`,
                    },
                  ]
                : [
                    { title: 'Bus Stop', value: `${this._data.param.busStop.name}` },
                    {
                      title: `No. of ${dataType}`,
                      value: `${Math.round(this._data.param.count)}`,
                    },
                    {
                      title: `${this._data.param.differenceWithTypical < 0 ? 'Less' : 'More'} than Typical`,
                      value: `${Math.round(this._data.param.differenceWithTypical)}%`,
                    },
                  ];
            case Slide.STUDENTS_COUNT_DENSITY:
              return [
                {
                  title: 'Location',
                  value: `${this._data.param.countParamsData.locationType} - ${this._data.param.countParamsData.location}`,
                },
                { title: 'Density', value: `${this._data.param.countParamsData.count}` },
              ];
            case Slide.STUDENTS_COUNT_PLACES:
              return [
                {
                  title: 'Location',
                  value: `${this._data.param.countParamsData.locationType} - ${this._data.param.countParamsData.location}`,
                },
                { title: 'No. of Student Places', value: `${this._data.param.countParamsData.count}` },
              ];
            case Slide.LAND_USE_EDUCATION:
              return [
                {
                  title: 'School',
                  value: `${this._data.tooltipData?.school}`,
                },
                {
                  title: 'Type',
                  value: `${this._data.tooltipData?.type}`,
                },
                { title: 'No. of Students', value: `${this._data.tooltipData?.noOfStudents}` },
                {
                  title: 'No. of Staff',
                  value: `${this._data.tooltipData?.noOfStaff}`,
                },
              ];
          }
        case 'landuse plot':
          return [
            { title: 'Sector', value: this._data.tooltipData && `${this._data.tooltipData.sector}` },
            { title: 'Plot Name/Number', value: this._data.tooltipData && `${this._data.tooltipData.plotName}` },
          ];
        case 'landuse zone':
          return [
            { title: 'District', value: `${this._data.param.district}` },
            { title: 'Zone Name/Number', value: `${this._data.param.zone}` },
            { title: 'GFA', value: `${this._data.param.gfa}` },
          ];
      }
    }
    return [
      { title: 'Info test 1', value: '100 km' },
      { title: 'Info test 2', value: '+20%' },
    ];
  }

  private _worldPosition = new Vector3();
  public get worldPosition() {
    return this._worldPosition;
  }
  public set worldPosition(value) {
    this._worldPosition = value;
  }

  public get screenPosition(): Vector2 {
    if (map3d.mapbox) {
      // tap this observable to depend this computable on it
      map3d.cameraUpdateFrames;
      const canvas: HTMLCanvasElement = map3d.mapbox.getCanvas();
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      return MapUtils.worldToScreen(this._worldPosition, map3d.camera, width, height);
    } else {
      return new Vector2();
    }
  }
}

const infoPopupStoreInstance = new InfoPopupStore();
export default infoPopupStoreInstance;
