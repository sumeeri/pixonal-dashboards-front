import * as TWEEN from '@tweenjs/tween.js';
import { Map as MapBox } from 'mapbox-gl';
import { reaction, runInAction } from 'mobx';
import { Group, PerspectiveCamera, Scene } from 'three';

import { Slide } from '../../../../entities/dashboard/types.ts';
import infoPopupStoreInstance from '../../infoPopupStore.ts';
import { CongestionFenceData, CongestionParamsData, FenceId } from '../congestion/data/CongestionDataTypes.ts';
import { Fence } from '../congestion/data/Fence.ts';
import { IFenceGeometryData } from '../congestion/data/IFenceGeometryData.ts';
import FenceGroup from '../congestion/FenceGroup.ts';
import { RelativeSpeedFormula } from '../congestion/fenceParamFormulas/RelativeSpeedFormula.ts';
import IJunctionParamFormula from '../failingJunctions/IJunctionParamFormula.ts';
import JunctionCircles from '../failingJunctions/JunctionCircles.ts';
import { JunctionData, JunctionId, JunctionParamsData } from '../failingJunctions/JunctionDataTypes.ts';
import JunctionInfoIcons from '../failingJunctions/JunctionInfoIcons.ts';
import { DensityFormula } from '../failingJunctions/junctionsParamFormulas/DensityFormula.ts';
import { IDataModelDisplayGroup } from '../IDataModelDisplayGroup.ts';
import { IMoveToEvent } from '../IMoveToEvent.ts';
import MapUtils from '../MapUtils.ts';
import congestion3DStoreInstance from '../stores/Congestion3DStore.ts';
import junctions3DStoreInstance from '../stores/Junctions3DStore.ts';
import { I3DSlide, SelectData } from './I3DSlide.ts';

export default class Junctions3DSlide implements I3DSlide {
  public moveToEvent?: (pos: IMoveToEvent) => void;

  private readonly junctionMap: Map<JunctionId, JunctionData>;
  private readonly fenceMap: Map<number, Fence>;

  private readonly group: Group;
  private readonly circlesGroup: IDataModelDisplayGroup<
    JunctionId,
    JunctionData,
    JunctionParamsData,
    IJunctionParamFormula
  >;
  private readonly infoIconsGroup: IDataModelDisplayGroup<
    JunctionId,
    JunctionData,
    JunctionParamsData,
    IJunctionParamFormula
  >;

  private readonly fenceGroup: FenceGroup<CongestionParamsData>;

  private defaultFormula: IJunctionParamFormula = new DensityFormula();

  constructor(
    private mapbox: MapBox,
    private camera: PerspectiveCamera
  ) {
    reaction(
      () => junctions3DStoreInstance.junctionsData,
      (junctions) => {
        if (junctions) this.setJunctions(junctions);
      }
    );
    reaction(
      () => junctions3DStoreInstance.currentTarget,
      (currentTarget) => {
        if (currentTarget) {
          const { current, target } = currentTarget;
          this.setParamsData(current, target);
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
      () => junctions3DStoreInstance.k,
      (k) => {
        this.updateAnimation(k);
      }
    );

    this.junctionMap = new Map<JunctionId, JunctionData>();
    this.fenceMap = new Map<number, Fence>();

    this.group = new Group();
    this.circlesGroup = new JunctionCircles();
    this.group.add(this.circlesGroup as JunctionCircles);
    this.infoIconsGroup = new JunctionInfoIcons();
    this.group.add(this.infoIconsGroup as JunctionInfoIcons);

    this.fenceGroup = new FenceGroup(new RelativeSpeedFormula());
    this.fenceGroup.name = 'FenceGroup';
    this.group.add(this.fenceGroup);
    this.fenceGroup.visible = false;
  }

  clearMap(): void {
    this.junctionMap.clear();

    if (this.circlesGroup.clearMapDisplay && this.infoIconsGroup.clearMapDisplay) {
      this.circlesGroup.clearMapDisplay();
      this.infoIconsGroup.clearMapDisplay();
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

  private setJunctions(junctions: JunctionData[]) {
    this.junctionMap.clear();

    for (const junction of junctions) {
      this.junctionMap.set(junction.i, junction);
    }

    this.circlesGroup.create(this.junctionMap);
    this.infoIconsGroup.create(this.junctionMap);
  }

  private setParamsData(current: Map<JunctionId, JunctionParamsData>, target: Map<JunctionId, JunctionParamsData>) {
    this.circlesGroup.setData(current, target, this.defaultFormula);
    this.infoIconsGroup.setData(current, target, this.defaultFormula);
  }

  async install(scene: Scene): Promise<void> {
    scene.add(this.group);
  }

  uninstall(scene: Scene): void {
    scene.remove(this.group);
  }

  onCameraMove(): void {
    // Pitch angle. 0 - ground
    let pitchAngle: number = Math.round(90 - this.mapbox.getPitch());
    if (pitchAngle > 89) pitchAngle = 90;
    if (pitchAngle < 6) pitchAngle = 0;

    this.fenceGroup.onCameraMove(this.camera.position, pitchAngle);
  }

  raycast(data: SelectData): void {
    const raycastResult = this.circlesGroup.raycast(data.raycaster);

    if (raycastResult) {
      const [selectedId] = raycastResult;
      const junction = this.junctionMap.get(selectedId);
      if (junction) {
        runInAction(() => {
          infoPopupStoreInstance.isShown = true;
          infoPopupStoreInstance.data = {
            slideGroup: 'main',
            slide: Slide.JUNCTIONS,
            junction: junction,
            param: junctions3DStoreInstance.currentTarget.current.get(selectedId)!,
          };
          infoPopupStoreInstance.worldPosition = MapUtils.getPositionFromWgs(junction.lng, junction.lat);
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
          pointOfInterest: MapUtils.getPositionFromWgs(junction.lng, junction.lat),
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
