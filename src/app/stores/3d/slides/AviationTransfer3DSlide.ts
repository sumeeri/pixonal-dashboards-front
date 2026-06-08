import { reaction, runInAction } from 'mobx';
import { DataType } from 'shared/constants/mapDataParams.ts';
import { Group, Scene, Vector3 } from 'three';

import { MarkerType, Slide } from '../../../../entities/dashboard/types.ts';
import { LocationWithGeometry } from '../../../../entities/locationPanel/types.ts';
import infoMarkerStoreInstance from '../../infoMarkerStore.ts';
import infoPopupStoreInstance from '../../infoPopupStore.ts';
import locationPanelStoreInstance from '../../locationPanelStore.ts';
import { AviationTransferArcsGroup } from '../aviation/AviationTransferArcsGroup.ts';
import { IMoveToEvent } from '../IMoveToEvent.ts';
import MapUtils from '../MapUtils.ts';
import { ArcAndCircleObject3D } from '../population/ArcAndCircleObject3D.ts';
import aviationTransfer3DStoreInstance, { MapOfAviationMoves } from '../stores/AviationTransfer3DStore.ts';
import { I3DSlide, SelectData } from './I3DSlide.ts';

const VALUE_MULTIPLIER = 15;

export default class AviationTransfer3DSlide implements I3DSlide {
  public stopTimelineEvent?: () => void;
  public moveToEvent?: (pos: IMoveToEvent) => void;

  private readonly group: Group;
  private readonly arcsGroup: AviationTransferArcsGroup;

  private locationsMap = new Map<string, LocationWithGeometry>();

  constructor(private inbound = false) {
    reaction(
      () => aviationTransfer3DStoreInstance.locationsMap,
      (locationsMap) => {
        this.arcsGroup.create(locationsMap);
      }
    );
    reaction(
      () => aviationTransfer3DStoreInstance.currentTarget,
      (currentTarget) => {
        if (currentTarget) {
          const { current, target } = currentTarget;
          this.setPopulationParamsData(current, target);
        }
      }
    );
    reaction(
      () => aviationTransfer3DStoreInstance.k,
      (k) => {
        this.updateAnimation(k);
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

    this.group = new Group();
    this.arcsGroup = new AviationTransferArcsGroup(false);
    this.arcsGroup.position.z = 5000;

    this.group.add(this.arcsGroup);
  }

  setVisible(visible: boolean): void {
    this.group.visible = visible;
  }

  private updateAnimation(k: number, mul: number = VALUE_MULTIPLIER) {
    if (aviationTransfer3DStoreInstance.currentLocation) {
      this.arcsGroup.updateAnimation(k, mul);
    }
  }

  private setPopulationParamsData(current: MapOfAviationMoves, target: MapOfAviationMoves) {
    this.clearMap();

    // if (aviationTransfer3DStoreInstance.currentLocation) {
    this.arcsGroup.setData(current, target, undefined, 'Zayed International Airport', this.inbound, false);

    if (this.arcsGroup.selectedArc) {
      const move = this.arcsGroup.movesMap.get(this.arcsGroup.selectedArc);
      runInAction(() => {
        if (move) {
          aviationTransfer3DStoreInstance.currentMoveData = move;
        } else if (aviationTransfer3DStoreInstance.currentMoveData) {
          aviationTransfer3DStoreInstance.currentMoveData.count = 0;
        }
      });
    }
    // }
  }

  clearMap() {
    this.arcsGroup.clearMovesDisplay();
  }

  async install(scene: Scene): Promise<void> {
    scene.add(this.group);

    infoMarkerStoreInstance.data = [
      {
        id: 0,
        value: 'Abu Dhabi Zayed International Airport',
        position: [0, 0],
        isShow: true,
        type: MarkerType.Location,
      },
    ];
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
    const raycastResult = this.arcsGroup.raycast(data.raycaster);
    if (raycastResult) {
      const [arcId] = raycastResult;
      const arc = this.arcsGroup.arcsMap.get(arcId)!;
      this.selectArc(arc, arc.endPoint);
      return;
    }
    this.deselectAll();
  }

  private selectArc(arcSelect: ArcAndCircleObject3D, point: Vector3) {
    const moveData = this.arcsGroup.movesMap.get(arcSelect.arcId);
    if (moveData) {
      runInAction(() => {
        aviationTransfer3DStoreInstance.currentMoveData = moveData;
        infoPopupStoreInstance.isShown = true;
        infoPopupStoreInstance.data = {
          slideGroup: 'main',
          slide: (() => {
            switch (aviationTransfer3DStoreInstance.slide) {
              case Slide.AVIATION_INBOUND:
                return Slide.AVIATION_INBOUND;
              case Slide.AVIATION_OUTBOUND:
              default:
                return Slide.AVIATION_OUTBOUND;
            }
          })(),
          datatype: (() => {
            switch (aviationTransfer3DStoreInstance.dataType) {
              case DataType.AVIATION_ARRIVALS:
                return DataType.AVIATION_ARRIVALS;
              case DataType.AVIATION_TRANSFERS:
                return DataType.AVIATION_TRANSFERS;
              case DataType.AVIATION_DEPARTURES:
              default:
                return DataType.AVIATION_DEPARTURES;
            }
          })(),
          param: moveData,
        };
        infoPopupStoreInstance.worldPosition = point;
      });

      this.arcsGroup.select(arcSelect.arcId);

      // this.moveToEvent?.({ pointOfInterest: point, /* zoom: 12, */ resetRotation: false, offset: [0, 0] });
      this.stopTimelineEvent?.();
    }
  }

  private deselectAll() {
    runInAction(() => {
      aviationTransfer3DStoreInstance.currentMoveData = undefined;
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
