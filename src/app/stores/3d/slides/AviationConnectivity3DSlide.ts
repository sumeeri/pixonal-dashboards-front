import { reaction, runInAction } from 'mobx';
import { DataType } from 'shared/constants/mapDataParams.ts';
import { Group, MathUtils, Scene } from 'three';

import { MarkerType, Slide } from '../../../../entities/dashboard/types.ts';
import infoMarkerStoreInstance from '../../infoMarkerStore.ts';
import infoPopupStoreInstance from '../../infoPopupStore.ts';
import locationPanelStoreInstance from '../../locationPanelStore.ts';
import { AviationConnectivityDataType } from '../aviation/AviationDataTypes.ts';
import { IMoveToEvent } from '../IMoveToEvent.ts';
import MapUtils from '../MapUtils.ts';
import { MultiPolygonObject3D } from '../MultiPolygonObject3D.ts';
import aviationConnectivity3DStoreInstance from '../stores/AviationConnectivity3DStore.ts';
import aviationTransfer3DStoreInstance from '../stores/AviationTransfer3DStore.ts';
import { I3DSlide, SelectData } from './I3DSlide.ts';

const NORMALIZATION_FACTOR = 150;

export default class AviationConnectivity3DSlide implements I3DSlide {
  public stopTimelineEvent?: () => void;
  public moveToEvent?: (pos: IMoveToEvent) => void;

  private readonly group: Group;
  private readonly zonesGroup: Group;

  private current = new Map<string, AviationConnectivityDataType>();
  private target = new Map<string, AviationConnectivityDataType>();

  private zonesObjectMap = new Map<string, MultiPolygonObject3D<string>>();

  private NORMALIZATION_FACTOR = 150;

  constructor() {
    reaction(
      () => aviationConnectivity3DStoreInstance.currentTarget,
      (currentTarget) => {
        if (currentTarget) {
          const { current, target } = currentTarget;
          this.setConnectivityParamsData(current, target);
        }
      }
    );
    reaction(
      () => aviationConnectivity3DStoreInstance.k,
      (k) => {
        this.updateAnimation(k);
      }
    );

    this.group = new Group();
    this.zonesGroup = new Group();

    this.group.add(this.zonesGroup);
  }

  updateAnimation(k: number) {
    for (const [id, zone] of this.zonesObjectMap) {
      if (this.target.get(id)) {
        zone.setValue(
          MathUtils.lerp(this.current.get(id)!.count, this.target.get(id)!.count, k) / NORMALIZATION_FACTOR
        );
      }
    }
  }

  private setConnectivityParamsData(
    current: Map<string, AviationConnectivityDataType>,
    target: Map<string, AviationConnectivityDataType>
  ) {
    this.current = current;
    this.target = target;
    this.zonesGroup.clear();

    this.zonesObjectMap = new Map<string, MultiPolygonObject3D<string>>();

    for (const [id, zone] of current) {
      const zoneObject3D = new MultiPolygonObject3D(id, zone.location.geometry);

      zoneObject3D.setScalableCoefficient(1000000);
      const normalizedCountryCount = zone.count / NORMALIZATION_FACTOR;

      zoneObject3D.setValue(normalizedCountryCount);

      this.zonesGroup.add(zoneObject3D);
      this.zonesObjectMap.set(id, zoneObject3D);
    }
  }
  clearMap(): void {
    this.zonesGroup.clear();
  }

  setVisible(visible: boolean): void {
    this.group.visible = visible;
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
    const intersects = data.raycaster.intersectObjects(
      this.zonesGroup.children.filter((obj) => obj.visible),
      true
    );

    const intersection = intersects[0];
    if (intersection) {
      const object = intersection.object;
      if (object instanceof MultiPolygonObject3D) {
        const zone = this.current.get(object.objectId)!;
        runInAction(() => {
          infoPopupStoreInstance.isShown = true;
          infoPopupStoreInstance.data = {
            slideGroup: 'main',
            slide: Slide.AVIATION_CONNECTIVITY,
            param: zone,
            datatype: DataType.AVIATION_CONNECTIVITY,
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
      aviationTransfer3DStoreInstance.currentMoveData = undefined;
    });

    this.deselect();
  }

  deselect() {
    runInAction(() => {
      infoPopupStoreInstance.isShown = false;
    });
  }
}
