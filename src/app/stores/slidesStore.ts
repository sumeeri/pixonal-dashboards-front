import { action, makeObservable, observable, reaction, runInAction } from 'mobx';
import { DataType, mapDataHorizons, mobilityTripsHorizons } from 'shared/constants/mapDataParams.ts';

import {
  inaccessibleSlidesForEmirates,
  inaccessibleSlidesForZonesWhileSwitching,
  patternTypeForSlide,
  populationMovementSlides,
} from '../../entities/dashboard/config.ts';
import { HorizonValue, Periods, Slide, TimelineAggregation, TrafficSlides, ValuesTypes } from '../../entities/dashboard/types.ts';
import { DEFAULT_DATA_TYPE_CONFIG } from '../../entities/dataType/config.ts';
import { LocationAndLocationType, LocationType } from '../../entities/locationPanel/types.ts';
import { ConsumptionGood } from './3d/landUse/LandUseDataTypes.ts';
import map3d from './3d/Map3d.ts';
import Accidents3DSlide from './3d/slides/Accidents3DSlide.ts';
import AviationConnectivity3DSlide from './3d/slides/AviationConnectivity3DSlide.ts';
import AviationTransfer3DSlide from './3d/slides/AviationTransfer3DSlide.ts';
import BusAndTaxiTrips3DSlide from './3d/slides/BusAndTaxiTrips3DSlide.ts';
import BusAndTaxiTripsWithin3DSlide from './3d/slides/BusAndTaxiTripsWithin3DSlide.ts';
import BusLine3DSlide from './3d/slides/BusLine3DSlide.ts';
import Congestion3DSlide from './3d/slides/Congestion3DSlide.ts';
import Empty3DSlide from './3d/slides/Empty3DSlide.ts';
import { I3DSlide } from './3d/slides/I3DSlide.ts';
import Junctions3DSlide from './3d/slides/Junctions3DSlide.ts';
import LandUseConsumptionPillar3DSlide from './3d/slides/LandUseConsumptionPillar3DSlide.ts';
import LandUsePlots3DSlide from './3d/slides/LandUsePlots3DSlide.ts';
import MaritimeFacilities3DSlide from './3d/slides/MaritimeFacilities3DSlide.ts';
import MaritimeTrips3DSlide from './3d/slides/MaritimeTrips3DSlide.ts';
import PopulationCount3DSlide from './3d/slides/PopulationCount3DSlide.ts';
import PopulationMovement3DSlide from './3d/slides/PopulationMovement3DSlide.ts';
import PopulationMovementWithin3DSlide from './3d/slides/PopulationMovementWithin3DSlide.ts';
import StudentsCount3DSlide from './3d/slides/StudentsCount3DSlide.ts';
import accidents3DStoreInstance from './3d/stores/Accidents3DStore.ts';
import aviationConnectivity3DStoreInstance from './3d/stores/AviationConnectivity3DStore.ts';
import aviationTransfer3DStoreInstance from './3d/stores/AviationTransfer3DStore.ts';
import busAndTaxiLocations3DStoreInstance from './3d/stores/BusAndTaxiLocations3DStore.ts';
import busLineUtilizationStoreInstance from './3d/stores/BusLineUtilizationStore.ts';
import busStops3DStoreInstance from './3d/stores/BusStops3DStore.ts';
import congestion3DStoreInstance from './3d/stores/Congestion3DStore.ts';
import current3DStoreInstance from './3d/stores/Current3DStore.ts';
import junctions3DStoreInstance from './3d/stores/Junctions3DStore.ts';
import landUseConsumptionPillar3DStoreInstance from './3d/stores/LandUseConsumptionPillar3DStore.ts';
import landUseConsumptionPlot3DStoreInstance from './3d/stores/LandUseConsumptionPlot3DStore.ts';
import landUsePlots3DStoreInstance from './3d/stores/LandUsePlots3DStore.ts';
import landUseZones3DStoreInstance from './3d/stores/LandUseZones3DStore.ts';
import maritimeFacilities3DStoreInstance from './3d/stores/MaritimeFacilities3DStore.ts';
import maritimeTrips3DStoreInstance from './3d/stores/MaritimeTrips3DStore.ts';
import populationCount3DStoreInstance from './3d/stores/PopulationCount3DStore.ts';
import populationMovement3DStoreInstance from './3d/stores/PopulationMovement3DStore.ts';
import populationMovementWithin3DStoreInstance from './3d/stores/PopulationMovementWithin3DStore.ts';
import studentsCount3DStoreInstance from './3d/stores/StudentsCount3DStore.ts';
import busAndTaxiTripsWithin3DStoreInstance from './3d/stores/TaxiTripsWithin3DStore.ts';
import zones3DStoreInstance from './3d/stores/Zones3DStore.ts';
import abortControllerStoreInstance from './AbortControllerStore.ts';
import contentLoadStoreInstance from './contentLoadStore.ts';
import locationPanelStoreInstance from './locationPanelStore.ts';
import mapDataValuesStoreInstance from './mapDataValuesStore.ts';
import patternsStoreInstance from './patternsStore.ts';
import timeIntervalsStoreInstance from './timeIntervalsStore.ts';

