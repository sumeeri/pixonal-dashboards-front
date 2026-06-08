import * as TWEEN from '@tweenjs/tween.js';
import { reaction, runInAction } from 'mobx';
import { Camera, Group, MathUtils, Scene, Vector2 } from 'three';

import { Slide } from '../../../../entities/dashboard/types.ts';
import infoPopupStoreInstance from '../../infoPopupStore.ts';
import { TaxiWithinTripsZone } from '../busAndTaxi/BusAndTaxiDataTypes.ts';
import BusAndTaxiInfoIcons from '../busAndTaxi/BusAndTaxiInfoIcons.ts';
import { IMoveToEvent } from '../IMoveToEvent.ts';
import MapUtils from '../MapUtils.ts';
import { MultiPolygonObject3D } from '../MultiPolygonObject3D.ts';
import PopulationWithinInfoIcons from '../populationCount/PopulationWithinInfoIcons.ts';
import busAndTaxiTripsWithin3DStoreInstance from '../stores/TaxiTripsWithin3DStore.ts';
import { I3DSlide, SelectData } from './I3DSlide.ts';

export default class BusAndTaxiTripsWithin3DSlide implements I3DSlide {
  public moveToEvent?: (pos: IMoveToEvent) => void;

  private readonly group: Group;
  private readonly zonesGroup: Group;

  private zonesObjectMap = new Map<string, MultiPolygonObject3D<string>>();

  private selectedZone?: MultiPolygonObject3D<string>;

  private infoIcons: BusAndTaxiInfoIcons;
  private current = new Map<string, TaxiWithinTripsZone>();
  private target = new Map<string, TaxiWithinTripsZone>();
  private maxValue: number = 500;

  constructor(private camera: Camera) {
    reaction(
      () => busAndTaxiTripsWithin3DStoreInstance.currentTarget,
      (currentTarget) => {
        if (currentTarget) {
          const { current, target } = currentTarget;
          this.setParamsData(current, target);
        }
      }
    );
    reaction(
      () => busAndTaxiTripsWithin3DStoreInstance.k,
      (k) => {
        this.updateAnimation(k);
      }
    );

    this.group = new Group();
    this.zonesGroup = new Group();

    this.infoIcons = new BusAndTaxiInfoIcons();
    this.group.add(this.infoIcons);

    this.group.add(this.zonesGroup);
  }

  setVisible(visible: boolean): void {
    this.group.visible = visible;

    this.deselectAll();
  }

  clearMap(): void {
    this.zonesGroup.clear();
  }

  setParamsData(current: Map<string, TaxiWithinTripsZone>, target: Map<string, TaxiWithinTripsZone>) {
    this.current = current;
    this.target = target;

    this.zonesGroup.clear();

    this.zonesObjectMap = new Map<string, MultiPolygonObject3D<string>>();

    const valuesCount: number[] = [];
    for (const [_, zone] of current) {
      const v = Number(zone.peopleCountParamsData.peopleCount) || 0;
      valuesCount.push(v);
    }
    const computedMax = valuesCount.length ? Math.max(...valuesCount) : 0;
    this.maxValue = Number.isFinite(computedMax) && computedMax > 0 ? computedMax : 1;

    for (const [id, zone] of current) {
      const zoneObject3D = new MultiPolygonObject3D(id, zone.location.geometry);
      const value = Number(zone.peopleCountParamsData.peopleCount) || 0;
      zoneObject3D.setValue(value / this.maxValue);
      this.zonesGroup.add(zoneObject3D);
      this.zonesObjectMap.set(id, zoneObject3D);
    }

    this.infoIcons.create(current);

    this.infoIcons.setData(current, target);
  }

  updateAnimation(k: number) {
    for (const [id, zone] of this.zonesObjectMap) {
      zone.setValue(
        MathUtils.lerp(
          this.current.get(id)?.peopleCountParamsData.peopleCount ?? 0,
          this.target.get(id)?.peopleCountParamsData.peopleCount ?? 0,
          k
        ) / this.maxValue
      );
    }
  }

  async install(scene: Scene): Promise<void> {
    scene.add(this.group);
  }

  uninstall(scene: Scene): void {
    scene.remove(this.group);
  }

  onCameraMove(): void {
    this.infoIcons.updateClippingPlane(this.camera);
  }

  onResolutionChange(_resolution: Vector2): void {
    // Empty
  }

  raycast(data: SelectData): void {
    const intersects = data.raycaster.intersectObjects(
      this.zonesGroup.children.filter((obj) => obj.visible),
      true
    );

    const intersection = intersects[0];
    if (intersection) {
      // // eslint-disable-next-line no-console
      // console.log(intersection);

      const object = intersection.object;
      if (object instanceof MultiPolygonObject3D) {
        const zone = this.current.get(object.objectId)!;
        runInAction(() => {
          infoPopupStoreInstance.isShown = true;
          infoPopupStoreInstance.data = {
            slideGroup: 'main',
            slide: Slide.TAXI_TRIPS_WITHIN,
            param: zone.peopleCountParamsData,
            zone: zone,
          };
          infoPopupStoreInstance.worldPosition = intersection.point;
        });

        this.selectZone(object);
        const param = zone.peopleCountParamsData;
        this.infoIcons.select(`${param.locationType}-${param.location}`);
      }
    } else {
      this.deselectAll();
    }
  }

  private selectZone(object: MultiPolygonObject3D<string>) {
    TWEEN.removeAll();
    for (const child of this.zonesGroup.children) {
      if (object != child) {
        new TWEEN.Tween(child.scale)
          .to(child.scale.clone().setZ(0.95))
          .duration(250 + Math.random() * 250)
          .easing(TWEEN.Easing.Quadratic.Out)
          .start();
      } else {
        new TWEEN.Tween(child.scale)
          .to(child.scale.clone().setZ(1.05))
          .duration(250 + Math.random() * 250)
          .easing(TWEEN.Easing.Quadratic.Out)
          .start();
      }
      // child.visible = false;
    }

    object.visible = true;
    this.selectedZone = object;

    const zone = this.current.get(object.objectId)!;

    this.moveToEvent?.({
      pointOfInterest: MapUtils.getPositionFromWgs(...zone.location.center, 0),
      zoom: 12.75,
      offset: [0, 100],
      resetRotation: false,
    });
  }

  private deselectAll() {
    TWEEN.removeAll();
    for (const child of this.zonesGroup.children) {
      child.visible = true;
      new TWEEN.Tween(child.scale)
        .to(child.scale.clone().setZ(1))
        .duration(1250 + Math.random() * 500)
        .easing(TWEEN.Easing.Bounce.Out)
        .start();
    }

    this.selectedZone = undefined;

    this.deselect();
  }

  deselect() {
    runInAction(() => {
      infoPopupStoreInstance.isShown = false;
    });
    this.infoIcons.deselect();
  }
}
