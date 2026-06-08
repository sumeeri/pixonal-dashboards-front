import * as TWEEN from '@tweenjs/tween.js';
import { reaction, runInAction } from 'mobx';
import { Camera, Group, MathUtils, Scene, Vector2 } from 'three';

import { Slide } from '../../../../entities/dashboard/types.ts';
import infoPopupStoreInstance from '../../infoPopupStore.ts';
import { IMoveToEvent } from '../IMoveToEvent.ts';
import MapUtils from '../MapUtils.ts';
import { MultiPolygonObject3D } from '../MultiPolygonObject3D.ts';
import PopulationCountInfoIcons from '../populationCount/PopulationCountInfoIcons.ts';
import { PopulationCountZone } from '../populationCount/PopulationCountTypes.ts';
import populationCount3DStoreInstance from '../stores/PopulationCount3DStore.ts';
import { I3DSlide, SelectData } from './I3DSlide.ts';

export default class PopulationCount3DSlide implements I3DSlide {
  public moveToEvent?: (pos: IMoveToEvent) => void;

  private readonly group: Group;
  private readonly zonesGroup: Group;

  private zonesObjectMap = new Map<string, MultiPolygonObject3D<string>>();

  private selectedZone?: MultiPolygonObject3D<string>;

  private infoIcons: PopulationCountInfoIcons;
  private current = new Map<string, PopulationCountZone>();
  private target = new Map<string, PopulationCountZone>();
  private maxValue: number = 25000;

  constructor(private camera: Camera) {
    reaction(
      () => populationCount3DStoreInstance.currentTarget,
      (currentTarget) => {
        if (currentTarget) {
          const { current, target } = currentTarget;
          this.setParamsData(current, target);
        }
      }
    );
    reaction(
      () => populationCount3DStoreInstance.k,
      (k) => {
        this.updateAnimation(k);
      }
    );

    this.group = new Group();
    this.zonesGroup = new Group();

    this.infoIcons = new PopulationCountInfoIcons();
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

  setParamsData(current: Map<string, PopulationCountZone>, target: Map<string, PopulationCountZone>) {
    this.current = current;
    this.target = target;

    this.zonesGroup.clear();

    this.zonesObjectMap = new Map<string, MultiPolygonObject3D<string>>();

    const valuesCount = [];
    for (const [_, zone] of current) {
      valuesCount.push(zone.peopleCountParamsData.peopleCount / zone.location.area);
    }
    this.maxValue = Math.max(...valuesCount);

    for (const [id, zone] of current) {
      const zoneObject3D = new MultiPolygonObject3D(id, zone.location.geometry);
      zoneObject3D.setScalableCoefficient(2000);
      zoneObject3D.setValue(zone.peopleCountParamsData.peopleCount / zone.location.area / this.maxValue);

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
          this.current.get(id)!.peopleCountParamsData.peopleCount!,
          this.target.get(id)!.peopleCountParamsData.peopleCount!,
          k
        ) /
          this.current.get(id)!.location.area /
          this.maxValue
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
            slide: Slide.POPULATION_COUNT,
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