export class SlidesStore {
  isStoriesOpen = false;
  currentSlide?: Slide;
  isTimeIntervalExpanded = false;
  isMapDataExpanded = true;
  isExploreDataOpen = false;

  private congestion3DSlide?: I3DSlide;
  private failingJunctions3DSlide?: I3DSlide;
  private accidents3DSlide?: I3DSlide;

  constructor() {
    makeObservable(this, {
      currentSlide: observable,
      isStoriesOpen: observable,
      isTimeIntervalExpanded: observable,
      isMapDataExpanded: observable,
      isExploreDataOpen: observable,
      setCurrentSlide: action,
      setIsStoriesOpen: action,
      setIsTimeIntervalExpanded: action,
      setIsMapDataExpanded: action,
      setIsExploreDataOpen: action,
    });

    reaction(
      () => mapDataValuesStoreInstance.dataType,
      () => {
        if (this.currentSlide === Slide.STUDENTS_COUNT) {
          mapDataValuesStoreInstance.setAllowedTimeTypes(this.getAllowedTimeTypes());
        }
      }
    );
  }

  isLocationTypeInaccessibleInCurrentSlide(locationType: LocationType, nextSlide?: Slide) {
    if (slidesStoreInstance) {
      switch (locationType) {
        case LocationType.EMIRATE:
          return inaccessibleSlidesForEmirates.includes(nextSlide!);

        case LocationType.ZONE:
          return inaccessibleSlidesForZonesWhileSwitching.includes(nextSlide!);

        case LocationType.CORRIDOR:
        case LocationType.ALL_LOCATIONS:
          return nextSlide !== Slide.ROAD_TRAFFIC;

        case LocationType.REGION:
        default:
          return false;
      }
    }
  }

  getCurrentPeriod(slide?: Slide) {
    switch (slide ?? this.currentSlide) {
      case Slide.AVIATION_INBOUND:
      case Slide.AVIATION_OUTBOUND:
      case Slide.AVIATION_CONNECTIVITY:
      case Slide.MARITIME_FACILITIES:
      case Slide.MARITIME_TRIPS:
      case Slide.LAND_USE_WATER_CONSUMPTION:
      case Slide.LAND_USE_ELECTRICITY_CONSUMPTION:
        return Periods.Months;
      case Slide.SUMMARY:
      case Slide.MOBILITY_TRIPS_INBOUND:
      case Slide.MOBILITY_TRIPS_OUTBOUND:
      case Slide.LAND_USE_RESIDENTIAL:
      case Slide.LAND_USE_RETAIL:
      case Slide.LAND_USE_OFFICES:
      case Slide.LAND_USE_EDUCATION:
      case Slide.LAND_USE_INDUSTRY:
      case Slide.LAND_USE_MEDICAL:
      case Slide.LAND_USE_HOSPITALITY:
      case Slide.LAND_USE_OTHERS:
      case Slide.LAND_USE_PLANNED_OFFICIAL:
      case Slide.LAND_USE_PLANNED_DEVELOPER:
        return Periods.Horizons;

      default:
        return Periods.Days;
    }
  }

