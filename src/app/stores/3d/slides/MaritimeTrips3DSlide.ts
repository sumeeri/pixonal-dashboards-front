import { reaction, runInAction } from 'mobx';
import { DataType } from 'shared/constants/mapDataParams.ts';
import { Group, MathUtils, PerspectiveCamera, Scene, WebGLRenderer } from 'three';

import { Slide } from '../../../../entities/dashboard/types.ts';
import infoPopupStoreInstance from '../../infoPopupStore.ts';
import mapDataValuesStoreInstance from '../../mapDataValuesStore.ts';
import { IMoveToEvent } from '../IMoveToEvent.ts';
import MapUtils from '../MapUtils.ts';
import { MaritimeFacilitiesDataType, MaritimeFacilitiesDataWithLocation } from '../maritime/MaritimesTypes.ts';
import { PillarsGroup } from '../pillars/PillarsGroup.ts';
import settingsState from '../SettingsState.ts';
import maritimeTrips3DStoreInstance from '../stores/MaritimeTrips3DStore.ts';
import { I3DSlide, SelectData } from './I3DSlide.ts';

const NORMALIZING_FACTOR = 10000000;

export default class MaritimeTrips3DSlide implements I3DSlide {
  public stopTimelineEvent?: () => void;
  public moveToEvent?: (pos: IMoveToEvent) => void;

  private readonly group: Group;
  private readonly pillarsGroup: PillarsGroup;
  private mapPillar = new Map<number, string>();

  private current = new Map<string, MaritimeFacilitiesDataType>();
  private target = new Map<string, MaritimeFacilitiesDataType>();

  constructor(
    private renderer: WebGLRenderer,
    private camera: PerspectiveCamera
  ) {
    reaction(
      () => maritimeTrips3DStoreInstance.currentTarget,
      (currentTarget) => {
        if (currentTarget) {
          const { current, target } = currentTarget;
          this.setConnectivityParamsData(current, target);
        }
      }
    );
    reaction(
      () => maritimeTrips3DStoreInstance.k,
      (k) => {
        this.updateAnimation(k);
      }
    );

    this.group = new Group();
    this.pillarsGroup = new PillarsGroup(settingsState.busStopPillars);

    this.group.add(this.pillarsGroup);
  }

  clearMap(): void {
    this.pillarsGroup.clear();
  }

  updateAnimation(k: number) {
    this.pillarsGroup.updateAnimation(k);
  }

  private setConnectivityParamsData(
    current: Map<string, MaritimeFacilitiesDataWithLocation>,
    target: Map<string, MaritimeFacilitiesDataWithLocation>
  ) {
    this.current = current;
    this.target = target;

    const pillarsPositions = new Map<number, [number, number]>();
    const pillarsValues = new Map<number, number>();

    let i = 0;
    for (const [id, param] of current) {
      this.mapPillar.set(i, id);

      pillarsPositions.set(i, param.location);
      pillarsValues.set(i, MathUtils.clamp(param.count * NORMALIZING_FACTOR, 0, 1));

      i++;
    }

    this.pillarsGroup.create(pillarsPositions);
    this.pillarsGroup.setData(pillarsValues, pillarsValues);
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
  }

  onCameraMove(): void {}

  raycast(data: SelectData): void {
    const pillarId = this.pillarsGroup.raycastSelectData(data, this.renderer, this.camera);
    const maritimeTripsId = this.mapPillar.get(pillarId!);
    const param = maritimeTrips3DStoreInstance.currentTarget.current.get(maritimeTripsId!);

    if (param) {
      runInAction(() => {
        infoPopupStoreInstance.isShown = true;

        infoPopupStoreInstance.data = {
          slideGroup: 'main',
          slide: Slide.MARITIME_TRIPS,
          param: param,
          datatype:
            mapDataValuesStoreInstance.dataType === DataType.VEHICLES_TRIPS
              ? DataType.VEHICLES_TRIPS
              : DataType.PASSENGER_TRIPS,
        };

        const centerPos = MapUtils.getPositionFromWgs(...param.location);
        centerPos.z = MathUtils.clamp(param.count * 200, 0, 2000);
        infoPopupStoreInstance.worldPosition = centerPos;
      });
    } else {
      this.deselectAll();
    }
  }

  private deselectAll() {
    this.deselect();
  }

  deselect() {
    runInAction(() => {
      infoPopupStoreInstance.isShown = false;
    });
  }
}
