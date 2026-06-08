import * as TWEEN from '@tweenjs/tween.js';
import { reaction, runInAction } from 'mobx';
import { Camera, Group, MathUtils, Scene, Vector2 } from 'three';

import { Slide } from '../../../../entities/dashboard/types.ts';
import infoPopupStoreInstance from '../../infoPopupStore.ts';
import mapDataValuesStoreInstance from '../../mapDataValuesStore.ts';
import { IMoveToEvent } from '../IMoveToEvent.ts';
import MapUtils from '../MapUtils.ts';
import { MultiPolygonObject3D } from '../MultiPolygonObject3D.ts';
import { PopulationMoveZone } from '../population/PopulationDataTypes.ts';
import PopulationWithinInfoIcons from '../populationCount/PopulationWithinInfoIcons.ts';
import populationMovementWithin3DStoreInstance from '../stores/PopulationMovementWithin3DStore.ts';
import { I3DSlide, SelectData } from './I3DSlide.ts';

export default class PopulationMovementWithin3DSlide implements I3DSlide {
  public moveToEvent?: (pos: IMoveToEvent) => void;

  private readonly group: Group;
  private readonly zonesGroup: Group;

  private zonesObjectMap = new Map<string, MultiPolygonObject3D<string>>();

  private infoIcons: PopulationWithinInfoIcons;

  private selectedZone?: MultiPolygonObject3D<string>;

  private current = new Map<string, PopulationMoveZone>();
  private target = new Map<string, PopulationMoveZone>();

  private maxValue: number = 1000;

  constructor(private camera: Camera) {
    reaction(
      () => populationMovementWithin3DStoreInstance.currentTarget,
      (currentTarget) => {
        if (currentTarget) {
          const { current, target } = currentTarget;
          this.setParamsData(current, target);
        }
      }
    );
    reaction(
      () => populationMovementWithin3DStoreInstance.k,
      (k) => {
        this.updateAnimation(k);
      }
    );

    this.group = new Group();
    this.zonesGroup = new Group();
    this.infoIcons = new PopulationWithinInfoIcons();
    this.group.add(this.infoIcons);
    this.group.add(this.zonesGroup);
  }
  clearMap(): void {
    this.zonesGroup.clear();
  }

  setVisible(visible: boolean): void {
    this.group.visible = visible;

    this.deselectAll();
  }

  setParamsData(current: Map<string, PopulationMoveZone>, target: Map<string, PopulationMoveZone>) {
    this.current = current;
    this.target = target;

    this.zonesGroup.clear();

    this.zonesObjectMap = new Map<string, MultiPolygonObject3D<string>>();

    const valuesCount = [];
    for (const [_, zone] of current) {
      valuesCount.push(zone.peopleMoveParamsData.peopleCount);
    }
    this.maxValue = Math.max(...valuesCount);

    for (const [id, zone] of current) {
      const zoneObject3D = new MultiPolygonObject3D(id, zone.location.geometry);
      zoneObject3D.setValue(zone.peopleMoveParamsData.peopleCount / this.maxValue);
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
          this.current.get(id)!.peopleMoveParamsData.peopleCount!,
          this.target.get(id)!.peopleMoveParamsData.peopleCount!,
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
    // this.infoIcons.updateClippingPlane(this.camera);
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
      const object = intersection.object;
      if (object instanceof MultiPolygonObject3D) {
        const zone = this.current.get(object.objectId)!;

        runInAction(() => {
          infoPopupStoreInstance.isShown = true;
          infoPopupStoreInstance.data = {
            slideGroup: 'main',
            slide: Slide.POPULATION_MOVEMENT_WITHIN,
            population: { objectId: object.objectId },
            dataType: mapDataValuesStoreInstance.dataType!,
            tooltipData: {
              location: zone.peopleMoveParamsData.from,
              peopleCount: zone.peopleMoveParamsData.peopleCount,
              recurrency: true,
            },
          };
          infoPopupStoreInstance.worldPosition = MapUtils.getPositionFromWgs(...zone.location.center, 700);
        });

        this.selectZone(object);
      }
    } else {
      this.deselectAll();
    }
  }

  private selectZone(object: MultiPolygonObject3D<string>) {
    for (const child of this.zonesGroup.children) {
      if (object != child) {
        new TWEEN.Tween(child.scale)
          .to(child.scale.clone().setZ(0.9))
          .duration(250 + Math.random() * 250)
          .easing(TWEEN.Easing.Quadratic.Out)
          .start();
      } else {
        new TWEEN.Tween(child.scale)
          .to(child.scale.clone().setZ(1.2))
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
    // this.infoIcons.deselect();
  }
}