  getDefaultPeriod(slide: Slide) {
    switch (slide) {
      case Slide.POPULATION_COUNT:
      case Slide.PEOPLE_BEHAVIOR_OVERVIEW:
        return { from: new Date(2025, 0, 1), to: new Date(2025, 2, 31) };
      case Slide.AVIATION_INBOUND:
      case Slide.AVIATION_OUTBOUND:
      case Slide.AVIATION_CONNECTIVITY:
      case Slide.MARITIME_TRIPS:
      case Slide.MARITIME_FACILITIES:
      case Slide.MOBILITY_OVERVIEW:
        return { from: new Date(2024, 3, 1), to: new Date(2024, 5, 30) };
      default:
        const defaultPeriod = mapDataValuesStoreInstance.getLastFinishedQuarter(true);
        return defaultPeriod;
    }
  }

  getAllowedTimeTypes() {
    switch (this.currentSlide) {
      case Slide.PEOPLE_BEHAVIOR_OVERVIEW:
      case Slide.LAND_USE_OVERVIEW:
      case Slide.MOBILITY_OVERVIEW:
      case Slide.STUDENTS_TRIPS_INBOUND:
      case Slide.STUDENTS_TRIPS_OUTBOUND:
      case Slide.STUDENTS_TRIPS_WITHIN:
      case Slide.AVIATION_INBOUND:
      case Slide.AVIATION_OUTBOUND:
      case Slide.AVIATION_CONNECTIVITY:
      case Slide.MARITIME_FACILITIES:
      case Slide.MARITIME_TRIPS:
      case Slide.LAND_USE_WATER_CONSUMPTION:
      case Slide.LAND_USE_ELECTRICITY_CONSUMPTION:
      case Slide.TRAFFIC_OVERVIEW:
      case Slide.JUNCTIONS:
      case Slide.ACCIDENTS:
        return [ValuesTypes.RANGE];

      case Slide.POPULATION_COUNT:
      case Slide.POPULATION_MOVEMENT_INBOUND:
      case Slide.POPULATION_MOVEMENT_OUTBOUND:
      case Slide.POPULATION_MOVEMENT_WITHIN:
      case Slide.BUS_TRIPS_INBOUND:
      case Slide.BUS_TRIPS_OUTBOUND:
      case Slide.BUS_TRIPS_WITHIN:
      case Slide.BUS_LINE_UTILIZATION:
      case Slide.TAXI_TRIPS_INBOUND:
      case Slide.TAXI_TRIPS_OUTBOUND:
      case Slide.TAXI_TRIPS_WITHIN:
      case Slide.ROAD_TRAFFIC:
        return [ValuesTypes.RANGE, ValuesTypes.PATTERN];

      case Slide.SUMMARY:
      case Slide.MOBILITY_TRIPS_INBOUND:
      case Slide.MOBILITY_TRIPS_OUTBOUND:
      case Slide.LAND_USE_RESIDENTIAL:
      case Slide.LAND_USE_RETAIL:
      case Slide.LAND_USE_OFFICES:
      case Slide.LAND_USE_EDUCATION:
      case Slide.LAND_USE_INDUSTRY:
      case Slide.LAND_USE_MEDICAL:
      case Slide.LAND_USE_HOSPITALITY:
      case Slide.LAND_USE_OTHERS:
      case Slide.LAND_USE_PLANNED_OFFICIAL:
      case Slide.LAND_USE_PLANNED_DEVELOPER:
        return [ValuesTypes.HORIZON];

      case Slide.STUDENTS_COUNT:
        switch (mapDataValuesStoreInstance.dataType) {
          case DataType.STUDENT_DENSITY:
            return [ValuesTypes.RANGE];
          case DataType.STUDENT_PLACES:
          default:
            return [ValuesTypes.HORIZON];
        }

      default:
        return [ValuesTypes.RANGE];
    }
  }

