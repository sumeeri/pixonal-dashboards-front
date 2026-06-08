import { reaction, runInAction } from 'mobx';
import { DataType } from 'shared/constants/mapDataParams.ts';
import { Color, Group, MathUtils, Scene } from 'three';

import { Slide } from '../../../../entities/dashboard/types.ts';
import infoMarkerStoreInstance from '../../infoMarkerStore.ts';
import infoPopupStoreInstance from '../../infoPopupStore.ts';
import { CircleObject3D } from '../CircleObject3D.ts';
import { IMoveToEvent } from '../IMoveToEvent.ts';
import map3d from '../Map3d.ts';
import { MaritimeFacilitiesDataWithLocation } from '../maritime/MaritimesTypes.ts';
import maritimeFacilities3DStoreInstance from '../stores/MaritimeFacilities3DStore.ts';
import { I3DSlide, SelectData } from './I3DSlide.ts';

const SCALE_FACTOR = 7000;

export default class MaritimeFacilities3DSlide implements I3DSlide {
  public stopTimelineEvent?: () => void;
  public moveToEvent?: (pos: IMoveToEvent) => void;

  private readonly group: Group;
  private readonly zonesGroup: Group;

  private current = new Map<string, MaritimeFacilitiesDataWithLocation>();
  private target = new Map<string, MaritimeFacilitiesDataWithLocation>();

  private zonesObjectMap = new Map<string, CircleObject3D<string>>();

  constructor() {
    reaction(
      () => maritimeFacilities3DStoreInstance.currentTarget,
      (currentTarget) => {
        if (currentTarget) {
          const { current, target } = currentTarget;
          this.setConnectivityParamsData(current, target);
        }
      }
    );
    reaction(
      () => maritimeFacilities3DStoreInstance.k,
      (k) => {
        this.updateAnimation(k);
      }
    );

    reaction(
      () => map3d.cameraUpdateFrames,
      () => {
        this.updateDiameterOfCircles();
      }
    );
    this.group = new Group();
    this.zonesGroup = new Group();

    this.group.add(this.zonesGroup);
  }

  clearMap(): void {
    this.zonesGroup.clear();
    this.zonesObjectMap.clear();
  }

  updateDiameterOfCircles() {
    for (const [key, circle] of this.zonesObjectMap) {
      const current = this.current.get(key);
      const target = this.target.get(key);

      if (current && target) {
        const maxDelay = 50;
        const maxRadius = 50;
        const zoomLevel = map3d.mapbox?.getZoom() || 1;

        const d =
          (MathUtils.lerp(Math.min(current.count, maxDelay), Math.min(target.count, maxDelay), 1) / maxDelay) *
          maxRadius;

        circle.setDiameter((d * SCALE_FACTOR) / zoomLevel);
      } else {
        circle.visible = false;
      }
    }
  }

  updateAnimation(k: number): void {
    for (const [key, circle] of this.zonesObjectMap) {
      const current = this.current.get(key);
      const target = this.target.get(key);

      if (current && target) {
        const maxDelay = 50;
        const maxRadius = 50;
        const zoomLevel = map3d.mapbox?.getZoom() || 1;

        const d =
          (MathUtils.lerp(Math.min(current.count, maxDelay), Math.min(target.count, maxDelay), k) / maxDelay) *
          maxRadius;
        circle.setDiameter((d * SCALE_FACTOR) / zoomLevel);
      } else {
        circle.visible = false;
      }
    }
  }

  private setConnectivityParamsData(
    current: Map<string, MaritimeFacilitiesDataWithLocation>,
    target: Map<string, MaritimeFacilitiesDataWithLocation>
  ) {
    this.current = current;
    this.target = target;

    const zoomLevel = map3d.mapbox?.getZoom() || 1;

    this.zonesGroup.clear();

    this.zonesObjectMap = new Map<string, CircleObject3D<string>>();

    for (const [id, zone] of current) {
      const circle = new CircleObject3D(id, zone.location, {
        borderColor: new Color(0x00dafe),
        borderDashed: false,
        fillColor: new Color(0x00dafe),
        fillOpacity: 0.25,
      });
      circle.setDiameter((zone.count * SCALE_FACTOR) / zoomLevel);

      this.zonesGroup.add(circle);
      this.zonesObjectMap.set(id, circle);
    }
  }

  setVisible(visible: boolean): void {
    this.group.visible = visible;
  }

  async install(scene: Scene): Promise<void> {
    scene.add(this.group);
  }

  uninstall(scene: Scene): void {
    this.deselectAll();
    scene.remove(this.group);

    infoMarkerStoreInstance.data = [];
  }

  onCameraMove(): void {}

  raycast(data: SelectData): void {
    const intersects = data.raycaster.intersectObjects(
      this.zonesGroup.children.filter((obj) => obj.visible),
      true
    );

    const intersection = intersects[0];
    if (intersection) {
      const object = intersection.object;
      if (object instanceof CircleObject3D) {
        const zone = this.current.get(object.objectId)!;

        runInAction(() => {
          infoPopupStoreInstance.isShown = true;
          infoPopupStoreInstance.data = {
            slideGroup: 'main',
            slide: Slide.MARITIME_FACILITIES,
            param: zone,
            datatype: DataType.FACILITY_USAGE,
          };
          infoPopupStoreInstance.worldPosition = intersection.point;
        });
      }
    } else {
      this.deselectAll();
    }
  }

  private deselectAll() {
    runInAction(() => {
      maritimeFacilities3DStoreInstance.currentMoveData = undefined;
    });
    this.deselect();
  }

  deselect() {
    runInAction(() => {
      infoPopupStoreInstance.isShown = false;
    });
  }
}
