import * as TWEEN from '@tweenjs/tween.js';
import { Map as MapBox } from 'mapbox-gl';
import { reaction, runInAction } from 'mobx';
import { Group, PerspectiveCamera, Scene } from 'three';

import { Slide } from '../../../../entities/dashboard/types.ts';
import infoPopupStoreInstance from '../../infoPopupStore.ts';
import AccidentCircles from '../accidents/AccidentCircles.ts';
import AccidentInfoIcons from '../accidents/AccidentInfoIcons.ts';
import { AccidentData, AccidentId } from '../accidents/AccidentsDataTypes.ts';
import IAccidentsParamFormula from '../accidents/IAccidentsParamFormula.ts';
import { DefaultFormula } from '../accidents/paramFormulas/DefaultFormula.ts';
import { CongestionFenceData, CongestionParamsData, FenceId } from '../congestion/data/CongestionDataTypes.ts';
import { Fence } from '../congestion/data/Fence.ts';
import { IFenceGeometryData } from '../congestion/data/IFenceGeometryData.ts';
import FenceGroup from '../congestion/FenceGroup.ts';
import { RelativeSpeedFormula } from '../congestion/fenceParamFormulas/RelativeSpeedFormula.ts';
import { IDataModelDisplayGroup } from '../IDataModelDisplayGroup.ts';
import { IMoveToEvent } from '../IMoveToEvent.ts';
import MapUtils from '../MapUtils.ts';
import accidents3DStoreInstance from '../stores/Accidents3DStore.ts';
import congestion3DStoreInstance from '../stores/Congestion3DStore.ts';
import { I3DSlide, SelectData } from './I3DSlide.ts';

export default class Accidents3DSlide implements I3DSlide {
  public moveToEvent?: (pos: IMoveToEvent) => void;

  // TODO: Refactor. Copy paste from Junctions3DSlide
  private fenceMap: Map<number, Fence>;

  private readonly group: Group;
  private readonly circlesGroup: IDataModelDisplayGroup<AccidentId, AccidentData, AccidentData, IAccidentsParamFormula>;
  private readonly infoIconsGroup: IDataModelDisplayGroup<
    AccidentId,
    AccidentData,
    AccidentData,
    IAccidentsParamFormula
  >;

  private readonly fenceGroup: FenceGroup<CongestionParamsData>;

  private defaultFormula: IAccidentsParamFormula = new DefaultFormula();

  constructor(
    private mapbox: MapBox,
    private camera: PerspectiveCamera
  ) {
    reaction(
      () => accidents3DStoreInstance.current,
      (current) => {
        if (current) {
          this.setParamsData(current, current);
        }
      }
    );

    reaction(
      () => congestion3DStoreInstance.fenceData,
      (fenceData) => {
        if (fenceData) this.setFenceData(fenceData);
      }
    );
    reaction(
      () => congestion3DStoreInstance.currentTarget,
      (currentTarget) => {
        if (currentTarget) {
          const { current, target } = currentTarget;
          this.setFenceParamsData(current, target);
        }
      }
    );

    reaction(
      () => accidents3DStoreInstance.k,
      (k) => {
        this.updateAnimation(k);
      }
    );

    this.fenceMap = new Map<number, Fence>();

    this.group = new Group();
    this.circlesGroup = new AccidentCircles();
    this.group.add(this.circlesGroup as AccidentCircles);
    this.infoIconsGroup = new AccidentInfoIcons();
    this.group.add(this.infoIconsGroup as AccidentInfoIcons);

    this.fenceGroup = new FenceGroup(new RelativeSpeedFormula());
    this.fenceGroup.name = 'FenceGroup';
    this.group.add(this.fenceGroup);
    this.fenceGroup.visible = false;
  }

  clearMap(): void {
    if (this.circlesGroup.clearMapDisplay) {
      this.circlesGroup.clearMapDisplay();
    }
  }

  private setFenceData(fenceData: IFenceGeometryData): void {
    fenceData.fenceList.forEach((fence: CongestionFenceData, faceIndex: number) => {
      const fenceObject = new Fence(fence.id, fence, faceIndex);
      this.fenceMap.set(fence.id, fenceObject);
    });
    this.fenceGroup.create(this.fenceMap);
  }

  private setFenceParamsData(
    current: Map<FenceId, CongestionParamsData>,
    target: Map<FenceId, CongestionParamsData>
  ): void {
    this.fenceGroup.setData(current, target, new RelativeSpeedFormula());
  }

  private setParamsData(current: Map<AccidentId, AccidentData>, _target: Map<AccidentId, AccidentData>) {
    this.circlesGroup.setData(current, current, this.defaultFormula);
    this.infoIconsGroup.setData(current, current, this.defaultFormula);
  }

  async install(scene: Scene): Promise<void> {
    scene.add(this.group);
  }

  uninstall(scene: Scene): void {
    scene.remove(this.group);
  }

  onCameraMove(): void {
    let pitchAngle: number = Math.round(90 - this.mapbox.getPitch());
    if (pitchAngle > 89) pitchAngle = 90;
    if (pitchAngle < 6) pitchAngle = 0;

    this.fenceGroup.onCameraMove(this.camera.position, pitchAngle);
  }

  raycast(data: SelectData): void {
    const icon = this.infoIconsGroup.raycast(data.raycaster);

    const circle = this.circlesGroup.raycast(data.raycaster);

    const resultOfRaycasting = icon || circle;

    if (resultOfRaycasting) {
      const [selectedId] = resultOfRaycasting;
      const accident = accidents3DStoreInstance.current.get(selectedId);
      if (accident) {
        runInAction(() => {
          infoPopupStoreInstance.isShown = true;
          infoPopupStoreInstance.data = { slideGroup: 'main', slide: Slide.ACCIDENTS, accident: accident };
          infoPopupStoreInstance.worldPosition = MapUtils.getPositionFromWgs(accident.lng, accident.lat);
        });

        this.circlesGroup.select(selectedId);
        this.infoIconsGroup.select(selectedId);

        this.fenceGroup.visible = true;

        this.fenceGroup.scale.setZ(0);

        new TWEEN.Tween(this.fenceGroup.scale)
          .to(this.fenceGroup.scale.clone().setZ(1))
          .duration(250)
          .easing(TWEEN.Easing.Quadratic.Out)
          .start();

        const canvas: HTMLCanvasElement = this.mapbox.getCanvas();
        const height = canvas.clientHeight;

        this.moveToEvent?.({
          pointOfInterest: MapUtils.getPositionFromWgs(accident.lng, accident.lat),
          zoom: 14,
          offset: [0, height * 0.15],
          resetRotation: false,
        });
      }
    } else {
      this.deselect();
    }
  }

  deselect(): void {
    runInAction(() => {
      infoPopupStoreInstance.isShown = false;
    });

    this.circlesGroup.deselect();
    this.infoIconsGroup.deselect();

    const tween = new TWEEN.Tween(this.fenceGroup.scale)
      .to(this.fenceGroup.scale.clone().setZ(0))
      .duration(250)
      .easing(TWEEN.Easing.Quadratic.Out)
      .start();

    tween.onComplete(() => {
      this.fenceGroup.visible = false;
    });
  }

  setVisible(visible: boolean): void {
    this.group.visible = visible;
  }

  updateAnimation(k: number) {
    this.circlesGroup.updateAnimation(k);
  }
}