  getHorizonOptionsForSlide(slide?: Slide): HorizonValue[] {
    switch (slide ?? this.currentSlide) {
      case Slide.MOBILITY_TRIPS_INBOUND:
      case Slide.MOBILITY_TRIPS_OUTBOUND:
        return mobilityTripsHorizons;
      default:
        return mapDataHorizons;
    }
  }

  async setCurrentSlide(slide: Slide) {
    if (this.currentSlide !== slide) {
      abortControllerStoreInstance.setAbortRequest();
    }

    contentLoadStoreInstance.setIsSelectedTimePointLoading(false);
    contentLoadStoreInstance.setIsTimelineDataLoading(true);

    timeIntervalsStoreInstance.setDefaultState();

    const currentPeriod = this.getCurrentPeriod(slide);
    mapDataValuesStoreInstance.setPeriod(currentPeriod);

    const currentDefaultTime = this.getDefaultPeriod(slide);
    mapDataValuesStoreInstance.setDefaultTime(currentDefaultTime);
    if (mapDataValuesStoreInstance.timeType === ValuesTypes.PATTERN) {
      mapDataValuesStoreInstance.setTime(currentDefaultTime);
    }

    zones3DStoreInstance.setSlide(slide);

    await this.setLocationAndLocationTypeForCurrentSlide(slide);

    switch (slide) {
      case Slide.ROAD_TRAFFIC:
        current3DStoreInstance.setCurrentStore(slide, [congestion3DStoreInstance]);

        if (!this.congestion3DSlide) {
          this.congestion3DSlide = new Congestion3DSlide(map3d.mapbox!, map3d.renderer, map3d.camera);
        }
        await map3d.setCurrent3DSlide(this.congestion3DSlide);
        break;
      case Slide.JUNCTIONS:
        current3DStoreInstance.setCurrentStore(slide, [congestion3DStoreInstance, junctions3DStoreInstance]);

        if (!this.failingJunctions3DSlide) {
          this.failingJunctions3DSlide = new Junctions3DSlide(map3d.mapbox!, map3d.camera);
        }
        await map3d.setCurrent3DSlide(this.failingJunctions3DSlide);
        break;
      case Slide.ACCIDENTS:
        current3DStoreInstance.setCurrentStore(slide, [accidents3DStoreInstance, congestion3DStoreInstance]);

        if (!this.accidents3DSlide) {
          this.accidents3DSlide = new Accidents3DSlide(map3d.mapbox!, map3d.camera);
        }
        await map3d.setCurrent3DSlide(this.accidents3DSlide);
        break;
      case Slide.POPULATION_COUNT:
        current3DStoreInstance.setCurrentStore(slide, [populationCount3DStoreInstance]);
        await map3d.setCurrent3DSlide(new PopulationCount3DSlide(map3d.camera));
        break;
      case Slide.POPULATION_MOVEMENT_INBOUND:
      case Slide.STUDENTS_TRIPS_INBOUND:
      case Slide.MOBILITY_TRIPS_INBOUND:
      case Slide.POPULATION_MOVEMENT_OUTBOUND:
      case Slide.STUDENTS_TRIPS_OUTBOUND:
      case Slide.MOBILITY_TRIPS_OUTBOUND:
        current3DStoreInstance.setCurrentStore(slide, [populationMovement3DStoreInstance]);
        await map3d.setCurrent3DSlide(new PopulationMovement3DSlide());
        break;
      case Slide.POPULATION_MOVEMENT_WITHIN:
        current3DStoreInstance.setCurrentStore(slide, [populationMovementWithin3DStoreInstance]);
        await map3d.setCurrent3DSlide(new PopulationMovementWithin3DSlide(map3d.camera));
        break;
      case Slide.STUDENTS_COUNT:
      case Slide.STUDENTS_TRIPS_WITHIN:
        current3DStoreInstance.setCurrentStore(slide, [studentsCount3DStoreInstance]);
        await map3d.setCurrent3DSlide(new StudentsCount3DSlide(map3d.camera));
        break;
      case Slide.BUS_TRIPS_INBOUND:
        current3DStoreInstance.setCurrentStore(slide, [busAndTaxiLocations3DStoreInstance, busStops3DStoreInstance]);
        await map3d.setCurrent3DSlide(new BusAndTaxiTrips3DSlide(map3d.renderer, map3d.camera, true));
        break;
      case Slide.BUS_TRIPS_OUTBOUND:
        current3DStoreInstance.setCurrentStore(slide, [busAndTaxiLocations3DStoreInstance, busStops3DStoreInstance]);
        await map3d.setCurrent3DSlide(new BusAndTaxiTrips3DSlide(map3d.renderer, map3d.camera, false));
        break;
      case Slide.BUS_TRIPS_WITHIN:
        current3DStoreInstance.setCurrentStore(slide, [busStops3DStoreInstance]);
        await map3d.setCurrent3DSlide(new BusAndTaxiTrips3DSlide(map3d.renderer, map3d.camera));
        break;
      case Slide.BUS_LINE_UTILIZATION:
        current3DStoreInstance.setCurrentStore(slide, [busLineUtilizationStoreInstance, busStops3DStoreInstance]);
        await map3d.setCurrent3DSlide(new BusLine3DSlide(map3d.mapbox!, map3d.renderer, map3d.camera));
        break;
      case Slide.TAXI_TRIPS_INBOUND:
        current3DStoreInstance.setCurrentStore(slide, [busAndTaxiLocations3DStoreInstance]);
        await map3d.setCurrent3DSlide(new BusAndTaxiTrips3DSlide(map3d.renderer, map3d.camera, true));
        break;
      case Slide.TAXI_TRIPS_OUTBOUND:
        current3DStoreInstance.setCurrentStore(slide, [busAndTaxiLocations3DStoreInstance]);
        await map3d.setCurrent3DSlide(new BusAndTaxiTrips3DSlide(map3d.renderer, map3d.camera, false));
        break;
      case Slide.TAXI_TRIPS_WITHIN:
        current3DStoreInstance.setCurrentStore(slide, [busAndTaxiTripsWithin3DStoreInstance]);
        await map3d.setCurrent3DSlide(new BusAndTaxiTripsWithin3DSlide(map3d.camera));
        break;
      case Slide.LAND_USE_CONSTRUCTION:
        current3DStoreInstance.setCurrentStore(slide, [landUsePlots3DStoreInstance]);
        await map3d.setCurrent3DSlide(new LandUsePlots3DSlide(map3d.mapbox!, map3d.camera, slide));
        break;
      case Slide.LAND_USE_RESIDENTIAL:
      case Slide.LAND_USE_SCHOOLS:
      case Slide.LAND_USE_INDUSTRY:
      case Slide.LAND_USE_MEDICAL:
      case Slide.LAND_USE_OFFICES:
      case Slide.LAND_USE_RETAIL:
      case Slide.LAND_USE_HOTELS:
      case Slide.LAND_USE_EDUCATION:
      case Slide.LAND_USE_HOSPITALITY:
      case Slide.LAND_USE_OTHERS:
      case Slide.LAND_USE_PLANNED_OFFICIAL:
      case Slide.LAND_USE_PLANNED_DEVELOPER:
        current3DStoreInstance.setCurrentStore(slide, [landUsePlots3DStoreInstance, landUseZones3DStoreInstance]);
        await map3d.setCurrent3DSlide(new LandUsePlots3DSlide(map3d.mapbox!, map3d.camera, slide));
        break;
      case Slide.LAND_USE_WATER_CONSUMPTION:
        current3DStoreInstance.setCurrentStore(slide, [
          landUseConsumptionPillar3DStoreInstance,
          landUseConsumptionPlot3DStoreInstance,
        ]);
        await map3d.setCurrent3DSlide(
          new LandUseConsumptionPillar3DSlide(ConsumptionGood.Water, map3d.mapbox!, map3d.renderer, map3d.camera)
        );
        break;
      case Slide.LAND_USE_ELECTRICITY_CONSUMPTION:
        current3DStoreInstance.setCurrentStore(slide, [landUseConsumptionPillar3DStoreInstance]);
        await map3d.setCurrent3DSlide(
          new LandUseConsumptionPillar3DSlide(ConsumptionGood.Electricity, map3d.mapbox!, map3d.renderer, map3d.camera)
        );
        break;
      case Slide.AVIATION_INBOUND:
        current3DStoreInstance.setCurrentStore(slide, [aviationTransfer3DStoreInstance]);
        await map3d.setCurrent3DSlide(new AviationTransfer3DSlide(true));
        break;
      case Slide.AVIATION_OUTBOUND:
        current3DStoreInstance.setCurrentStore(slide, [aviationTransfer3DStoreInstance]);
        await map3d.setCurrent3DSlide(new AviationTransfer3DSlide(false));
        break;
      case Slide.AVIATION_CONNECTIVITY:
        current3DStoreInstance.setCurrentStore(slide, [aviationConnectivity3DStoreInstance]);
        await map3d.setCurrent3DSlide(new AviationConnectivity3DSlide());
        break;
      case Slide.MARITIME_FACILITIES:
        current3DStoreInstance.setCurrentStore(slide, [maritimeFacilities3DStoreInstance]);
        await map3d.setCurrent3DSlide(new MaritimeFacilities3DSlide());
        break;
      case Slide.MARITIME_TRIPS:
        current3DStoreInstance.setCurrentStore(slide, [maritimeTrips3DStoreInstance]);
        await map3d.setCurrent3DSlide(new MaritimeTrips3DSlide(map3d.renderer, map3d.camera));
        break;
      case Slide.LAND_USE_OVERVIEW:
      case Slide.PEOPLE_BEHAVIOR_OVERVIEW:
      case Slide.SUMMARY:
      case Slide.MOBILITY_OVERVIEW:
      case Slide.TRAFFIC_OVERVIEW:
      case Slide.LANDING:
      case undefined:
        current3DStoreInstance.setCurrentStore(slide, []);
        await map3d.setCurrent3DSlide(new Empty3DSlide());
        break;
      default:
        throw new Error('unknown slide ' + slide);
    }

    mapDataValuesStoreInstance.setDataType(DEFAULT_DATA_TYPE_CONFIG[slide]);

    runInAction(() => {
      this.currentSlide = slide;
    });

    const patternType = patternTypeForSlide(slide);
    mapDataValuesStoreInstance.setCurrentPatternType(patternType);
    mapDataValuesStoreInstance.setPattern(patternsStoreInstance.patternsMap.get(patternType)?.[0]);

    timeIntervalsStoreInstance.setTypeOfRange(TimelineAggregation.ENTIRE);

    const allowedTimeTypes = this.getAllowedTimeTypes();
    mapDataValuesStoreInstance.setAllowedTimeTypes(allowedTimeTypes);

    const horizonOptions = this.getHorizonOptionsForSlide(slide);
    const currentHorizon = mapDataValuesStoreInstance.horizon;
    const coercedHorizon = horizonOptions.find((h) => h.id === currentHorizon.id) ?? horizonOptions[0];
    if (coercedHorizon.id !== currentHorizon.id) {
      mapDataValuesStoreInstance.setHorizon(coercedHorizon);
    }

    map3d.setSlide(slide);
  }

