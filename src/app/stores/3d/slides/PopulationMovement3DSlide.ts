import { reaction, runInAction } from 'mobx';
import { Group, Scene, Vector3 } from 'three';

import { MarkerType, Slide } from '../../../../entities/dashboard/types.ts';
import infoMarkerStoreInstance from '../../infoMarkerStore.ts';
import infoPopupStoreInstance from '../../infoPopupStore.ts';
import locationPanelStoreInstance from '../../locationPanelStore.ts';
import { IMoveToEvent } from '../IMoveToEvent.ts';
import MapUtils from '../MapUtils.ts';
import { ArcAndCircleObject3D } from '../population/ArcAndCircleObject3D.ts';
import { ZoneHierarchyArcsGroup } from '../populationMovement/ZoneHierarchyArcsGroup.ts';
import populationMovement3DStoreInstance, { MapOfPopulationMoves } from '../stores/PopulationMovement3DStore.ts';
import { I3DSlide, SelectData } from './I3DSlide.ts';

export default class PopulationMovement3DSlide implements I3DSlide {
  public stopTimelineEvent?: () => void;
  public moveToEvent?: (pos: IMoveToEvent) => void;

  private readonly group: Group;
  private readonly arcsGroup: ZoneHierarchyArcsGroup;

  constructor() {
    reaction(
      () => populationMovement3DStoreInstance.locationsMap,
      (locationsMap) => {
        this.arcsGroup.create(locationsMap);
      }
    );
    reaction(
      () => populationMovement3DStoreInstance.currentTarget,
      (currentTarget) => {
        if (currentTarget) {
          const { current, target } = currentTarget;
          this.setPopulationParamsData(current, target);
        }
      }
    );
    reaction(
      () => populationMovement3DStoreInstance.k,
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
    this.arcsGroup = new ZoneHierarchyArcsGroup();

    this.group.add(this.arcsGroup);
  }

  setVisible(visible: boolean): void {
    this.group.visible = visible;
  }

  private updateAnimation(k: number, mul: number = 1) {
    if (populationMovement3DStoreInstance.currentLocation) {
      this.arcsGroup.updateAnimation(k, mul);
    }
  }

  private setPopulationParamsData(current: MapOfPopulationMoves, target: MapOfPopulationMoves) {
    this.clearMovesDisplay();

    if (locationPanelStoreInstance.currentLocation.location) {
      this.arcsGroup.setData(
        current,
        target,
        undefined,
        locationPanelStoreInstance.currentLocation.location,
        populationMovement3DStoreInstance.slide?.includes('inbound')
      );

      if (this.arcsGroup.selectedArc) {
        const move = this.arcsGroup.movesMap.get(this.arcsGroup.selectedArc);
        runInAction(() => {
          if (move) {
            populationMovement3DStoreInstance.currentMoveData = move;
          } else if (populationMovement3DStoreInstance.currentMoveData) {
            populationMovement3DStoreInstance.currentMoveData.peopleCount = 0;
          }
        });
      }
    }
  }

  clearMap(): void {
    this.clearMovesDisplay();
  }

  private clearMovesDisplay() {
    this.arcsGroup.clearMovesDisplay();
  }

  async install(scene: Scene): Promise<void> {
    scene.add(this.group);

    runInAction(() => {
      infoMarkerStoreInstance.data = [
        {
          id: 0,
          position: [0, 0],
          isShow: true,
          type: MarkerType.Location,
        },
      ];
    });
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
        populationMovement3DStoreInstance.currentMoveData = moveData;
        infoPopupStoreInstance.isShown = true;
        if (
          [Slide.MOBILITY_TRIPS_INBOUND, Slide.MOBILITY_TRIPS_OUTBOUND].includes(
            populationMovement3DStoreInstance.slide!
          )
        ) {
          infoPopupStoreInstance.data = {
            slideGroup: 'main',
            slide: Slide.MOBILITY_TRIPS_INBOUND,
            param: moveData,
          };
        } else {
          infoPopupStoreInstance.data = {
            slideGroup: 'main',
            slide: Slide.POPULATION_MOVEMENT_INBOUND,
            param: moveData,
          };
        }

        infoPopupStoreInstance.worldPosition = point;
      });

      this.arcsGroup.select(arcSelect.arcId);

      this.moveToEvent?.({ pointOfInterest: point, zoom: 12, resetRotation: false, offset: [0, 0] });
      this.stopTimelineEvent?.();
    }
  }

  private deselectAll() {
    runInAction(() => {
      populationMovement3DStoreInstance.currentMoveData = undefined;
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
