import { reaction, runInAction } from 'mobx';
import { DataType } from 'shared/constants/mapDataParams.ts';
import { Group, MathUtils, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from 'three';

import { MarkerType, Slide } from '../../../../entities/dashboard/types.ts';
import { LocationWithGeometry } from '../../../../entities/locationPanel/types.ts';
import infoMarkerStoreInstance from '../../infoMarkerStore.ts';
import infoPopupStoreInstance from '../../infoPopupStore.ts';
import locationPanelStoreInstance from '../../locationPanelStore.ts';
import mapDataValuesStoreInstance from '../../mapDataValuesStore.ts';
import { BusAndTaxiArcsGroup } from '../busAndTaxi/BusAndTaxiArcsGroup.ts';
import { BusWithinParamsData } from '../busAndTaxi/BusAndTaxiDataTypes.ts';
import { IMoveToEvent } from '../IMoveToEvent.ts';
import MapUtils from '../MapUtils.ts';
import { PillarsGroup } from '../pillars/PillarsGroup.ts';
import { ArcAndCircleObject3D } from '../population/ArcAndCircleObject3D.ts';
import settingsState from '../SettingsState.ts';
import busAndTaxiLocations3DStoreInstance, { MapOfBusMoves } from '../stores/BusAndTaxiLocations3DStore.ts';
import busStops3DStoreInstance from '../stores/BusStops3DStore.ts';
import { I3DSlide, SelectData } from './I3DSlide.ts';

export default class BusAndTaxiTrips3DSlide implements I3DSlide {
  public stopTimelineEvent?: () => void;
  public moveToEvent?: (pos: IMoveToEvent) => void;

  private readonly group: Group;
  private readonly arcsGroup: BusAndTaxiArcsGroup;
  private readonly pillarsGroup: PillarsGroup;

  private locationsMap = new Map<string, LocationWithGeometry>();
  private mapPillarToBusStop = new Map<number, number>();

  constructor(
    private renderer: WebGLRenderer,
    private camera: PerspectiveCamera,
    private inbound = false
  ) {
    reaction(
      () => mapDataValuesStoreInstance.dataType,
      (dataType) => {
        this.deselect();
        this.setDataType(dataType);
      }
    );

    reaction(
      () => busAndTaxiLocations3DStoreInstance.currentTarget,
      (currentTarget) => {
        if (currentTarget) {
          const { current, target } = currentTarget;
          this.setPopulationParamsData(current, target);
        }
      }
    );

    reaction(
      () => busStops3DStoreInstance.currentTarget,
      (currentTarget) => {
        if (currentTarget) {
          const { current, target } = currentTarget;
          this.setBusStopsParamsData(current, target);
        }
      }
    );

    reaction(
      () => busAndTaxiLocations3DStoreInstance.k,
      (k) => {
        this.arcsUpdateAnimation(k);
      }
    );

    reaction(
      () => busStops3DStoreInstance.k,
      (k) => {
        this.pillarsUpdateAnimation(k);
      }
    );

    reaction(
      () => infoPopupStoreInstance.isShown,
      () => {
        if (infoPopupStoreInstance.isShown === false) {
          this.deselect();
        }
      }
    );

    reaction(
      () => busAndTaxiLocations3DStoreInstance.locationsMap,
      (map) => {
        if (map) {
          this.setLocationGeometry(map);
        }
      }
    );

    this.group = new Group();
    this.arcsGroup = new BusAndTaxiArcsGroup();
    this.group.add(this.arcsGroup);
    this.pillarsGroup = new PillarsGroup(settingsState.busStopPillars);
    this.group.add(this.pillarsGroup);
  }

  private setDataType(dataType?: DataType) {
    switch (dataType) {
      case DataType.END_TO_END_TRIPS_LOCATIONS:
        this.arcsGroup.visible = true;
        this.pillarsGroup.visible = false;
        break;
      case DataType.END_TO_END_TRIPS_BUS_STOPS:
      case DataType.BOARDING_BUS_STOPS:
      case DataType.ALIGHTINGS_BUS_STOPS:
      case DataType.TRANSFERS_BUS_STOPS:
        this.arcsGroup.visible = false;
        this.pillarsGroup.visible = true;
        break;
    }
  }

  setVisible(visible: boolean): void {
    this.group.visible = visible;

    this.setDataType(mapDataValuesStoreInstance.dataType);
  }

  private arcsUpdateAnimation(k: number, mul: number = 1) {
    this.arcsGroup.updateAnimation(k, mul);
  }

  private pillarsUpdateAnimation(k: number) {
    this.pillarsGroup.updateAnimation(k);
  }

  private setPopulationParamsData(current: MapOfBusMoves, target: MapOfBusMoves) {
    this.clearMap();

    this.arcsGroup.setData(
      current,
      target,
      undefined,
      locationPanelStoreInstance.currentLocation.location,
      this.inbound
    );

    if (this.arcsGroup.selectedArc) {
      const move = this.arcsGroup.movesMap.get(this.arcsGroup.selectedArc);
      runInAction(() => {
        if (move) {
          busAndTaxiLocations3DStoreInstance.currentMoveData = move;
        } else if (busAndTaxiLocations3DStoreInstance.currentMoveData) {
          busAndTaxiLocations3DStoreInstance.currentMoveData.count = 0;
        }
      });
    }
  }

  private setBusStopsParamsData(current: Map<number, BusWithinParamsData>, _target: Map<number, BusWithinParamsData>) {
    this.clearMap();

    const pillarsPositions = new Map<number, [number, number]>();
    const pillarsValues = new Map<number, number>();
    let i = 0;
    for (const [id, param] of current) {
      this.mapPillarToBusStop.set(i++, id);
      pillarsPositions.set(id, param.busStop.geometry);
      pillarsValues.set(id, MathUtils.clamp(param.count / 10, 0, 1));
    }

    this.pillarsGroup.create(pillarsPositions);
    this.pillarsGroup.setData(pillarsValues, pillarsValues);
  }

  clearMap() {
    this.arcsGroup.clearMovesDisplay();
    this.pillarsGroup.create(new Map<number, [number, number]>());
  }

  async install(scene: Scene): Promise<void> {
    scene.add(this.group);

    infoMarkerStoreInstance.data = [
      {
        id: 0,
        position: [0, 0],
        isShow: true,
        type: MarkerType.Location,
      },
    ];
  }

  setLocationGeometry(map: Map<string, LocationWithGeometry>) {
    this.arcsGroup.create(map);
  }

  uninstall(scene: Scene): void {
    this.deselectAll();
    scene.remove(this.group);
    infoMarkerStoreInstance.data = [];
  }

  onCameraMove(): void {
    const location = locationPanelStoreInstance.currentLocation;
    if (location) {
      infoMarkerStoreInstance.updateMarkerPosition(0, MapUtils.getPositionFromWgs(...location.center));
    }
  }

  raycast(data: SelectData): void {
    const pillarId = this.pillarsGroup.raycastSelectData(data, this.renderer, this.camera);

    const raycastResult = this.arcsGroup.raycast(data.raycaster);

    if (raycastResult) {
      const [arcId] = raycastResult;
      const arc = this.arcsGroup.arcsMap.get(arcId)!;

      this.selectArc(arc, arc.endPoint);
    } else {
      this.deselectAll();
    }

    if (pillarId) {
      const busStopId = this.mapPillarToBusStop.get(pillarId!);
      const param = busStops3DStoreInstance.currentTarget.current.get(busStopId!);
      if (param) {
        runInAction(() => {
          infoPopupStoreInstance.isShown = true;

          infoPopupStoreInstance.data = {
            slideGroup: 'main',
            slide: Slide.BUS_TRIPS_WITHIN,
            param: param,
            dataType: mapDataValuesStoreInstance.dataType!,
          };

          const centerPos = MapUtils.getPositionFromWgs(...param.busStop.geometry);
          centerPos.z = MathUtils.clamp(param.count * 200, 0, 2000);
          infoPopupStoreInstance.worldPosition = centerPos;
        });
      } else {
        this.deselectAll();
      }
    }
  }

  private selectArc(arcSelect: ArcAndCircleObject3D, point: Vector3) {
    const moveData = this.arcsGroup.movesMap.get(arcSelect.arcId);
    if (moveData) {
      runInAction(() => {
        busAndTaxiLocations3DStoreInstance.currentMoveData = moveData;
        infoPopupStoreInstance.isShown = true;
        infoPopupStoreInstance.data = {
          slideGroup: 'main',
          slide: Slide.BUS_TRIPS_INBOUND,
          param: moveData,
        };
        infoPopupStoreInstance.worldPosition = point;
      });

      this.arcsGroup.select(arcSelect.arcId);

      this.moveToEvent?.({ pointOfInterest: point, zoom: 12, resetRotation: false, offset: [0, 0] });
      this.stopTimelineEvent?.();
    }
  }

  private deselectAll() {
    runInAction(() => {
      busAndTaxiLocations3DStoreInstance.currentMoveData = undefined;
    });

    this.deselect();
  }

  deselect() {
    this.arcsGroup.deselect();
    runInAction(() => {
      infoPopupStoreInstance.isShown = false;
    });
  }
}