  private async switchToDistrict() {
    const districts = await zones3DStoreInstance.getLocations(LocationType.DISTRICT);
    const location = locationPanelStoreInstance.currentLocation;
    const needDistrict = districts?.find((x) => location.parentLocation === x.location);

    locationPanelStoreInstance.setCurrentLocation(needDistrict!);
    locationPanelStoreInstance.setCurrentLocationType(LocationType.DISTRICT);
    locationPanelStoreInstance.setActiveTab(LocationType.DISTRICT);
  }

  private async switchToAbuDhabiRegion() {
    const regions = await zones3DStoreInstance.getLocations(LocationType.REGION);
    const abuDhabiRegion = regions?.find((x) => x.location === 'Abu Dhabi');

    if (!abuDhabiRegion) {
      return;
    }

    locationPanelStoreInstance.setCurrentLocation(abuDhabiRegion);
    locationPanelStoreInstance.setLocationInPanel(abuDhabiRegion);
    locationPanelStoreInstance.setCurrentLocationType(LocationType.REGION);
    locationPanelStoreInstance.setActiveTab(LocationType.REGION);
    locationPanelStoreInstance.setLocationTypeInPanel(LocationType.REGION);
  }

  private async setLocationAndLocationTypeForCurrentSlide(nextSlide?: Slide) {
    const isInaccessibleLocationType = slidesStoreInstance.isLocationTypeInaccessibleInCurrentSlide(
      locationPanelStoreInstance.currentLocationType,
      nextSlide
    );

    const toPopulationMovement =
      nextSlide &&
      populationMovementSlides.includes(nextSlide) &&
      !populationMovementSlides.includes(this.currentSlide!);

    const fromPopulationMovement =
      nextSlide &&
      !populationMovementSlides.includes(nextSlide) &&
      populationMovementSlides.includes(this.currentSlide!);
    if (
      (toPopulationMovement || fromPopulationMovement) &&
      locationPanelStoreInstance.currentLocationType === LocationType.ZONE
    ) {
      this.switchToDistrict();
      return;
    }

    const isTrafficSlide = nextSlide ? TrafficSlides.includes(nextSlide) : false;
    const isAbuDhabiRegion =
      locationPanelStoreInstance.currentLocationType === LocationType.REGION &&
      locationPanelStoreInstance.currentLocation.location === 'Abu Dhabi';

    if (isTrafficSlide && !isAbuDhabiRegion) {
      await this.switchToAbuDhabiRegion();
      return;
    }

    if (isInaccessibleLocationType) {
      if (locationPanelStoreInstance.currentLocationType === LocationType.ZONE) {
        this.switchToDistrict();
      } else {
        locationPanelStoreInstance.setDefaultLocation();
        locationPanelStoreInstance.setCurrentLocationType(LocationType.SPECIAL_DISTRICT);
        locationPanelStoreInstance.setActiveTab(LocationType.SPECIAL_DISTRICT);
      }
    }
  }

