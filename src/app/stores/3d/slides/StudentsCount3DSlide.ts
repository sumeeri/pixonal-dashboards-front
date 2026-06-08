import * as TWEEN from '@tweenjs/tween.js';
import { reaction, runInAction } from 'mobx';
import { DataType } from 'shared/constants/mapDataParams.ts';
import { Camera, Group, MathUtils, Scene, Vector2 } from 'three';

import { Slide } from '../../../../entities/dashboard/types.ts';
import infoPopupStoreInstance from '../../infoPopupStore.ts';
import mapDataValuesStoreInstance from '../../mapDataValuesStore.ts';
import { IMoveToEvent } from '../IMoveToEvent.ts';
import MapUtils from '../MapUtils.ts';
import { MultiPolygonObject3D } from '../MultiPolygonObject3D.ts';
import PopulationCountInfoIcons from '../populationCount/PopulationCountInfoIcons.ts';
import studentsCount3DStoreInstance from '../stores/StudentsCount3DStore.ts';
import { StudentCountZone } from '../students/StudentsDataTypes.ts';
import { I3DSlide, SelectData } from './I3DSlide.ts';

export default class StudentsCount3DSlide implements I3DSlide {
  public moveToEvent?: (pos: IMoveToEvent) => void;

  private readonly group: Group;
  private readonly zonesGroup: Group;

  private zonesObjectMap = new Map<string, MultiPolygonObject3D<string>>();

  private selectedZone?: MultiPolygonObject3D<string>;

  private infoIcons: PopulationCountInfoIcons;
  private current = new Map<string, StudentCountZone>();
  private target = new Map<string, StudentCountZone>();
  private maxValue: number = 5000;

  constructor(private camera: Camera) {
    reaction(
      () => studentsCount3DStoreInstance.currentTarget,
      (currentTarget) => {
        if (currentTarget) {
          const { current, target } = currentTarget;
          this.setParamsData(current, target);
        }
      }
    );
    reaction(
      () => studentsCount3DStoreInstance.k,
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

  clearMap(): void {
    this.zonesGroup.clear();
  }

  setVisible(visible: boolean): void {
    this.group.visible = visible;

    this.deselectAll();
  }

  async setParamsData(current: Map<string, StudentCountZone>, target: Map<string, StudentCountZone>) {
    this.current = current;
    this.target = target;

    this.zonesGroup.clear();

    this.zonesObjectMap = new Map<string, MultiPolygonObject3D<string>>();

    const valuesCount = [];
    for (const [_, zone] of current) {
      valuesCount.push(zone.countParamsData.count);
    }
    this.maxValue = Math.max(...valuesCount);

    for (const [id, zone] of current) {
      const geometry = zone.location.geometry;

      if (geometry) {
        const zoneObject3D = new MultiPolygonObject3D(id, geometry);
        zoneObject3D.setValue(zone.countParamsData.count / this.maxValue);
        this.zonesGroup.add(zoneObject3D);
        this.zonesObjectMap.set(id, zoneObject3D);
      }
    }

    this.infoIcons.create(current);

    this.infoIcons.setData(current, target);
  }

  updateAnimation(k: number) {
    for (const [id, zone] of this.zonesObjectMap) {
      zone.setValue(
        MathUtils.lerp(this.current.get(id)!.countParamsData.count!, this.target.get(id)!.countParamsData.count!, k) /
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
      const object = intersection.object;
      if (object instanceof MultiPolygonObject3D) {
        const zone = this.current.get(object.objectId)!;
        runInAction(() => {
          infoPopupStoreInstance.isShown = true;
          switch (mapDataValuesStoreInstance.dataType) {
            case DataType.STUDENT_DENSITY:
              infoPopupStoreInstance.data = {
                slideGroup: 'main',
                slide: Slide.STUDENTS_COUNT_DENSITY,
                datatype: mapDataValuesStoreInstance.dataType,
                param: zone,
              };
              break;

            case DataType.STUDENT_PLACES:
              infoPopupStoreInstance.data = {
                slideGroup: 'main',
                slide: Slide.STUDENTS_COUNT_PLACES,
                datatype: mapDataValuesStoreInstance.dataType,
                param: zone,
              };
              break;
            case DataType.STUDENT_LOCATIONS:
            case DataType.STUDENT_RESIDENCES:
              infoPopupStoreInstance.data = {
                slideGroup: 'main',
                slide: Slide.STUDENTS_TRIPS_WITHIN,
                param: zone,
                datatype: mapDataValuesStoreInstance.dataType,
              };
          }

          infoPopupStoreInstance.worldPosition = intersection.point;
        });

        this.selectZone(object);
        const param = zone.countParamsData;
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