  async getParentRegionForCurrentLocation() {
    const location = locationPanelStoreInstance.currentLocation;

    let needRegion: LocationAndLocationType = { location: location.location, locationType: location.locationType };

    const zoneAndDistrictTypes = [LocationType.ZONE, LocationType.DISTRICT, LocationType.SPECIAL_DISTRICT];

    const isZoneOrDistrict = zoneAndDistrictTypes.includes(location.locationType);

    if (isZoneOrDistrict) {
      const districts = await zones3DStoreInstance.getLocations(LocationType.DISTRICT);

      const parentDistrict = districts?.find(
        (district) => location.parentLocation === district.location || location.location === district.location
      );

      if (parentDistrict) {
        needRegion = { location: parentDistrict.parentLocation!, locationType: 'region' };
      }
    }

    if (location.locationType === LocationType.EMIRATE) {
      needRegion = { location: 'Abu Dhabi', locationType: 'region' };
    }

    return needRegion;
  }

  setIsStoriesOpen(value: boolean) {
    this.isStoriesOpen = value;
  }

  setIsTimeIntervalExpanded(value: boolean) {
    this.isTimeIntervalExpanded = value;
  }

  setIsMapDataExpanded(value: boolean) {
    this.isMapDataExpanded = value;
  }

  setIsExploreDataOpen(value: boolean) {
    this.isExploreDataOpen = value;
  }
}

const slidesStoreInstance = new SlidesStore();
export default slidesStoreInstance;
